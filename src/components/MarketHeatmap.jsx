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

// 產業結構焦點分類標的資料庫 (10/2 真實行情基準)
const SECTOR_GROUPS = [
  {
    id: 'COMP_PARTS',
    name: '電子零組件與被動元件',
    icon: Zap,
    colorTheme: 'cyan',
    weight: 35.2,
    stocks: [
      { code: '2327', name: '國巨*', price: 626.0, change: 24.0, pctChange: 3.99, turnover: 644.4, isUp: true },
      { code: '4958', name: '臻鼎-KY', price: 561.0, change: 51.0, pctChange: 10.0, turnover: 369.1, isUp: true },
      { code: '2492', name: '華新科', price: 361.5, change: 32.5, pctChange: 9.88, turnover: 198.5, isUp: true },
      { code: '6274', name: '台燿', price: 1620.0, change: 85.0, pctChange: 5.54, turnover: 190.8, isUp: true }
    ]
  },
  {
    id: 'SEMI',
    name: '半導體產業',
    icon: Cpu,
    colorTheme: 'blue',
    weight: 28.5,
    stocks: [
      { code: '2330', name: '台積電', price: 2500.0, change: -10.0, pctChange: -0.40, turnover: 346.7, isUp: false },
      { code: '2454', name: '聯發科', price: 4950.0, change: -30.0, pctChange: -0.60, turnover: 189.6, isUp: false },
      { code: '2408', name: '南亞科', price: 526.0, change: 7.0, pctChange: 1.35, turnover: 185.4, isUp: true },
      { code: '2303', name: '聯電', price: 161.5, change: 0.0, pctChange: 0.0, turnover: 159.3, isUp: true }
    ]
  },
  {
    id: 'OPTO',
    name: '光電面板與光學',
    icon: Sparkles,
    colorTheme: 'amber',
    weight: 15.6,
    stocks: [
      { code: '2409', name: '友達', price: 40.45, change: 2.15, pctChange: 5.61, turnover: 282.1, isUp: true, open: 38.75, high: 40.85, low: 38.65, prevClose: 38.30, volume: 69729 },
      { code: '3481', name: '群創', price: 52.8, change: 0.5, pctChange: 0.96, turnover: 110.9, isUp: true },
      { code: '3008', name: '大立光', price: 6290.0, change: 85.0, pctChange: 1.37, turnover: 95.4, isUp: true }
    ]
  },
  {
    id: 'AI_COMP',
    name: 'AI 伺服器與電腦周邊',
    icon: Server,
    colorTheme: 'indigo',
    weight: 12.8,
    stocks: [
      { code: '3017', name: '奇鋐', price: 3440.0, change: -70.0, pctChange: -1.99, turnover: 107.6, isUp: false },
      { code: '2308', name: '台達電', price: 1885.0, change: -20.0, pctChange: -1.05, turnover: 104.0, isUp: false },
      { code: '2317', name: '鴻海', price: 251.0, change: -3.0, pctChange: -1.18, turnover: 71.3, isUp: false },
      { code: '2382', name: '廣達', price: 332.0, change: -2.0, pctChange: -0.60, turnover: 33.0, isUp: false }
    ]
  },
  {
    id: 'SHIPPING',
    name: '航運物流與海運',
    icon: Ship,
    colorTheme: 'sky',
    weight: 4.2,
    stocks: [
      { code: '2603', name: '長榮', price: 239.5, change: 1.5, pctChange: 0.63, turnover: 28.5, isUp: true },
      { code: '2609', name: '陽明', price: 70.2, change: 1.3, pctChange: 1.89, turnover: 24.2, isUp: true },
      { code: '2615', name: '萬海', price: 92.5, change: 2.7, pctChange: 3.01, turnover: 18.6, isUp: true }
    ]
  },
  {
    id: 'FINANCE',
    name: '金融保險金控',
    icon: Landmark,
    colorTheme: 'emerald',
    weight: 3.9,
    stocks: [
      { code: '2881', name: '富邦金', price: 151.0, change: -0.5, pctChange: -0.33, turnover: 27.5, isUp: false },
      { code: '2882', name: '國泰金', price: 111.0, change: -0.5, pctChange: -0.45, turnover: 22.4, isUp: false },
      { code: '2891', name: '中信金', price: 35.1, change: 0.3, pctChange: 0.86, turnover: 16.8, isUp: true }
    ]
  }
];

