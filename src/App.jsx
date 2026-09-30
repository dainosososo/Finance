import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
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
      // Open detail modal with standard generated stock data in NT$
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
    { id: 'ALL', name: '綜合總覽', icon: Sparkles },
    { id: 'REALTIME', name: '即時自選', icon: Zap },
    { id: 'RANKINGS', name: '三大排行', icon: Coins },
    { id: 'NEWS', name: '產業時事', icon: Newspaper },
    { id: 'DAILY', name: '全股報價庫', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Minimalist Tab Navigation Bar (Light Theme) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-sm backdrop-blur-md">
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
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-3 text-xs text-slate-600 font-mono px-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              全站標的均以 <strong className="text-slate-900">新台幣 (NT$)</strong> 計價
            </span>
          </div>
        </div>

        {/* 1. TAB: ALL (綜合總覽 - 淺色簡約視圖) */}
        {activeTab === 'ALL' && (
          <div className="space-y-6 animate-fade-in">
            {/* Market Overview & Metrics */}
            <MarketSummary 
              taiexData={taiexData}
              topStocks={dailyStocks.slice(0, 10)}
              onSelectStock={(st) => setSelectedStockModal(st)}
            />

            {/* Quick Watchlist Section */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">自選關注即時報價</h3>
                </div>
                <button 
                  onClick={() => setActiveTab('REALTIME')}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold transition"
                >
                  五檔盤況與管理自選 ➔
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quotes.map((q) => {
                  const isUp = parseFloat(q.change || 0) >= 0;
                  return (
                    <div
                      key={q.symbol}
                      onClick={() => setSelectedStockModal(q)}
                      className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer transition flex flex-col justify-between shadow-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{q.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{q.symbol}</span>
                        </div>
                        <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                        }`}>
                          {isUp ? `+${q.pctChange}%` : `${q.pctChange}%`}
                        </span>
                      </div>
                      <div className="mt-2 text-right">
                        <span className={`text-base font-extrabold font-mono ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
                          NT$ {q.price}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TWSE Rankings Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  證交所 13:30 盤後三大排行精要
                </h3>
                <button 
                  onClick={() => setActiveTab('RANKINGS')}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold transition"
                >
                  完整排行列表 ➔
                </button>
              </div>

              <PostMarketRankings 
                reportData={postMarketData}
                onRefresh={() => loadData(true)}
                isRefreshing={isRefreshing}
                onSelectStock={(st) => setSelectedStockModal(st)}
              />
            </div>

            {/* Industry News Highlight */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-purple-600" />
                  焦點產業結構時事 (五大財經媒體)
                </h3>
                <button 
                  onClick={() => setActiveTab('NEWS')}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 font-semibold transition"
                >
                  產業結構全覽 ➔
                </button>
              </div>

              <IndustryNewsFeed 
                newsList={industryNews}
                onSelectStock={(st) => setSelectedStockModal(st)}
              />
            </div>
          </div>
        )}

        {/* 2. TAB: REALTIME (即時自選與五檔) */}
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

        {/* 3. TAB: RANKINGS (三大法人與成交量排行) */}
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

        {/* 4. TAB: NEWS (產業結構分類新聞時事) */}
        {activeTab === 'NEWS' && (
          <div className="space-y-6 animate-fade-in">
            <IndustryNewsFeed 
              newsList={industryNews}
              onSelectStock={(st) => setSelectedStockModal(st)}
            />
            <FscNewsFeed newsList={fscNews} />
          </div>
        )}

        {/* 5. TAB: DAILY (全股每日收盤價數據庫) */}
        {activeTab === 'DAILY' && (
          <div className="space-y-6 animate-fade-in">
            <DailyClosingTable 
              dailyStocks={dailyStocks}
              onSelectStock={(st) => setSelectedStockModal(st)}
            />
          </div>
        )}
      </main>

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

      {/* Minimalist Light Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Finance 台灣股市觀測站</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">
              三竹製選股版 v1.2 (淺色簡約)
            </span>
          </div>

          <p className="text-slate-500 text-[11px]">
            臺灣證券交易所 (TWSE Open Data) • 盤後三大法人 • 盤差與K棒蠟燭圖 • 五大財經媒體
          </p>

          <a 
            href="https://github.com/dainosososo/Finance"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-mono text-xs font-semibold"
          >
            github.com/dainosososo/Finance
          </a>
        </div>
      </footer>
    </div>
  );
}
