import React, { useState } from 'react';
import { TrendingUp, Search, RefreshCw, Github, Zap, ArrowUpRight, ArrowDownRight, X, Bell, Wifi } from 'lucide-react';
import { DAILY_TWSE_STOCKS_MAP } from '../data/dailyTwseStocksMap';

export const STOCK_SEARCH_ALIASES = {
  '密望實': '8043',
  '密望': '8043',
  '蜜望實': '8043',
  '世界先進': '5347',
  '世界': '5347',
  '群益證': '6005',
  '群益證券': '6005',
  '群益': '6005',
  '台積': '2330',
  '台積電': '2330',
  '聯發': '2454',
  '聯發科': '2454',
  '鴻海': '2317',
  '廣達': '2382',
  '大立光': '3008',
  '日月光': '3711',
  '日月光投控': '3711',
  '聯電': '2303',
  '威剛': '3260',
  '日電貿': '3090',
  '鈊象': '3293',
  '富邦金': '2881',
  '富邦金控': '2881',
  '國泰金': '2882',
  '國泰金控': '2882',
  '中信金': '2891',
  '中信金控': '2891',
  '玉山金': '2884',
  '玉山金控': '2884',
  '元大金': '2885',
  '元大金控': '2885',
  '兆豐金': '2886',
  '兆豐金控': '2886',
  '開發金': '2883',
  '凱基金': '2883',
  '凱基金控': '2883'
};

