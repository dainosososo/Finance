import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Coins, 
  Building2, 
  Cpu, 
  Server, 
  Ship, 
  Landmark, 
  Zap, 
  Sparkles,
  Maximize2,
  Filter
} from 'lucide-react';

/**
 * 台灣股市即時成交值與產業板塊雙熱力圖 (Market Heatmap Treemap)
 * 1. 即時成交值熱力圖: 依成交金額決定方塊比重，依即時漲跌幅呈現台股紅漲綠跌色溫
 * 2. 產業結構熱力圖: 依產業資金佔比與族群分類，展示各大板塊領頭羊多區塊走勢
 */

// 產業結構焦點分類標的資料庫
const SECTOR_GROUPS = [
  {
    id: 'SEMI',
    name: '半導體產業',
    icon: Cpu,
    colorTheme: 'blue',
    weight: 41.5, // 佔市場成交比重 %
    stocks: [
      { code: '2330', name: '台積電', price: 2510.0, change: 30.0, pctChange: 1.21, turnover: 853.8, isUp: true },
      { code: '2454', name: '聯發科', price: 4980.0, change: 60.0, pctChange: 1.22, turnover: 218.0, isUp: true },
      { code: '2303', name: '聯電', price: 154.5, change: 1.0, pctChange: 0.65, turnover: 95.3, isUp: true },
      { code: '3711', name: '日月光投控', price: 161.5, change: 3.5, pctChange: 2.22, turnover: 78.4, isUp: true }
    ]
  },
  {
    id: 'AI_COMP',
    name: 'AI 伺服器與電腦周邊',
    icon: Server,
    colorTheme: 'indigo',
    weight: 23.8,
    stocks: [
      { code: '3231', name: '緯創', price: 190.5, change: 6.0, pctChange: 3.25, turnover: 112.6, isUp: true },
      { code: '2317', name: '鴻海', price: 254.0, change: 2.5, pctChange: 0.99, turnover: 77.5, isUp: true },
      { code: '2382', name: '廣達', price: 334.0, change: 0.5, pctChange: 0.15, turnover: 49.8, isUp: true },
      { code: '2376', name: '技嘉', price: 294.5, change: 6.5, pctChange: 2.26, turnover: 38.2, isUp: true }
    ]
  },
  {
    id: 'THERMAL_COMP',
    name: '電子零組件與水冷散熱',
    icon: Zap,
    colorTheme: 'cyan',
    weight: 10.4,
    stocks: [
      { code: '2308', name: '台達電', price: 1905.0, change: 15.0, pctChange: 0.79, turnover: 116.5, isUp: true },
      { code: '3017', name: '奇鋐', price: 656.0, change: 16.0, pctChange: 2.50, turnover: 42.8, isUp: true },
      { code: '3324', name: '雙鴻', price: 742.0, change: 17.0, pctChange: 2.34, turnover: 31.4, isUp: true }
    ]
  },
  {
    id: 'SHIPPING',
    name: '航運物流與海運',
    icon: Ship,
    colorTheme: 'sky',
    weight: 7.2,
    stocks: [
      { code: '2603', name: '長榮', price: 238.0, change: -1.5, pctChange: -0.63, turnover: 28.5, isUp: false },
      { code: '2609', name: '陽明', price: 70.2, change: 1.3, pctChange: 1.89, turnover: 24.2, isUp: true },
      { code: '2615', name: '萬海', price: 92.5, change: 2.7, pctChange: 3.01, turnover: 18.6, isUp: true }
    ]
  },
  {
    id: 'FINANCE',
    name: '金融保險金控',
    icon: Landmark,
    colorTheme: 'emerald',
    weight: 6.5,
    stocks: [
      { code: '2881', name: '富邦金', price: 150.5, change: -0.5, pctChange: -0.33, turnover: 27.5, isUp: false },
      { code: '2882', name: '國泰金', price: 110.5, change: -0.5, pctChange: -0.45, turnover: 22.4, isUp: false },
      { code: '2891', name: '中信金', price: 35.1, change: 0.3, pctChange: 0.86, turnover: 16.8, isUp: true }
    ]
  },
  {
    id: 'OPTO',
    name: '光電面板與光學',
    icon: Sparkles,
    colorTheme: 'amber',
    weight: 5.6,
    stocks: [
      { code: '3481', name: '群創', price: 50.2, change: 0.45, pctChange: 0.90, turnover: 52.1, isUp: true },
      { code: '2409', name: '友達', price: 35.8, change: 0.75, pctChange: 2.14, turnover: 41.2, isUp: true },
      { code: '3008', name: '大立光', price: 6010.0, change: -25.0, pctChange: -0.41, turnover: 28.6, isUp: false }
    ]
  },
  {
    id: 'ENERGY',
    name: '重電綠能與電機',
    icon: Flame,
    colorTheme: 'rose',
    weight: 5.0,
    stocks: [
      { code: '1519', name: '華城', price: 672.0, change: 27.0, pctChange: 4.19, turnover: 42.6, isUp: true },
      { code: '1503', name: '士電', price: 236.5, change: 7.5, pctChange: 3.28, turnover: 19.8, isUp: true }
    ]
  }
];

