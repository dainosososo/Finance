/**
 * 雲端條件警報與推播通知服務 (Cloud Condition Alerts & Push Notifications Service)
 * 支援:
 * 1. 瀏覽器原生效能 Web Notifications API (跨分頁推播)
 * 2. Web Audio API 3 音階合成提示鈴聲 (無依賴、極速發聲)
 * 3. 雲端 Webhook 自動轉發 (Discord / Telegram / LINE / 自訂 API)
 * 4. 多維度警報條件: 突破高點、跌破低點、漲停鎖死 (>=9.5%)、跌停 (<-9.5%)、爆量突破
 */

const STORAGE_KEY_ALERTS = 'twse_price_alerts_v1';
const STORAGE_KEY_SETTINGS = 'twse_alert_settings_v1';

// 預設警報設定
export const DEFAULT_ALERT_SETTINGS = {
  soundEnabled: true,
  browserPushEnabled: true,
  cloudWebhookEnabled: false,
  webhookUrl: '', // Discord / Telegram / Custom Webhook
  webhookType: 'DISCORD', // 'DISCORD' | 'TELEGRAM' | 'GENERIC'
  telegramBotToken: '',
  telegramChatId: ''
};

// 取得所有警報列表
export function getAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load alerts from localStorage', e);
    return [];
  }
}

// 儲存警報列表
export function saveAlerts(alerts) {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
  } catch (e) {
    console.warn('Failed to save alerts to localStorage', e);
  }
}

// 取得全域警報設定
export function getAlertSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_ALERT_SETTINGS;
    return { ...DEFAULT_ALERT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_ALERT_SETTINGS;
  }
}

// 儲存全域警報設定
export function saveAlertSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save alert settings', e);
  }
}

// 新增警報
export function addAlert(newAlert) {
  const alerts = getAlerts();
  const alertItem = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    code: newAlert.code.trim(),
    name: newAlert.name || newAlert.code.trim(),
    condition: newAlert.condition || 'PRICE_GTE', // 'PRICE_GTE' | 'PRICE_LTE' | 'PCT_GTE' | 'PCT_LTE' | 'LIMIT_UP' | 'VOLUME_GTE'
    targetValue: parseFloat(newAlert.targetValue) || 0,
    note: newAlert.note || '',
    active: true,
    triggered: false,
    triggeredAt: null,
    triggeredPrice: null,
    createdAt: new Date().toISOString()
  };
  alerts.unshift(alertItem);
  saveAlerts(alerts);
  return alertItem;
}

// 刪除警報
export function removeAlert(id) {
  const alerts = getAlerts().filter(a => a.id !== id);
  saveAlerts(alerts);
  return alerts;
}

// 切換警報開關
export function toggleAlertActive(id) {
  const alerts = getAlerts().map(a => {
    if (a.id === id) {
      return { ...a, active: !a.active, triggered: false };
    }
    return a;
  });
  saveAlerts(alerts);
  return alerts;
}

// 重設已觸發警報
export function resetAlert(id) {
  const alerts = getAlerts().map(a => {
    if (a.id === id) {
      return { ...a, triggered: false, triggeredAt: null, triggeredPrice: null };
    }
    return a;
  });
  saveAlerts(alerts);
  return alerts;
}

// 請求瀏覽器推播權限
export async function requestPushPermission() {
  if (!('Notification' in window)) {
    return 'UNSUPPORTED';
  }
  if (Notification.permission === 'granted') {
    return 'GRANTED';
  }
  const perm = await Notification.requestPermission();
  return perm === 'granted' ? 'GRANTED' : 'DENIED';
}

// Web Audio API 提示音效 (3 音階上升和弦，清脆悅耳且不依賴外部音檔)
export function playAlertChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [587.33, 739.99, 880.00]; // D5, F#5, A5 和弦音
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.5);
    });
  } catch (e) {
    console.warn('Audio playback not allowed or failed:', e);
  }
}

// 發送雲端 Webhook 通知
export async function sendCloudWebhook(alert, stockData, settings) {
  if (!settings.cloudWebhookEnabled) return;

  const title = `🚨 【台股條件警報觸發】${alert.name} (${alert.code})`;
  const description = `觸發條件: ${formatConditionText(alert)}\n當前成交價: NT$ ${stockData.price}\n漲跌幅: ${stockData.pctChange}%\n當日累積成交: ${stockData.volume || 0} 張\n備忘: ${alert.note || '無'}`;
  const timestamp = new Date().toLocaleString('zh-TW', { hour12: false });

  try {
    // 1. Discord Webhook 格式
    if (settings.webhookType === 'DISCORD' && settings.webhookUrl) {
      await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Finance 台股即時戰情室',
          avatar_url: 'https://dainosososo.github.io/Finance/favicon.ico',
          embeds: [{
            title,
            description,
            color: parseFloat(stockData.pctChange) >= 0 ? 0xE11D48 : 0x10B981,
            footer: { text: `觸發時間: ${timestamp}` }
          }]
        })
      });
    }
    // 2. Telegram Bot 格式
    else if (settings.webhookType === 'TELEGRAM' && settings.telegramBotToken && settings.telegramChatId) {
      const tgUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
      await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: `*${title}*\n\n${description}\n\n時間: \`${timestamp}\``,
          parse_mode: 'Markdown'
        })
      });
    }
    // 3. 通用自訂 Webhook (JSON POST)
    else if (settings.webhookUrl) {
      await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert,
          stockData,
          timestamp
        })
      });
    }
  } catch (err) {
    console.warn('Cloud Webhook delivery error:', err);
  }
}

