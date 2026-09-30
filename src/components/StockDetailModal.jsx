import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart2, 
  Coins, 
  Building2, 
  Layers, 
  Newspaper, 
  Gift, 
  Percent, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Flame,
  Scale,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { getStockDetailData } from '../services/stockDetailService';

export default function StockDetailModal({ stock, onClose }) {
  const [timeframe, setTimeframe] = useState('1D'); // 1D, 5D, 1M, 3M, 1Y
  const [klineType, setKlineType] = useState('分時'); // 分時, 日K, 週K, 月K, 60分K, 還原K
  const [activeTab, setActiveTab] = useState('TECH'); // TECH, CHIPS, FUNDAMENTALS, DIVIDENDS, CHAIN, NEWS

  const detail = useMemo(() => {
    return getStockDetailData(stock);
  }, [stock]);

  if (!stock || !detail) return null;

  const isUp = detail.change >= 0;
  const currentChartData = detail.charts[timeframe] || detail.charts['1D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="bg-dark-900 border border-gray-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Header */}
        <div className="p-5 bg-dark-800/90 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-base font-mono">
              {detail.code}
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-white tracking-tight">{detail.name}</h2>
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {detail.code}
                </span>
                <span className="text-xs bg-dark-700 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                  {detail.market}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">三竹股市專業規格 • 盤差、多週期技術線、籌碼、基本面與產業鏈綜合觀測</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-dark-900 hover:bg-gray-800 rounded-xl transition-colors"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Main Price & Order Depth (盤差) Card */}
          <div className="bg-dark-800/70 border border-gray-800 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-400 block font-sans">即時最新成交價 (新台幣)</span>
                <div className="flex items-baseline space-x-3 mt-0.5">
                  <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                    NT$ {detail.price.toLocaleString()}
                  </span>
                  <span className={`inline-flex items-center text-sm font-bold font-mono px-2 py-0.5 rounded ${
                    isUp ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {isUp ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                    {isUp ? `+${detail.change}` : detail.change} ({isUp ? `+${detail.pctChange}` : detail.pctChange}%)
                  </span>
                </div>
              </div>

              {/* 盤差與內外盤比 (SanZhu Core Feature) */}
              <div className="bg-dark-900/80 p-3 rounded-xl border border-gray-700/80 min-w-[240px]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400 flex items-center gap-1 font-medium">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    盤差分析 (內外盤比)
                  </span>
                  <span className="font-mono text-[11px] text-gray-300">跳動差: NT$ {detail.spread}</span>
                </div>

                {/* Outer vs Inner Ratio Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-red-400 font-bold">外盤: {detail.outRatio}% (買進)</span>
                    <span className="text-emerald-400 font-bold">內盤: {detail.inRatio}% (賣出)</span>
                  </div>
                  <div className="w-full h-2 bg-dark-950 rounded-full overflow-hidden flex border border-gray-700/40">
                    <div style={{ width: `${detail.outRatio}%` }} className="bg-red-500 h-full"></div>
                    <div style={{ width: `${detail.inRatio}%` }} className="bg-emerald-500 h-full"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-0.5">
                    <span>外盤量: {detail.outVolume?.toLocaleString()} 張</span>
                    <span>內盤量: {detail.inVolume?.toLocaleString()} 張</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar: Open, High, Low, Vol, P/E */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-800 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">開盤價</span>
                <span className="font-mono font-bold text-gray-200">NT$ {detail.open}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">最高價</span>
                <span className="font-mono font-bold text-red-400">NT$ {detail.high}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">最低價</span>
                <span className="font-mono font-bold text-emerald-400">NT$ {detail.low}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">昨收價</span>
                <span className="font-mono font-bold text-gray-400">NT$ {detail.prevClose}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">成交量 / 金額</span>
                <span className="font-mono font-bold text-white">{detail.volume?.toLocaleString()} 張 ({detail.turnover})</span>
              </div>
            </div>
          </div>

          {/* 3. Interactive Technical Chart with 1D, 5D, 1M, 3M, 1Y */}
          <div className="bg-dark-800/50 border border-gray-800 rounded-2xl p-4 sm:p-5 space-y-4">
            {/* Chart Toolbar: Timeframe & K-Line Types */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
              {/* 1D, 5D, 1M, 3M, 1Y Toggle */}
              <div className="flex items-center space-x-1 bg-dark-900 p-1 rounded-xl border border-gray-800">
                {['1D', '5D', '1M', '3M', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      timeframe === tf 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-400 hover:text-white hover:bg-dark-800'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* K-Line Granularity Selector (分時, 日K, 週K, 月K, 60分K, 還原K) */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                {['分時', '日K', '週K', '月K', '60分K', '還原K'].map((k) => (
                  <button
                    key={k}
                    onClick={() => setKlineType(k)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition ${
                      klineType === k
                        ? 'bg-dark-700 text-blue-400 border border-blue-500/30 font-semibold'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="detailPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isUp ? '#EF4444' : '#10B981'} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={isUp ? '#EF4444' : '#10B981'} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="time" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    stroke="#6B7280" 
                    fontSize={11} 
                    tickLine={false}
                    tickFormatter={(v) => `NT$${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#9CA3AF' }}
                    formatter={(val, name) => [`NT$ ${Number(val).toLocaleString()}`, name === 'price' ? '價格' : name]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isUp ? '#EF4444' : '#10B981'} 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#detailPriceGrad)" 
                  />
                  {currentChartData[0]?.ma5 && (
                    <Area type="monotone" dataKey="ma5" stroke="#3B82F6" strokeWidth={1.5} fill="none" dot={false} name="MA5 均線" />
                  )}
                  {currentChartData[0]?.ma20 && (
                    <Area type="monotone" dataKey="ma20" stroke="#F59E0B" strokeWidth={1.5} fill="none" dot={false} name="MA20 月線" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Volume Sub-Bar Indicator */}
            <div className="h-16 w-full pt-1 border-t border-gray-800/80">
              <span className="text-[10px] text-gray-500 font-mono block mb-1">成交量 (Volume)</span>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentChartData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Bar dataKey="volume" fill={isUp ? '#EF4444' : '#10B981'} opacity={0.7} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. SanZhu 6 Core Dimension Tabs (技術面、籌碼面、基本面、股利、產業鏈、時事) */}
          <div className="space-y-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-800">
              <button
                onClick={() => setActiveTab('TECH')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'TECH'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>技術面</span>
              </button>

              <button
                onClick={() => setActiveTab('CHIPS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'CHIPS'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>籌碼面</span>
              </button>

              <button
                onClick={() => setActiveTab('FUNDAMENTALS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'FUNDAMENTALS'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>基本面</span>
              </button>

              <button
                onClick={() => setActiveTab('DIVIDENDS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'DIVIDENDS'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>股利政策</span>
              </button>

              <button
                onClick={() => setActiveTab('CHAIN')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'CHAIN'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>產業鏈位置</span>
              </button>

              <button
                onClick={() => setActiveTab('NEWS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'NEWS'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>個股時事</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. 技術面 (TECH) */}
            {activeTab === 'TECH' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-dark-800/60 p-4 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block mb-1">均線排列結構</span>
                  <div className="text-sm font-bold text-white mb-2">多頭排列 (MA5 &gt; MA20 &gt; MA60)</div>
                  <div className="space-y-1 font-mono text-[11px] text-gray-300">
                    <div>MA5 (5日線): NT$ {(detail.price * 0.99).toFixed(2)}</div>
                    <div>MA20 (月線): NT$ {(detail.price * 0.96).toFixed(2)}</div>
                    <div>MA60 (季線): NT$ {(detail.price * 0.91).toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-dark-800/60 p-4 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block mb-1">關鍵支撐與壓力</span>
                  <div className="text-sm font-bold text-white mb-2">短線突破壓力點位</div>
                  <div className="space-y-1 font-mono text-[11px] text-gray-300">
                    <div>短線壓力: NT$ {(detail.price * 1.03).toFixed(2)}</div>
                    <div>回檔支撐: NT$ {(detail.price * 0.97).toFixed(2)}</div>
                    <div>乖離率 (BIAS): +2.45% (偏多)</div>
                  </div>
                </div>

                <div className="bg-dark-800/60 p-4 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block mb-1">震盪技術指標</span>
                  <div className="text-sm font-bold text-emerald-400 mb-2">多方動能主導</div>
                  <div className="space-y-1 font-mono text-[11px] text-gray-300">
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
                  <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">外資籌碼動態</span>
                    <span className="text-sm font-bold text-red-400 font-mono block mt-1">{detail.chips.foreignStreak}</span>
                    <span className="text-[11px] text-gray-400 mt-1 block">近5日累計: +{detail.chips.foreign5D.toLocaleString()} 張</span>
                  </div>

                  <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">投信基金動態</span>
                    <span className="text-sm font-bold text-red-400 font-mono block mt-1">{detail.chips.trustStreak}</span>
                    <span className="text-[11px] text-gray-400 mt-1 block">近5日累計: +{detail.chips.trust5D.toLocaleString()} 張</span>
                  </div>

                  <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">千張大戶持股比例</span>
                    <span className="text-sm font-bold text-white font-mono block mt-1">{detail.chips.majorHoldingRatio}</span>
                    <span className="text-[11px] text-emerald-400 mt-1 block">週變動: {detail.chips.majorChange}</span>
                  </div>

                  <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">融資融券餘額</span>
                    <span className="text-sm font-bold text-gray-200 font-mono block mt-1">{detail.chips.marginBalance}</span>
                    <span className="text-[11px] text-gray-400 mt-1 block">空單: {detail.chips.shortBalance}</span>
                  </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-blue-300">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>籌碼診斷：三大法人同買同買動向明確，大戶持股高於市場均值，浮動籌碼獲有效鎖定。</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. 基本面 (FUNDAMENTALS) */}
            {activeTab === 'FUNDAMENTALS' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block font-sans text-[11px]">本益比 (P/E)</span>
                  <span className="text-base font-bold text-white">{detail.pe} 倍</span>
                  <span className="text-[10px] text-gray-500 block font-sans mt-0.5">產業平均約 20 倍</span>
                </div>

                <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block font-sans text-[11px]">股價淨值比 (P/B)</span>
                  <span className="text-base font-bold text-white">{detail.pb} 倍</span>
                  <span className="text-[10px] text-gray-500 block font-sans mt-0.5">資產評價健康</span>
                </div>

                <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block font-sans text-[11px]">近四季 EPS 總和</span>
                  <span className="text-base font-bold text-red-400">NT$ {detail.eps}</span>
                  <span className="text-[10px] text-gray-500 block font-sans mt-0.5">每股稅後盈餘</span>
                </div>

                <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block font-sans text-[11px]">最新單月合併營收</span>
                  <span className="text-base font-bold text-white">{detail.revenueMonthly}</span>
                  <span className="text-[10px] text-red-400 block font-mono mt-0.5">YoY {detail.revYoY} (月增 {detail.revMoM})</span>
                </div>

                <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block font-sans text-[11px]">營業毛利率 (Gross Margin)</span>
                  <span className="text-base font-bold text-white">{detail.grossMargin}</span>
                </div>

                <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block font-sans text-[11px]">營業利益率 (OP Margin)</span>
                  <span className="text-base font-bold text-white">{detail.opMargin}</span>
                </div>

                <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800 sm:col-span-2">
                  <span className="text-gray-400 block font-sans text-[11px]">股東權益報酬率 (ROE)</span>
                  <span className="text-base font-bold text-emerald-400">{detail.roe}</span>
                  <span className="text-[10px] text-gray-400 block font-sans mt-0.5">代表每 100 元股東資金帶來之長期淨利能力</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. 股利政策 (DIVIDENDS) */}
            {activeTab === 'DIVIDENDS' && (
              <div className="space-y-3 text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 pb-2">
                        <th className="py-2 px-3">股利年度</th>
                        <th className="py-2 px-3 text-right">現金股利 (元)</th>
                        <th className="py-2 px-3 text-right">股票股利 (元)</th>
                        <th className="py-2 px-3 text-right">除息基準日</th>
                        <th className="py-2 px-3 text-right">現金殖利率</th>
                        <th className="py-2 px-3 text-right">歷史填息紀錄</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 font-mono">
                      {detail.dividends.map((div, idx) => (
                        <tr key={idx} className="hover:bg-dark-800/40">
                          <td className="py-2.5 px-3 font-sans text-gray-200">{div.year}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-white">NT$ {div.cash}</td>
                          <td className="py-2.5 px-3 text-right text-gray-400">{div.stock > 0 ? `NT$ ${div.stock}` : '-'}</td>
                          <td className="py-2.5 px-3 text-right text-gray-400">{div.exDate}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-red-400">{div.yield}</td>
                          <td className="py-2.5 px-3 text-right font-sans text-emerald-400">{div.fillDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. 產業鏈位置 (CHAIN) */}
            {activeTab === 'CHAIN' && (
              <div className="space-y-3 text-xs">
                <div className="bg-dark-800/60 p-4 rounded-xl border border-gray-800">
                  <span className="text-gray-400 font-sans block mb-1">產業戰略核心定位</span>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    {detail.supplyChain.position}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-dark-800/40 p-3.5 rounded-xl border border-gray-800">
                    <span className="font-bold text-blue-400 block mb-2">🔺 上游供應鏈</span>
                    <ul className="space-y-1 text-gray-300">
                      {detail.supplyChain.upstream.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-dark-800/40 p-3.5 rounded-xl border border-gray-800">
                    <span className="font-bold text-purple-400 block mb-2">🔹 中游製造與同業</span>
                    <ul className="space-y-1 text-gray-300">
                      {detail.supplyChain.midstream.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-dark-800/40 p-3.5 rounded-xl border border-gray-800">
                    <span className="font-bold text-emerald-400 block mb-2">🔻 下游客戶與應用</span>
                    <ul className="space-y-1 text-gray-300">
                      {detail.supplyChain.downstream.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 6. 個股時事新聞 (NEWS) */}
            {activeTab === 'NEWS' && (
              <div className="space-y-2.5 text-xs">
                {detail.news.map((n, i) => (
                  <div key={i} className="p-3 bg-dark-800/50 hover:bg-dark-800/80 rounded-xl border border-gray-800 transition">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                      <span className="px-1.5 py-0.2 rounded bg-dark-700 text-blue-300 border border-gray-700">{n.source}</span>
                      <span className="font-mono">{n.date}</span>
                    </div>
                    <h4 className="text-white font-semibold text-sm leading-snug">{n.title}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
