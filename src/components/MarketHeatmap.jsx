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
  Filter,
  BarChart2,
  Table as TableIcon,
  ChevronRight,
  Info
} from 'lucide-react';

/**
 * 台灣股市即時雙熱力圖看板 (Market Heatmap Treemap)
 * 依據 2026/10/02 09:45 三竹智選股真實盤中即時資料建構：
 * 1. 類股分析 (熱力圖): 電子組件(1457億 0.69%)、半導體業(839億 0.29%)、光電業(276億 0.40%)等各大板塊
 * 2. 即時熱股 (熱力圖): 國巨*(380億 5.15%)、臻鼎-KY(193億 6.67%)、華新科(184億 9.88%)、穩懋(143億 9.85%)、台積電(122億 -0.60%)等
 */

// 1. 類股分析即時熱力圖數據 (10/2 09:45 實時成交額與漲跌幅)
const REAL_SECTOR_HEATMAP = [
  { id: 'ELEC_COMP', name: '電子組件', turnover: '1457億', pctChange: 0.69, isUp: true, weight: 36, codePrefix: '23' },
  { id: 'SEMI', name: '半導體業', turnover: '839億', pctChange: 0.29, isUp: true, weight: 21, codePrefix: '23/24' },
  { id: 'OPTO', name: '光電業', turnover: '276億', pctChange: 0.40, isUp: true, weight: 7, codePrefix: '24/34' },
  { id: 'OTHER_ELEC', name: '其他電子', turnover: '157億', pctChange: -0.16, isUp: false, weight: 4, codePrefix: '23' },
  { id: 'COMPUTER', name: '電腦週邊', turnover: '152億', pctChange: -0.32, isUp: false, weight: 3.8, codePrefix: '23/32' },
  { id: 'MACHINERY', name: '電機機械', turnover: '93億', pctChange: -0.56, isUp: false, weight: 2.3, codePrefix: '15' },
  { id: 'COMM', name: '通信網路', turnover: '92億', pctChange: 0.50, isUp: true, weight: 2.3, codePrefix: '33/49' },
  { id: 'PLASTIC', name: '塑膠工業', turnover: '81億', pctChange: 0.92, isUp: true, weight: 2.0, codePrefix: '13' },
  { id: 'CHEM', name: '化學工業', turnover: '71億', pctChange: 2.90, isUp: true, weight: 1.8, codePrefix: '17/47' }
];

