import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MarketHeatmap from './components/MarketHeatmap';
import MarketSummary from './components/MarketSummary';
import RealtimeTicker from './components/RealtimeTicker';
import DailyClosingTable from './components/DailyClosingTable';
import FscNewsFeed from './components/FscNewsFeed';
import StockDetailModal from './components/StockDetailModal';
import PostMarketRankings from './components/PostMarketRankings';
import IndustryNewsFeed from './components/IndustryNewsFeed';
import DailyReportModal from './components/DailyReportModal';
import { 
  TrendingUp, 
  Layers, 
  Coins, 
  Newspaper, 
  Database, 
  Zap, 
  Sparkles,
  Flame,
  ArrowRight
} from 'lucide-react';
import { 
  fetchDailyClosingPrices, 
  fetchRealtimeQuotes, 
  fetchTaiexIndex, 
  fetchFscAnnouncements,
  DEFAULT_WATCHLIST 
} from './services/twseApi';
import {
  getMarketReportData,
  getIndustryNews
} from './services/marketReportService';

export default function App() {
  const [dailyStocks, setDailyStocks] = useState([]);
  const [watchlist, setWatchlist] = useState(['2330', '2317', '2454', '0050']);
  const [quotes, setQuotes] = useState([]);
  const [taiexData, setTaiexData] = useState(null);
  const [fscNews, setFscNews] = useState([]);
  const [postMarketData, setPostMarketData] = useState(null);
  const [industryNews, setIndustryNews] = useState([]);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [selectedStockModal, setSelectedStockModal] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10s default
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, REALTIME, RANKINGS, NEWS, DAILY
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initial and on-demand load
  const loadData = useCallback(async (forceLive = false) => {
    setIsRefreshing(true);
    try {
      const [daily, realtime, taiex, news, postMarket, indNews] = await Promise.all([
        fetchDailyClosingPrices(),
        fetchRealtimeQuotes(watchlist),
        fetchTaiexIndex(),
        fetchFscAnnouncements(),
        getMarketReportData({ forceLive }),
        getIndustryNews()
      ]);

      if (daily && daily.length > 0) setDailyStocks(daily);
      if (realtime && realtime.length > 0) setQuotes(realtime);
      if (taiex) setTaiexData(taiex);
      if (news) setFscNews(news);
      if (postMarket) setPostMarketData(postMarket);
      if (indNews) setIndustryNews(indNews);
    } catch (err) {
      console.error('Error fetching TWSE data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [watchlist]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh interval polling for live stock quotes & intraday market data
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        const realtime = await fetchRealtimeQuotes(watchlist);
        if (realtime && realtime.length > 0) setQuotes(realtime);
      } catch (e) {
        console.warn('Realtime polling error:', e);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, watchlist]);

  // Watchlist handlers
  const handleAddStock = (code) => {
    if (!watchlist.includes(code)) {
      const updated = [...watchlist, code];
      setWatchlist(updated);
      fetchRealtimeQuotes(updated).then(res => setQuotes(res));
    }
  };

  const handleRemoveStock = (code) => {
    const updated = watchlist.filter(c => c !== code);
    setWatchlist(updated);
    setQuotes(quotes.filter(q => q.symbol !== code));
  };

  // Global search handler
  const handleSearch = (term) => {
    if (!term) return;
    const clean = term.trim();
    const found = dailyStocks.find(s => s.Code?.toLowerCase() === clean.toLowerCase() || s.Name?.toLowerCase() === clean.toLowerCase()) ||
                  dailyStocks.find(s => s.Code?.toLowerCase().includes(clean.toLowerCase()) || s.Name?.toLowerCase().includes(clean.toLowerCase())) ||
                  quotes.find(q => q.symbol?.toLowerCase() === clean.toLowerCase() || q.name?.toLowerCase() === clean.toLowerCase());

    if (found) {
      setSelectedStockModal(found);
    } else {
      const defaultPrice = clean === '2330' ? '2480.00' : '100.00';
      setSelectedStockModal({ 
        Code: clean, 
        Name: isNaN(clean) ? clean : `個股 ${clean}`, 
        ClosingPrice: defaultPrice 
      });
      handleAddStock(clean);
    }
  };

  const TABS = [
    { id: 'ALL', name: '雙熱力圖中心', icon: Flame },
    { id: 'MARKET', name: '大盤與市場總覽', icon: Layers },
    { id: 'REALTIME', name: '即時自選', icon: Zap },
    { id: 'RANKINGS', name: '三大排行', icon: Coins },
    { id: 'NEWS', name: '產業時事', icon: Newspaper },
    { id: 'DAILY', name: '全股報價庫', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#fff8fa] text-slate-900 font-sans flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        onSearch={handleSearch}
        stockList={dailyStocks}
        onSelectStock={(st) => setSelectedStockModal(st)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onManualRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        taiexData={taiexData}
        onOpenReportModal={() => setShowDailyReportModal(true)}
        onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Container with Collapsible Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Left Collapsible Sidebar (櫻花粉主題) */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenReportModal={() => setShowDailyReportModal(true)}
          taiexData={taiexData}
        />

        {/* Center Main View Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Minimalist Tab Navigation Bar (櫻花粉精緻主題) */}
          <div className="flex items-center justify-between gap-3 bg-[#fff0f3] p-2 sm:p-2.5 rounded-2xl border border-pink-200/90 shadow-xs backdrop-blur-md">
            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-rose-900/80 hover:text-rose-950 hover:bg-rose-100/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-rose-600'}`} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-rose-800 font-mono hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>台灣證券交易所 即時數據連線中</span>
            </div>
          </div>

          {/* 1. TAB: ALL (首頁中心雙熱力圖: 即時成交值、產業結構板塊) */}
          {activeTab === 'ALL' && (
            <div className="space-y-6 animate-fade-in">
              <MarketHeatmap 
                dailyStocks={dailyStocks}
                onSelectStock={(st) => setSelectedStockModal(st)}
              />
            </div>
          )}

          {/* 2. TAB: MARKET (獨立大盤加權指數與市場總覽關鍵指標 TWSE) */}
          {activeTab === 'MARKET' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#fff0f3] p-5 sm:p-6 rounded-3xl border border-pink-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-200/80 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-xs">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        大盤加權指數與市場總覽關鍵指標 (TWSE)
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md border border-pink-300">
                          全市場核心看板
                        </span>
                      </h2>
                      <p className="text-xs text-rose-900/70 mt-0.5">
                        整合臺灣證交所加權指數 (TAIEX)、櫃買指數 (OTC)、市場總成交額與多空漲跌家數
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono text-rose-800 bg-white/90 px-3 py-1.5 rounded-xl border border-pink-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>臺灣證券交易所連線撮合</span>
                  </div>
                </div>

                {/* 4 Financial Metric Cards + Top Gainers */}
                <MarketSummary 
                  taiexData={taiexData}
                  topStocks={dailyStocks.slice(0, 10)}
                  onSelectStock={(st) => setSelectedStockModal(st)}
                />
              </div>

              {/* Major Weighted Stock Summary Table */}
              <div className="bg-white/95 p-5 sm:p-6 rounded-3xl border border-pink-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-rose-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      大盤權值核心標的即時報價總覽
                    </h3>
                  </div>
                  <span className="text-xs text-rose-800/80 font-mono">
                    點擊標的直接開啟三竹深度分析
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fff0f3] text-rose-900 font-bold border-b border-pink-200">
                      <tr>
                        <th className="py-2.5 px-3">代號 / 標的</th>
                        <th className="py-2.5 px-3">產業類別</th>
                        <th className="py-2.5 px-3 text-right">成交價 (NT$)</th>
                        <th className="py-2.5 px-3 text-right">漲跌</th>
                        <th className="py-2.5 px-3 text-right">漲跌幅</th>
                        <th className="py-2.5 px-3 text-right">成交量 (張)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100 font-mono">
                      {dailyStocks.slice(0, 10).map((st) => {
                        const isUp = !String(st.Change || st.change || '').includes('-');
                        return (
                          <tr 
                            key={st.Code || st.symbol} 
                            onClick={() => setSelectedStockModal(st)}
                            className="hover:bg-rose-50/50 cursor-pointer transition"
                          >
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-900 flex items-center space-x-2">
                              <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-pink-200 font-mono text-[11px]">
                                {st.Code || st.symbol}
                              </span>
                              <span>{st.Name || st.name}</span>
                            </td>
                            <td className="py-2.5 px-3 font-sans text-slate-500">
                              {st.Sector || st.sector || '上市核心'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              NT$ {st.ClosingPrice || st.price}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-bold ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
                              {st.Change || st.change || '--'}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-bold ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
                              {st.pctChange || (st.PctChange ? `${st.PctChange}%` : '--')}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-700">
                              {st.TradeVolume ? Number(st.TradeVolume).toLocaleString() : (st.volume || '--')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. TAB: REALTIME (即時自選) */}
          {activeTab === 'REALTIME' && (
            <div className="space-y-6 animate-fade-in">
              <RealtimeTicker 
                quotes={quotes}
                onSelectStock={(st) => setSelectedStockModal(st)}
                onAddStock={handleAddStock}
                onRemoveStock={handleRemoveStock}
              />
            </div>
          )}

          {/* 4. TAB: RANKINGS (三大法人與成交量排行，點擊側欄項目跳轉至此) */}
          {activeTab === 'RANKINGS' && (
            <div className="space-y-6 animate-fade-in">
              <PostMarketRankings 
                reportData={postMarketData}
                onRefresh={() => loadData(true)}
                isRefreshing={isRefreshing}
                onSelectStock={(st) => setSelectedStockModal(st)}
              />
            </div>
          )}

          {/* 5. TAB: NEWS (焦點產業結構時事與金管會公文，點擊側欄項目跳轉至此) */}
          {activeTab === 'NEWS' && (
            <div className="space-y-6 animate-fade-in">
              <IndustryNewsFeed 
                newsList={industryNews}
                onSelectStock={(st) => setSelectedStockModal(st)}
              />
              <FscNewsFeed newsList={fscNews} />
            </div>
          )}

          {/* 6. TAB: DAILY (全股每日收盤價數據庫) */}
          {activeTab === 'DAILY' && (
            <div className="space-y-6 animate-fade-in">
              <DailyClosingTable 
                dailyStocks={dailyStocks}
                onSelectStock={(st) => setSelectedStockModal(st)}
              />
            </div>
          )}
        </main>
      </div>

      {/* 13:30 Daily Market Report Modal */}
      {showDailyReportModal && (
        <DailyReportModal 
          reportData={postMarketData}
          taiexData={taiexData}
          onClose={() => setShowDailyReportModal(false)}
          onSelectStock={(st) => {
            setShowDailyReportModal(false);
            setSelectedStockModal(st);
          }}
        />
      )}

      {/* Mitake-Style Stock Detail Modal (三竹股市風格深度分析 - 含 K線蠟燭圖) */}
      {selectedStockModal && (
        <StockDetailModal 
          stock={selectedStockModal}
          onClose={() => setSelectedStockModal(null)}
        />
      )}

      {/* Minimalist Light Pink Footer */}
      <footer className="bg-[#fff0f3] border-t border-pink-200 py-6 text-center text-xs text-rose-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Finance 台灣股市觀測站</span>
            <span className="text-[10px] bg-rose-100/90 text-rose-800 px-2 py-0.5 rounded border border-pink-300 font-semibold">
              櫻花粉簡約雙熱力圖版
            </span>
          </div>

          <p className="text-rose-900/70 text-[11px]">
            臺灣證券交易所 (TWSE Open Data) • 盤後三大法人 • 自由縮放K棒蠟燭圖 • 雙熱力圖
          </p>

          <a 
            href="https://github.com/dainosososo/Finance"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-700 hover:text-rose-900 flex items-center gap-1 font-mono text-xs font-semibold"
          >
            github.com/dainosososo/Finance
          </a>
        </div>
      </footer>
    </div>
  );
}