export default function MarketHeatmap({ 
  dailyStocks = [], 
  onSelectStock 
}) {
  const [activeView, setActiveView] = useState('SPLIT'); // 'SPLIT', 'TURNOVER', 'SECTOR'

  // Helper: merge real dailyStocks data into a stock entry
  const mergeRealData = (st, dailyMap) => {
    const found = dailyMap.get(st.code);
    if (found) {
      const cp = parseFloat(found.ClosingPrice) || st.price;
      const chg = parseFloat(found.Change) || st.change;
      const prev = cp - chg;
      const pct = prev > 0 ? Number(((chg / prev) * 100).toFixed(2)) : st.pctChange;
      const tv = parseFloat(found.TradeValue) || 0;
      const turnoverYi = tv > 0 ? Number((tv / 100000000).toFixed(1)) : st.turnover;
      return {
        ...st,
        price: cp,
        change: chg,
        pctChange: pct,
        isUp: chg >= 0,
        turnover: turnoverYi,
        Name: found.Name || st.name,
        Code: st.code,
        ClosingPrice: String(cp)
      };
    }
    return { ...st, Name: st.name, Code: st.code, ClosingPrice: String(st.price) };
  };

  // Build a lookup map from dailyStocks once
  const dailyMap = useMemo(() => {
    const map = new Map();
    if (dailyStocks && dailyStocks.length > 0) {
      dailyStocks.forEach(d => { if (d.Code) map.set(d.Code, d); });
    }
    return map;
  }, [dailyStocks]);

  // 1. 處理即時成交值熱力圖標的 (取權值與大成交金額活躍股)
  const turnoverStocks = useMemo(() => {
    // 優先整合全股真實行情
    const baseList = [
      { code: '2330', name: '台積電', price: 2510.0, change: 30.0, pctChange: 1.21, turnover: 853.8, sector: '半導體' },
      { code: '2454', name: '聯發科', price: 4980.0, change: 60.0, pctChange: 1.22, turnover: 218.0, sector: '半導體' },
      { code: '2308', name: '台達電', price: 1905.0, change: 15.0, pctChange: 0.79, turnover: 116.5, sector: '零組件' },
      { code: '3231', name: '緯創', price: 190.5, change: 6.0, pctChange: 3.25, turnover: 112.6, sector: '電腦周邊' },
      { code: '2303', name: '聯電', price: 154.5, change: 1.0, pctChange: 0.65, turnover: 95.3, sector: '半導體' },
      { code: '2317', name: '鴻海', price: 254.0, change: 2.5, pctChange: 0.99, turnover: 77.5, sector: '電腦周邊' },
      { code: '0050', name: '元大台灣50', price: 112.9, change: 0.85, pctChange: 0.76, turnover: 62.6, sector: 'ETF' },
      { code: '3481', name: '群創', price: 50.2, change: 0.45, pctChange: 0.90, turnover: 52.1, sector: '光電業' },
      { code: '2382', name: '廣達', price: 334.0, change: 0.5, pctChange: 0.15, turnover: 49.8, sector: '電腦周邊' },
      { code: '1519', name: '華城', price: 672.0, change: 27.0, pctChange: 4.19, turnover: 42.6, sector: '電機' },
      { code: '3017', name: '奇鋐', price: 656.0, change: 16.0, pctChange: 2.50, turnover: 42.8, sector: '電腦周邊' },
      { code: '2409', name: '友達', price: 35.8, change: 0.75, pctChange: 2.14, turnover: 41.2, sector: '光電業' },
      { code: '3008', name: '大立光', price: 6010.0, change: -25.0, pctChange: -0.41, turnover: 28.6, sector: '光電業' },
      { code: '2603', name: '長榮', price: 238.0, change: -1.5, pctChange: -0.63, turnover: 28.5, sector: '航運業' },
      { code: '2881', name: '富邦金', price: 150.5, change: -0.5, pctChange: -0.33, turnover: 27.5, sector: '金融' },
      { code: '2882', name: '國泰金', price: 110.5, change: -0.5, pctChange: -0.45, turnover: 22.4, sector: '金融' }
    ];

    // Merge real data from dailyStocks
    const merged = baseList.map(st => mergeRealData(st, dailyMap));
    
    // Sort by actual turnover (descending) so the treemap reflects reality
    merged.sort((a, b) => b.turnover - a.turnover);
    
    return merged;
  }, [dailyMap]);

  // 2. Also update SECTOR_GROUPS stocks with real data
  const updatedSectorGroups = useMemo(() => {
    if (dailyMap.size === 0) return SECTOR_GROUPS;
    return SECTOR_GROUPS.map(sec => ({
      ...sec,
      stocks: sec.stocks.map(st => mergeRealData(st, dailyMap))
    }));
  }, [dailyMap]);

  // 顏色計算函式 (台灣股市標準: 紅漲綠跌)
  const getHeatmapColor = (pct) => {
    if (pct >= 3.0) return 'bg-red-600 text-white border-red-700 shadow-sm';
    if (pct >= 1.5) return 'bg-red-500 text-white border-red-600';
    if (pct > 0) return 'bg-red-400 text-white border-red-500';
    if (pct === 0) return 'bg-slate-400 text-white border-slate-500';
    if (pct > -1.5) return 'bg-emerald-400 text-white border-emerald-500';
    if (pct > -3.0) return 'bg-emerald-500 text-white border-emerald-600';
    return 'bg-emerald-600 text-white border-emerald-700 shadow-sm';
  };

  return (
    <div className="space-y-4">
      {/* Heatmap Top Bar with View Mode Toggle (櫻花粉主題) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fff0f3] p-3.5 rounded-2xl border border-pink-200/90 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-tr from-rose-500 to-pink-600 text-white rounded-xl shadow-xs">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              台股雙熱力圖多區塊觀測站
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded border border-pink-300 font-semibold">
                即時成交值 • 產業板塊
              </span>
            </h2>
            <p className="text-[11px] text-rose-900/70 mt-0.5">以成交金額權重決定區塊面積，色溫即時反映個股與產業強弱勢多空動能</p>
          </div>
        </div>

        {/* View Switch Buttons */}
        <div className="flex items-center space-x-1 bg-white/90 p-1 rounded-xl border border-pink-200 self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setActiveView('SPLIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'SPLIT' 
                ? 'bg-rose-600 text-white shadow-xs' 
                : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
            }`}
          >
            並列雙熱力圖
          </button>
          <button
            onClick={() => setActiveView('TURNOVER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'TURNOVER' 
                ? 'bg-rose-600 text-white shadow-xs' 
                : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
            }`}
          >
            即時成交值
          </button>
          <button
            onClick={() => setActiveView('SECTOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'SECTOR' 
                ? 'bg-rose-600 text-white shadow-xs' 
                : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
            }`}
          >
            產業結構板塊
          </button>
        </div>
      </div>

      {/* Main Heatmap Container */}
      <div className={`grid gap-4 ${activeView === 'SPLIT' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* ========================================================= */}
        {/* HEATMAP 1: 即時成交值熱力圖 (Turnover / Trade Value Heatmap) */}
        {/* ========================================================= */}
        {(activeView === 'SPLIT' || activeView === 'TURNOVER') && (
          <div className="bg-[#fff0f3] rounded-2xl border border-pink-200 p-4 sm:p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-pink-200/80 pb-2.5">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-rose-600" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    即時成交值熱力圖 (Turnover Treemap)
                  </h3>
                  <span className="text-[10px] text-rose-800/80">方塊面積 = 成交金額比重 • 紅漲綠跌</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-rose-800 bg-white/90 px-2 py-0.5 rounded border border-pink-200">
                龍頭: <strong className="text-rose-900 font-extrabold">{turnoverStocks[0]?.name || '台積電'} ({turnoverStocks[0]?.turnover || '-'}億)</strong>
              </span>
            </div>

            {/* Treemap Multi-block Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 min-h-[380px] select-none">
              {/* TSMC (2330) - Massive Leader Block (佔 4x4 或 4x3) */}
              {(() => {
                const tsmc = turnoverStocks.find(s => s.code === '2330') || turnoverStocks[0];
                return (
                  <div
                    onClick={() => onSelectStock && onSelectStock(tsmc)}
                    className={`col-span-3 sm:col-span-4 row-span-3 p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md ${getHeatmapColor(tsmc.pctChange)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-base sm:text-lg font-black block tracking-tight">{tsmc.name}</span>
                        <span className="text-xs font-mono opacity-90">{tsmc.code}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs font-mono">
                        {tsmc.pctChange >= 0 ? `+${tsmc.pctChange}%` : `${tsmc.pctChange}%`}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl sm:text-3xl font-black font-mono">
                        NT$ {tsmc.price?.toLocaleString()}
                      </div>
                      <div className="text-[11px] opacity-90 font-mono mt-0.5 flex items-center justify-between">
                        <span>成交值: {tsmc.turnover} 億</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/15">佔全市場 20.8%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* MediaTek (2454) - 2nd Largest Block */}
              {(() => {
                const mtk = turnoverStocks.find(s => s.code === '2454') || turnoverStocks[1];
                return (
                  <div
                    onClick={() => onSelectStock && onSelectStock(mtk)}
                    className={`col-span-3 sm:col-span-4 row-span-2 p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md ${getHeatmapColor(mtk.pctChange)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm sm:text-base font-black block">{mtk.name}</span>
                        <span className="text-xs font-mono opacity-90">{mtk.code}</span>
                      </div>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/20 font-mono">
                        {mtk.pctChange >= 0 ? `+${mtk.pctChange}%` : `${mtk.pctChange}%`}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xl sm:text-2xl font-black font-mono">
                        NT$ {mtk.price?.toLocaleString()}
                      </div>
                      <div className="text-[10px] opacity-90 font-mono flex items-center justify-between">
                        <span>成交: {mtk.turnover} 億</span>
                        <span>高價IC設計</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Delta (2308) & Wistron (3231) - Tier 2 Active Blocks */}
              {turnoverStocks.filter(s => ['2308', '3231'].includes(s.code)).map((st) => (
                <div
                  key={st.code}
                  onClick={() => onSelectStock && onSelectStock(st)}
                  className={`col-span-3 sm:col-span-2 row-span-1 p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${getHeatmapColor(st.pctChange)}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-extrabold truncate">{st.name}</span>
                    <span className="text-[10px] font-mono font-bold">
                      {st.pctChange >= 0 ? `+${st.pctChange}%` : `${st.pctChange}%`}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-sm font-black font-mono">NT$ {st.price}</span>
                    <span className="text-[9px] opacity-80 font-mono">{st.turnover}億</span>
                  </div>
                </div>
              ))}

              {/* Foxconn (2317) & UMC (2303) */}
              {turnoverStocks.filter(s => ['2317', '2303'].includes(s.code)).map((st) => (
                <div
                  key={st.code}
                  onClick={() => onSelectStock && onSelectStock(st)}
                  className={`col-span-3 sm:col-span-2 row-span-1 p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${getHeatmapColor(st.pctChange)}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-extrabold truncate">{st.name}</span>
                    <span className="text-[10px] font-mono font-bold">
                      {st.pctChange >= 0 ? `+${st.pctChange}%` : `${st.pctChange}%`}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-sm font-black font-mono">NT$ {st.price}</span>
                    <span className="text-[9px] opacity-80 font-mono">{st.turnover}億</span>
                  </div>
                </div>
              ))}

              {/* Remaining Active Stocks Grid */}
              {turnoverStocks.filter(s => !['2330', '2454', '2308', '3231', '2317', '2303'].includes(s.code)).slice(0, 8).map((st) => (
                <div
                  key={st.code}
                  onClick={() => onSelectStock && onSelectStock(st)}
                  className={`col-span-2 sm:col-span-2 row-span-1 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xs ${getHeatmapColor(st.pctChange)}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold truncate">{st.name}</span>
                    <span className="text-[10px] font-mono font-bold">
                      {st.pctChange >= 0 ? `+${st.pctChange}%` : `${st.pctChange}%`}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between text-[11px] font-mono">
                    <span className="font-bold">NT$ {st.price}</span>
                    <span className="text-[9px] opacity-80">{st.turnover}億</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
              <span className="font-sans">台股漲跌色溫：</span>
              <div className="flex items-center space-x-1.5">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"></span>&lt;-3%</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block"></span>-1%</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-400 inline-block"></span>平盤</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-400 inline-block"></span>+1%</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-600 inline-block"></span>&gt;+3%</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* HEATMAP 2: 產業結構板塊熱力圖 (Industry Sector Treemap)   */}
        {/* ========================================================= */}
        {(activeView === 'SPLIT' || activeView === 'SECTOR') && (
          <div className="bg-[#fff0f3] rounded-2xl border border-pink-200 p-4 sm:p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-pink-200/80 pb-2.5">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-rose-600" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    產業結構板塊熱力圖 (Industry Sectors)
                  </h3>
                  <span className="text-[10px] text-rose-800/80">依產業鏈資金成交比重分類 • 族群龍頭股透視</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-rose-800 font-semibold bg-white/90 px-2 py-0.5 rounded border border-pink-200">
                半導體 (41.5%) + AI伺服器 (23.8%) 主導
              </span>
            </div>

            {/* Sector Treemap Multi-block Container */}
            <div className="space-y-3 min-h-[380px]">
              {updatedSectorGroups.map((sec) => {
                const Icon = sec.icon;
                const avgPct = sec.stocks.reduce((acc, cur) => acc + cur.pctChange, 0) / sec.stocks.length;
                const isSecUp = avgPct >= 0;

                return (
                  <div
                    key={sec.id}
                    className="p-3 rounded-xl border border-pink-200 bg-white/90 hover:bg-white transition-colors shadow-2xs"
                  >
                    {/* Sector Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded-md bg-[#fff0f3] border border-pink-200 text-rose-700">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-bold text-slate-900">{sec.name}</span>
                        <span className="text-[10px] font-mono text-rose-800 bg-[#fff5f7] px-1.5 py-0.2 rounded border border-pink-200 font-medium">
                          資金比重 {sec.weight}%
                        </span>
                      </div>
                      <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isSecUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                      }`}>
                        板塊平均 {isSecUp ? `+${avgPct.toFixed(2)}%` : `${avgPct.toFixed(2)}%`}
                      </span>
                    </div>

                    {/* Constituent Stocks Mini-Cards inside Sector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {sec.stocks.map((st) => (
                        <div
                          key={st.code}
                          onClick={() => onSelectStock && onSelectStock(st)}
                          className={`p-2 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-between ${getHeatmapColor(st.pctChange)}`}
                        >
                          <div>
                            <span className="text-[11px] font-extrabold block truncate leading-tight">{st.name}</span>
                            <span className="text-[9px] font-mono opacity-85">{st.code}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black font-mono block leading-tight">
                              NT$ {st.price?.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-mono font-bold block">
                              {st.pctChange >= 0 ? `+${st.pctChange}%` : `${st.pctChange}%`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Sector Footnote */}
            <div className="flex items-center justify-between text-[10px] text-rose-800/80 pt-2 border-t border-pink-200/80 font-mono">
              <span>共涵蓋 7 大產業結構族群</span>
              <span>點擊任何板塊標的即可開啟三竹技術與籌碼分析</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