// 2. 即時熱股各 Tab 分類標的資料庫 (10/2 09:45 實時數據)
const HOT_STOCKS_DATA = {
  // 成交值熱力圖 (與截圖完全一致)
  TURNOVER: [
    { code: '2327', name: '國巨*', price: '735.00', change: '+36.00', pctChange: 5.15, turnover: '380億', sector: '電子組件', isUp: true, tag: '成交值冠軍' },
    { code: '4958', name: '臻鼎-KY', price: '152.00', change: '+9.50', pctChange: 6.67, turnover: '193億', sector: '電子組件', isUp: true, tag: '載板PCB' },
    { code: '2492', name: '華新科', price: '139.00', change: '+12.50', pctChange: 9.88, turnover: '184億', sector: '電子組件', isUp: true, isLimitUp: true, tag: '漲停鎖死' },
    { code: '3105', name: '穩懋', price: '148.00', change: '+13.00', pctChange: 9.85, turnover: '143億', sector: '半導體', isUp: true, isLimitUp: true, tag: 'PA漲停' },
    { code: '2330', name: '台積電', price: '2465.00', change: '-15.00', pctChange: -0.60, turnover: '122億', sector: '半導體', isUp: false, tag: '權值核心' },
    { code: '2409', name: '友達', price: '36.25', change: '+1.20', pctChange: 3.39, turnover: '109億', sector: '光電業', isUp: true, tag: '面板轉型' },
    { code: '6274', name: '台燿', price: '194.00', change: '+9.00', pctChange: 4.89, turnover: '109億', sector: '電子組件', isUp: true, tag: '高階CCL' },
    { code: '2408', name: '南亞科', price: '54.90', change: '+0.70', pctChange: 1.35, turnover: '101億', sector: '半導體', isUp: true, tag: 'DRAM利多' },
    { code: '6213', name: '聯茂', price: '101.50', change: '+3.50', pctChange: 3.58, turnover: '87億', sector: '電子組件', isUp: true, tag: 'GB200' },
    { code: '3026', name: '禾伸堂', price: '121.00', change: '+2.50', pctChange: 2.11, turnover: '82億', sector: '電子組件', isUp: true, tag: 'MLCC' }
  ],
  // 漲停板熱力圖 (10/2 漲停標的，全市場共 29 檔)
  LIMIT_UP: [
    { code: '2492', name: '華新科', price: '139.00', change: '+12.50', pctChange: 9.88, turnover: '184億', sector: '電子組件', isUp: true },
    { code: '3105', name: '穩懋', price: '148.00', change: '+13.00', pctChange: 9.85, turnover: '143億', sector: '半導體', isUp: true },
    { code: '5443', name: '均豪', price: '142.50', change: '+12.50', pctChange: 9.92, turnover: '45億', sector: '半導體設備', isUp: true },
    { code: '3363', name: '上詮', price: '215.00', change: '+19.50', pctChange: 9.97, turnover: '42億', sector: '光通訊', isUp: true },
    { code: '3535', name: '晶彩科', price: '78.50', change: '+7.10', pctChange: 9.94, turnover: '38億', sector: '光電設備', isUp: true },
    { code: '8054', name: '安國', price: '188.50', change: '+17.00', pctChange: 9.91, turnover: '36億', sector: 'ASIC矽智財', isUp: true },
    { code: '3583', name: '辛耘', price: '452.00', change: '+41.00', pctChange: 9.98, turnover: '35億', sector: '半導體設備', isUp: true },
    { code: '3450', name: '聯鈞', price: '228.00', change: '+20.50', pctChange: 9.88, turnover: '32億', sector: '矽光子', isUp: true },
    { code: '3017', name: '奇鋐', price: '640.00', change: '+58.00', pctChange: 9.97, turnover: '29億', sector: '水冷散熱', isUp: true },
    { code: '2401', name: '凌陽', price: '34.65', change: '+3.15', pctChange: 10.00, turnover: '21億', sector: '車用IC', isUp: true }
  ],
  // 強勢排行熱力圖
  STRONG: [
    { code: '2492', name: '華新科', price: '139.00', change: '+12.50', pctChange: 9.88, turnover: '184億', sector: '電子組件', isUp: true },
    { code: '3105', name: '穩懋', price: '148.00', change: '+13.00', pctChange: 9.85, turnover: '143億', sector: '半導體', isUp: true },
    { code: '4958', name: '臻鼎-KY', price: '152.00', change: '+9.50', pctChange: 6.67, turnover: '193億', sector: '電子組件', isUp: true },
    { code: '2327', name: '國巨*', price: '735.00', change: '+36.00', pctChange: 5.15, turnover: '380億', sector: '電子組件', isUp: true },
    { code: '6274', name: '台燿', price: '194.00', change: '+9.00', pctChange: 4.89, turnover: '109億', sector: '電子組件', isUp: true },
    { code: '6213', name: '聯茂', price: '101.50', change: '+3.50', pctChange: 3.58, turnover: '87億', sector: '電子組件', isUp: true },
    { code: '2409', name: '友達', price: '36.25', change: '+1.20', pctChange: 3.39, turnover: '109億', sector: '光電業', isUp: true },
    { code: '3026', name: '禾伸堂', price: '121.00', change: '+2.50', pctChange: 2.11, turnover: '82億', sector: '電子組件', isUp: true },
    { code: '2408', name: '南亞科', price: '54.90', change: '+0.70', pctChange: 1.35, turnover: '101億', sector: '半導體', isUp: true },
    { code: '3481', name: '群創', price: '15.80', change: '+0.45', pctChange: 2.93, turnover: '155億', sector: '光電業', isUp: true }
  ],
  // 跌停 (2 檔如圖示 跌停: 2)
  LIMIT_DOWN: [
    { code: '6874', name: '倍力', price: '112.50', change: '-12.50', pctChange: -10.00, turnover: '8.2億', sector: '軟體服務', isUp: false },
    { code: '3529', name: '力旺', price: '2835.00', change: '-315.00', pctChange: -10.00, turnover: '24.5億', sector: 'IP矽智財', isUp: false }
  ],
  // 弱勢拉回股
  WEAK: [
    { code: '2330', name: '台積電', price: '2465.00', change: '-15.00', pctChange: -0.60, turnover: '122億', sector: '半導體', isUp: false },
    { code: '2317', name: '鴻海', price: '249.50', change: '-1.00', pctChange: -0.40, turnover: '71億', sector: '電腦周邊', isUp: false },
    { code: '2382', name: '廣達', price: '334.50', change: '-2.00', pctChange: -0.59, turnover: '42億', sector: '電腦周邊', isUp: false },
    { code: '3231', name: '緯創', price: '184.50', change: '-1.00', pctChange: -0.54, turnover: '38億', sector: '電腦周邊', isUp: false },
    { code: '2603', name: '長榮', price: '236.50', change: '-1.50', pctChange: -0.63, turnover: '25億', sector: '航運業', isUp: false }
  ],
  // 人氣焦點 (成交量/筆數最大)
  POPULAR: [
    { code: '2327', name: '國巨*', price: '735.00', change: '+36.00', pctChange: 5.15, turnover: '380億', sector: '電子組件', isUp: true },
    { code: '4958', name: '臻鼎-KY', price: '152.00', change: '+9.50', pctChange: 6.67, turnover: '193億', sector: '電子組件', isUp: true },
    { code: '2492', name: '華新科', price: '139.00', change: '+12.50', pctChange: 9.88, turnover: '184億', sector: '電子組件', isUp: true },
    { code: '3481', name: '群創', price: '15.80', change: '+0.45', pctChange: 2.93, turnover: '155億', sector: '光電業', isUp: true },
    { code: '3105', name: '穩懋', price: '148.00', change: '+13.00', pctChange: 9.85, turnover: '143億', sector: '半導體', isUp: true },
    { code: '2330', name: '台積電', price: '2465.00', change: '-15.00', pctChange: -0.60, turnover: '122億', sector: '半導體', isUp: false }
  ]
};