export default function Navbar({ 
  onSearch, 
  stockList = [],
  onSelectStock,
  activeTab = 'ALL',
  setActiveTab,
  autoRefresh, 
  setAutoRefresh, 
  refreshInterval, 
  setRefreshInterval,
  onManualRefresh,
  isRefreshing,
  taiexData,
  onOpenReportModal,
  onToggleSidebar,
  isSidebarCollapsed,
  onOpenAlertsModal,
  alertCount = 0,
  hasTriggeredAlert = false,
  onOpenWsModal,
  wsStatus = 'DISCONNECTED',
  wsLatency = 0
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.trim().toLowerCase();

    // 1. 優先檢查別名庫 (如 密望實 -> 8043, 世界先進 -> 5347)
    const aliasCode = STOCK_SEARCH_ALIASES[searchTerm.trim()];
    const aliasStock = aliasCode && DAILY_TWSE_STOCKS_MAP[aliasCode] ? [{
      Code: aliasCode,
      Name: DAILY_TWSE_STOCKS_MAP[aliasCode].name,
      ClosingPrice: String(DAILY_TWSE_STOCKS_MAP[aliasCode].price || DAILY_TWSE_STOCKS_MAP[aliasCode].close),
      Change: String(DAILY_TWSE_STOCKS_MAP[aliasCode].change),
      PctChange: String(DAILY_TWSE_STOCKS_MAP[aliasCode].pctChange),
      TradeVolume: String(DAILY_TWSE_STOCKS_MAP[aliasCode].volume * 1000),
      Sector: DAILY_TWSE_STOCKS_MAP[aliasCode].market || '上市櫃'
    }] : [];

    // 2. 當前 stockList 匹配
    const hits = (stockList || [])
      .filter(s => (s.Code && s.Code.toLowerCase().includes(term)) || (s.Name && s.Name.toLowerCase().includes(term)));

    // 3. 全台股 2,248 檔上市櫃字典庫即時檢索 (含精確代號/名稱加權排序)
    const mapHits = Object.entries(DAILY_TWSE_STOCKS_MAP)
      .filter(([code, s]) => {
        const cLower = code.toLowerCase();
        const nLower = s.name.toLowerCase();
        return cLower.includes(term) || nLower.includes(term) || term.includes(nLower);
      })
      .sort(([c1, s1], [c2, s2]) => {
        const exact1 = c1.toLowerCase() === term || s1.name.toLowerCase() === term;
        const exact2 = c2.toLowerCase() === term || s2.name.toLowerCase() === term;
        if (exact1 && !exact2) return -1;
        if (!exact1 && exact2) return 1;
        const start1 = s1.name.toLowerCase().startsWith(term);
        const start2 = s2.name.toLowerCase().startsWith(term);
        if (start1 && !start2) return -1;
        if (!start1 && start2) return 1;
        return 0;
      })
      .map(([code, s]) => ({
        Code: code,
        Name: s.name,
        ClosingPrice: String(s.price || s.close),
        Change: String(s.change),
        PctChange: String(s.pctChange),
        TradeVolume: String(s.volume * 1000),
        Sector: s.market || '上市櫃'
      }));

    // 合併結果並去重
    const combined = [...aliasStock, ...hits, ...mapHits];
    const seen = new Set();
    const unique = [];
    for (const item of combined) {
      if (!seen.has(item.Code)) {
        seen.add(item.Code);
        unique.push(item);
      }
      if (unique.length >= 8) break;
    }
    return unique;
  }, [searchTerm, stockList]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (searchResults.length > 0 && onSelectStock) {
        onSelectStock(searchResults[0]);
      } else {
        onSearch(searchTerm.trim());
      }
      setIsFocused(false);
    }
  };

  const handleSelectResult = (st) => {
    if (onSelectStock) {
      onSelectStock(st);
    } else if (onSearch) {
      onSearch(st.Code || st.Name);
    }
    setSearchTerm('');
    setIsFocused(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-pink-200 shadow-xs backdrop-blur-md bg-[#fff8fa]/95">
      {/* Main Navigation Bar - 搜尋框占用整個橫幅空間 */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Sidebar Toggle & Brand Logo */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-rose-700 hover:text-rose-950 hover:bg-rose-100/70 transition border border-pink-200 shadow-2xs"
              title="展開/收起側欄選單"
              aria-label="展開/收起側欄選單"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div 
            className="flex items-center space-x-2.5 cursor-pointer"
            onClick={() => setActiveTab && setActiveTab('ALL')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-600 to-rose-700 p-0.5 shadow-md shadow-pink-500/10">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                  Finance
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-rose-100 text-rose-800 rounded border border-pink-300">
                  TWSE
                </span>
              </div>
              <p className="text-[11px] text-rose-900/70 hidden sm:block">台灣股市雙熱力圖與盤後觀測站</p>
            </div>
          </div>
        </div>

        {/* Search Bar with Autocomplete Dropdown - 占用整個橫幅空間 */}
        <div className="flex-1 min-w-0 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsFocused(true);
              }}
              placeholder="搜尋股票代號或名稱 (如: 2330, 台積電, 聯發科, 鴻海, 0050)..."
              className="w-full bg-white text-sm text-slate-900 placeholder-rose-300 pl-11 pr-24 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all shadow-xs"
            />
            <Search className="absolute left-4 top-3 w-4 h-4 text-rose-400" />
            <div className="absolute right-2.5 top-1.5 flex items-center space-x-1.5">
              {searchTerm ? (
                <button
                  type="submit"
                  className="text-xs bg-rose-600 text-white hover:bg-rose-700 px-3.5 py-1.5 rounded-xl transition-colors font-bold shadow-xs"
                >
                  搜尋
                </button>
              ) : (
                <span className="text-[11px] font-mono font-medium text-rose-800/70 bg-[#fff5f7] border border-pink-200 px-2 py-1 rounded-lg hidden sm:inline-block">
                  新台幣 NT$ 計價
                </span>
              )}
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isFocused && searchTerm.trim() && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsFocused(false)} 
              />
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden backdrop-blur-xl animate-fade-in">
                <div className="p-2.5 border-b border-slate-200 text-[11px] font-bold text-slate-500 px-4 flex justify-between items-center bg-slate-50">
                  <span>即時配對標的 (點擊開啟即時個股分析)</span>
                  <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-pink-200">
                    新台幣 NT$ 計價
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map((item) => (
                    <div
                      key={item.Code}
                      onMouseDown={() => handleSelectResult(item)}
                      className="p-3 hover:bg-rose-50/40 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-pink-200">
                          {item.Code}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                            {item.Name}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            {item.Sector || '上市'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-900 block">
                          {item.ClosingPrice || item.price ? `NT$ ${item.ClosingPrice || item.price}` : '--'}
                        </span>
                        <span className={`text-[11px] font-mono font-bold ${
                          String(item.Change || '').includes('-') ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {item.Change || '--'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {searchResults.length === 0 && (
                    <div 
                      onMouseDown={() => handleSelectResult({ Code: searchTerm.trim(), Name: searchTerm.trim() })}
                      className="p-4 hover:bg-slate-50 cursor-pointer text-center text-xs text-rose-600 transition"
                    >
                      開啟「<strong className="text-slate-900">{searchTerm.trim()}</strong>」三竹深度技術與籌碼分析 ➔
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Action Buttons: WebSocket Status & Alerts Manager */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* WebSocket Status Pill */}
          <button
            onClick={onOpenWsModal}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              wsStatus === 'CONNECTED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : wsStatus === 'FALLBACK_RACING'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-rose-50 text-rose-800 border-pink-200 hover:bg-rose-100'
            }`}
            title="點擊開啟 WebSocket 串流控制台與延遲監控"
          >
            <span className={`w-2 h-2 rounded-full ${
              wsStatus === 'CONNECTED'
                ? 'bg-emerald-500 animate-ping'
                : wsStatus === 'FALLBACK_RACING'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500'
            }`}></span>
            <span className="hidden md:inline">
              {wsStatus === 'CONNECTED' ? 'WS 串流' : wsStatus === 'FALLBACK_RACING' ? '競速串流' : '未連線'}
            </span>
            <span className="text-[10px] opacity-75">{wsLatency > 0 ? `${wsLatency}ms` : ''}</span>
          </button>

          {/* Cloud Alerts Bell Button */}
          <button
            onClick={onOpenAlertsModal}
            className={`relative p-2 rounded-xl border transition shadow-2xs cursor-pointer ${
              hasTriggeredAlert
                ? 'bg-rose-600 text-white border-rose-600 animate-bounce'
                : 'bg-white text-rose-700 hover:bg-rose-50 border-pink-200'
            }`}
            title="雲端條件警報與推播中心"
            aria-label="雲端條件警報"
          >
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white ${
                hasTriggeredAlert ? 'bg-amber-400 text-slate-900 animate-pulse' : 'bg-rose-600 text-white'
              }`}>
                {alertCount}
              </span>
            )}
          </button>

          {/* Manual Refresh */}
          {onManualRefresh && (
            <button
              onClick={onManualRefresh}
              className={`p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-pink-200 transition shadow-2xs ${
                isRefreshing ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="強制刷新全市場即時數據"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
