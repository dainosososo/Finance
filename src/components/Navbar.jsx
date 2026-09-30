import React, { useState } from 'react';
import { TrendingUp, Search, RefreshCw, Github, Zap, Shield, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800/80 shadow-2xl backdrop-blur-md">
      {/* Top Announcement & TAIEX Ticker Bar */}
      <div className="bg-dark-800/90 border-b border-gray-800 py-1.5 px-4 text-xs font-mono flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
              證交所即時連線中
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-sans">加權指數 (TAIEX):</span>
            <span className="font-bold text-gray-100">{taiexData?.taiex || '23,125.80'}</span>
            <span className={`inline-flex items-center font-bold px-1.5 py-0.2 rounded text-[11px] ${
              isUp ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'
            }`}>
              {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {taiexData?.change || '+245.60'} ({taiexData?.pctChange || '+1.07%'})
            </span>
          </div>

          <div className="flex items-center space-x-2 text-gray-400 font-sans">
            <span>成交量:</span>
            <span className="text-gray-200 font-bold">{taiexData?.volume || '4,125.80 億'}</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-red-400 font-sans">漲: {taiexData?.upCount || 689}</span>
            <span className="text-emerald-400 font-sans">跌: {taiexData?.downCount || 231}</span>
            <span className="text-gray-400 font-sans">平: {taiexData?.flatCount || 98}</span>
          </div>
        </div>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/dainosososo/Finance"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center space-x-1.5 text-xs text-gray-300 hover:text-white transition-colors bg-gray-800/80 hover:bg-gray-700/80 px-2.5 py-1 rounded-md border border-gray-700"
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-400 font-sans">
                Finance
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 rounded border border-blue-500/30">
                TWSE
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">台灣股市即時行情與盤後觀測站</p>
          </div>
        </div>

        {/* Search Bar with Autocomplete Dropdown */}
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
              placeholder="搜尋股票代號或名稱 (如: 2330, 台積電, 鴻海)..."
              className="w-full bg-dark-800/80 text-sm text-gray-100 placeholder-gray-400 pl-10 pr-10 py-2 rounded-xl border border-gray-700/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
            {searchTerm && (
              <button
                type="submit"
                className="absolute right-2 top-1.5 text-xs bg-blue-600 text-white hover:bg-blue-500 px-2.5 py-1 rounded-lg transition-colors font-medium"
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
              <div className="absolute left-0 right-0 top-full mt-2 bg-dark-900 border border-gray-700/90 rounded-2xl shadow-2xl z-40 overflow-hidden backdrop-blur-xl animate-fade-in">
                <div className="p-2 border-b border-gray-800 text-[11px] font-bold text-gray-400 px-3 flex justify-between items-center">
                  <span>即時配對標的 (點擊開啟三竹完整分析)</span>
                  <span className="text-[10px] text-blue-400">NT$ 報價</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-800/50">
                  {searchResults.map((item) => (
                    <div
                      key={item.Code}
                      onMouseDown={() => handleSelectResult(item)}
                      className="p-3 hover:bg-dark-800/80 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {item.Code}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                            {item.Name}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {item.Sector || '上市'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-gray-100 block">
                          NT$ {item.ClosingPrice || item.price || '990.00'}
                        </span>
                        <span className={`text-[11px] font-mono ${
                          String(item.Change || '').includes('-') ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {item.Change || '+12.00'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {searchResults.length === 0 && (
                    <div 
                      onMouseDown={() => handleSelectResult({ Code: searchTerm.trim(), Name: searchTerm.trim() })}
                      className="p-4 hover:bg-dark-800/80 cursor-pointer text-center text-xs text-blue-400 transition"
                    >
                      開啟「<strong className="text-white">{searchTerm.trim()}</strong>」三竹深度技術與籌碼分析 ➔
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
            <div className="hidden lg:flex items-center space-x-1 mr-2 text-xs font-medium text-gray-300">
              <button
                onClick={() => setActiveTab('REALTIME')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'REALTIME' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white hover:bg-gray-800'
                }`}
              >
                自選行情
              </button>
              <button
                onClick={() => setActiveTab('RANKINGS')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'RANKINGS' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white hover:bg-gray-800'
                }`}
              >
                三大排行
              </button>
              <button
                onClick={() => setActiveTab('NEWS')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'NEWS' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white hover:bg-gray-800'
                }`}
              >
                產業時事
              </button>
              <button
                onClick={() => setActiveTab('DAILY')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeTab === 'DAILY' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white hover:bg-gray-800'
                }`}
              >
                全股報價
              </button>
            </div>
          )}

          {/* 13:30 Daily Report Modal Trigger */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600/90 to-pink-600/90 hover:from-red-500 hover:to-pink-500 text-white text-xs px-3 py-2 rounded-lg font-bold transition shadow-lg shadow-red-500/20 active:scale-95"
            title="開啟 13:30 盤後精簡報告"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>13:30 盤後日報</span>
          </button>

          {/* Refresh Toggle */}
          <div className="hidden sm:flex items-center bg-dark-800 rounded-lg p-1 border border-gray-700/80">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                autoRefresh 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-400 fill-emerald-400/30' : ''}`} />
              <span>{autoRefresh ? '自動' : '暫停'}</span>
            </button>

            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-xs text-gray-300 font-mono focus:outline-none px-1 py-0.5 cursor-pointer"
              >
                <option value={5000} className="bg-dark-800">5s</option>
                <option value={10000} className="bg-dark-800">10s</option>
                <option value={30000} className="bg-dark-800">30s</option>
              </select>
            )}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 bg-blue-600/90 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
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
