import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Plus, 
  Trash2, 
  Volume2, 
  Check, 
  Send, 
  ShieldAlert, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Settings, 
  Globe, 
  Zap, 
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { 
  getAlerts, 
  saveAlerts, 
  addAlert, 
  removeAlert, 
  toggleAlertActive, 
  resetAlert, 
  getAlertSettings, 
  saveAlertSettings, 
  requestPushPermission, 
  playAlertChime, 
  formatConditionText,
  sendCloudWebhook
} from '../services/alertService';

export default function AlertsManagerModal({ isOpen, onClose, stockList = [], defaultStock = null }) {
  const [activeTab, setActiveTab] = useState('LIST'); // 'LIST' | 'ADD' | 'SETTINGS'
  const [alerts, setAlerts] = useState([]);
  const [settings, setSettings] = useState(getAlertSettings());
  const [pushStatus, setPushStatus] = useState('DEFAULT'); // 'GRANTED' | 'DENIED' | 'DEFAULT'

  // 新增警報表單
  const [newCode, setNewCode] = useState(defaultStock?.Code || defaultStock?.symbol || '2330');
  const [newName, setNewName] = useState(defaultStock?.Name || defaultStock?.name || '台積電');
  const [newCondition, setNewCondition] = useState('PRICE_GTE');
  const [newTargetValue, setNewTargetValue] = useState(defaultStock?.ClosingPrice || defaultStock?.price || '2500');
  const [newNote, setNewNote] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const refreshData = () => {
    setAlerts(getAlerts());
    setSettings(getAlertSettings());
    if ('Notification' in window) {
      setPushStatus(Notification.permission.toUpperCase());
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      if (defaultStock) {
        setNewCode(defaultStock.Code || defaultStock.symbol || '');
        setNewName(defaultStock.Name || defaultStock.name || '');
        setNewTargetValue(defaultStock.ClosingPrice || defaultStock.price || '');
      }
    }
  }, [isOpen, defaultStock]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCreateAlert = (e) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    // 尋找名稱
    let matchedName = newName.trim();
    if (!matchedName) {
      const match = stockList.find(s => (s.Code || s.symbol) === newCode.trim());
      matchedName = match ? (match.Name || match.name) : newCode.trim();
    }

    addAlert({
      code: newCode.trim(),
      name: matchedName,
      condition: newCondition,
      targetValue: newTargetValue,
      note: newNote.trim()
    });

    showToast(`✅ 已成功建立 ${matchedName} 警報條件！`);
    refreshData();
    setActiveTab('LIST');
    setNewNote('');
  };

  const handleDeleteAlert = (id) => {
    removeAlert(id);
    refreshData();
  };

  const handleToggle = (id) => {
    toggleAlertActive(id);
    refreshData();
  };

  const handleReset = (id) => {
    resetAlert(id);
    refreshData();
    showToast('🔄 警報已重新啟用監控');
  };

  const handleRequestPush = async () => {
    const res = await requestPushPermission();
    setPushStatus(res);
    if (res === 'GRANTED') {
      showToast('🔔 瀏覽器系統推播已授權成功！');
      try {
        new Notification('Finance 警報系統', { body: '推播功能已成功啟用，背景看盤將即時通知！' });
      } catch {}
    } else {
      showToast('⚠️ 請在瀏覽器網址列左側允許通知權限');
    }
  };

  const handleTestSound = () => {
    playAlertChime();
    showToast('🔊 已播放 3 音階合成警報音效');
  };

  const handleSaveSettings = (newSt) => {
    setSettings(newSt);
    saveAlertSettings(newSt);
    showToast('💾 設定已成功儲存！');
  };

  const handleTestWebhook = async () => {
    if (!settings.webhookUrl && !settings.telegramBotToken) {
      showToast('❌ 請先輸入 Webhook 網址或 Telegram Token');
      return;
    }
    showToast('⏳ 正在發送測試推播...');
    await sendCloudWebhook(
      { name: '測試標的 (台積電)', code: '2330', condition: 'PRICE_GTE', targetValue: 2500, note: '這是一則測試通知' },
      { price: '2510.00', pctChange: '+3.50', volume: 45000 },
      settings
    );
    showToast('🚀 測試通知已成功送出！請至 Discord/Telegram 查收');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fff8fa] w-full max-w-2xl rounded-3xl border border-pink-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
                雲端條件警報與即時推播中心
                <span className="text-[10px] bg-white text-rose-700 px-2 py-0.5 rounded-full font-bold">
                  即時盯盤
                </span>
              </h2>
              <p className="text-xs text-rose-100/90 mt-0.5">
                突破高點、跌破低點、漲停鎖死、爆量跳動！支援瀏覽器跨分頁推播與 Discord / Telegram
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-rose-100 hover:text-white hover:bg-white/20 transition"
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

        {/* Tab Navigation */}
        <div className="flex border-b border-pink-200 bg-white/80 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'LIST'
                ? 'bg-[#fff8fa] text-rose-700 border-t-2 border-rose-600 border-x border-pink-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            監控中警報 ({alerts.length})
          </button>

          <button
            onClick={() => setActiveTab('ADD')}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'ADD'
                ? 'bg-[#fff8fa] text-rose-700 border-t-2 border-rose-600 border-x border-pink-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            新增條件警報
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'SETTINGS'
                ? 'bg-[#fff8fa] text-rose-700 border-t-2 border-rose-600 border-x border-pink-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            推播通道與音效設定
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: 警報清單 */}
          {activeTab === 'LIST' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  即時盤中條件規則 (每秒隨行情撮合自檢)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestSound}
                    className="text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-pink-200 px-2.5 py-1 rounded-xl transition flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    試聽鈴聲
                  </button>
                  <button
                    onClick={() => setActiveTab('ADD')}
                    className="text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded-xl transition flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新增
                  </button>
                </div>
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-pink-200 p-6">
                  <Bell className="w-10 h-10 text-rose-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">目前尚無設置任何價格警報</p>
                  <p className="text-xs text-slate-400 mt-1">
                    您可以設定目標價、漲停通知或單日跌幅，當行情觸及時代碼自動跳出推播通知！
                  </p>
                  <button
                    onClick={() => setActiveTab('ADD')}
                    className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                  >
                    立即新增第一筆警報 ➔
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {alerts.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                        item.triggered 
                          ? 'bg-amber-50/80 border-amber-300' 
                          : item.active 
                            ? 'bg-white border-pink-200 shadow-2xs' 
                            : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <button
                          onClick={() => handleToggle(item.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                            item.active ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-500'
                          }`}
                          title="點擊切換啟用/暫停"
                        >
                          {item.active ? <Check className="w-4 h-4" /> : '停'}
                        </button>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-pink-200">
                              {item.code}
                            </span>
                            <span className="font-bold text-sm text-slate-900">{item.name}</span>
                            {item.triggered && (
                              <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                                🔔 已於 {item.triggeredAt} 觸發 (NT$ {item.triggeredPrice})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-rose-900/80 font-medium mt-0.5">
                            {formatConditionText(item)}
                          </p>
                          {item.note && (
                            <p className="text-[11px] text-slate-400 mt-0.5">備忘: {item.note}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {item.triggered && (
                          <button
                            onClick={() => handleReset(item.id)}
                            className="p-1.5 text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition"
                            title="重新啟用此警報"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAlert(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 新增警報 */}
          {activeTab === 'ADD' && (
            <form onSubmit={handleCreateAlert} className="space-y-4 bg-white p-5 rounded-2xl border border-pink-200 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    股票代號
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => {
                      const code = e.target.value.trim();
                      setNewCode(code);
                      const m = stockList.find(s => (s.Code || s.symbol) === code);
                      if (m) setNewName(m.Name || m.name);
                    }}
                    placeholder="例: 2330, 2454, 4958"
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-rose-500 bg-[#fffbfc]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    標的名稱 (選填)
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例: 台積電"
                    className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-rose-500 bg-[#fffbfc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  觸發條件類型
                </label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-rose-500 bg-[#fffbfc]"
                >
                  <option value="PRICE_GTE">現價突破或達到 &gt;= 目標價 (做多突破)</option>
                  <option value="PRICE_LTE">現價跌破或低於 &lt;= 目標價 (做空跌破/停損)</option>
                  <option value="LIMIT_UP">強勢攻上漲停板 (&gt;= +9.5%)</option>
                  <option value="PCT_GTE">單日漲幅突破 &gt;= X%</option>
                  <option value="PCT_LTE">單日跌幅超過 &lt;= -X%</option>
                  <option value="VOLUME_GTE">單日累積成交量突破 &gt;= X 張 (爆量追蹤)</option>
                </select>
              </div>

              {newCondition !== 'LIMIT_UP' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    目標門檻值 ({newCondition.startsWith('PRICE') ? 'NT$ 元' : newCondition.startsWith('PCT') ? '%' : '張數'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(e.target.value)}
                    placeholder="輸入目標數字 (如 2500 或 5.5)"
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-rose-500 bg-[#fffbfc]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  備忘說明 (可選)
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="例: 突破盤整區間追價、跌破月線停損"
                  className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-rose-500 bg-[#fffbfc]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  儲存並開始監控
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: 推播通道與音效設定 */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-4">
              {/* 1. 瀏覽器推播 */}
              <div className="bg-white p-4 rounded-2xl border border-pink-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-rose-600" />
                      瀏覽器原生推播 (Web Notifications API)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      即使切換到其他瀏覽器分頁或在背景工作，桌面右下角也能跳出即時警報卡片！
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pushStatus === 'GRANTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pushStatus === 'GRANTED' ? '已授權' : '未授權'}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {pushStatus !== 'GRANTED' ? (
                    <button
                      onClick={handleRequestPush}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                    >
                      <Bell className="w-4 h-4" />
                      點擊授權瀏覽器推播通知
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> 瀏覽器已允許推播通知
                    </span>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer ml-auto text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => handleSaveSettings({ ...settings, soundEnabled: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    觸發時播放提示鈴聲
                  </label>
                </div>
              </div>

              {/* 2. 雲端 Webhook 推播 (Discord / Telegram) */}
              <div className="bg-white p-4 rounded-2xl border border-pink-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-indigo-600" />
                      雲端 Webhook 自動轉發 (Discord / Telegram)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      可將警報直接打到您的個人 Discord 頻道或 Telegram Bot，手機立馬收到通知！
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.cloudWebhookEnabled}
                      onChange={(e) => handleSaveSettings({ ...settings, cloudWebhookEnabled: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    啟用雲端轉發
                  </label>
                </div>

                {settings.cloudWebhookEnabled && (
                  <div className="space-y-3 pt-2 border-t border-pink-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        轉發通道類型
                      </label>
                      <select
                        value={settings.webhookType}
                        onChange={(e) => setSettings({ ...settings, webhookType: e.target.value })}
                        className="w-full text-xs font-bold p-2 rounded-xl border border-pink-200 bg-[#fffbfc]"
                      >
                        <option value="DISCORD">Discord Webhook (最方便，貼上網址即用)</option>
                        <option value="TELEGRAM">Telegram Bot (輸入 Bot Token 與 Chat ID)</option>
                        <option value="GENERIC">自訂 Webhook (通用 JSON POST)</option>
                      </select>
                    </div>

                    {settings.webhookType !== 'TELEGRAM' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Webhook URL 網址
                        </label>
                        <input
                          type="url"
                          value={settings.webhookUrl}
                          onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                          placeholder="https://discord.com/api/webhooks/..."
                          className="w-full text-xs font-mono p-2 rounded-xl border border-pink-200 bg-[#fffbfc]"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Telegram Bot Token
                          </label>
                          <input
                            type="text"
                            value={settings.telegramBotToken}
                            onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                            placeholder="例: 123456:ABC-DEF1234..."
                            className="w-full text-xs font-mono p-2 rounded-xl border border-pink-200 bg-[#fffbfc]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Chat ID
                          </label>
                          <input
                            type="text"
                            value={settings.telegramChatId}
                            onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                            placeholder="例: 987654321"
                            className="w-full text-xs font-mono p-2 rounded-xl border border-pink-200 bg-[#fffbfc]"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleTestWebhook}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        發送測試訊息
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveSettings(settings)}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                      >
                        儲存 Webhook 設定
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
