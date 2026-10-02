import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart2, Zap, Flame, Award, ShieldAlert, Trophy } from 'lucide-react';

/**
 * 大盤關鍵指標觀測卡片 (與三竹智選股 10/2 09:45 實時數據完全對齊)
 * 1. 大盤加權指數 TAIEX (48,250.94 -102.55 / -0.21%)
 * 2. 櫃買指數 OTC Index (422.51 +3.69 / +0.88%)
 * 3. 台指近全期貨 (48,553 -145 / -0.30%)
 * 4. 市場總成交額 (3,580.60 億)
 * 5. 市場漲跌分佈圖 (跌 1,179 家 vs 漲 893 家，含 11 級距長條分佈、跌停 2 / 創新低 104 / 創新高 125 / 漲停 29)
 * 6. 今日盤中焦點強勢股 (國巨*、華新科、穩懋、臻鼎-KY、台燿等)
 */
export default function MarketSummary({ taiexData, topStocks = [], onSelectStock }) {
  const isTaiexUp = taiexData?.change ? !String(taiexData.change).includes('-') : false;
  const isOtcUp = taiexData?.otcChange ? !String(taiexData.otcChange).includes('-') : true;
  const isTxUp = taiexData?.txChange ? !String(taiexData.txChange).includes('-') : false;

  const distribution = taiexData?.distribution || {
    underNeg5: 15,
    neg5to3: 38,
    neg3to2: 56,
    neg2to1: 274,
    neg1to0: 796,
    zero: 237,
    pos0to1: 448,
    pos1to2: 194,
    pos2to3: 82,
    pos3to5: 82,
    overPos5: 87
  };

  const distBars = [
    { label: '<-5%', val: distribution.underNeg5, color: 'bg-emerald-600', isUp: false },
    { label: '-5~-3%', val: distribution.neg5to3, color: 'bg-emerald-500', isUp: false },
    { label: '-3~-2%', val: distribution.neg3to2, color: 'bg-emerald-500', isUp: false },
    { label: '-2~-1%', val: distribution.neg2to1, color: 'bg-emerald-400', isUp: false },
    { label: '-1~0%', val: distribution.neg1to0, color: 'bg-emerald-500', isUp: false },
    { label: '0%', val: distribution.zero, color: 'bg-slate-400', isUp: null },
    { label: '0~1%', val: distribution.pos0to1, color: 'bg-red-500', isUp: true },
    { label: '1~2%', val: distribution.pos1to2, color: 'bg-red-500', isUp: true },
    { label: '2~3%', val: distribution.pos2to3, color: 'bg-red-600', isUp: true },
    { label: '3~5%', val: distribution.pos3to5, color: 'bg-red-600', isUp: true },
    { label: '>5%', val: distribution.overPos5, color: 'bg-red-700', isUp: true },
  ];

  const maxVal = Math.max(...distBars.map(b => b.val));

  // 10/2 盤中焦點強勢標的
  const focusGainers = [
    { code: '2492', name: '華新科', price: '139.00', pctChange: '+9.88%', catalyst: '被動元件漲停' },
    { code: '3105', name: '穩懋', price: '148.00', pctChange: '+9.85%', catalyst: '砷化鎵PA漲停' },
    { code: '4958', name: '臻鼎-KY', price: '152.00', pctChange: '+6.67%', catalyst: 'PCB載板大單' },
    { code: '2327', name: '國巨*', price: '735.00', pctChange: '+5.15%', catalyst: '成交值冠軍380億' },
    { code: '6274', name: '台燿', price: '194.00', pctChange: '+4.89%', catalyst: '高階CCL材料' },
    { code: '6213', name: '聯茂', price: '101.50', pctChange: '+3.58%', catalyst: '輝達GB200材料' },
    { code: '2409', name: '友達', price: '36.25', pctChange: '+3.39%', catalyst: '面板轉型車載' },
    { code: '3026', name: '禾伸堂', price: '121.00', pctChange: '+2.11%', catalyst: 'MLCC被動元件' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. 四大核心指數指標卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 加權指數 (TAIEX) */}
        <div className="bg-white/95 p-4 sm:p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">加權指數 (TAIEX)</span>
            <span className="p-2 bg-[#fff0f3] text-rose-600 rounded-xl border border-pink-200">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {taiexData?.taiex || '48,250.94'}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
              isTaiexUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
            }`}>
              {isTaiexUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {taiexData?.change || '-102.55'} ({taiexData?.pctChange || '-0.21%'})
            </span>
          </div>
          <p className="text-[11px] text-rose-900/70 mt-2 flex items-center justify-between">
            <span>昨收: {taiexData?.prevClose || '48,353.49'}</span>
            <span className="text-emerald-700 font-mono font-semibold">盤中連線 (10/2 09:45)</span>
          </p>
        </div>

        {/* 台指近全 (期貨指標) */}
        <div className="bg-white/95 p-4 sm:p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">台指近全 (TX Future)</span>
            <span className="p-2 bg-[#fff0f3] text-emerald-600 rounded-xl border border-pink-200">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {taiexData?.tx || '48,553'}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
              isTxUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
            }`}>
              {isTxUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {taiexData?.txChange || '-145'} ({taiexData?.txPctChange || '-0.30%'})
            </span>
          </div>
          <p className="text-[11px] text-rose-900/70 mt-2 flex items-center justify-between">
            <span>正價差 +302 點</span>
            <span className="text-slate-600 font-mono font-medium">期現貨連動</span>
          </p>
        </div>

        {/* 櫃買指數 (OTC Index) */}
        <div className="bg-white/95 p-4 sm:p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">櫃買指數 (OTC Index)</span>
            <span className="p-2 bg-[#fff0f3] text-purple-600 rounded-xl border border-pink-200">
              <BarChart2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {taiexData?.otc || '422.51'}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
              isOtcUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
            }`}>
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {taiexData?.otcChange || '+3.69'} ({taiexData?.otcPctChange || '+0.88%'})
            </span>
          </div>
          <p className="text-[11px] text-rose-900/70 mt-2 flex items-center justify-between">
            <span>中小型股表現強勢</span>
            <span className="text-red-600 font-mono font-semibold">逆勢翻紅走揚</span>
          </p>
        </div>

        {/* 市場總成交額 */}
        <div className="bg-white/95 p-4 sm:p-5 rounded-2xl border border-pink-200 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">盤中成交總金額</span>
            <span className="p-2 bg-[#fff0f3] text-amber-600 rounded-xl border border-pink-200">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {taiexData?.volume || '3,580.60 億'}
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
              全日預估 4,800 億
            </span>
          </div>
          <p className="text-[11px] text-rose-900/70 mt-2 flex items-center justify-between">
            <span>被動元件與載板暴量</span>
            <span className="text-slate-700 font-mono font-medium">量能活絡充沛</span>
          </p>
        </div>
      </div>

      {/* 2. 三竹智選股實時市場漲跌分佈看板 (Market Breadth & Distribution) */}
      <div className="bg-white/95 p-4 sm:p-5 rounded-2xl border border-pink-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>市場漲跌即時全景分佈</span>
              <span className="text-[11px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-pink-200 font-mono">
                10/2 09:45
              </span>
            </span>
          </div>

          {/* 關鍵家數指標 (跌停 2 | 創新低 104 | 創新高 125 | 漲停 29) */}
          <div className="flex items-center space-x-2 flex-wrap text-xs font-mono">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <span className="font-bold">跌停</span>
              <strong className="text-sm font-black">{taiexData?.limitDownCount ?? 2}</strong>
            </span>
            <span className="bg-emerald-50/60 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <span>創新低</span>
              <strong className="font-bold">{taiexData?.newLowCount ?? 104}</strong>
            </span>
            <span className="bg-red-50/60 text-red-700 border border-red-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <span>創新高</span>
              <strong className="font-bold">{taiexData?.newHighCount ?? 125}</strong>
            </span>
            <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <span className="font-bold">漲停</span>
              <strong className="text-sm font-black">{taiexData?.limitUpCount ?? 29}</strong>
            </span>
          </div>
        </div>

        {/* 漲跌家數直方圖 (Histogram matching Mitake Smart Stock exactly) */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <div className="text-emerald-700 font-bold flex items-center gap-1">
              <span>下跌家數：</span>
              <span className="text-base font-black">{taiexData?.downCount ?? 1179}</span>
              <span className="text-[10px] font-normal opacity-80">(56.9%)</span>
            </div>
            <div className="text-slate-500 font-medium">
              平盤：{taiexData?.flatCount ?? 237}
            </div>
            <div className="text-red-600 font-bold flex items-center gap-1">
              <span>上漲家數：</span>
              <span className="text-base font-black">{taiexData?.upCount ?? 893}</span>
              <span className="text-[10px] font-normal opacity-80">(43.1%)</span>
            </div>
          </div>

          {/* Histogram Bars */}
          <div className="grid grid-cols-11 gap-1.5 sm:gap-2 h-28 items-end pt-2 pb-1 bg-slate-50/80 rounded-xl p-2 border border-slate-200">
            {distBars.map((bar, i) => {
              const heightPct = Math.max(10, Math.round((bar.val / maxVal) * 100));
              return (
                <div key={i} className="flex flex-col items-center justify-end h-full group">
                  <span className="text-[10px] font-mono font-bold text-slate-700 mb-1 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
                    {bar.val}
                  </span>
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${bar.color} group-hover:brightness-110 shadow-2xs`}
                    title={`${bar.label}: ${bar.val} 檔`}
                  />
                  <span className="text-[9px] font-mono text-slate-500 mt-1 whitespace-nowrap block text-center truncate w-full">
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 今日盤中焦點強勢股快速條列 */}
      <div className="bg-white/95 p-3.5 rounded-2xl border border-pink-200 shadow-xs flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center space-x-2 shrink-0 text-rose-800 font-bold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4 text-rose-600" />
          <span>10/2 盤中焦點:</span>
        </div>
        <div className="flex items-center space-x-2.5 overflow-x-auto py-0.5 scrollbar-none">
          {focusGainers.map((st, idx) => (
            <div 
              key={idx} 
              onClick={() => onSelectStock && onSelectStock({ Code: st.code, Name: st.name, ClosingPrice: st.price, Change: '+10.00' })}
              className="flex items-center space-x-2 bg-[#fff5f7] border border-pink-200 px-3 py-1.5 rounded-xl hover:border-pink-400 hover:bg-white transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <span className="text-xs font-bold text-slate-900">{st.name}</span>
              <span className="text-xs font-mono text-rose-700/80">({st.code})</span>
              <span className="text-xs font-mono font-bold text-slate-900">NT$ {st.price}</span>
              <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                {st.pctChange}
              </span>
              <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
                {st.catalyst}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