export default function MarketHeatmap({ 
  dailyStocks = [], 
  realtimeQuotes = [],
  onSelectStock 
}) {
  const [activeView, setActiveView] = useState('SPLIT'); // 'SPLIT', 'TURNOVER', 'SECTOR'

  // Build a lookup map from realtimeQuotes
  const realtimeMap = useMemo(() => {
    const map = new Map();
    if (realtimeQuotes && realtimeQuotes.length > 0) {
      realtimeQuotes.forEach(q => {
        if (q.symbol) map.set(q.symbol, q);
      });
    }
    return map;
  }, [realtimeQuotes]);

  // Helper: merge real dailyStocks and realtimeQuotes into a stock entry
  const mergeRealData = (st, dailyMap, realtimeMap) => {
    const live = realtimeMap ? realtimeMap.get(st.code) : null;
    if (live && live.isRealtime && live.price !== '-' && parseFloat(live.price) > 0) {
      const cp = parseFloat(live.price);
      const chg = parseFloat(live.change) || 0;
      const pct = parseFloat(live.pctChange) || 0;
      const vol = parseFloat(live.volume) || 0;
      const toYi = parseFloat(live.turnover) || (cp * vol * 1000 / 100000000);
      const turnoverYi = Number(toYi.toFixed(1));
      
      return {
        ...st,
        price: cp,
        change: chg,
        pctChange: pct,
        isUp: chg >= 0,
        turnover: turnoverYi > 0 ? turnoverYi : st.turnover,
        Name: live.name || st.name,
        Code: st.code,
        ClosingPrice: String(cp),
        isLive: true,
        liveTime: live.time
      };
    }

    const found = dailyMap.get(st.code);
    if (found) {
      const cp = parseFloat(found.ClosingPrice) || st.price;
      const chg = parseFloat(found.Change) || st.change;
      const prev = cp - chg;
      const pct = prev > 0 ? Number(((chg / prev) * 100).toFixed(2)) : st.pctChange;
      
      const tv = parseFloat(found.TradeValue) || 0;
      const tvFromYi = parseFloat(found.TurnoverYi) || 0;
      const vol = parseFloat(found.TradeVolume) || 0;
      
      let turnoverYi = 0;
      if (tvFromYi > 0) {
        turnoverYi = tvFromYi;
      } else if (tv > 0) {
        turnoverYi = Number((tv / 100000000).toFixed(1));
      } else if (cp > 0 && vol > 0) {
        turnoverYi = Number(((cp * vol * 1000) / 100000000).toFixed(1));
      } else {
        turnoverYi = st.turnover;
      }

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

  // 1. 處理即時成交值熱力圖標的 (取全市場當前成交金額最大的活躍標的，即時與盤後無縫結合)
  const turnoverStocks = useMemo(() => {
    let combined = [];

    // 若 dailyStocks 存在，優先提取成交金額最高的熱門股並融入盤中即時撮合跳動
    if (dailyStocks && dailyStocks.length > 0) {
      const allParsed = dailyStocks.map(d => {
        const live = realtimeMap.get(d.Code);
        const cp = (live && parseFloat(live.price) > 0) ? parseFloat(live.price) : (parseFloat(d.ClosingPrice) || 0);
        const chg = live ? (parseFloat(live.change) || 0) : (parseFloat(d.Change) || 0);
        const pct = live ? (parseFloat(live.pctChange) || 0) : (parseFloat(d.PctChange) || 0);
        const tvYi = (live && parseFloat(live.turnover) > 0) ? parseFloat(live.turnover) : (parseFloat(d.TurnoverYi) || 0);
        const tv = parseFloat(d.TradeValue) || 0;
        const vol = live ? parseFloat(live.volume) : (parseFloat(d.TradeVolume) || 0);
        
        let turnoverYi = 0;
        if (tvYi > 0) turnoverYi = tvYi;
        else if (tv > 0) turnoverYi = Number((tv / 100000000).toFixed(1));
        else if (cp > 0 && vol > 0) turnoverYi = Number(((cp * vol * 1000) / 100000000).toFixed(1));

        return {
          code: d.Code,
          name: live?.name || d.Name,
          price: cp,
          change: chg,
          pctChange: pct,
          isUp: chg >= 0,
          turnover: turnoverYi,
          sector: d.Sector || '一般產業',
          Name: live?.name || d.Name,
          Code: d.Code,
          ClosingPrice: String(cp),
          isLive: !!live
        };
      }).filter(s => s.price > 0 && !s.code.startsWith('00') && s.turnover > 0);

      // 依成交金額由大到小排序
      allParsed.sort((a, b) => b.turnover - a.turnover);

      // 取前 16 檔成交金額最大者
      if (allParsed.length >= 10) {
        combined = allParsed.slice(0, 16);
      }
    }

    // 若提取數量不足，以焦點權重標的清單補齊並套用即時盤中資料
    if (combined.length < 10) {
      const baseList = [
        { code: '2327', name: '國巨*', price: 626.0, change: 24.0, pctChange: 3.99, turnover: 644.4, sector: '零組件' },
        { code: '4958', name: '臻鼎-KY', price: 561.0, change: 51.0, pctChange: 10.0, turnover: 369.1, sector: '零組件' },
        { code: '2330', name: '台積電', price: 2500.0, change: -10.0, pctChange: -0.40, turnover: 346.7, sector: '半導體' },
        { code: '2409', name: '友達', price: 40.45, change: 2.15, pctChange: 5.61, turnover: 282.1, sector: '光電業', open: 38.75, high: 40.85, low: 38.65, prevClose: 38.30, volume: 69729 },
        { code: '2492', name: '華新科', price: 361.5, change: 32.5, pctChange: 9.88, turnover: 198.5, sector: '零組件' },
        { code: '6274', name: '台燿', price: 1620.0, change: 85.0, pctChange: 5.54, turnover: 190.8, sector: '零組件' },
        { code: '2408', name: '南亞科', price: 526.0, change: 7.0, pctChange: 1.35, turnover: 185.4, sector: '半導體' },
        { code: '2454', name: '聯發科', price: 4950.0, change: -30.0, pctChange: -0.60, turnover: 189.6, sector: '半導體' },
        { code: '6213', name: '聯茂', price: 683.0, change: 41.0, pctChange: 6.39, turnover: 163.5, sector: '零組件' },
        { code: '2303', name: '聯電', price: 161.5, change: 0.0, pctChange: 0.0, turnover: 159.3, sector: '半導體' },
        { code: '3105', name: '穩懋', price: 591.0, change: 53.0, pctChange: 9.85, turnover: 161.4, sector: '半導體' },
        { code: '3026', name: '禾伸堂', price: 835.0, change: -17.0, pctChange: -2.00, turnover: 140.4, sector: '零組件' },
        { code: '3481', name: '群創', price: 52.8, change: 0.5, pctChange: 0.96, turnover: 110.9, sector: '光電業' },
        { code: '3017', name: '奇鋐', price: 3440.0, change: -70.0, pctChange: -1.99, turnover: 107.6, sector: '電腦周邊' },
        { code: '2308', name: '台達電', price: 1885.0, change: -20.0, pctChange: -1.05, turnover: 104.0, sector: '零組件' },
        { code: '2317', name: '鴻海', price: 251.0, change: -3.0, pctChange: -1.18, turnover: 71.3, sector: '電腦周邊' }
      ];
      combined = baseList.map(st => mergeRealData(st, dailyMap, realtimeMap));
      combined.sort((a, b) => b.turnover - a.turnover);
    }

    return combined;
  }, [dailyStocks, dailyMap, realtimeMap]);

  // 2. Also update SECTOR_GROUPS stocks with real data
  const updatedSectorGroups = useMemo(() => {
    return SECTOR_GROUPS.map(sec => ({
      ...sec,
      stocks: sec.stocks.map(st => mergeRealData(st, dailyMap, realtimeMap))
    }));
  }, [dailyMap, realtimeMap]);

  const latestLiveTime = useMemo(() => {
    if (!realtimeQuotes || realtimeQuotes.length === 0) return null;
    const item = realtimeQuotes.find(q => q.time);
    return item ? item.time : null;
  }, [realtimeQuotes]);

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
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 flex-wrap">
              台股雙熱力圖多區塊觀測站
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded border border-pink-300 font-semibold">
                即時成交值 • 產業板塊
              </span>
              {latestLiveTime && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  盤中即時撮合 ({latestLiveTime})
                </span>
              )}
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

            {/* Treemap Multi-block Grid (依真實成交金額大小動態排版) */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 min-h-[380px] select-none">
              {/* Rank 1: Massive Leader Block (全市場成交金額冠軍) */}
              {turnoverStocks[0] && (() => {
                const leader = turnoverStocks[0];
                return (
                  <div
                    onClick={() => onSelectStock && onSelectStock(leader)}
                    className={`col-span-3 sm:col-span-4 row-span-3 p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md ${getHeatmapColor(leader.pctChange)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-base sm:text-lg font-black block tracking-tight">{leader.name}</span>
                        <span className="text-xs font-mono opacity-90">{leader.code}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs font-mono">
                        {leader.pctChange >= 0 ? `+${leader.pctChange}%` : `${leader.pctChange}%`}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl sm:text-3xl font-black font-mono">
                        NT$ {leader.price?.toLocaleString()}
                      </div>
                      <div className="text-[11px] opacity-90 font-mono mt-0.5 flex items-center justify-between">
                        <span>成交值: {leader.turnover} 億</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/15 font-sans">成交榜首</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Rank 2: 2nd Largest Block (全市場成交金額亞軍) */}
              {turnoverStocks[1] && (() => {
                const subLeader = turnoverStocks[1];
                return (
                  <div
                    onClick={() => onSelectStock && onSelectStock(subLeader)}
                    className={`col-span-3 sm:col-span-4 row-span-2 p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md ${getHeatmapColor(subLeader.pctChange)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm sm:text-base font-black block">{subLeader.name}</span>
                        <span className="text-xs font-mono opacity-90">{subLeader.code}</span>
                      </div>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/20 font-mono">
                        {subLeader.pctChange >= 0 ? `+${subLeader.pctChange}%` : `${subLeader.pctChange}%`}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xl sm:text-2xl font-black font-mono">
                        NT$ {subLeader.price?.toLocaleString()}
                      </div>
                      <div className="text-[10px] opacity-90 font-mono flex items-center justify-between">
                        <span>成交: {subLeader.turnover} 億</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-black/15 font-sans">熱門權值</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Rank 3~6: Tier 2 Active Blocks */}
              {turnoverStocks.slice(2, 6).map((st) => (
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

              {/* Rank 7~16: Remaining Active Traded Stocks Grid */}
              {turnoverStocks.slice(6, 16).map((st) => (
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
              <span>點擊任何板塊標的即可開啟深度技術與籌碼分析</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