// 格式化警報條件文字
export function formatConditionText(alert) {
  switch (alert.condition) {
    case 'PRICE_GTE':
      return `現價突破或達到 >= NT$ ${alert.targetValue}`;
    case 'PRICE_LTE':
      return `現價跌破或低於 <= NT$ ${alert.targetValue}`;
    case 'PCT_GTE':
      return `單日漲幅達到 >= +${alert.targetValue}%`;
    case 'PCT_LTE':
      return `單日跌幅超過 <= -${Math.abs(alert.targetValue)}%`;
    case 'LIMIT_UP':
      return `強勢攻上漲停板 (>= +9.5%)`;
    case 'VOLUME_GTE':
      return `單日累積成交量突破 >= ${Number(alert.targetValue).toLocaleString()} 張`;
    default:
      return `條件: ${alert.condition} ${alert.targetValue}`;
  }
}

/**
 * 核心檢驗引擎: 傳入最新一輪行情，檢查並觸發符合條件的警報
 * @param {Array} quotes 最新個股報價陣列
 * @returns {Array} 本輪新觸發的警報陣列
 */
export function checkQuotesAgainstAlerts(quotes = []) {
  if (!quotes || quotes.length === 0) return [];

  const alerts = getAlerts();
  const settings = getAlertSettings();
  const newlyTriggered = [];

  const quoteMap = new Map();
  quotes.forEach(q => {
    const code = q.symbol || q.Code;
    if (code) quoteMap.set(code, q);
  });

  let hasUpdates = false;

  const updatedAlerts = alerts.map(alert => {
    if (!alert.active || alert.triggered) return alert;

    const q = quoteMap.get(alert.code);
    if (!q) return alert;

    const price = parseFloat(q.price || q.ClosingPrice) || 0;
    const pctChange = parseFloat(q.pctChange || q.PctChange) || 0;
    const volume = parseInt(q.volume || q.TradeVolume) || 0;

    if (price <= 0) return alert;

    let isMet = false;

    switch (alert.condition) {
      case 'PRICE_GTE':
        if (price >= alert.targetValue) isMet = true;
        break;
      case 'PRICE_LTE':
        if (price <= alert.targetValue) isMet = true;
        break;
      case 'PCT_GTE':
        if (pctChange >= alert.targetValue) isMet = true;
        break;
      case 'PCT_LTE':
        if (pctChange <= -Math.abs(alert.targetValue)) isMet = true;
        break;
      case 'LIMIT_UP':
        if (pctChange >= 9.5) isMet = true;
        break;
      case 'VOLUME_GTE':
        if (volume >= alert.targetValue) isMet = true;
        break;
      default:
        break;
    }

    if (isMet) {
      hasUpdates = true;
      const triggeredInfo = {
        ...alert,
        triggered: true,
        triggeredAt: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
        triggeredPrice: price
      };

      newlyTriggered.push({
        alert: triggeredInfo,
        quote: { price, pctChange, volume, name: alert.name, code: alert.code }
      });

      // 1. 播放音效
      if (settings.soundEnabled) {
        playAlertChime();
      }

      // 2. 瀏覽器系統推播通知 (可跨分頁)
      if (settings.browserPushEnabled && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`🔔 【台股警報觸發】${alert.name} (${alert.code})`, {
            body: `${formatConditionText(alert)}\n當前現價: NT$ ${price} (${pctChange >= 0 ? '+' : ''}${pctChange}%)`,
            icon: 'https://dainosososo.github.io/Finance/favicon.ico'
          });
        } catch (e) {
          console.warn('Native notification failed', e);
        }
      }

      // 3. 雲端 Webhook 推播
      if (settings.cloudWebhookEnabled) {
        sendCloudWebhook(triggeredInfo, { price, pctChange, volume }, settings);
      }

      return triggeredInfo;
    }

    return alert;
  });

  if (hasUpdates) {
    saveAlerts(updatedAlerts);
  }

  return newlyTriggered;
}