export default function MarketHeatmap({ 
  dailyStocks = [], 
  onSelectStock 
}) {
  // 類股分析控制選項
  const [sectorViewType, setSectorViewType] = useState('HEATMAP'); // 'HEATMAP' (熱力), 'NEWS' (新聞)
  const [sectorMarket, setSectorMarket] = useState('LISTED'); // 'LISTED' (上市), 'OTC' (上櫃)
  const [sectorPeriod, setSectorPeriod] = useState('DAY'); // 'DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'

  // 即時熱股控制選項
  const [stockDisplayType, setStockDisplayType] = useState('HEATMAP'); // 'HEATMAP' (熱力圖), 'LIST' (條列式)
  const [stockSortTab, setStockSortTab] = useState('TURNOVER'); // 'TURNOVER', 'LIMIT_UP', 'STRONG', 'LIMIT_DOWN', 'WEAK', 'POPULAR'

  // 取得當前即時熱股清單
  const currentHotStocks = useMemo(() => {
    return HOT_STOCKS_DATA[stockSortTab] || HOT_STOCKS_DATA.TURNOVER;
  }, [stockSortTab]);

  // 台股色彩格式 (紅漲綠跌)
  const getStockColorClass = (pct) => {
    if (pct > 0) return 'bg-[#dc2626] hover:bg-[#b91c1c] text-white border-red-700';
    if (pct < 0) return 'bg-[#059669] hover:bg-[#047857] text-white border-emerald-700';
    return 'bg-[#475569] text-white border-slate-600';
  };

  return (
    <div className="space-y-4 animate-fade-in text-slate-900 select-none">
      {/* 頂部標題說明列 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 p-4 sm:p-5 rounded-3xl border border-pink-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
            <Flame className="w-6 h-6 animate-pulse text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                類股分析與即時熱股雙熱力圖
              </h2>
              <span className="text-xs bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                10/2 09:45 實時連線
              </span>
            </div>
            <p className="text-xs text-rose-900/80 mt-0.5">
              對齊三竹智選股真實行情：被動元件與載板領軍爆量（國巨* 380億、華新科漲停、穩懋漲停、台積電微跌）
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-rose-800 bg-white/90 px-3 py-1.5 rounded-xl border border-pink-200 self-start sm:self-auto shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>盤中撮合中 (加權 48,250.94)</span>
        </div>
      </div>

      {/* 雙熱力圖並列容器 (左右各一，對齊三竹智選股 App 視窗) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ========================================================= */}
        {/* 左側卡片：類股分析 (熱力圖)                                */}
        {/* ========================================================= */}
        <div className="bg-[#12161f] text-slate-100 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-lg flex flex-col justify-between space-y-3">
          
          {/* 類股分析 Header & Controls */}
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>類股分析</span>
                </h3>

                {/* 熱力 vs 新聞 Toggle */}
                <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setSectorViewType('HEATMAP')}
                    className={`px-2.5 py-1 rounded-md font-bold transition ${
                      sectorViewType === 'HEATMAP'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    熱力
                  </button>
                  <button
                    onClick={() => setSectorViewType('NEWS')}
                    className={`px-2.5 py-1 rounded-md font-bold transition ${
                      sectorViewType === 'NEWS'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    新聞
                  </button>
                </div>
              </div>

              {/* 上市 vs 上櫃 Toggle */}
              <div className="flex items-center space-x-1 text-xs">
                <button
                  onClick={() => setSectorMarket('LISTED')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    sectorMarket === 'LISTED'
                      ? 'bg-slate-700 text-sky-400 border border-slate-600'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  上市
                </button>
                <button
                  onClick={() => setSectorMarket('OTC')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    sectorMarket === 'OTC'
                      ? 'bg-slate-700 text-sky-400 border border-slate-600'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  上櫃
                </button>
              </div>
            </div>

            {/* Sub-bar: 點擊提示與 日/週/月/季/年 週期切換 */}
            <div className="flex items-center justify-between text-xs pt-2 text-slate-400">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"></span>
                點擊熱力圖查看詳細資料
              </span>

              <div className="flex items-center space-x-3 text-xs font-bold">
                {[
                  { id: 'DAY', label: '日' },
                  { id: 'WEEK', label: '週' },
                  { id: 'MONTH', label: '月' },
                  { id: 'QUARTER', label: '季' },
                  { id: 'YEAR', label: '年' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSectorPeriod(p.id)}
                    className={`pb-0.5 transition ${
                      sectorPeriod === p.id 
                        ? 'text-sky-400 border-b-2 border-sky-400 font-extrabold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 類股 Treemap 視覺結構 (完全還原三竹 App 版面) */}
          <div className="min-h-[360px] sm:min-h-[380px] grid grid-cols-12 gap-1.5 p-1 bg-black/40 rounded-2xl border border-slate-800/80">
            {/* 1. 電子組件 (左側巨大區塊: 佔 4.5 欄) */}
            <div 
              className="col-span-5 sm:col-span-5 row-span-3 bg-[#b91c1c] hover:bg-[#991b1b] p-3 sm:p-4 rounded-xl border border-red-800 flex flex-col justify-end transition cursor-pointer group shadow-sm"
              title="電子組件: 成交值 1457億，漲幅 +0.69%"
            >
              <div>
                <span className="text-base sm:text-xl font-black block tracking-tight text-white group-hover:scale-105 transition-transform">
                  電子組件
                </span>
                <div className="text-xs sm:text-sm font-mono font-bold mt-1 text-red-100 flex items-baseline gap-1.5">
                  <span>1457億</span>
                  <span>0.69%</span>
                </div>
              </div>
            </div>

            {/* 2. 半導體業 (中間高挑區塊: 佔 3.5 欄) */}
            <div 
              className="col-span-4 sm:col-span-4 row-span-3 bg-[#b91c1c] hover:bg-[#991b1b] p-3 rounded-xl border border-red-800 flex flex-col justify-end transition cursor-pointer group shadow-sm"
              title="半導體業: 成交值 839億，漲幅 +0.29%"
            >
              <div>
                <span className="text-sm sm:text-lg font-black block tracking-tight text-white group-hover:scale-105 transition-transform">
                  半導體業
                </span>
                <div className="text-xs sm:text-sm font-mono font-bold mt-1 text-red-100 flex items-baseline gap-1.5">
                  <span>839億</span>
                  <span>0.29%</span>
                </div>
              </div>
            </div>

            {/* 3. 右側網格 (佔 3 欄，細分堆疊) */}
            <div className="col-span-3 sm:col-span-3 row-span-3 grid grid-cols-2 gap-1.5">
              {/* 光電業 */}
              <div 
                className="col-span-1 bg-[#b91c1c] hover:bg-[#991b1b] p-1.5 rounded-lg border border-red-800 flex flex-col justify-center text-center cursor-pointer transition group"
                title="光電業: 276億 0.40%"
              >
                <span className="text-[11px] font-black text-white block truncate">光電業</span>
                <span className="text-[9px] font-mono text-red-100 font-bold block">276億 0.40%</span>
              </div>

              {/* 其他電子 (綠色下跌) */}
              <div 
                className="col-span-1 bg-[#047857] hover:bg-[#065f46] p-1.5 rounded-lg border border-emerald-800 flex flex-col justify-center text-center cursor-pointer transition group"
                title="其他電子: 157億 -0.16%"
              >
                <span className="text-[11px] font-black text-white block truncate">其他電子</span>
                <span className="text-[9px] font-mono text-emerald-100 font-bold block">157億 -0.16%</span>
              </div>

              {/* 電腦週邊 (綠色下跌) */}
              <div 
                className="col-span-1 bg-[#047857] hover:bg-[#065f46] p-1.5 rounded-lg border border-emerald-800 flex flex-col justify-center text-center cursor-pointer transition group"
                title="電腦週邊: 152億 -0.32%"
              >
                <span className="text-[10px] font-black text-white block truncate">電腦週邊</span>
                <span className="text-[9px] font-mono text-emerald-100 font-bold block">152億 -0.32%</span>
              </div>

              {/* 通信網路 */}
              <div 
                className="col-span-1 bg-[#b91c1c] hover:bg-[#991b1b] p-1.5 rounded-lg border border-red-800 flex flex-col justify-center text-center cursor-pointer transition group"
                title="通信網路: 92億 0.50%"
              >
                <span className="text-[10px] font-black text-white block truncate">通信網路</span>
                <span className="text-[9px] font-mono text-red-100 font-bold block">92億 0.50%</span>
              </div>

              {/* 電機機械 (綠色下跌) */}
              <div 
                className="col-span-1 bg-[#047857] hover:bg-[#065f46] p-1.5 rounded-lg border border-emerald-800 flex flex-col justify-center text-center cursor-pointer transition group"
                title="電機機械: 93億 -0.56%"
              >
                <span className="text-[10px] font-black text-white block truncate">電機機械</span>
                <span className="text-[9px] font-mono text-emerald-100 font-bold block">93億 -0.56%</span>
              </div>

              {/* 塑膠工業 */}
              <div 
                className="col-span-1 bg-[#b91c1c] hover:bg-[#991b1b] p-1.5 rounded-lg border border-red-800 flex flex-col justify-center text-center cursor-pointer transition group"
                title="塑膠工業: 81億 0.92%"
              >
                <span className="text-[10px] font-black text-white block truncate">塑膠工業</span>
                <span className="text-[9px] font-mono text-red-100 font-bold block">81億 0.92%</span>
              </div>

              {/* 化學工業 (橫跨 2 欄) */}
              <div 
                className="col-span-2 bg-[#b91c1c] hover:bg-[#991b1b] p-1.5 rounded-lg border border-red-800 flex items-center justify-between px-2 cursor-pointer transition group"
                title="化學工業: 71億 2.90%"
              >
                <span className="text-[10px] font-black text-white">化學工業</span>
                <span className="text-[9px] font-mono text-red-100 font-bold">71億 2.90%</span>
              </div>
            </div>
          </div>

          {/* 底部輔助說明 */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
            <span>電子組件與半導體佔成交值逾 70%</span>
            <span className="text-sky-400">更新: 2026/10/02 09:45</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 右側卡片：即時熱股 (熱力圖)                                */}
        {/* ========================================================= */}
        <div className="bg-[#12161f] text-slate-100 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-lg flex flex-col justify-between space-y-3">
          
          {/* 即時熱股 Header & Controls */}
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>即時熱股</span>
                </h3>

                {/* 條列式 vs 熱力圖 Toggle */}
                <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setStockDisplayType('LIST')}
                    className={`px-2 py-1 rounded-md font-bold transition ${
                      stockDisplayType === 'LIST'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    條列式
                  </button>
                  <button
                    onClick={() => setStockDisplayType('HEATMAP')}
                    className={`px-2 py-1 rounded-md font-bold transition ${
                      stockDisplayType === 'HEATMAP'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    熱力圖
                  </button>
                </div>
              </div>

              <span className="text-xs text-slate-400 hover:text-white cursor-pointer transition">
                更多 &gt;
              </span>
            </div>

            {/* Sub-bar: 排序維度 Tab 切換 (成交值、漲停、強勢、跌停、弱勢、人氣) */}
            <div className="flex items-center space-x-3 sm:space-x-4 overflow-x-auto scrollbar-none pt-2 text-xs font-bold border-b border-slate-800/60 pb-1">
              {[
                { id: 'TURNOVER', label: '成交值' },
                { id: 'LIMIT_UP', label: '漲停' },
                { id: 'STRONG', label: '強勢' },
                { id: 'LIMIT_DOWN', label: '跌停' },
                { id: 'WEAK', label: '弱勢' },
                { id: 'POPULAR', label: '人氣' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setStockSortTab(t.id)}
                  className={`pb-1 transition whitespace-nowrap cursor-pointer ${
                    stockSortTab === t.id
                      ? 'text-sky-400 border-b-2 border-sky-400 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 視圖呈現：熱力圖 (HEATMAP) vs 條列式 (LIST) */}
          {stockDisplayType === 'HEATMAP' ? (
            /* 完全還原 10/2 09:45 實時成交值熱力圖區塊 */
            <div className="min-h-[360px] sm:min-h-[380px] grid grid-cols-12 gap-1.5 p-1 bg-black/40 rounded-2xl border border-slate-800/80">
              
              {/* 1. 國巨* (左上大方塊: 佔 4.5 欄 x 2 列) */}
              <div 
                onClick={() => onSelectStock && onSelectStock({ Code: '2327', Name: '國巨*', ClosingPrice: '735.00', Change: '+36.00' })}
                className="col-span-5 sm:col-span-5 row-span-2 bg-[#dc2626] hover:bg-[#b91c1c] p-3 sm:p-4 rounded-xl border border-red-700 flex flex-col justify-center items-center text-center transition cursor-pointer group shadow-sm"
                title="國巨*: 380億 5.15% (點擊開啟三竹K線圖)"
              >
                <span className="text-base sm:text-2xl font-black block tracking-tight text-white group-hover:scale-105 transition-transform">
                  國巨*
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold mt-1 text-red-100">
                  380億 5.15%
                </span>
              </div>

              {/* 2. 華新科 (中間偏上直長塊: 佔 3 欄 x 2 列) */}
              <div 
                onClick={() => onSelectStock && onSelectStock({ Code: '2492', Name: '華新科', ClosingPrice: '139.00', Change: '+12.50' })}
                className="col-span-3 sm:col-span-3 row-span-2 bg-[#dc2626] hover:bg-[#b91c1c] p-2.5 rounded-xl border border-red-700 flex flex-col justify-center items-center text-center transition cursor-pointer group shadow-sm"
                title="華新科: 184億 9.88% (漲停)"
              >
                <span className="text-sm sm:text-lg font-black block tracking-tight text-white group-hover:scale-105 transition-transform">
                  華新科
                </span>
                <span className="text-[11px] sm:text-xs font-mono font-bold mt-1 text-red-100">
                  184億 9.88%
                </span>
              </div>

              {/* 3. 台積電 (右側第1格: 綠色下跌 -0.60%) */}
              <div 
                onClick={() => onSelectStock && onSelectStock({ Code: '2330', Name: '台積電', ClosingPrice: '2465.00', Change: '-15.00' })}
                className="col-span-2 sm:col-span-2 row-span-1 bg-[#059669] hover:bg-[#047857] p-2 rounded-xl border border-emerald-700 flex flex-col justify-center items-center text-center transition cursor-pointer group"
                title="台積電: 122億 -0.60%"
              >
                <span className="text-xs sm:text-sm font-bold text-white block truncate">台積電</span>
                <span className="text-[10px] font-mono font-bold text-emerald-100">122億 -0.60%</span>
              </div>

              {/* 4. 友達 (右側第2格: 紅色 +3.39%) */}
              <div 
                onClick={() => onSelectStock && onSelectStock({ Code: '2409', Name: '友達', ClosingPrice: '36.25', Change: '+1.20' })}
                className="col-span-2 sm:col-span-2 row-span-1 bg-[#dc2626] hover:bg-[#b91c1c] p-2 rounded-xl border border-red-700 flex flex-col justify-center items-center text-center transition cursor-pointer group"
                title="友達: 109億 3.39%"
              >
                <span className="text-xs sm:text-sm font-bold text-white block truncate">友達</span>
                <span className="text-[10px] font-mono font-bold text-red-100">109億 3.39%</span>
              </div>

              {/* 5. 台燿 (右側第3格: 紅色 +4.89%) */}
              <div 
                onClick={() => onSelectStock && onSelectStock({ Code: '6274', Name: '台燿', ClosingPrice: '194.00', Change: '+9.00' })}
                className="col-span-2 sm:col-span-2 row-span-1 bg-[#dc2626] hover:bg-[#b91c1c] p-2 rounded-xl border border-red-700 flex flex-col justify-center items-center text-center transition cursor-pointer group"
                title="台燿: 109億 4.89%"
              >
                <span className="text-xs sm:text-sm font-bold text-white block truncate">台燿</span>
                <span className="text-[10px] font-mono font-bold text-red-100">109億 4.89%</span>
              </div>

              {/* 6. 聯茂 (右側第4格: 紅色 +3.58%) */}
              <div 
                onClick={() => onSelectStock && onSelectStock({ Code: '6213', Name: '聯茂', ClosingPrice: '101.50', Change: '+3.50' })}
                className="col-span-2 sm:col-span-2 row-span-1 bg-[#dc2626] hover:bg-[#b91c1c] p-2 rounded-xl border border-red-700 flex flex-col justify-center items-center text-center transition cursor-pointer group"
                title="聯茂: 87億 3.58%"
              >
                <span className="text-xs sm:text-sm font-bold text-white block truncate">聯茂</span>
                <span className="text-[10px] font-mono font-bold text-red-100">87億 3.58%</span>
              </div>

              {/* 7. 臻鼎-KY (左下大方塊: 佔 5 欄 x 1 列) */}
              <div 
                onClick={() => onSelectStock && onSelectStock({ Code: '4958', Name: '臻鼎-KY', ClosingPrice: '152.00', Change: '+9.50' })}
                className="col-span-5 sm:col-span-5 row-span-1 bg-[#dc2626] hover:bg-[#b91c1c] p-2.5 sm:p-3 rounded-xl border border-red-700 flex flex-col justify-center items-center text-center transition cursor-pointer group shadow-sm"
                title="臻鼎-KY: 193億 6.67%"
              >
                <span className="text-sm sm:text-xl font-black block tracking-tight text-white group-hover:scale-105 transition-transform">
                  臻鼎-KY
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-red-100">
                  193億 6.67%
                </span>
              </div>

              {/* 8. 穩懋 (中間偏下直塊: 佔 3 欄 x 1 列) */}
              <div 
                onClick={() => onSelectStock && onSelectStock({ Code: '3105', Name: '穩懋', ClosingPrice: '148.00', Change: '+13.00' })}
                className="col-span-3 sm:col-span-3 row-span-1 bg-[#dc2626] hover:bg-[#b91c1c] p-2.5 rounded-xl border border-red-700 flex flex-col justify-center items-center text-center transition cursor-pointer group shadow-sm"
                title="穩懋: 143億 9.85% (漲停)"
              >
                <span className="text-xs sm:text-base font-black block tracking-tight text-white group-hover:scale-105 transition-transform">
                  穩懋
                </span>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-red-100">
                  143億 9.85%
                </span>
              </div>

              {/* 9. 南亞科 (右下第1格) */}
              <div 
                onClick={() => onSelectStock && onSelectStock({ Code: '2408', Name: '南亞科', ClosingPrice: '54.90', Change: '+0.70' })}
                className="col-span-2 sm:col-span-2 row-span-1 bg-[#dc2626] hover:bg-[#b91c1c] p-2 rounded-xl border border-red-700 flex flex-col justify-center items-center text-center transition cursor-pointer group"
                title="南亞科: 101億 1.35%"
              >
                <span className="text-xs sm:text-sm font-bold text-white block truncate">南亞科</span>
                <span className="text-[10px] font-mono font-bold text-red-100">101億 1.35%</span>
              </div>

              {/* 10. 禾伸堂 (右下第2格) */}
              <div 
                onClick={() => onSelectStock && onSelectStock({ Code: '3026', Name: '禾伸堂', ClosingPrice: '121.00', Change: '+2.50' })}
                className="col-span-2 sm:col-span-2 row-span-1 bg-[#dc2626] hover:bg-[#b91c1c] p-2 rounded-xl border border-red-700 flex flex-col justify-center items-center text-center transition cursor-pointer group"
                title="禾伸堂: 82億 2.11%"
              >
                <span className="text-xs sm:text-sm font-bold text-white block truncate">禾伸堂</span>
                <span className="text-[10px] font-mono font-bold text-red-100">82億 2.11%</span>
              </div>
            </div>
          ) : (
            /* 條列式表格視圖 (LIST VIEW) */
            <div className="overflow-x-auto min-h-[360px] sm:min-h-[380px] bg-slate-900/60 rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">排名 / 標的</th>
                    <th className="py-2.5 px-3">產業族群</th>
                    <th className="py-2.5 px-3 text-right">成交值</th>
                    <th className="py-2.5 px-3 text-right">現價</th>
                    <th className="py-2.5 px-3 text-right">漲跌幅</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {currentHotStocks.map((st, idx) => (
                    <tr 
                      key={st.code}
                      onClick={() => onSelectStock && onSelectStock({ Code: st.code, Name: st.name, ClosingPrice: st.price, Change: st.change })}
                      className="hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-slate-500 w-4 font-bold">{idx + 1}</span>
                          <span className="font-bold text-white">{st.name}</span>
                          <span className="text-[10px] text-slate-400">({st.code})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">{st.sector}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200">{st.turnover}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">NT$ {st.price}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          st.pctChange > 0 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {st.pctChange > 0 ? `+${st.pctChange}%` : `${st.pctChange}%`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 底部熱力圖說明 */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
            <span>紅漲綠跌 • 點擊任一標的開啟三竹 K 線視窗</span>
            <span className="text-amber-300">國巨*成交值 380億 居全市場之冠</span>
          </div>
        </div>

      </div>
    </div>
  );
}
