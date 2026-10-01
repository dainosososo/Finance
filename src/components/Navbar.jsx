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
  onOpenReportModal
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

  const isUp = taiexData?.change?.includes('+');

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/90 shadow-xs backdrop-blur-md bg-white/95">
      {/* Top Announcement & TAIEX Ticker Bar (Light Theme) */}
      <div className="bg-slate-50 border-b border-slate-200 py-1.5 px-4 text-xs font-mono flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
              證交所即時連線 (含當日即時K線 • 2330: NT$ 2,480~2,510)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-sans">加權指數 (TAIEX):</span>
            <span className="font-bold text-slate-900">{taiexData?.taiex || '23,125.80'}</span>
            <span className={`inline-flex items-center font-bold px-1.5 py-0.2 rounded text-[11px] ${
              isUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
            }`}>
              {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {taiexData?.change || '+245.60'} ({taiexData?.pctChange || '+1.07%'})
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-500 font-sans">
            <span>成交金額:</span>
            <span className="text-slate-800 font-bold">{taiexData?.volume || '4,125.80 億'}</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-red-600 font-sans font-medium">漲: {taiexData?.upCount || 689}</span>
            <span className="text-emerald-600 font-sans font-medium">跌: {taiexData?.downCount || 231}</span>
            <span className="text-slate-500 font-sans">平: {taiexData?.flatCount || 98}</span>
          </div>
        </div>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/dainosososo/Finance"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-xs"
        >
          <Github className="w-3.5 h-3.5" />
          <span>dainosososo/Finance</span>
        </a>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          className="flex items-center space-x-3 flex-shrink-0 cursor-pointer"
          onClick={() => setActiveTab && setActiveTab('ALL')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-blue-500/10">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                Finance
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                TWSE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">台灣股市即時行情與盤後觀測站</p>
          </div>
        </div>

        {/* Search Bar with Autocomplete Dropdown (Light Theme) */}
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
              className="w-full bg-slate-100/90 text-sm text-slate-900 placeholder-slate-400 pl-10 pr-10 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            {searchTerm && (
              <button
                type="submit"
                className="absolute right-2 top-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 px-2.5 py-1 rounded-lg transition-colors font-medium shadow-xs"
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
          {/* Quick Section Tab Links */}
          {setActiveTab && (
            <div className="hidden lg:flex items-center space-x-1 mr-2 text-xs font-medium text-slate-600">
              <button
                onClick={() => setActiveTab('REALTIME')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'REALTIME' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                自選行情
              </button>
              <button
                onClick={() => setActiveTab('RANKINGS')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'RANKINGS' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                三大排行
              </button>
              <button
                onClick={() => setActiveTab('NEWS')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'NEWS' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                產業時事
              </button>
              <button
                onClick={() => setActiveTab('DAILY')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'DAILY' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                全股報價
              </button>
            </div>
          )}

          {/* 13:30 Daily Report Modal Trigger */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg font-bold transition shadow-sm active:scale-95"
            title="開啟 13:30 盤後精簡報告"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>13:30 盤後日報</span>
          </button>

          {/* Refresh Toggle (Light Theme) */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                autoRefresh 
                  ? 'bg-white text-emerald-600 border border-slate-200 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-500 fill-emerald-500/20' : ''}`} />
              <span>{autoRefresh ? '自動' : '暫停'}</span>
            </button>

            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-xs text-slate-700 font-mono focus:outline-none px-1 py-0.5 cursor-pointer"
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
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition-all shadow-xs active:scale-95 disabled:opacity-50"
            title="手動抓取最新證交所資料"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">刷新</span>
          </button>
        </div>
      </div>
    </header>
  );
}
