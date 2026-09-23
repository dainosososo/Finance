import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MarketSummary from './components/MarketSummary';
import RealtimeTicker from './components/RealtimeTicker';
import DailyClosingTable from './components/DailyClosingTable';
import FscNewsFeed from './components/FscNewsFeed';
import StockDetailModal from './components/StockDetailModal';
import { 
  fetchDailyClosingPrices, 
  fetchRealtimeQuotes, 
  fetchTaiexIndex, 
  fetchFscAnnouncements,
  DEFAULT_WATCHLIST 
} from './services/twseApi';

export default function App() {
  const [dailyStocks, setDailyStocks] = useState([]);
  const [watchlist, setWatchlist] = useState(['2330', '2317', '2454', '0050']);
  const [quotes, setQuotes] = useState([]);
  const [taiexData, setTaiexData] = useState(null);
  const [fscNews, setFscNews] = useState([]);
  const [selectedStockModal, setSelectedStockModal] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10s default
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, REALTIME, DAILY, NEWS

  // Initial load
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [daily, realtime, taiex, news] = await Promise.all([
        fetchDailyClosingPrices(),
        fetchRealtimeQuotes(watchlist),
        fetchTaiexIndex(),
        fetchFscAnnouncements()
      ]);

      if (daily && daily.length > 0) setDailyStocks(daily);
      if (realtime && realtime.length > 0) setQuotes(realtime);
      if (taiex) setTaiexData(taiex);
      if (news) setFscNews(news);
    } catch (err) {
      console.error('Error fetching TWSE data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [watchlist]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh interval polling for live stock quotes
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(async () => {
      const realtime = await fetchRealtimeQuotes(watchlist);
      if (realtime && realtime.length > 0) setQuotes(realtime);
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
    const found = dailyStocks.find(s => s.Code === term || s.Name === term) ||
                  quotes.find(q => q.symbol === term || q.name === term);

    if (found) {
      setSelectedStockModal(found);
    } else {
      // Add to watchlist
      handleAddStock(term);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        onSearch={handleSearch}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onManualRefresh={loadData}
        isRefreshing={isRefreshing}
        taiexData={taiexData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Market Overview & Metrics */}
        <MarketSummary 
          taiexData={taiexData}
          topStocks={dailyStocks.slice(0, 10)}
        />

        {/* Real-time Ticker & Order Book */}
        <section id="realtime-section">
          <RealtimeTicker 
            quotes={quotes}
            onSelectStock={(st) => setSelectedStockModal(st)}
            onAddStock={handleAddStock}
            onRemoveStock={handleRemoveStock}
          />
        </section>

        {/* Daily Closing Prices Database Table */}
        <section id="daily-section">
          <DailyClosingTable 
            dailyStocks={dailyStocks}
            onSelectStock={(st) => setSelectedStockModal(st)}
          />
        </section>

        {/* FSC & TWSE Regulatory News Feed */}
        <section id="news-section">
          <FscNewsFeed newsList={fscNews} />
        </section>
      </main>

      {/* Stock Detail Modal */}
      {selectedStockModal && (
        <StockDetailModal 
          stock={selectedStockModal}
          onClose={() => setSelectedStockModal(null)}
        />
      )}

      {/* Footer */}
      <footer className="glass-panel border-t border-gray-800 py-8 text-center text-xs text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-200">Finance 台灣股市爬蟲觀測站</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
              v1.0.0
            </span>
          </div>

          <p className="text-gray-500">
            資料來源: 臺灣證券交易所 (TWSE Open Data) 與 金融監督管理委員會 (FSC)
          </p>

          <a 
            href="https://github.com/dainosososo/Finance"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
          >
            github.com/dainosososo/Finance
          </a>
        </div>
      </footer>
    </div>
  );
}
