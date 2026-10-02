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
            <h3 className="text-2xl font-black text-slate-900 font-mono">{taiexData?.taiex || '48,438.06'}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
              isTaiexUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
            }`}>
              {isTaiexUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {taiexData?.change || '+84.57'} ({taiexData?.pctChange || '+0.17%'})
            </span>
          </div>
          <p className="text-xs text-rose-900/70 mt-2 flex items-center justify-between">
            <span>證券交易所即時運算</span>
            <span className="text-rose-700 font-mono text-[11px] font-semibold">盤後連線</span>
          </p>
        </div>

        {/* OTC Index Card */}
        {(() => {
          const isOtcUp = taiexData?.otcChange?.includes('+');
          return (
            <div className="bg-white/95 p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">櫃買指數 OTC Index</span>
                <span className="p-2 bg-[#fff0f3] text-purple-600 rounded-xl border border-pink-200">
                  <BarChart2 className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-slate-900 font-mono">{taiexData?.otc || '---'}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                  isOtcUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                }`}>
                  {isOtcUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                  {taiexData?.otcChange || '---'} ({taiexData?.otcPctChange || '---'})
                </span>
              </div>
              <p className="text-xs text-rose-900/70 mt-2 flex items-center justify-between">
                <span>上櫃中小型股表現</span>
                <span className="text-purple-700 font-mono text-[11px] font-semibold">{isOtcUp ? '偏多' : '偏空'}</span>
              </p>
            </div>
          );
        })()}

        {/* Total Market Volume Card */}
        <div className="bg-white/95 p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">市場成交總金額</span>
            <span className="p-2 bg-[#fff0f3] text-emerald-600 rounded-xl border border-pink-200">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 font-mono">{taiexData?.volume || '---'}</h3>
          </div>
          <p className="text-xs text-rose-900/70 mt-2 flex items-center justify-between">
            <span>全日成交金額</span>
            <span className="text-slate-800 font-mono text-[11px] font-medium">{taiexData?.status || '資料載入中'}</span>
          </p>
        </div>

        {/* Market Breadth & Sentiment */}
        {(() => {
          const up = taiexData?.upCount || 0;
          const flat = taiexData?.flatCount || 0;
          const down = taiexData?.downCount || 0;
          const total = up + flat + down || 1;
          const upPct = Math.round((up / total) * 100);
          const flatPct = Math.round((flat / total) * 100);
          const downPct = 100 - upPct - flatPct;
          const isBull = up > down;
          return (
            <div className="bg-white/95 p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">大盤多空漲跌比</span>
                <span className="p-2 bg-[#fff0f3] text-amber-600 rounded-xl border border-pink-200">
                  <Flame className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-1 mt-1">
                <div className="flex justify-between text-xs font-mono font-medium">
                  <span className="text-red-600">漲: {up}</span>
                  <span className="text-slate-500">平: {flat}</span>
                  <span className="text-emerald-600">跌: {down}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex border border-slate-300/60">
                  <div style={{ width: `${upPct}%` }} className="bg-red-500 h-full"></div>
                  <div style={{ width: `${flatPct}%` }} className="bg-slate-300 h-full"></div>
                  <div style={{ width: `${downPct}%` }} className="bg-emerald-500 h-full"></div>
                </div>
              </div>
              <p className="text-[11px] text-rose-900/70 mt-2 flex justify-between items-center">
                <span>{isBull ? '多方氣勢佔優' : '空方力道壓制'}</span>
                <span className={isBull ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {isBull ? `偏多 ${upPct}%` : `偏空 ${downPct}%`}
                </span>
              </p>
            </div>
          );
        })()}
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
