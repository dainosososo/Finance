import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart2, Zap, Flame, Award } from 'lucide-react';

export default function MarketSummary({ taiexData, topStocks = [], onSelectStock }) {
  const isTaiexUp = taiexData?.change?.includes('+');

  // Top gainers from top stocks
  const sortedGainers = [...topStocks].sort((a, b) => parseFloat(b.pctChange || b.Change || 0) - parseFloat(a.pctChange || a.Change || 0)).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* 4 Key Financial Metric Cards (Light Minimalist Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TAIEX Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">大盤加權指數 TAIEX</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
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
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>證券交易所即時運算</span>
            <span className="text-blue-600 font-mono text-[11px] font-semibold">盤中連線</span>
          </p>
        </div>

        {/* OTC Index Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">櫃買指數 OTC Index</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
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
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>上櫃中小型股表現</span>
            <span className="text-purple-600 font-mono text-[11px] font-semibold">強勢反彈</span>
          </p>
        </div>

        {/* Total Market Volume Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">市場成交總金額</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 font-mono">{taiexData?.volume || '4,125.80 億'}</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              量增 12.4%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>全日預估成交金額</span>
            <span className="text-slate-700 font-mono text-[11px] font-medium">資金活絡</span>
          </p>
        </div>

        {/* Market Breadth & Sentiment */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">大盤多空漲跌比</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
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
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
              <div style={{ width: '68%' }} className="bg-red-500 h-full"></div>
              <div style={{ width: '10%' }} className="bg-slate-300 h-full"></div>
              <div style={{ width: '22%' }} className="bg-emerald-500 h-full"></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex justify-between items-center">
            <span>多方氣勢佔優</span>
            <span className="text-red-600 font-bold">偏多 68%</span>
          </p>
        </div>
      </div>

      {/* Top Gainers Quick Bar (Light Theme) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center space-x-2 flex-shrink-0 text-amber-700 font-bold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4 text-amber-600" />
          <span>今日強勢焦點:</span>
        </div>
        <div className="flex items-center space-x-2.5 overflow-x-auto py-0.5 scrollbar-none">
          {sortedGainers.map((st, idx) => (
            <div 
              key={idx} 
              onClick={() => onSelectStock && onSelectStock(st)}
              className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:border-blue-400 hover:bg-white transition-all flex-shrink-0 cursor-pointer shadow-2xs"
            >
              <span className="text-xs font-bold text-slate-900">{st.name || st.Name}</span>
              <span className="text-xs font-mono text-slate-500">({st.symbol || st.Code})</span>
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
