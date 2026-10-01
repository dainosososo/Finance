import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart2, Zap, Flame, Award } from 'lucide-react';

/**
 * 大盤關鍵指標觀測卡片 (移至網頁最下方) - 櫻花粉主題
 * 1. 大盤加權指數 TAIEX
 * 2. 櫃買指數 OTC Index
 * 3. 市場成交總金額
 * 4. 大盤多空漲跌比
 * 5. 今日強勢焦點
 */
export default function MarketSummary({ taiexData, topStocks = [], onSelectStock }) {
  const isTaiexUp = taiexData?.change?.includes('+');

  // Top gainers from top stocks
  const sortedGainers = [...topStocks].sort((a, b) => parseFloat(b.pctChange || b.Change || 0) - parseFloat(a.pctChange || a.Change || 0)).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* 4 Key Financial Metric Cards (櫻花粉精緻卡片) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TAIEX Card */}
        <div className="bg-white/95 p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">大盤加權指數 TAIEX</span>
            <span className="p-2 bg-[#fff0f3] text-rose-600 rounded-xl border border-pink-200">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 font-mono">{taiexData?.taiex || '23,125.80'}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
              isTaiexUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
            }`}>
              {isTaiexUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {taiexData?.change || '+245.60'} ({taiexData?.pctChange || '+1.07%'})
            </span>
          </div>
          <p className="text-xs text-rose-900/70 mt-2 flex items-center justify-between">
            <span>證券交易所即時運算</span>
            <span className="text-rose-700 font-mono text-[11px] font-semibold">盤後連線</span>
          </p>
        </div>

        {/* OTC Index Card */}
        <div className="bg-white/95 p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">櫃買指數 OTC Index</span>
            <span className="p-2 bg-[#fff0f3] text-purple-600 rounded-xl border border-pink-200">
              <BarChart2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 font-mono">272.45</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono text-red-600 bg-red-50 border border-red-200">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +2.15 (+0.80%)
            </span>
          </div>
          <p className="text-xs text-rose-900/70 mt-2 flex items-center justify-between">
            <span>上櫃中小型股表現</span>
            <span className="text-purple-700 font-mono text-[11px] font-semibold">強勢反彈</span>
          </p>
        </div>

        {/* Total Market Volume Card */}
        <div className="bg-white/95 p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">市場成交總金額</span>
            <span className="p-2 bg-[#fff0f3] text-emerald-600 rounded-xl border border-pink-200">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 font-mono">{taiexData?.volume || '4,125.80 億'}</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              量增 12.4%
            </span>
          </div>
          <p className="text-xs text-rose-900/70 mt-2 flex items-center justify-between">
            <span>全日成交金額</span>
            <span className="text-slate-800 font-mono text-[11px] font-medium">資金活絡</span>
          </p>
        </div>

        {/* Market Breadth & Sentiment */}
        <div className="bg-white/95 p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">大盤多空漲跌比</span>
            <span className="p-2 bg-[#fff0f3] text-amber-600 rounded-xl border border-pink-200">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          {/* Progress Bar */}
          <div className="space-y-1 mt-1">
            <div className="flex justify-between text-xs font-mono font-medium">
              <span className="text-red-600">漲: {taiexData?.upCount || 689}</span>
              <span className="text-slate-500">平: {taiexData?.flatCount || 98}</span>
              <span className="text-emerald-600">跌: {taiexData?.downCount || 231}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex border border-slate-300/60">
              <div style={{ width: '68%' }} className="bg-red-500 h-full"></div>
              <div style={{ width: '10%' }} className="bg-slate-300 h-full"></div>
              <div style={{ width: '22%' }} className="bg-emerald-500 h-full"></div>
            </div>
          </div>
          <p className="text-[11px] text-rose-900/70 mt-2 flex justify-between items-center">
            <span>多方氣勢佔優</span>
            <span className="text-red-600 font-bold">偏多 68%</span>
          </p>
        </div>
      </div>

      {/* Top Gainers Quick Bar (櫻花粉底色) */}
      <div className="bg-white/95 p-3.5 rounded-2xl border border-pink-200 shadow-xs flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center space-x-2 flex-shrink-0 text-rose-800 font-bold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4 text-rose-600" />
          <span>今日強勢焦點:</span>
        </div>
        <div className="flex items-center space-x-2.5 overflow-x-auto py-0.5 scrollbar-none">
          {sortedGainers.map((st, idx) => (
            <div 
              key={idx} 
              onClick={() => onSelectStock && onSelectStock(st)}
              className="flex items-center space-x-2 bg-[#fff5f7] border border-pink-200 px-3 py-1.5 rounded-xl hover:border-pink-400 hover:bg-white transition-all flex-shrink-0 cursor-pointer shadow-2xs"
            >
              <span className="text-xs font-bold text-slate-900">{st.name || st.Name}</span>
              <span className="text-xs font-mono text-rose-700/80">({st.symbol || st.Code})</span>
              <span className="text-xs font-mono font-bold text-slate-900">NT$ {st.price || st.ClosingPrice}</span>
              <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                +{st.pctChange || st.PctChange || '2.5'}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
