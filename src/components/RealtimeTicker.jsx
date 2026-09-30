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
      {/* Left 2 Columns: Real-time Stock Cards & Ticker List (Light Minimalist) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header & Watchlist controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                即時報價與自選股監控
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-mono">
                  LIVE 即時
                </span>
              </h2>
              <p className="text-xs text-slate-500">點選自選卡片可同步連動右側五檔委託買賣盤</p>
            </div>
          </div>

          {/* Add custom stock to watchlist */}
          <form onSubmit={handleAddSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={newStockCode}
              onChange={(e) => setNewStockCode(e.target.value)}
              placeholder="新增代號 (例: 2603)"
              className="w-32 bg-slate-100 text-xs text-slate-900 placeholder-slate-400 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <button
              type="submit"
              className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors shadow-xs"
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
                className={`bg-white p-4 rounded-2xl cursor-pointer transition-all relative border ${
                  isSelected 
                    ? 'ring-2 ring-blue-500/80 bg-blue-50/40 border-blue-400 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-slate-900">{st.name}</span>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {st.symbol}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{st.sector || '熱門標的'}</span>
                  </div>

                  {/* Price change badge */}
                  <div className="flex flex-col items-end">
                    <span className={`text-xl font-extrabold font-mono ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
                      NT$ {st.price}
                    </span>
                    <span className={`inline-flex items-center text-xs font-bold font-mono px-1.5 py-0.5 rounded mt-0.5 ${
                      isUp ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                      {isUp ? `+${st.change}` : st.change} ({st.pctChange}%)
                    </span>
                  </div>
                </div>

                {/* Sub details: High/Low/Vol */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">最高 (High)</span>
                    <span className="text-slate-800 font-medium">NT$ {st.high || st.price}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">最低 (Low)</span>
                    <span className="text-slate-800 font-medium">NT$ {st.low || st.price}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">成交量 (Vol)</span>
                    <span className="text-slate-800 font-medium">{st.volume} 張</span>
                  </div>
                </div>

                {/* Remove & Inspect Actions */}
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {st.time}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(st);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-[11px] flex items-center gap-1 font-bold hover:underline"
                    >
                      <span>三竹K線圖</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {quotes.length > 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveStock(st.symbol);
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100 transition-colors"
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

      {/* Right Column: 5-Level Bid/Ask Order Book (五檔報價 in Light Theme) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">盤中五檔委託報價</h3>
              <p className="text-xs text-slate-500">
                {activeQuote ? `${activeQuote.name} (${activeQuote.symbol})` : '選擇股票觀看'}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
            撮合連線
          </span>
        </div>

        {activeQuote ? (
          <div className="space-y-4">
            {/* Price Header Summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center font-mono">
              <div>
                <span className="text-xs text-slate-500 block font-sans">最新成交價</span>
                <span className={`text-xl font-extrabold ${parseFloat(activeQuote.change || 0) >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  NT$ {activeQuote.price}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block font-sans">昨收價 (Prev)</span>
                <span className="text-slate-700 font-bold">NT$ {activeQuote.prevClose}</span>
              </div>
            </div>

            {/* 5-Level Order Book Table */}
            <div className="space-y-1 text-xs font-mono">
              <div className="grid grid-cols-4 text-[11px] text-slate-500 pb-1.5 border-b border-slate-200 font-sans font-medium">
                <span>買量 (Bid)</span>
                <span>買進委價</span>
                <span className="text-right">賣出委價</span>
                <span className="text-right">賣量 (Ask)</span>
              </div>

              {/* Render 5 levels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const bid = activeQuote.bids?.[i] || { price: (parseFloat(activeQuote.price) - (i + 1) * 0.5).toFixed(2), vol: Math.floor(Math.random() * 200 + 10).toString() };
                const ask = activeQuote.asks?.[i] || { price: (parseFloat(activeQuote.price) + (i + 1) * 0.5).toFixed(2), vol: Math.floor(Math.random() * 200 + 10).toString() };

                return (
                  <div key={i} className="grid grid-cols-4 py-1.5 px-2 rounded hover:bg-slate-50 transition-colors items-center border-b border-slate-100">
                    <span className="text-emerald-600 font-medium">{bid.vol}</span>
                    <span className="text-emerald-600 font-bold">NT$ {bid.price}</span>
                    <span className="text-red-600 font-bold text-right">NT$ {ask.price}</span>
                    <span className="text-red-600 font-medium text-right">{ask.vol}</span>
                  </div>
                );
              })}
            </div>

            {/* Trading tips */}
            <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span>開盤價: <strong className="text-slate-900 font-mono">NT$ {activeQuote.open}</strong></span>
                <span>最高價: <strong className="text-red-600 font-mono">NT$ {activeQuote.high}</strong></span>
              </div>
              <div className="flex justify-between">
                <span>最低價: <strong className="text-emerald-600 font-mono">NT$ {activeQuote.low}</strong></span>
                <span>總成交: <strong className="text-slate-900 font-mono">{activeQuote.volume} 張</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-xs">
            請點擊左側卡片檢視即時五檔報價
          </div>
        )}
      </div>
    </div>
  );
}
