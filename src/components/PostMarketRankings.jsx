import React, { useState } from 'react';
import { 
  BarChart3, 
  Building2, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Search, 
  ArrowUpDown,
  Coins,
  ChevronRight,
  ShieldAlert,
  Flame
} from 'lucide-react';

export default function PostMarketRankings({ 
  reportData, 
  onRefresh, 
  isRefreshing, 
  onSelectStock 
}) {
  const [activeTab, setActiveTab] = useState('VOLUME'); // VOLUME, FOREIGN, TRUST, FLOWS
  const [subTab, setSubTab] = useState('BUY'); // BUY, SELL for Foreign & Trust
  const [searchTerm, setSearchTerm] = useState('');

  if (!reportData) {
    return (
      <div className="glass-panel p-8 text-center text-gray-400 rounded-2xl animate-pulse">
        正在載入臺灣證交所即時與盤後資料...
      </div>
    );
  }

  const { volumeRankings = [], foreignRankings = { buy: [], sell: [] }, trustRankings = { buy: [], sell: [] }, institutionalFlows = {} } = reportData;

  // Filter lists based on search
  const filterList = (list = []) => {
    if (!Array.isArray(list)) return [];
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(item => 
      (item?.name && item.name.toLowerCase().includes(term)) || 
      (item?.code && item.code.includes(term)) ||
      (item?.sector && item.sector.includes(term))
    );
  };

  const filteredVolume = filterList(volumeRankings || []);
  const currentForeign = (subTab === 'BUY' ? foreignRankings?.buy : foreignRankings?.sell) || [];
  const filteredForeign = filterList(currentForeign);
  const currentTrust = (subTab === 'BUY' ? trustRankings?.buy : trustRankings?.sell) || [];
  const filteredTrust = filterList(currentTrust);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">
                  臺灣證交所即時排行與盤後動向
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {reportData.isClosed ? '🔴 13:30 盤後已定案' : '🟢 盤中即時追蹤中'}
                </span>
                <span className="text-[11px] font-mono text-gray-400 bg-dark-800/80 px-2 py-0.5 rounded border border-gray-700/60">
                  更新: {reportData.timestamp}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                支援盤中即時線上爬取與 13:30 盤後三大法人 (BFI82U)、成交量 (MI_INDEX20)、外資投信 (T86)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="搜尋代號 / 名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-800/80 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-36 sm:w-44 transition-all"
            />
          </div>

          {/* On-Demand Refresh Button */}
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            title="隨時連線 TWSE 與即時爬蟲抓取最新盤中資料，不限 13:35"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-medium transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>即時線上抓取</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none border-b border-gray-800/60">
        <button
          onClick={() => setActiveTab('VOLUME')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'VOLUME'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span>成交量排行 (Top 20)</span>
        </button>

        <button
          onClick={() => setActiveTab('FOREIGN')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'FOREIGN'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>外資買賣超排行</span>
        </button>

        <button
          onClick={() => setActiveTab('TRUST')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'TRUST'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <Landmark className="w-4 h-4 text-purple-400" />
          <span>投信買賣超排行</span>
        </button>

        <button
          onClick={() => setActiveTab('FLOWS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'FLOWS'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span>三大法人資金動向總覽</span>
        </button>
      </div>

      {/* Sub Tabs for Foreign & Trust (Buy vs Sell) */}
      {(activeTab === 'FOREIGN' || activeTab === 'TRUST') && (
        <div className="flex items-center justify-between gap-4 mb-4 bg-dark-800/40 p-1.5 rounded-xl border border-gray-800/80">
          <div className="flex gap-1.5">
            <button
              onClick={() => setSubTab('BUY')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                subTab === 'BUY'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>買超前 20 名</span>
            </button>
            <button
              onClick={() => setSubTab('SELL')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                subTab === 'SELL'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>賣超前 20 名</span>
            </button>
          </div>
          <span className="text-[11px] text-gray-500 px-2">單位：張 (1,000股)</span>
        </div>
      )}

      {/* CONTENT TAB 1: VOLUME RANKING */}
      {activeTab === 'VOLUME' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                <th className="py-3 px-3">排名</th>
                <th className="py-3 px-3">代號 / 名稱</th>
                <th className="py-3 px-3">產業</th>
                <th className="py-3 px-3 text-right">成交量 (張)</th>
                <th className="py-3 px-3 text-right">成交金額</th>
                <th className="py-3 px-3 text-right">收盤價</th>
                <th className="py-3 px-3 text-right">漲跌幅</th>
                <th className="py-3 px-2 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredVolume.map((item) => {
                const isUp = item.change && item.change.includes('+');
                const isFlat = !item.change || item.change === '0.00';
                return (
                  <tr 
                    key={item.code} 
                    className="hover:bg-blue-600/5 transition group cursor-pointer"
                    onClick={() => onSelectStock && onSelectStock({ Code: item.code, Name: item.name, ClosingPrice: item.price, Change: item.change })}
                  >
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                        item.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        item.rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                        item.rank === 3 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                        'text-gray-500'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white group-hover:text-blue-400 transition">{item.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{item.code}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-dark-700 text-gray-300 border border-gray-700/60">
                        {item.sector}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-gray-200">
                      {item.volume != null ? Number(item.volume).toLocaleString() : '--'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-gray-400 text-xs">
                      {item.turnover}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      NT$ {item.price}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-semibold ${
                      isUp ? 'text-red-400' : isFlat ? 'text-gray-400' : 'text-emerald-400'
                    }`}>
                      {item.pctChange}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button 
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition"
                        title="查看即時走勢"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTENT TAB 2: FOREIGN INVESTORS (T86) */}
      {activeTab === 'FOREIGN' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                <th className="py-3 px-3">排名</th>
                <th className="py-3 px-3">代號 / 名稱</th>
                <th className="py-3 px-3">產業</th>
                <th className="py-3 px-3 text-right">股價</th>
                <th className="py-3 px-3 text-right">{subTab === 'BUY' ? '外資買超張數' : '外資賣超張數'}</th>
                <th className="py-3 px-2 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredForeign.map((item) => (
                <tr 
                  key={item.code}
                  className="hover:bg-blue-600/5 transition group cursor-pointer"
                  onClick={() => onSelectStock && onSelectStock({ Code: item.code, Name: item.name, ClosingPrice: item.price })}
                >
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs bg-dark-700 text-gray-300">
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white group-hover:text-blue-400 transition">{item.name}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{item.code}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-dark-700 text-gray-300">
                      {item.sector}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    NT$ {item.price}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-bold ${
                    subTab === 'BUY' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {subTab === 'BUY' ? '+' : ''}{item.netShares != null ? Math.abs(Number(item.netShares)).toLocaleString() : '--'} 張
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTENT TAB 3: INVESTMENT TRUST (T86) */}
      {activeTab === 'TRUST' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                <th className="py-3 px-3">排名</th>
                <th className="py-3 px-3">代號 / 名稱</th>
                <th className="py-3 px-3">產業</th>
                <th className="py-3 px-3 text-right">股價</th>
                <th className="py-3 px-3 text-right">{subTab === 'BUY' ? '投信買超張數' : '投信賣超張數'}</th>
                <th className="py-3 px-2 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredTrust.map((item) => (
                <tr 
                  key={item.code}
                  className="hover:bg-blue-600/5 transition group cursor-pointer"
                  onClick={() => onSelectStock && onSelectStock({ Code: item.code, Name: item.name, ClosingPrice: item.price })}
                >
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs bg-dark-700 text-gray-300">
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white group-hover:text-blue-400 transition">{item.name}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{item.code}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-dark-700 text-gray-300">
                      {item.sector}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    NT$ {item.price}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-bold ${
                    subTab === 'BUY' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {subTab === 'BUY' ? '+' : ''}{item.netShares != null ? Math.abs(Number(item.netShares)).toLocaleString() : '--'} 張
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTENT TAB 4: THREE MAJOR INSTITUTIONAL FLOWS SUMMARY (BFI82U) */}
      {activeTab === 'FLOWS' && institutionalFlows && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Foreign Card */}
            <div className="bg-dark-800/60 border border-gray-800 rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400">外資及陸資 (不含自營)</span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                  institutionalFlows.foreign?.net >= 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {institutionalFlows.foreign?.net >= 0 ? '買超' : '賣超'}
                </span>
              </div>
              <div className={`text-2xl font-bold font-mono ${
                institutionalFlows.foreign?.net >= 0 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {institutionalFlows.foreign?.net >= 0 ? '+' : ''}{institutionalFlows.foreign?.net} 億
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-800/80 text-xs text-gray-400">
                <div>買進：<span className="font-mono text-gray-200">{institutionalFlows.foreign?.buy} 億</span></div>
                <div>賣出：<span className="font-mono text-gray-200">{institutionalFlows.foreign?.sell} 億</span></div>
              </div>
            </div>

            {/* Investment Trust Card */}
            <div className="bg-dark-800/60 border border-gray-800 rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400">投信法人 (Investment Trust)</span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                  institutionalFlows.investmentTrust?.net >= 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {institutionalFlows.investmentTrust?.net >= 0 ? '買超' : '賣超'}
                </span>
              </div>
              <div className={`text-2xl font-bold font-mono ${
                institutionalFlows.investmentTrust?.net >= 0 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {institutionalFlows.investmentTrust?.net >= 0 ? '+' : ''}{institutionalFlows.investmentTrust?.net} 億
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-800/80 text-xs text-gray-400">
                <div>買進：<span className="font-mono text-gray-200">{institutionalFlows.investmentTrust?.buy} 億</span></div>
                <div>賣出：<span className="font-mono text-gray-200">{institutionalFlows.investmentTrust?.sell} 億</span></div>
              </div>
            </div>

            {/* Total Institutional Flow Card */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-blue-500/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-blue-300">三大法人合計買賣超</span>
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-blue-500/20 text-blue-300">
                  淨資金流向
                </span>
              </div>
              <div className={`text-2xl font-bold font-mono ${
                institutionalFlows.total?.net >= 0 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {institutionalFlows.total?.net >= 0 ? '+' : ''}{institutionalFlows.total?.net} 億
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-blue-500/20 text-xs text-blue-200/70">
                <div>買進總額：<span className="font-mono text-white">{institutionalFlows.total?.buy} 億</span></div>
                <div>賣出總額：<span className="font-mono text-white">{institutionalFlows.total?.sell} 億</span></div>
              </div>
            </div>
          </div>

          {/* Details Breakdown Table */}
          <div className="overflow-x-auto bg-dark-800/30 rounded-xl border border-gray-800 p-4">
            <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
              三大法人各單位細部買賣金額表 (證交所 BFI82U)
            </h4>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-2 px-3">單位名稱</th>
                  <th className="py-2 px-3 text-right">買進金額</th>
                  <th className="py-2 px-3 text-right">賣出金額</th>
                  <th className="py-2 px-3 text-right">買賣差額 (買超/賣超)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40 font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-sans text-gray-200">外資及陸資 (不含自營商)</td>
                  <td className="py-2.5 px-3 text-right text-gray-300">{institutionalFlows.foreign?.buy} 億</td>
                  <td className="py-2.5 px-3 text-right text-gray-300">{institutionalFlows.foreign?.sell} 億</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${institutionalFlows.foreign?.net >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {institutionalFlows.foreign?.net >= 0 ? '+' : ''}{institutionalFlows.foreign?.net} 億
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-gray-200">投信 (Investment Trust)</td>
                  <td className="py-2.5 px-3 text-right text-gray-300">{institutionalFlows.investmentTrust?.buy} 億</td>
                  <td className="py-2.5 px-3 text-right text-gray-300">{institutionalFlows.investmentTrust?.sell} 億</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${institutionalFlows.investmentTrust?.net >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {institutionalFlows.investmentTrust?.net >= 0 ? '+' : ''}{institutionalFlows.investmentTrust?.net} 億
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-gray-200">自營商 (自行買賣)</td>
                  <td className="py-2.5 px-3 text-right text-gray-300">{institutionalFlows.dealerSelf?.buy} 億</td>
                  <td className="py-2.5 px-3 text-right text-gray-300">{institutionalFlows.dealerSelf?.sell} 億</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${institutionalFlows.dealerSelf?.net >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {institutionalFlows.dealerSelf?.net >= 0 ? '+' : ''}{institutionalFlows.dealerSelf?.net} 億
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-gray-200">自營商 (避險)</td>
                  <td className="py-2.5 px-3 text-right text-gray-300">{institutionalFlows.dealerHedge?.buy} 億</td>
                  <td className="py-2.5 px-3 text-right text-gray-300">{institutionalFlows.dealerHedge?.sell} 億</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${institutionalFlows.dealerHedge?.net >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {institutionalFlows.dealerHedge?.net >= 0 ? '+' : ''}{institutionalFlows.dealerHedge?.net} 億
                  </td>
                </tr>
                <tr className="bg-blue-600/10 font-bold border-t border-blue-500/20">
                  <td className="py-3 px-3 font-sans text-white">三大法人合計</td>
                  <td className="py-3 px-3 text-right text-white">{institutionalFlows.total?.buy} 億</td>
                  <td className="py-3 px-3 text-right text-white">{institutionalFlows.total?.sell} 億</td>
                  <td className={`py-3 px-3 text-right ${institutionalFlows.total?.net >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {institutionalFlows.total?.net >= 0 ? '+' : ''}{institutionalFlows.total?.net} 億
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
