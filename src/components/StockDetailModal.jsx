import React, { useState, useMemo } from 'react';
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

/**
 * 三竹選股風格深度分析彈窗 (Mitake-Style Stock Detail Modal)
 * - 移除了多餘的 1D/5D/1M/3M/1Y 重複欄位，保留直觀的分時、日K、週K、月K、60分K、還原K
 * - 搭配 CandlestickChart 自由縮放與平移回溯
 * - 全面採用【淺粉色、櫻花粉】資訊區塊上色設計，提升辨識度與質感
 */
export default function StockDetailModal({ stock, onClose }) {
  const [activeTab, setActiveTab] = useState('TECH'); // TECH, CHIPS, FUNDAMENTALS, DIVIDENDS, CHAIN, NEWS
  const [klineType, setKlineType] = useState('日K'); // 分時, 日K, 週K, 月K, 60分K, 還原K
  const [chartMode, setChartMode] = useState('CANDLE'); // CANDLE (蠟燭圖), LINE (折線圖)

  // 獲取該股票完整三竹規格數據資料
  const detail = useMemo(() => {
    if (!stock) return null;
    const d = getStockDetailData(stock);
    if (stock.price) {
      d.price = Number(stock.price);
      if (stock.change !== undefined) d.change = Number(stock.change);
      if (stock.pctChange !== undefined) d.pctChange = Number(stock.pctChange);
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

  const handleKlineChange = (k) => {
    setKlineType(k);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-[#fff8fa] text-slate-900 border border-pink-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Header (櫻花粉精緻主題) */}
        <div className="p-4 sm:p-5 bg-[#fff0f3] border-b border-pink-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100/90 border border-pink-300 flex items-center justify-center text-rose-700 font-extrabold text-base font-mono shadow-xs">
              {detail.code}
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{detail.name}</h2>
                <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-pink-200">
                  {detail.code}
                </span>
                <span className="text-xs bg-rose-100/70 text-rose-800 px-2 py-0.5 rounded font-medium border border-pink-200">
                  {detail.market}
                </span>
              </div>
              <p className="text-xs text-rose-900/70 mt-0.5 font-sans">
                三竹股市標準規格 • 盤差、自由縮放K線蠟燭圖、籌碼面、基本面與產業鏈綜合分析
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-rose-400 hover:text-rose-700 bg-white hover:bg-rose-50 border border-pink-200 rounded-xl transition-colors shadow-2xs"
            title="關閉視窗"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-[#fff8fa]">
          {/* Main Price & Order Depth (盤差) Card (櫻花粉資訊區塊) */}
          <div className="bg-[#fff0f3] border border-pink-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-rose-700/80 block font-medium">最新成交價 (新台幣計價)</span>
                <div className="flex items-baseline space-x-3 mt-0.5">
                  <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
                    NT$ {detail.price?.toLocaleString()}
                  </span>
                  <span className={`inline-flex items-center text-sm font-bold font-mono px-2 py-0.5 rounded ${
                    isUp ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}>
                    {isUp ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                    {isUp ? `+${detail.change}` : detail.change} ({isUp ? `+${detail.pctChange}` : detail.pctChange}%)
                  </span>
                </div>
              </div>

              {/* 盤差與內外盤比 (SanZhu Core Feature) */}
              <div className="bg-white/95 p-3 rounded-xl border border-pink-200 min-w-[240px] shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-800 flex items-center gap-1 font-bold">
                    <Scale className="w-3.5 h-3.5 text-rose-600" />
                    盤差分析 (內外盤比)
                  </span>
                  <span className="font-mono text-[11px] text-rose-800 font-semibold">跳動差: NT$ {detail.spread}</span>
                </div>

                {/* Outer vs Inner Ratio Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-red-600 font-bold">外盤: {detail.outRatio}% (買進)</span>
                    <span className="text-emerald-600 font-bold">內盤: {detail.inRatio}% (賣出)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex border border-slate-300/60">
                    <div style={{ width: `${detail.outRatio}%` }} className="bg-red-500 h-full"></div>
                    <div style={{ width: `${detail.inRatio}%` }} className="bg-emerald-500 h-full"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                    <span>外盤量: {detail.outVolume?.toLocaleString()} 張</span>
                    <span>內盤量: {detail.inVolume?.toLocaleString()} 張</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar: Open, High, Low, Vol with explicit NT$ */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-pink-200/80 text-xs">
              <div>
                <span className="text-rose-900/70 block text-[11px]">開盤價</span>
                <span className="font-mono font-bold text-slate-800">NT$ {detail.open}</span>
              </div>
              <div>
                <span className="text-rose-900/70 block text-[11px]">最高價</span>
                <span className="font-mono font-bold text-red-600">NT$ {detail.high}</span>
              </div>
              <div>
                <span className="text-rose-900/70 block text-[11px]">最低價</span>
                <span className="font-mono font-bold text-emerald-600">NT$ {detail.low}</span>
              </div>
              <div>
                <span className="text-rose-900/70 block text-[11px]">昨收價</span>
                <span className="font-mono font-bold text-slate-600">NT$ {detail.prevClose}</span>
              </div>
              <div>
                <span className="text-rose-900/70 block text-[11px]">成交量 / 金額</span>
                <span className="font-mono font-bold text-slate-900">{detail.volume?.toLocaleString()} 張 ({detail.turnover})</span>
              </div>
            </div>
          </div>

          {/* 3. Interactive Candlestick (K線蠟燭圖) & Technical Chart (白色高對比卡片配櫻花粉工具列) */}
          <div className="bg-white border border-pink-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            {/* Chart Toolbar: 僅保留分時、日K、週K、月K、60分K、還原K，以及蠟燭/折線切換 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-3">
              {/* K-Line Granularity Selector (分時, 日K, 週K, 月K, 60分K, 還原K) */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs bg-[#fff0f3] p-1 rounded-xl border border-pink-200">
                {['分時', '日K', '週K', '月K', '60分K', '還原K'].map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKlineChange(k)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition font-bold ${
                      klineType === k
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/70'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              {/* Chart Mode Toggle: Candlestick vs Line */}
              <div className="flex items-center space-x-1 bg-[#fff0f3] p-1 rounded-xl border border-pink-200">
                <button
                  onClick={() => setChartMode('CANDLE')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    chartMode === 'CANDLE'
                      ? 'bg-white text-rose-700 shadow-xs border border-pink-200'
                      : 'text-rose-800 hover:text-rose-950'
                  }`}
                  title="切換為 K 線蠟燭圖 (Candlestick)"
                >
                  <CandleIcon className="w-3.5 h-3.5" />
                  <span>K棒蠟燭</span>
                </button>
                <button
                  onClick={() => setChartMode('LINE')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    chartMode === 'LINE'
                      ? 'bg-white text-rose-700 shadow-xs border border-pink-200'
                      : 'text-rose-800 hover:text-rose-950'
                  }`}
                  title="切換為分時折線圖"
                >
                  <LineIcon className="w-3.5 h-3.5" />
                  <span>折線</span>
                </button>
              </div>
            </div>

            {/* CHART RENDER: Candlestick (含自由縮放、支撐壓力線、副圖指標與畫線工具) vs Line */}
            {chartMode === 'CANDLE' ? (
              <CandlestickChart 
                data={currentChartData}
                height={340}
                isUp={isUp}
                stock={detail}
                supportPrice={detail.supportPrice || Number((detail.price * 0.97).toFixed(2))}
                resistancePrice={detail.resistancePrice || Number((detail.price * 1.03).toFixed(2))}
              />
            ) : (
              <div className="space-y-2">
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
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#FBCFE8', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(244,114,182,0.1)' }}
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

                {/* Sub-bar Volume */}
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

          {/* 4. SanZhu 6 Core Dimension Tabs (技術面、籌碼面、基本面、股利、產業鏈、時事) */}
          <div className="space-y-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-pink-200">
              <button
                onClick={() => setActiveTab('TECH')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'TECH'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>技術面</span>
              </button>

              <button
                onClick={() => setActiveTab('CHIPS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'CHAIN'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>產業鏈位置</span>
              </button>

              <button
                onClick={() => setActiveTab('NEWS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'NEWS'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/60'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>個股時事</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. 技術面 (TECH) */}
            {activeTab === 'TECH' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#fff0f3] p-4 rounded-xl border border-pink-200">
                  <span className="text-rose-800/80 block mb-1 font-semibold">均線排列結構</span>
                  <div className="text-sm font-bold text-slate-900 mb-2">多頭排列 (MA5 &gt; MA20 &gt; MA60)</div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-700">
                    <div>MA5 (5日線): NT$ {(detail.price * 0.99).toFixed(2)}</div>
                    <div>MA20 (月線): NT$ {(detail.price * 0.96).toFixed(2)}</div>
                    <div>MA60 (季線): NT$ {(detail.price * 0.91).toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-[#fff0f3] p-4 rounded-xl border border-pink-200">
                  <span className="text-rose-800/80 block mb-1 font-semibold">關鍵支撐與壓力</span>
                  <div className="text-sm font-bold text-slate-900 mb-2">短線突破壓力點位</div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-700">
                    <div>短線壓力: NT$ {(detail.price * 1.03).toFixed(2)}</div>
                    <div>回檔支撐: NT$ {(detail.price * 0.97).toFixed(2)}</div>
                    <div>乖離率 (BIAS): +2.45% (偏多)</div>
                  </div>
                </div>

                <div className="bg-[#fff0f3] p-4 rounded-xl border border-pink-200">
                  <span className="text-rose-800/80 block mb-1 font-semibold">震盪技術指標</span>
                  <div className="text-sm font-bold text-emerald-600 mb-2">多方動能主導</div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-700">
                    <div>RSI (14日): 64.2 (強勢區)</div>
                    <div>KD (9,3,3): K 72 / D 68 (黃金交叉)</div>
                    <div>MACD: 正向翻紅擴大</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. 籌碼面 (CHIPS) */}
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

            {/* TAB CONTENT: 3. 基本面 (FUNDAMENTALS) */}
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

                <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200">
                  <span className="text-rose-800/80 block font-sans text-[11px] font-semibold">營業毛利率 (Gross Margin)</span>
                  <span className="text-base font-bold text-slate-900">{detail.grossMargin}</span>
                </div>

                <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200">
                  <span className="text-rose-800/80 block font-sans text-[11px] font-semibold">營業利益率 (OP Margin)</span>
                  <span className="text-base font-bold text-slate-900">{detail.opMargin}</span>
                </div>

                <div className="bg-[#fff0f3] p-3.5 rounded-xl border border-pink-200 sm:col-span-2">
                  <span className="text-rose-800/80 block font-sans text-[11px] font-semibold">股東權益報酬率 (ROE)</span>
                  <span className="text-base font-bold text-emerald-600">{detail.roe}</span>
                  <span className="text-[10px] text-slate-500 block font-sans mt-0.5">獲利回報率穩健</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. 股利政策 (DIVIDENDS) */}
            {activeTab === 'DIVIDENDS' && (
              <div className="space-y-3 text-xs">
                <div className="overflow-x-auto rounded-xl border border-pink-200 shadow-2xs">
                  <table className="w-full text-left font-mono">
                    <thead className="bg-[#fff0f3] text-rose-800 border-b border-pink-200 font-sans text-[11px]">
                      <tr>
                        <th className="p-3">股利發放年度</th>
                        <th className="p-3">現金股利 (NT$)</th>
                        <th className="p-3">股票股利</th>
                        <th className="p-3">除息交易日</th>
                        <th className="p-3">殖利率 (Yield)</th>
                        <th className="p-3">填息天數</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100 bg-white">
                      {detail.dividends.map((div, i) => (
                        <tr key={i} className="hover:bg-rose-50/50 transition">
                          <td className="p-3 font-bold text-slate-900 font-sans">{div.year}</td>
                          <td className="p-3 text-red-600 font-bold">NT$ {div.cash}</td>
                          <td className="p-3 text-slate-600">{div.stock} 股</td>
                          <td className="p-3 text-slate-500">{div.exDate}</td>
                          <td className="p-3 text-emerald-600 font-bold">{div.yield}</td>
                          <td className="p-3 text-slate-700 font-sans">{div.fillDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-rose-800/80 font-mono">
                  * 殖利率依發放時股價推算，歷史平均 10~15 天完成填息。
                </p>
              </div>
            )}

            {/* TAB CONTENT: 5. 產業鏈位置 (CHAIN) */}
            {activeTab === 'CHAIN' && (
              <div className="bg-[#fff0f3] p-4 rounded-xl border border-pink-200 space-y-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-rose-700 block mb-1">產業戰略核心定位</span>
                  <div className="text-sm font-bold text-slate-900 bg-white p-2.5 rounded-lg border border-pink-200">
                    {detail.supplyChain.position}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-pink-200 space-y-1.5">
                    <span className="font-bold text-rose-700 block border-b border-pink-100 pb-1">上游供應廠商</span>
                    {detail.supplyChain.upstream.map((up, i) => (
                      <div key={i} className="text-slate-700 text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        {up}
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-pink-200 space-y-1.5">
                    <span className="font-bold text-purple-700 block border-b border-pink-100 pb-1">中游製造與同業</span>
                    {detail.supplyChain.midstream.map((mid, i) => (
                      <div key={i} className="text-slate-700 text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        {mid}
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-pink-200 space-y-1.5">
                    <span className="font-bold text-emerald-700 block border-b border-pink-100 pb-1">下游出貨客戶群</span>
                    {detail.supplyChain.downstream.map((down, i) => (
                      <div key={i} className="text-slate-700 text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {down}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 6. 個股時事 (NEWS) */}
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
          </div>
        </div>

        {/* 5. Modal Footer Action */}
        <div className="p-3 bg-[#fff0f3] border-t border-pink-200 flex items-center justify-between text-xs text-rose-800">
          <span className="font-mono text-[11px]">
            臺灣證券交易所 (TWSE) • 三竹股市規格深度診斷模組
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-xs"
          >
            完成檢視
          </button>
        </div>
      </div>
    </div>
  );
}
