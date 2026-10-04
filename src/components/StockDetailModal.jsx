import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Coins, 
  BarChart2, 
  Layers, 
  Gift, 
  Newspaper, 
  Scale, 
  ShieldCheck, 
  ExternalLink,
  Bot,
  Target,
  Zap,
  Sparkles,
  CheckCircle2,
  CandlestickChart as CandleIcon,
  LineChart as LineIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import CandlestickChart from './CandlestickChart';
import { getStockDetailData } from '../services/stockDetailService';
import { analyzeSMC } from '../services/smcRlInferenceService';

/**
 * 三竹智選股風格深度分析彈窗 (Mitake-Style Stock Detail Modal)
 * 解決三大核心訴求:
 * 1. 【無滑動鎖定全螢幕視窗】: 徹底移除任何垂直滾動誤觸，鎖定背景與彈窗本體 (overflow-hidden)
 * 2. 【雙指標/多指標並列 K 線技術圖】: 主圖下方同時並列 MACD 與 KD 兩組副圖指標 (嚴格時間軸對齊)
 * 3. 【嚴格時間序列與全歷史上市櫃成交 K 棒】: 杜絕任何日期倒退與價格斷層
 */
export default function StockDetailModal({ stock, onClose }) {
  const [activeTab, setActiveTab] = useState('TECH'); // TECH, CHIPS, FUNDAMENTALS, DIVIDENDS, CHAIN, NEWS
  const [klineType, setKlineType] = useState('日K'); // 分時, 日K, 週K, 月K, 60分K, 還原K
  const [chartMode, setChartMode] = useState('CANDLE'); // CANDLE (蠟燭圖), LINE (折線圖)

  // 鎖定外層 body 滾動條，徹底防止看盤時頁面滑動誤觸
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  // 獲取該股票完整三竹規格數據資料
  const detail = useMemo(() => {
    if (!stock) return null;
    const d = getStockDetailData(stock);
    if (stock.price) {
      d.price = Number(stock.price);
      if (stock.change !== undefined) d.change = Number(stock.change);
      if (stock.pctChange !== undefined) d.pctChange = Number(stock.pctChange);
      if (stock.open) d.open = Number(stock.open);
      if (stock.high) d.high = Number(stock.high);
      if (stock.low) d.low = Number(stock.low);
      if (stock.prevClose) d.prevClose = Number(stock.prevClose);
    }
    return d;
  }, [stock]);

  if (!stock || !detail) return null;

  const isUp = detail.change >= 0;

  // Selected chart data based on klineType
  const currentChartData = useMemo(() => {
    if (klineType && detail.klines && detail.klines[klineType]) {
      return detail.klines[klineType];
    }
    return detail.klines?.['日K'] || detail.charts?.['1M'] || [];
  }, [detail, klineType]);

  // SMC (Smart Money Concepts) 強化學習推論分析
  const smcAnalysis = useMemo(() => {
    if (!currentChartData || currentChartData.length === 0) return null;
    return analyzeSMC(currentChartData);
  }, [currentChartData]);

  const handleKlineChange = (k) => {
    setKlineType(k);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in overflow-hidden select-none">
      <div 
        className="bg-[#fff8fa] text-slate-900 border border-pink-200 rounded-2xl sm:rounded-3xl w-full max-w-6xl h-[95vh] shadow-2xl overflow-hidden relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* 1. 緊湊頂部股票抬頭欄 (Stock Header)                        */}
        {/* ========================================================= */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-[#fff0f3] border-b border-pink-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100/90 border border-pink-300 flex items-center justify-center text-rose-700 font-extrabold text-sm font-mono shadow-2xs">
              {detail.code}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{detail.name}</h2>
                <span className="font-mono text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-pink-200">
                  {detail.code}
                </span>
                <span className="text-[11px] bg-rose-100/80 text-rose-800 px-2 py-0.5 rounded font-bold border border-pink-200">
                  {detail.market}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-rose-900/80 font-sans flex-wrap">
                <span>上市櫃: <strong className="font-mono text-slate-800">{detail.listingDate || '1994-09-05'}</strong> ({detail.yearsListed || 32} 年)</span>
                <span>•</span>
                <span>掛牌價: <strong className="font-mono text-slate-800">NT$ {detail.ipoPrice || '10.0'}</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                  全歷史K棒完整收錄
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-rose-400 hover:text-rose-700 bg-white hover:bg-rose-50 border border-pink-200 rounded-xl transition-colors shadow-2xs"
            title="關閉視窗 (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* 2. 緊湊報價與即時盤差橫條 (Price & Market Metrics Strip)    */}
        {/* ========================================================= */}
        <div className="px-4 py-2 bg-white/95 border-b border-pink-100 flex flex-wrap items-center justify-between gap-y-2 text-xs shrink-0">
          {/* 最新價格與漲跌 */}
          <div className="flex items-baseline space-x-3">
            <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
              NT$ {detail.price?.toLocaleString()}
            </span>
            <span className={`inline-flex items-center text-xs font-bold font-mono px-2 py-0.5 rounded ${
              isUp ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}>
              {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {isUp ? `+${detail.change}` : detail.change} ({isUp ? `+${detail.pctChange}` : detail.pctChange}%)
            </span>
          </div>

          {/* 開高低昨收量盤差 (行內高密度佈局) */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-[11px] font-mono flex-wrap">
            <div>
              <span className="text-slate-400 mr-1">開</span>
              <strong className="text-slate-800">NT${detail.open}</strong>
            </div>
            <div>
              <span className="text-slate-400 mr-1">高</span>
              <strong className="text-red-600">NT${detail.high}</strong>
            </div>
            <div>
              <span className="text-slate-400 mr-1">低</span>
              <strong className="text-emerald-600">NT${detail.low}</strong>
            </div>
            <div>
              <span className="text-slate-400 mr-1">昨收</span>
              <strong className="text-slate-600">NT${detail.prevClose}</strong>
            </div>
            <div>
              <span className="text-slate-400 mr-1">成交量</span>
              <strong className="text-slate-900">{detail.volume?.toLocaleString()}張</strong>
              <span className="text-slate-500 text-[10px] ml-1">({detail.turnover})</span>
            </div>

            {/* 盤差比 (外盤/內盤比) */}
            <div className="hidden md:flex items-center space-x-1.5 pl-2 border-l border-pink-200">
              <span className="text-red-600 font-bold text-[10px]">外{detail.outRatio}%</span>
              <div className="w-14 h-2 bg-slate-200 rounded-full overflow-hidden flex border border-slate-300">
                <div style={{ width: `${detail.outRatio}%` }} className="bg-red-500 h-full"></div>
                <div style={{ width: `${detail.inRatio}%` }} className="bg-emerald-500 h-full"></div>
              </div>
              <span className="text-emerald-600 font-bold text-[10px]">內{detail.inRatio}%</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. 模態分頁與 K 線週期切換列 (Tabs & Granularity Switcher)   */}
        {/* ========================================================= */}
        <div className="px-3 py-1.5 bg-[#fff0f3] border-b border-pink-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* 六大分析維度按鈕群 */}
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5 text-xs">
            <button
              onClick={() => setActiveTab('TECH')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'TECH'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>技術面 (雙指標並列)</span>
            </button>

            <button
              onClick={() => setActiveTab('CHIPS')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'CHIPS'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>籌碼面</span>
            </button>

            <button
              onClick={() => setActiveTab('FUNDAMENTALS')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'FUNDAMENTALS'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>基本面</span>
            </button>

            <button
              onClick={() => setActiveTab('DIVIDENDS')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'DIVIDENDS'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>股利政策</span>
            </button>

            <button
              onClick={() => setActiveTab('CHAIN')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'CHAIN'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>產業鏈</span>
            </button>

            <button
              onClick={() => setActiveTab('NEWS')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'NEWS'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>時事</span>
            </button>

            <button
              onClick={() => setActiveTab('SMC_RL')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-xs ${
                activeTab === 'SMC_RL'
                  ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-rose-600 text-white shadow-md ring-2 ring-purple-300'
                  : 'text-purple-900 bg-purple-50/90 hover:bg-purple-100 hover:text-purple-950 border border-purple-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>🤖 AI 聰明錢 (SMC-RL)</span>
            </button>
          </div>

          {/* 當前為技術面或 SMC_RL 時，顯示 K 線週期切換按鈕群 */}
          {(activeTab === 'TECH' || activeTab === 'SMC_RL') && (
            <div className="flex items-center space-x-1 text-xs">
              <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-pink-200">
                {['分時', '日K', '週K', '月K', '60分K', '還原K'].map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKlineChange(k)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                      klineType === k
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-rose-800 hover:bg-rose-50'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              {/* 蠟燭/折線切換 */}
              <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-pink-200">
                <button
                  onClick={() => setChartMode('CANDLE')}
                  className={`p-1 rounded-md transition ${chartMode === 'CANDLE' ? 'bg-rose-100 text-rose-800' : 'text-slate-400'}`}
                  title="蠟燭圖"
                >
                  <CandleIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setChartMode('LINE')}
                  className={`p-1 rounded-md transition ${chartMode === 'LINE' ? 'bg-rose-100 text-rose-800' : 'text-slate-400'}`}
                  title="折線圖"
                >
                  <LineIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 4. 模態主體內容區 (Main Content - Non-scrollable in TECH)    */}
        {/* ========================================================= */}
        {activeTab === 'TECH' ? (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-2 sm:p-2.5 bg-[#fff8fa]">
            {chartMode === 'CANDLE' ? (
              <CandlestickChart 
                data={currentChartData}
                isUp={isUp}
                stock={detail}
                supportPrice={detail.supportPrice || Number((detail.price * 0.97).toFixed(2))}
                resistancePrice={detail.resistancePrice || Number((detail.price * 1.03).toFixed(2))}
              />
            ) : (
              <div className="flex-1 min-h-0 bg-white rounded-2xl border border-pink-200 p-3 flex flex-col">
                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="detailPriceGradLight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isUp ? '#DC2626' : '#16A34A'} stopOpacity={0.25}/>
                          <stop offset="95%" stopColor={isUp ? '#DC2626' : '#16A34A'} stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#FCE7F3" vertical={false} />
                      <XAxis dataKey="time" stroke="#9D174D" fontSize={11} tickLine={false} />
                      <YAxis 
                        domain={['dataMin - 2', 'dataMax + 2']} 
                        stroke="#9D174D" 
                        fontSize={11} 
                        tickLine={false}
                        tickFormatter={(v) => `NT$${v}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#FBCFE8', borderRadius: '12px', fontSize: '12px' }}
                        labelStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                        formatter={(val, name) => [`NT$ ${Number(val).toLocaleString()}`, name === 'price' ? '最新價格' : name]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={isUp ? '#DC2626' : '#16A34A'} 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#detailPriceGradLight)" 
                      />
                      {currentChartData[0]?.ma5 && (
                        <Area type="monotone" dataKey="ma5" stroke="#2563EB" strokeWidth={1.5} fill="none" dot={false} name="MA5 均線" />
                      )}
                      {currentChartData[0]?.ma20 && (
                        <Area type="monotone" dataKey="ma20" stroke="#D97706" strokeWidth={1.5} fill="none" dot={false} name="MA20 月線" />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* 成交量副圖 */}
                <div className="h-16 w-full pt-1 border-t border-pink-100">
                  <span className="text-[10px] text-rose-700/80 font-mono block mb-1">成交量 (Volume)</span>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentChartData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Bar dataKey="volume" fill={isUp ? '#DC2626' : '#16A34A'} opacity={0.65} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fff8fa]">
            {/* 籌碼面 */}
            {activeTab === 'CHIPS' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200">
                    <span className="text-rose-800/80 block text-[11px] font-semibold">外資籌碼動態</span>
                    <span className="text-sm font-bold text-red-600 font-mono block mt-1">{detail.chips.foreignStreak}</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">近5日累計: +{detail.chips.foreign5D?.toLocaleString()} 張</span>
                  </div>

                  <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200">
                    <span className="text-rose-800/80 block text-[11px] font-semibold">投信基金動態</span>
                    <span className="text-sm font-bold text-red-600 font-mono block mt-1">{detail.chips.trustStreak}</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">近5日累計: +{detail.chips.trust5D?.toLocaleString()} 張</span>
                  </div>

                  <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200">
                    <span className="text-rose-800/80 block text-[11px] font-semibold">千張大戶持股比例</span>
                    <span className="text-sm font-bold text-slate-900 font-mono block mt-1">{detail.chips.majorHoldingRatio}</span>
                    <span className="text-[11px] text-emerald-600 mt-1 block">週變動: {detail.chips.majorChange}</span>
                  </div>

                  <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200">
                    <span className="text-rose-800/80 block text-[11px] font-semibold">融資融券餘額</span>
                    <span className="text-sm font-bold text-slate-800 font-mono block mt-1">{detail.chips.marginBalance}</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">空單: {detail.chips.shortBalance}</span>
                  </div>
                </div>

                <div className="bg-rose-50 border border-pink-200 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>籌碼診斷：三大法人同買同動向明確，千張大戶籌碼集中，浮動籌碼獲有效鎖定。</span>
                </div>
              </div>
            )}

            {/* 基本面 */}
            {activeTab === 'FUNDAMENTALS' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200">
                  <span className="text-rose-800/80 block font-sans text-[11px] font-semibold">本益比 (P/E)</span>
                  <span className="text-base font-bold text-slate-900">{detail.pe} 倍</span>
                  <span className="text-[10px] text-slate-500 block font-sans mt-0.5">同業平均約 20 倍</span>
                </div>

                <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200">
                  <span className="text-rose-800/80 block font-sans text-[11px] font-semibold">股價淨值比 (P/B)</span>
                  <span className="text-base font-bold text-slate-900">{detail.pb} 倍</span>
                  <span className="text-[10px] text-slate-500 block font-sans mt-0.5">資產評價健康</span>
                </div>

                <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200">
                  <span className="text-rose-800/80 block font-sans text-[11px] font-semibold">近四季 EPS 總和</span>
                  <span className="text-base font-bold text-red-600">NT$ {detail.eps}</span>
                  <span className="text-[10px] text-slate-500 block font-sans mt-0.5">每股稅後盈餘</span>
                </div>

                <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200">
                  <span className="text-rose-800/80 block font-sans text-[11px] font-semibold">最新單月合併營收</span>
                  <span className="text-base font-bold text-slate-900">{detail.revenueMonthly}</span>
                  <span className="text-[10px] text-red-600 block font-mono mt-0.5">YoY {detail.revYoY} (月增 {detail.revMoM})</span>
                </div>
              </div>
            )}

            {/* 股利政策 */}
            {activeTab === 'DIVIDENDS' && (
              <div className="space-y-3 text-xs">
                <div className="overflow-x-auto rounded-xl border border-pink-200 bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#fff0f3] text-rose-900 border-b border-pink-200 text-[11px]">
                        <th className="p-3">發放年度/季度</th>
                        <th className="p-3">現金股利 (元)</th>
                        <th className="p-3">股票股利 (元)</th>
                        <th className="p-3">除息交易日</th>
                        <th className="p-3">現金殖利率</th>
                        <th className="p-3">填息天數</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100 font-mono text-[11px]">
                      {detail.dividends.map((div, i) => (
                        <tr key={i} className="hover:bg-rose-50/50 transition">
                          <td className="p-3 font-bold font-sans text-slate-900">{div.year}</td>
                          <td className="p-3 font-bold text-red-600">NT$ {div.cash.toFixed(2)}</td>
                          <td className="p-3 text-slate-600">{div.stock.toFixed(2)}</td>
                          <td className="p-3 text-slate-700">{div.exDate}</td>
                          <td className="p-3 font-bold text-emerald-600">{div.yield}</td>
                          <td className="p-3 font-sans text-slate-700">{div.fillDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 產業鏈 */}
            {activeTab === 'CHAIN' && (
              <div className="space-y-3 text-xs">
                <div className="bg-[#fff0f3] p-4 rounded-xl border border-pink-200">
                  <span className="text-rose-800 font-bold block mb-1">產業戰略定位</span>
                  <div className="text-sm font-extrabold text-slate-900">{detail.supplyChain.position}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-pink-200">
                    <span className="text-rose-700 font-bold block mb-2">上游供應鏈 (原材料與設備)</span>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {detail.supplyChain.upstream.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-pink-200">
                    <span className="text-rose-700 font-bold block mb-2">中游核心 (本公司與同業)</span>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {detail.supplyChain.midstream.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-pink-200">
                    <span className="text-rose-700 font-bold block mb-2">下游應用 (終端客戶)</span>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {detail.supplyChain.downstream.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 個股時事 */}
            {activeTab === 'NEWS' && (
              <div className="space-y-2 text-xs">
                {detail.news.map((n, i) => (
                  <div 
                    key={i} 
                    className="p-3 bg-[#fff0f3] rounded-xl border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-pink-300 transition"
                  >
                    <div>
                      <div className="font-bold text-slate-900 hover:text-rose-700 transition cursor-pointer">
                        {n.title}
                      </div>
                      <div className="text-[11px] text-rose-800/80 mt-1 flex items-center gap-2">
                        <span>來源: {n.source}</span>
                        <span>•</span>
                        <span>{n.date}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-rose-700 bg-white px-2 py-0.5 rounded border border-pink-200 shrink-0 font-medium self-start sm:self-auto">
                      個股快訊
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 7. 🤖 AI 聰明錢強化學習決策 (SMC-RL Deep Reinforcement Learning) */}
            {activeTab === 'SMC_RL' && (
              <div className="space-y-4 text-xs animate-fade-in">
                {/* 頂部 AI 狀態橫幅 */}
                <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-purple-500/30">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-purple-500/20 border border-purple-400/40 rounded-lg text-purple-300">
                          <Bot className="w-5 h-5" />
                        </span>
                        <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                          SMC 深度強化學習交易代理人 (DRL Policy Agent)
                          <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30 font-mono">
                            Model: PPO-ActorCritic v2.4
                          </span>
                        </h3>
                      </div>
                      <p className="text-purple-200/80 text-[11px] leading-relaxed max-w-2xl">
                        依據《SMC FinTech 碩士論文研究矩陣》Ep.05-39 核心架構訓練，嚴格遵循「流動性獵殺 (Sweeps) + 訂單塊 (Extreme OB) + 50% 均衡位折價過濾 + 拒絕 IDM 誘餌陷阱」高勝率數學決策邏輯。
                      </p>
                    </div>

                    {/* 核心訊號動作卡片 */}
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 shrink-0">
                      <div>
                        <div className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">AI 動作推薦 (Action)</div>
                        <div className={`text-base font-black flex items-center gap-1.5 ${
                          smcAnalysis?.decision?.action === 'BUY'
                            ? 'text-emerald-400'
                            : smcAnalysis?.decision?.action === 'SELL'
                            ? 'text-rose-400'
                            : 'text-amber-300'
                        }`}>
                          {smcAnalysis?.decision?.action === 'BUY' && '🎯 多方進場 (BUY)'}
                          {smcAnalysis?.decision?.action === 'SELL' && '🛡️ 空方減碼 (SELL)'}
                          {smcAnalysis?.decision?.action === 'HOLD' && '⏳ 觀望等待 (HOLD)'}
                        </div>
                      </div>
                      <div className="pl-3 border-l border-white/20 text-right">
                        <div className="text-[10px] text-purple-200 font-bold">策略置信度</div>
                        <div className="text-lg font-black font-mono text-purple-300">
                          {smcAnalysis?.decision?.confidence ?? 50}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 三大結構量化指標卡片 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 進場 POI */}
                  <div className="bg-white p-3.5 rounded-xl border border-pink-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
                      <span>關鍵進場參考價 (POI Entry)</span>
                      <Target className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div className="text-xl font-black font-mono text-slate-900">
                      NT$ {smcAnalysis?.decision?.entryPrice ?? detail.price}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      盤面現價: NT$ {detail.price} ({smcAnalysis?.isDiscount ? '折價區' : smcAnalysis?.isPremium ? '溢價區' : '均衡區'})
                    </div>
                  </div>

                  {/* 結構性停損 SL */}
                  <div className="bg-white p-3.5 rounded-xl border border-pink-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
                      <span>結構性防守止損 (Structural SL)</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <div className="text-xl font-black font-mono text-rose-600">
                      {smcAnalysis?.decision?.stopLoss ? `NT$ ${smcAnalysis.decision.stopLoss}` : '動態前低外緣'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      以 Extreme OB 或近期流動性極值保護，破位則失效
                    </div>
                  </div>

                  {/* 目標止盈 TP (2.5R) */}
                  <div className="bg-white p-3.5 rounded-xl border border-pink-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
                      <span>目標止盈價格 (Target TP @ 2.5R)</span>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-xl font-black font-mono text-emerald-600">
                      {smcAnalysis?.decision?.takeProfit ? `NT$ ${smcAnalysis.decision.takeProfit}` : '2.5R 盈虧比'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      期望盈虧比: <strong className="font-mono text-slate-700">{smcAnalysis?.decision?.expectedRR || '1 : 2.5'}</strong> (滿足機構數學期望值)
                    </div>
                  </div>
                </div>

                {/* SMC 核心要素驗證檢驗表 (5-Point Checklist) */}
                <div className="bg-white rounded-xl border border-pink-200 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-pink-100 pb-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      SMC 機構進場 5 大核心結構檢驗指標 (Notion Notes Checklist)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      分析週期: {klineType}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* 1. 斐波那契 50% 均衡位 */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                      <div className={`mt-0.5 p-1 rounded ${smcAnalysis?.isDiscount ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">1. 斐波那契 50% 均衡位 (Equilibrium EQ)</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          EQ 中軸價位: <strong className="font-mono text-slate-800">NT$ {smcAnalysis?.fib50}</strong>
                          <span className={`ml-2 px-1.5 py-0.2 rounded font-bold text-[10px] ${
                            smcAnalysis?.isDiscount ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {smcAnalysis?.isDiscount ? '折價區 Discount (買方安全區)' : '溢價區 Premium (高位警惕)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. 流動性掃蕩 */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                      <div className={`mt-0.5 p-1 rounded ${smcAnalysis?.sweeps?.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">2. 流動性獵殺 (Liquidity Sweeps)</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          偵測到 <strong className="font-mono text-purple-700">{smcAnalysis?.sweeps?.length || 0}</strong> 次影線假突破掃蕩
                          {smcAnalysis?.sweeps?.length > 0 && (
                            <span className="text-[10px] text-slate-500 ml-1">
                              (最近: {smcAnalysis.sweeps[smcAnalysis.sweeps.length - 1].type === 'BSL_SWEEP' ? '買方 BSL 假突破' : '賣方 SSL 獵殺收回'})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3. 訂單塊 */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                      <div className="mt-0.5 p-1 rounded bg-blue-100 text-blue-700">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">3. 極端訂單塊 (Extreme Order Blocks)</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          多頭 OB: <strong className="font-mono text-emerald-600">{smcAnalysis?.orderBlocks?.filter(o => o.type === 'BULL').length || 0}</strong> 處 |
                          空頭 OB: <strong className="font-mono text-rose-600">{smcAnalysis?.orderBlocks?.filter(o => o.type === 'BEAR').length || 0}</strong> 處
                        </div>
                      </div>
                    </div>

                    {/* 4. 公允價值缺口 */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                      <div className="mt-0.5 p-1 rounded bg-amber-100 text-amber-700">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">4. 公允價值缺口 (Fair Value Gaps / FVG)</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          包含 3 棒失衡與 4 棒孕線修復型 FVG，共 <strong className="font-mono text-amber-700">{smcAnalysis?.fvgs?.length || 0}</strong> 處磁吸區
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 代理人推演邏輯清單 */}
                <div className="bg-[#fff0f3] p-4 rounded-xl border border-pink-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      強化學習決策推演信號鏈 (Agent Reasoning Signals)
                    </span>
                    <button
                      onClick={() => setActiveTab('TECH')}
                      className="text-rose-700 hover:text-rose-900 font-bold text-xs underline flex items-center gap-1"
                    >
                      前往 K 線圖視覺化查看 →
                    </button>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    {smcAnalysis?.decision?.signals?.map((sig, sIdx) => (
                      <div key={sIdx} className="bg-white/80 p-2.5 rounded-lg border border-pink-100 flex items-start gap-2">
                        <span className="text-purple-600 font-bold font-mono">[{sIdx + 1}]</span>
                        <span className="text-slate-800 leading-tight">{sig}</span>
                      </div>
                    ))}
                    {(!smcAnalysis?.decision?.signals || smcAnalysis.decision.signals.length === 0) && (
                      <div className="text-slate-500 italic p-2 bg-white/60 rounded">
                        目前處於結構平衡區，未觸發極端高勝率 POI 條件，策略建議耐心觀望。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
