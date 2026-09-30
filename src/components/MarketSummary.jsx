import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart2, Zap, Flame, Award } from 'lucide-react';

export default function MarketSummary({ taiexData, topStocks = [], onSelectStock }) {
  const isTaiexUp = taiexData?.change?.includes('+');

  // Top gainers from top stocks
  const sortedGainers = [...topStocks].sort((a, b) => parseFloat(b.pctChange || b.Change || 0) - parseFloat(a.pctChange || a.Change || 0)).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 4 Key Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TAIEX Card */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">大盤加權指數 TAIEX</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-white font-mono">{taiexData?.taiex || '23,125.80'}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
              isTaiexUp ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
            }`}>
              {isTaiexUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {taiexData?.change || '+245.60'} ({taiexData?.pctChange || '+1.07%'})
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center justify-between">
            <span>證券交易所實時計算</span>
            <span className="text-blue-400 font-mono text-[11px]">即時盤中</span>
          </p>
        </div>

        {/* OTC Index Card */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">櫃買指數 OTC Index</span>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <BarChart2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-white font-mono">272.45</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono text-red-400 bg-red-500/10 border border-red-500/20">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +2.15 (+0.80%)
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center justify-between">
            <span>上櫃中小型股表現</span>
            <span className="text-purple-400 font-mono text-[11px]">強勢反彈</span>
          </p>
        </div>

        {/* Total Market Volume Card */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">市場成交總金額</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-white font-mono">{taiexData?.volume || '4,125.80 億'}</h3>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              量增 12.4%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center justify-between">
            <span>預估全日總成交量</span>
            <span className="text-gray-300 font-mono text-[11px]">資金活絡</span>
          </p>
        </div>

        {/* Market Breadth & Sentiment */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">大盤多空漲跌比</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          {/* Progress Bar */}
          <div className="space-y-1.5 mt-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-red-400 font-bold">漲: {taiexData?.upCount || 689}</span>
              <span className="text-gray-400">平: {taiexData?.flatCount || 98}</span>
              <span className="text-emerald-400 font-bold">跌: {taiexData?.downCount || 231}</span>
            </div>
            <div className="w-full h-2.5 bg-dark-900 rounded-full overflow-hidden flex border border-gray-700/50">
              <div style={{ width: '68%' }} className="bg-gradient-to-r from-red-600 to-red-500 h-full"></div>
              <div style={{ width: '10%' }} className="bg-gray-500 h-full"></div>
              <div style={{ width: '22%' }} className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full"></div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 flex justify-between items-center">
            <span>多方控盤趨勢明顯</span>
            <span className="text-red-400 font-bold">偏多 68%</span>
          </p>
        </div>
      </div>

      {/* Top Gainers Quick Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center space-x-2 flex-shrink-0 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4 text-amber-400" />
          <span>強勢焦點股:</span>
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto py-1 scrollbar-none">
          {sortedGainers.map((st, idx) => (
            <div 
              key={idx} 
              onClick={() => onSelectStock && onSelectStock(st)}
              className="flex items-center space-x-2 bg-dark-800/90 border border-gray-700/80 px-3 py-1.5 rounded-xl hover:border-blue-500/50 transition-all flex-shrink-0 cursor-pointer"
            >
              <span className="text-xs font-bold text-gray-200">{st.name || st.Name}</span>
              <span className="text-xs font-mono text-gray-400">({st.symbol || st.Code})</span>
              <span className="text-xs font-mono font-bold text-white">NT$ {st.price || st.ClosingPrice}</span>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                +{st.pctChange || st.PctChange || '2.5'}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
