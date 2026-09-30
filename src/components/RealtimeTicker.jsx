import React, { useState } from 'react';
import { Zap, Plus, Trash2, ArrowUpRight, ArrowDownRight, Layers, Clock, ExternalLink } from 'lucide-react';

export default function RealtimeTicker({ 
  quotes = [], 
  onSelectStock, 
  onAddStock, 
  onRemoveStock 
}) {
  const [newStockCode, setNewStockCode] = useState('');
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState(0);

  const activeQuote = quotes[selectedQuoteIndex] || quotes[0];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newStockCode.trim()) {
      onAddStock(newStockCode.trim());
      setNewStockCode('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Columns: Real-time Stock Cards & Ticker List */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header & Watchlist controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-800/80 p-4 rounded-2xl border border-gray-800">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                即時報價與自選股監控
                <span className="text-[11px] font-normal px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-mono">
                  LIVE (即時連線)
                </span>
              </h2>
              <p className="text-xs text-gray-400">點擊股票卡片可檢視五檔報價與圖表分析</p>
            </div>
          </div>

          {/* Add custom stock to watchlist */}
          <form onSubmit={handleAddSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={newStockCode}
              onChange={(e) => setNewStockCode(e.target.value)}
              placeholder="新增代號 (例: 2603)"
              className="w-32 bg-dark-900 text-xs text-white placeholder-gray-500 px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
          </form>
        </div>

        {/* Real-time Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quotes.map((st, idx) => {
            const isUp = parseFloat(st.change || 0) >= 0;
            const isSelected = selectedQuoteIndex === idx;

            return (
              <div
                key={st.symbol || idx}
                onClick={() => setSelectedQuoteIndex(idx)}
                className={`glass-card p-4 rounded-2xl cursor-pointer transition-all relative group ${
                  isSelected 
                    ? 'ring-2 ring-blue-500/80 bg-blue-900/10 border-blue-500/50' 
                    : 'hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-white">{st.name}</span>
                      <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                        {st.symbol}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 block mt-0.5">{st.sector || '熱門標的'}</span>
                  </div>

                  {/* Price change badge */}
                  <div className={`flex flex-col items-end`}>
                    <span className={`text-xl font-extrabold font-mono ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                      NT$ {st.price}
                    </span>
                    <span className={`inline-flex items-center text-xs font-bold font-mono px-1.5 py-0.5 rounded mt-0.5 ${
                      isUp ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                      {isUp ? `+${st.change}` : st.change} ({st.pctChange}%)
                    </span>
                  </div>
                </div>

                {/* Sub details: High/Low/Vol */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-800 text-xs font-mono">
                  <div>
                    <span className="text-gray-500 block text-[10px]">最高 (High)</span>
                    <span className="text-gray-200 font-medium">NT$ {st.high || st.price}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">最低 (Low)</span>
                    <span className="text-gray-200 font-medium">NT$ {st.low || st.price}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">成交量 (Vol)</span>
                    <span className="text-gray-200 font-medium">{st.volume} 張</span>
                  </div>
                </div>

                {/* Remove & Inspect Actions */}
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-gray-800/60">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {st.time}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(st);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1 font-medium hover:underline"
                    >
                      <span>技術K線圖</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {quotes.length > 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveStock(st.symbol);
                        }}
                        className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-dark-800 transition-colors"
                        title="從自選股移除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: 5-Level Bid/Ask Order Book (五檔報價) */}
      <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-white text-base">盤中五檔委託報價</h3>
              <p className="text-xs text-gray-400">
                {activeQuote ? `${activeQuote.name} (${activeQuote.symbol})` : '選擇股票觀看'}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
            即時撮合
          </span>
        </div>

        {activeQuote ? (
          <div className="space-y-4">
            {/* Price Header Summary */}
            <div className="bg-dark-900/80 p-3 rounded-xl border border-gray-800 flex justify-between items-center font-mono">
              <div>
                <span className="text-xs text-gray-400 block">最新成交價</span>
                <span className={`text-xl font-extrabold ${parseFloat(activeQuote.change || 0) >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  NT$ {activeQuote.price}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">昨收 (Prev)</span>
                <span className="text-gray-200 font-bold">NT$ {activeQuote.prevClose}</span>
              </div>
            </div>

            {/* 5-Level Order Book Table */}
            <div className="space-y-1 text-xs font-mono">
              <div className="grid grid-cols-4 text-[11px] text-gray-400 pb-1 border-b border-gray-800 font-sans">
                <span>買量 (Bid V)</span>
                <span>買價 (Bid P)</span>
                <span className="text-right">賣價 (Ask P)</span>
                <span className="text-right">賣量 (Ask V)</span>
              </div>

              {/* Render 5 levels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const bid = activeQuote.bids?.[i] || { price: (parseFloat(activeQuote.price) - (i + 1) * 0.5).toFixed(2), vol: Math.floor(Math.random() * 200 + 10).toString() };
                const ask = activeQuote.asks?.[i] || { price: (parseFloat(activeQuote.price) + (i + 1) * 0.5).toFixed(2), vol: Math.floor(Math.random() * 200 + 10).toString() };

                return (
                  <div key={i} className="grid grid-cols-4 py-1.5 px-2 rounded hover:bg-dark-800/80 transition-colors items-center">
                    <span className="text-emerald-400 font-medium">{bid.vol}</span>
                    <span className="text-emerald-400 font-bold">NT$ {bid.price}</span>
                    <span className="text-red-400 font-bold text-right">NT$ {ask.price}</span>
                    <span className="text-red-400 font-medium text-right">{ask.vol}</span>
                  </div>
                );
              })}
            </div>

            {/* Trading tips */}
            <div className="text-[11px] text-gray-400 bg-dark-900/60 p-3 rounded-xl border border-gray-800 space-y-1">
              <div className="flex justify-between">
                <span>開盤價: <strong className="text-gray-200">NT$ {activeQuote.open}</strong></span>
                <span>最高價: <strong className="text-red-400">NT$ {activeQuote.high}</strong></span>
              </div>
              <div className="flex justify-between">
                <span>最低價: <strong className="text-emerald-400">NT$ {activeQuote.low}</strong></span>
                <span>總成交: <strong className="text-gray-200">{activeQuote.volume} 張</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 text-xs">
            請點擊左側卡片檢視即時五檔資料
          </div>
        )}
      </div>
    </div>
  );
}
