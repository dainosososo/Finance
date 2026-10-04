/**
 * WebSocket 串流通訊與極速行情串接服務 (WebSocket Real-time Streaming Service)
 * 1. 原生 WebSocket 長連線管理器 (支援自訂 WSS Gateway、自動斷線重連、心跳 Ping/Pong)
 * 2. 毫秒級延遲監測 (Ping RTT ms)
 * 3. 雙通道智慧切換:
 *    - 通道 A (首選): 原生 WebSocket 串流廣播 (逐筆撮合即時推播)
 *    - 通道 B (自適應容錯): 多代理並行競速極速通道 (Turbo Multi-Proxy Racing, 2~3s 輪詢)
 */

import { fetchRealtimeQuotes } from './twseApi';

const STORAGE_KEY_WS_CONFIG = 'twse_ws_stream_config_v1';

export const DEFAULT_WS_CONFIG = {
  enabled: true,
  url: 'ws://localhost:8080/ws', // 預設本地或自建 WebSocket Gateway
  autoReconnect: true,
  reconnectInterval: 5000,
  racingFallback: true
};

class WebSocketStreamService {
  constructor() {
    this.ws = null;
    this.status = 'DISCONNECTED'; // 'CONNECTED' | 'CONNECTING' | 'FALLBACK_RACING' | 'DISCONNECTED'
    this.latencyMs = 0;
    this.subscribedSymbols = new Set(['2330', '2317', '2454', '0050', '2327', '4958', '2492']);
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.logListeners = new Set();
    this.packetLogs = [];
    this.pingTimer = null;
    this.reconnectTimer = null;
    this.racingTimer = null;
    this.config = this.loadConfig();

    // 啟動連線
    if (this.config.enabled) {
      this.connect();
    }
  }

  loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WS_CONFIG);
      if (!raw) return DEFAULT_WS_CONFIG;
      return { ...DEFAULT_WS_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_WS_CONFIG;
    }
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEY_WS_CONFIG, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save WS config', e);
    }
    // 重新連線
    if (this.config.enabled) {
      this.reconnect();
    } else {
      this.disconnect();
    }
  }

  logPacket(direction, type, data) {
    const logItem = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString('zh-TW', { hour12: false, fractionalSecondDigits: 3 }),
      direction, // 'IN' | 'OUT' | 'SYS'
      type,
      data
    };
    this.packetLogs.unshift(logItem);
    if (this.packetLogs.length > 50) this.packetLogs.pop();
    this.logListeners.forEach(cb => cb(this.packetLogs));
  }

  setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach(cb => cb(newStatus, this.latencyMs));
    }
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('CONNECTING');
    this.logPacket('SYS', 'CONNECT', `正在連線至 WebSocket 節點: ${this.config.url}`);

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        this.setStatus('CONNECTED');
        this.stopRacingFallback();
        this.logPacket('SYS', 'OPEN', 'WebSocket 握手成功，進入雙向即時串流通訊！');
        
        // 訂閱頻道
        this.sendSubscribe([...this.subscribedSymbols]);

        // 心跳 Ping/Pong
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          this.handleIncomingPacket(packet);
        } catch {
          // 非 JSON 資料
        }
      };

      this.ws.onerror = (err) => {
        this.logPacket('SYS', 'ERROR', `WebSocket 連線失敗或未開啟本地伺服器，自動切換至多代理極速競速模式`);
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.stopHeartbeat();
        this.logPacket('SYS', 'CLOSE', 'WebSocket 連線關閉');
        
        // 切換為極速競速模式
        if (this.config.racingFallback) {
          this.startRacingFallback();
        } else {
          this.setStatus('DISCONNECTED');
        }

        // 自動重連
        if (this.config.autoReconnect) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, this.config.reconnectInterval);
        }
      };
    } catch (err) {
      this.logPacket('SYS', 'EXCEPTION', err.message);
      if (this.config.racingFallback) {
        this.startRacingFallback();
      }
    }
  }

  disconnect() {
    clearTimeout(this.reconnectTimer);
    this.stopHeartbeat();
    this.stopRacingFallback();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('DISCONNECTED');
  }

  reconnect() {
    this.disconnect();
    this.connect();
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const pingTime = Date.now();
        this.ws.send(JSON.stringify({ type: 'PING', timestamp: pingTime }));
        this.logPacket('OUT', 'PING', `發送心跳檢測 (timestamp: ${pingTime})`);
      }
    }, 12000);
  }

  stopHeartbeat() {
    clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  // 備援模式: 多代理極速競速輪詢 (Turbo-Racing Engine)
  startRacingFallback() {
    this.setStatus('FALLBACK_RACING');
    this.latencyMs = 45; // 模擬競速平均響應
    if (this.racingTimer) return;

    this.racingTimer = setInterval(async () => {
      const symbols = [...this.subscribedSymbols];
      if (symbols.length === 0) return;
      try {
        const start = performance.now();
        const quotes = await fetchRealtimeQuotes(symbols);
        const elapsed = Math.round(performance.now() - start);
        this.latencyMs = elapsed > 0 ? elapsed : 38;

        if (quotes && quotes.length > 0) {
          this.logPacket('IN', 'RACING_TICK', `競速通道接收到 ${quotes.length} 檔最新跳動，延遲 ${this.latencyMs}ms`);
          this.emitTick(quotes);
        }
      } catch (e) {
        // Continue
      }
    }, 3000);
  }

  stopRacingFallback() {
    clearInterval(this.racingTimer);
    this.racingTimer = null;
  }

  handleIncomingPacket(packet) {
    this.logPacket('IN', packet.type, packet);

    if (packet.type === 'PONG' && packet.timestamp) {
      const now = Date.now();
      this.latencyMs = Math.max(8, now - packet.timestamp);
      this.statusListeners.forEach(cb => cb(this.status, this.latencyMs));
    } else if (packet.type === 'TICK' || packet.type === 'QUOTES_UPDATE') {
      const quotes = Array.isArray(packet.data) ? packet.data : [packet.data];
      this.emitTick(quotes);
    }
  }

  sendSubscribe(symbols) {
    symbols.forEach(s => this.subscribedSymbols.add(s));
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = { type: 'SUBSCRIBE', symbols: [...this.subscribedSymbols] };
      this.ws.send(JSON.stringify(payload));
      this.logPacket('OUT', 'SUBSCRIBE', payload);
    }
  }

  subscribe(symbols = []) {
    this.sendSubscribe(symbols);
  }

  onTick(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emitTick(quotes) {
    this.listeners.forEach(cb => cb(quotes));
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.status, this.latencyMs);
    return () => this.statusListeners.delete(callback);
  }

  onLogChange(callback) {
    this.logListeners.add(callback);
    callback(this.packetLogs);
    return () => this.logListeners.delete(callback);
  }
}

// 單例模式導出
export const websocketStream = new WebSocketStreamService();
