import React, { useState } from 'react';
import { Zap, Plus, Trash2, ArrowUpRight, ArrowDownRight, Clock, ExternalLink } from 'lucide-react';

export default function RealtimeTicker({ 
  quotes = [], 
  onSelectStock, 
  onAddStock, 
  onRemoveStock 
}) {
  const [newStockCode, setNewStockCode] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newStockCode.trim()) {
      onAddStock(newStockCode.trim());
      setNewStockCode('');
    }
  };

  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* Header & Watchlist controls (櫻花粉簡約風格) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 p-4 sm:p-5 rounded-2xl border border-pink-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 bg-[#fff0f3] text-rose-600 rounded-xl border border-pink-200">
            <Zap className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              即時自選報價與個股監控
              <span className="text-[11px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md border border-pink-300 font-mono">
                LIVE 即時連線
              </span>
            </h2>
            <p className="text-xs text-rose-900/70 mt-0.5">
              點擊任意自選卡片，即可開啟三竹技術分析、自由縮放K線、即時支撐壓力線與籌碼財務資訊
            </p>
          </div>
        </div>

        {/* Add custom stock to watchlist */}
        <form onSubmit={handleAddSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={newStockCode}
            onChange={(e) => setNewStockCode(e.target.value)}
            placeholder="新增代號 (例: 2603, 0050)"
            className="w-40 sm:w-48 bg-[#fff8fa] text-xs text-slate-900 placeholder-rose-300 px-3.5 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-300 transition"
          />
          <button
            type="submit"
            className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow-xs active:scale-95 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增</span>
          </button>
        </form>
      </div>

      {/* Real-time Cards Responsive Grid (已刪除五檔，滿版多欄位展示) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {quotes.map((st, idx) => {
          const isUp = parseFloat(st.change || 0) >= 0;

          return (
            <div
              key={st.symbol || idx}
              onClick={() => onSelectStock && onSelectStock(st)}
              className="bg-white/95 p-5 rounded-2xl cursor-pointer transition-all duration-200 relative border border-pink-200 hover:border-pink-400 hover:shadow-md hover:-translate-y-0.5 group flex flex-col justify-between"
            >
              <div>
                {/* Header row: Name, symbol, sector, remove button */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-slate-900 group-hover:text-rose-600 transition-colors">
                        {st.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-rose-800 bg-[#fff0f3] px-2 py-0.5 rounded border border-pink-200">
                        {st.symbol}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      {st.sector || '上市核心標的'}
                    </span>
                  </div>

                  {quotes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStock(st.symbol);
                      }}
                      className="text-slate-300 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors opacity-80 group-hover:opacity-100"
                      title="從自選股移除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Price and Percentage change */}
                <div className="mt-3 flex items-baseline justify-between">
                  <span className={`text-2xl font-black font-mono tracking-tight ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
                    NT$ {st.price}
                  </span>
                  <span className={`inline-flex items-center text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                    isUp ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}>
                    {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                    {isUp ? `+${st.change}` : st.change} ({st.pctChange}%)
                  </span>
                </div>

                {/* High / Low / Volume */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-pink-100 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">最高</span>
                    <span className="text-slate-800 font-bold">NT$ {st.high || st.price}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">最低</span>
                    <span className="text-slate-800 font-bold">NT$ {st.low || st.price}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">成交量</span>
                    <span className="text-slate-800 font-bold">{st.volume} 張</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {st.time || '13:30'}
                </span>
                <span className="text-rose-600 group-hover:text-rose-700 text-xs flex items-center gap-1 font-bold group-hover:underline">
                  <span>三竹深度分析</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
