import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  X, 
  Activity, 
  RotateCcw, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Wifi, 
  Terminal, 
  Play, 
  Settings,
  HelpCircle,
  Clock
} from 'lucide-react';
import { websocketStream } from '../services/websocketStreamService';

export default function WebSocketStreamModal({ isOpen, onClose }) {
  const [status, setStatus] = useState(websocketStream.status);
  const [latencyMs, setLatencyMs] = useState(websocketStream.latencyMs);
  const [packetLogs, setPacketLogs] = useState([...websocketStream.packetLogs]);
  const [wsConfig, setWsConfig] = useState(websocketStream.config);
  const [customUrl, setCustomUrl] = useState(websocketStream.config.url);
  const [showGuide, setShowGuide] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const unStatus = websocketStream.onStatusChange((s, lat) => {
      setStatus(s);
      setLatencyMs(lat);
    });

    const unLogs = websocketStream.onLogChange((logs) => {
      setPacketLogs([...logs]);
    });

    return () => {
      unStatus();
      unLogs();
    };
  }, [isOpen]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    websocketStream.saveConfig({ url: customUrl.trim() });
    setWsConfig(websocketStream.config);
    showToast('🚀 已更新 WebSocket 伺服器網址並嘗試連線！');
  };

  const handleReconnect = () => {
    websocketStream.reconnect();
    showToast('🔄 正在重新連接 WebSocket 串流...');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fff8fa] w-full max-w-2xl rounded-3xl border border-pink-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
                WebSocket 極速串流通訊控制台
                <span className="text-[10px] bg-white text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  LIVE STREAM
                </span>
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                雙向持久化長連線，逐筆撮合即時推播，毫秒級零延遲行情傳輸
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center animate-fade-in">
            {toastMsg}
          </div>
        )}

        {/* Status Dashboard */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. 連線狀態 */}
            <div className="bg-white p-3.5 rounded-2xl border border-pink-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 block">通訊通道狀態</span>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className={`w-3 h-3 rounded-full ${
                  status === 'CONNECTED' 
                    ? 'bg-emerald-500 animate-ping' 
                    : status === 'FALLBACK_RACING' 
                      ? 'bg-amber-500 animate-pulse' 
                      : 'bg-rose-500'
                }`}></span>
                <span className="text-sm font-black text-slate-900">
                  {status === 'CONNECTED' ? '🟢 原生 WS 串流' : status === 'FALLBACK_RACING' ? '🟡 多代理競速模式' : '🔴 連線中斷'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {status === 'CONNECTED' ? '雙向推播已啟用' : '自動並行拉取中'}
              </span>
            </div>

            {/* 2. 延遲監測 */}
            <div className="bg-white p-3.5 rounded-2xl border border-pink-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 block">往返延遲 (Ping RTT)</span>
              <div className="flex items-center space-x-2 mt-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-base font-black font-mono text-emerald-600">
                  {latencyMs} <span className="text-xs font-normal">ms</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {latencyMs < 50 ? '極致高速 (<50ms)' : '正常網路連線'}
              </span>
            </div>

            {/* 3. 訂閱標的 */}
            <div className="bg-white p-3.5 rounded-2xl border border-pink-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 block">即時撮合頻道</span>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <Wifi className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-black text-slate-900">
                  {websocketStream.subscribedSymbols.size} 檔標的
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                台積電、鴻海、國巨、臻鼎等
              </span>
            </div>
          </div>

          {/* Gateway 配置表單 */}
          <form onSubmit={handleSaveUrl} className="bg-white p-4 rounded-2xl border border-pink-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-600" />
                WebSocket Gateway 伺服器端點 (WSS/WS)
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showGuide ? '收起啟動教學' : '如何啟動本機轉發伺服器？'}
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="ws://localhost:8080/ws 或 wss://your-proxy.com"
                className="flex-1 text-xs font-mono p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-emerald-500 bg-[#fffbfc]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                儲存端點
              </button>
              <button
                type="button"
                onClick={handleReconnect}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition"
                title="強制重新連線"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* 展開教學說明 */}
            {showGuide && (
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono space-y-2 animate-fade-in">
                <p className="text-emerald-400 font-bold">💡 本地啟動 WebSocket 代理伺服器教學 (1 分鐘完成):</p>
                <p className="text-slate-300">1. 在專案目錄打開終端機 (Terminal)</p>
                <div className="p-2 bg-black/60 rounded text-emerald-300">
                  npm install ws<br />
                  node server/websocket-proxy.js
                </div>
                <p className="text-slate-400 text-[11px]">
                  啟動後，伺服器會自動常駐監聽 <code>ws://localhost:8080</code>，並向證交所抓取即時撮合，此控制台狀態將瞬間變為 🟢 綠燈！
                </p>
              </div>
            )}
          </form>

          {/* 即時封包控制台 (Live Packet Stream Log) */}
          <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400">
                  即時數據封包傳輸日誌 (Live Tick Console)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                緩存最新 50 筆封包
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 font-mono text-[11px] pr-1">
              {packetLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  等待即時封包湧入中...
                </div>
              ) : (
                packetLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-2 py-0.5 border-b border-slate-900">
                    <span className="text-slate-500 text-[10px] w-14 flex-shrink-0">{log.time}</span>
                    <span className={`px-1 py-0.2 rounded text-[10px] font-bold flex-shrink-0 ${
                      log.direction === 'IN' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : log.direction === 'OUT' 
                          ? 'bg-blue-950 text-blue-400 border border-blue-800' 
                          : 'bg-purple-950 text-purple-400 border border-purple-800'
                    }`}>
                      {log.direction}
                    </span>
                    <span className="text-amber-300 font-bold flex-shrink-0">[{log.type}]</span>
                    <span className="text-slate-300 break-all">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
