import React, { useState } from 'react';
import { TrendingUp, Search, RefreshCw, Github, Zap, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

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
  isSidebarCollapsed
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.trim().toLowerCase();
    return (stockList || [])
      .filter(s => (s.Code && s.Code.toLowerCase().includes(term)) || (s.Name && s.Name.toLowerCase().includes(term)))
      .slice(0, 6);
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
      {/* Top System Status Bar (櫻花粉主題) */}
      <div className="bg-[#fff0f3] border-b border-pink-200 py-1.5 px-4 text-xs font-mono flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-pink-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
            臺灣證券交易所 (TWSE) 即時連線 • 當日即時行情中心
          </span>
          <span className="hidden md:inline text-[11px] text-rose-900/70 font-sans">
            含雙熱力圖多區塊觀測 • 自由縮放K線與三竹深度分析
          </span>
        </div>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/dainosososo/Finance"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center space-x-1.5 text-xs text-rose-800 hover:text-rose-950 transition-colors bg-white/90 hover:bg-rose-50 px-2.5 py-1 rounded-md border border-pink-200 shadow-2xs"
        >
          <Github className="w-3.5 h-3.5" />
          <span>dainosososo/Finance</span>
        </a>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
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

        {/* Search Bar with Autocomplete Dropdown (櫻花粉主題) */}
        <div className="flex-1 max-w-md mx-2 relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsFocused(true);
              }}
              placeholder="搜尋股票代號或名稱 (如: 2330, 台積電, 聯發科)..."
              className="w-full bg-white/95 text-sm text-slate-900 placeholder-rose-300 pl-10 pr-10 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-400 transition-all shadow-inner"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-rose-400" />
            {searchTerm && (
              <button
                type="submit"
                className="absolute right-2 top-1.5 text-xs bg-rose-600 text-white hover:bg-rose-700 px-2.5 py-1 rounded-lg transition-colors font-medium shadow-xs"
              >
                搜尋
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {isFocused && searchTerm.trim() && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsFocused(false)} 
              />
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden backdrop-blur-xl animate-fade-in">
                <div className="p-2 border-b border-slate-200 text-[11px] font-bold text-slate-500 px-3 flex justify-between items-center bg-slate-50">
                  <span>即時配對標的 (點擊開啟三竹完整分析)</span>
                  <span className="text-[10px] text-blue-700 font-bold">新台幣 NT$ 計價</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map((item) => (
                    <div
                      key={item.Code}
                      onMouseDown={() => handleSelectResult(item)}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.Code}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
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
                      className="p-4 hover:bg-slate-50 cursor-pointer text-center text-xs text-blue-600 transition"
                    >
                      開啟「<strong className="text-slate-900">{searchTerm.trim()}</strong>」三竹深度技術與籌碼分析 ➔
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nav Links & Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Section Tab Links (櫻花粉主題) */}
          {setActiveTab && (
            <div className="hidden lg:flex items-center space-x-1 mr-2 text-xs font-medium text-rose-800">
              <button
                onClick={() => setActiveTab('REALTIME')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'REALTIME' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'hover:text-rose-950 hover:bg-rose-100/60'
                }`}
              >
                自選行情
              </button>
              <button
                onClick={() => setActiveTab('RANKINGS')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'RANKINGS' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'hover:text-rose-950 hover:bg-rose-100/60'
                }`}
              >
                三大排行
              </button>
              <button
                onClick={() => setActiveTab('NEWS')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'NEWS' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'hover:text-rose-950 hover:bg-rose-100/60'
                }`}
              >
                產業時事
              </button>
              <button
                onClick={() => setActiveTab('DAILY')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'DAILY' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'hover:text-rose-950 hover:bg-rose-100/60'
                }`}
              >
                全股報價
              </button>
            </div>
          )}

          {/* 13:30 Daily Report Modal Trigger */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-2 rounded-xl font-bold transition shadow-xs active:scale-95"
            title="開啟 13:30 盤後精簡報告"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>13:30 盤後日報</span>
          </button>

          {/* Refresh Toggle (櫻花粉精緻主題) */}
          <div className="hidden sm:flex items-center bg-[#fff0f3] rounded-xl p-1 border border-pink-200">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                autoRefresh 
                  ? 'bg-white text-rose-700 border border-pink-200 shadow-2xs font-bold' 
                  : 'text-rose-800 hover:text-rose-950'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${autoRefresh ? 'text-rose-600 fill-rose-600/20' : ''}`} />
              <span>{autoRefresh ? '自動' : '暫停'}</span>
            </button>

            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-xs text-rose-900 font-mono focus:outline-none px-1 py-0.5 cursor-pointer"
              >
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            )}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-2 rounded-xl font-medium transition-all shadow-xs active:scale-95 disabled:opacity-50"
            title="手動抓取最新證交所資料"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-bold">刷新</span>
          </button>
        </div>
      </div>
    </header>
  );
}
