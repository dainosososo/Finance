import React, { useState } from 'react';
import { 
  BarChart3, 
  Building2, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Search, 
  Coins,
  ChevronRight,
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
  const [volumeLimit, setVolumeLimit] = useState(100);

  if (!reportData) {
    return (
      <div className="bg-white p-8 text-center text-slate-400 rounded-2xl border border-slate-200 animate-pulse shadow-sm">
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
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">
                  臺灣證交所即時排行與三大法人動向
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {reportData.isClosed ? '🔴 13:30 盤後已定案' : '🟢 盤中即時追蹤中'}
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  更新: {reportData.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                整合證交所即時成交量 (MI_INDEX20)、外資投信買賣超 (T86) 與三大法人資金流向 (BFI82U)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="搜尋代號 / 名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white w-36 sm:w-44 transition-all"
            />
          </div>

          {/* On-Demand Refresh Button */}
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            title="隨時連線 TWSE 抓取最新盤中資料"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>即時線上抓取</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setActiveTab('VOLUME')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'VOLUME'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span>成交量排行 (Top 100)</span>
        </button>

        <button
          onClick={() => setActiveTab('FOREIGN')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'FOREIGN'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-500" />
          <span>外資買賣超排行</span>
        </button>

        <button
          onClick={() => setActiveTab('TRUST')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'TRUST'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4 text-purple-500" />
          <span>投信買賣超排行</span>
        </button>

        <button
          onClick={() => setActiveTab('FLOWS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'FLOWS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-500" />
          <span>三大法人資金動向總覽</span>
        </button>
      </div>

      {/* Sub Tabs for Foreign & Trust (Buy vs Sell) */}
      {(activeTab === 'FOREIGN' || activeTab === 'TRUST') && (
        <div className="flex items-center justify-between gap-4 mb-4 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <div className="flex gap-1.5">
            <button
              onClick={() => setSubTab('BUY')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                subTab === 'BUY'
                  ? 'bg-red-50 text-red-600 border border-red-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>買超前 20 名</span>
            </button>
            <button
              onClick={() => setSubTab('SELL')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                subTab === 'SELL'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>賣超前 20 名</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500 px-2 font-mono">單位：張 (1,000股)</span>
        </div>
      )}

      {/* CONTENT TAB 1: VOLUME RANKING (Light Theme - Top 100) */}
      {activeTab === 'VOLUME' && (
        <div className="space-y-3">
          {/* Quick Filter Bar for Top 100 / 50 / 20 */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-slate-700 text-xs">顯示數量:</span>
              {[
                { label: 'Top 100 全部', val: 100 },
                { label: 'Top 50', val: 50 },
                { label: 'Top 20', val: 20 }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setVolumeLimit(opt.val)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    volumeLimit === opt.val
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-blue-700">
                收錄 {volumeRankings.length} 檔標的
              </span>
              <span>•</span>
              <span>已載入前 {Math.min(volumeLimit, filteredVolume.length)} 檔</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <th className="py-2.5 px-3">排名</th>
                  <th className="py-2.5 px-3">代號 / 名稱</th>
                  <th className="py-2.5 px-3">產業族群</th>
                  <th className="py-2.5 px-3 text-right">成交量 (張)</th>
                  <th className="py-2.5 px-3 text-right">成交金額</th>
                  <th className="py-2.5 px-3 text-right">收盤價</th>
                  <th className="py-2.5 px-3 text-right">漲跌幅</th>
                  <th className="py-2.5 px-2 text-center">分析</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVolume.slice(0, volumeLimit).map((item) => {
                  const isUp = item.change && item.change.includes('+');
                  const isFlat = !item.change || item.change === '0.00';
                  return (
                    <tr 
                      key={item.code} 
                      className="hover:bg-blue-50/50 transition group cursor-pointer"
                      onClick={() => onSelectStock && onSelectStock({ Code: item.code, Name: item.name, ClosingPrice: item.price, Change: item.change })}
                    >
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                          item.rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          item.rank === 2 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                          item.rank === 3 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'text-slate-400 font-mono'
                        }`}>
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.code}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {item.sector}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {item.volume != null ? Number(item.volume).toLocaleString() : '--'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500 text-xs">
                        {item.turnover}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        NT$ {item.price}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                        isUp ? 'text-red-600' : isFlat ? 'text-slate-400' : 'text-emerald-600'
                      }`}>
                        {item.pctChange}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button 
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
                          title="查看三竹K線走勢"
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
        </div>
      )}

      {/* CONTENT TAB 2: FOREIGN INVESTORS (T86) */}
      {activeTab === 'FOREIGN' && (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3">排名</th>
                <th className="py-2.5 px-3">代號 / 名稱</th>
                <th className="py-2.5 px-3">產業族群</th>
                <th className="py-2.5 px-3 text-right">目前股價</th>
                <th className="py-2.5 px-3 text-right">{subTab === 'BUY' ? '外資買超張數' : '外資賣超張數'}</th>
                <th className="py-2.5 px-2 text-center">分析</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredForeign.map((item) => (
                <tr 
                  key={item.code}
                  className="hover:bg-blue-50/50 transition group cursor-pointer"
                  onClick={() => onSelectStock && onSelectStock({ Code: item.code, Name: item.name, ClosingPrice: item.price })}
                >
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs bg-slate-100 text-slate-700">
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">{item.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.code}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                      {item.sector}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    NT$ {item.price}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                    subTab === 'BUY' ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {subTab === 'BUY' ? '+' : ''}{item.netShares != null ? Math.abs(Number(item.netShares)).toLocaleString() : '--'} 張
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <button className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition">
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
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3">排名</th>
                <th className="py-2.5 px-3">代號 / 名稱</th>
                <th className="py-2.5 px-3">產業族群</th>
                <th className="py-2.5 px-3 text-right">目前股價</th>
                <th className="py-2.5 px-3 text-right">{subTab === 'BUY' ? '投信買超張數' : '投信賣超張數'}</th>
                <th className="py-2.5 px-2 text-center">分析</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrust.map((item) => (
                <tr 
                  key={item.code}
                  className="hover:bg-blue-50/50 transition group cursor-pointer"
                  onClick={() => onSelectStock && onSelectStock({ Code: item.code, Name: item.name, ClosingPrice: item.price })}
                >
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs bg-slate-100 text-slate-700">
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">{item.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.code}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                      {item.sector}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    NT$ {item.price}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                    subTab === 'BUY' ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {subTab === 'BUY' ? '+' : ''}{item.netShares != null ? Math.abs(Number(item.netShares)).toLocaleString() : '--'} 張
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <button className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTENT TAB 4: THREE MAJOR INSTITUTIONAL FLOWS SUMMARY (BFI82U in Light Theme) */}
      {activeTab === 'FLOWS' && institutionalFlows && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Foreign Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">外資及陸資 (不含自營商)</span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                  institutionalFlows.foreign?.net >= 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {institutionalFlows.foreign?.net >= 0 ? '買超' : '賣超'}
                </span>
              </div>
              <div className={`text-2xl font-black font-mono ${
                institutionalFlows.foreign?.net >= 0 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {institutionalFlows.foreign?.net >= 0 ? '+' : ''}{institutionalFlows.foreign?.net} 億
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                <div>買進：<span className="font-mono text-slate-800 font-semibold">{institutionalFlows.foreign?.buy} 億</span></div>
                <div>賣出：<span className="font-mono text-slate-800 font-semibold">{institutionalFlows.foreign?.sell} 億</span></div>
              </div>
            </div>

            {/* Investment Trust Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">投信法人 (Investment Trust)</span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                  institutionalFlows.investmentTrust?.net >= 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {institutionalFlows.investmentTrust?.net >= 0 ? '買超' : '賣超'}
                </span>
              </div>
              <div className={`text-2xl font-black font-mono ${
                institutionalFlows.investmentTrust?.net >= 0 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {institutionalFlows.investmentTrust?.net >= 0 ? '+' : ''}{institutionalFlows.investmentTrust?.net} 億
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                <div>買進：<span className="font-mono text-slate-800 font-semibold">{institutionalFlows.investmentTrust?.buy} 億</span></div>
                <div>賣出：<span className="font-mono text-slate-800 font-semibold">{institutionalFlows.investmentTrust?.sell} 億</span></div>
              </div>
            </div>

            {/* Total Institutional Flow Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-900">三大法人合計買賣超</span>
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-white text-blue-700 border border-blue-200">
                  淨資金流向
                </span>
              </div>
              <div className={`text-2xl font-black font-mono ${
                institutionalFlows.total?.net >= 0 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {institutionalFlows.total?.net >= 0 ? '+' : ''}{institutionalFlows.total?.net} 億
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-blue-200 text-xs text-blue-800">
                <div>買進總額：<span className="font-mono font-bold text-slate-900">{institutionalFlows.total?.buy} 億</span></div>
                <div>賣出總額：<span className="font-mono font-bold text-slate-900">{institutionalFlows.total?.sell} 億</span></div>
              </div>
            </div>
          </div>

          {/* Details Breakdown Table */}
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
              三大法人細部買賣金額表 (證券交易所 BFI82U)
            </h4>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2 px-3">單位名稱</th>
                  <th className="py-2 px-3 text-right">買進金額</th>
                  <th className="py-2 px-3 text-right">賣出金額</th>
                  <th className="py-2 px-3 text-right">買賣差額 (超額)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">外資及陸資 (不含自營商)</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{institutionalFlows.foreign?.buy} 億</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{institutionalFlows.foreign?.sell} 億</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${institutionalFlows.foreign?.net >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {institutionalFlows.foreign?.net >= 0 ? '+' : ''}{institutionalFlows.foreign?.net} 億
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">投信 (Investment Trust)</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{institutionalFlows.investmentTrust?.buy} 億</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{institutionalFlows.investmentTrust?.sell} 億</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${institutionalFlows.investmentTrust?.net >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {institutionalFlows.investmentTrust?.net >= 0 ? '+' : ''}{institutionalFlows.investmentTrust?.net} 億
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">自營商 (自行買賣)</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{institutionalFlows.dealerSelf?.buy} 億</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{institutionalFlows.dealerSelf?.sell} 億</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${institutionalFlows.dealerSelf?.net >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {institutionalFlows.dealerSelf?.net >= 0 ? '+' : ''}{institutionalFlows.dealerSelf?.net} 億
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">自營商 (避險)</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{institutionalFlows.dealerHedge?.buy} 億</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{institutionalFlows.dealerHedge?.sell} 億</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${institutionalFlows.dealerHedge?.net >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {institutionalFlows.dealerHedge?.net >= 0 ? '+' : ''}{institutionalFlows.dealerHedge?.net} 億
                  </td>
                </tr>
                <tr className="bg-blue-50 font-bold border-t border-blue-200">
                  <td className="py-2.5 px-3 font-sans text-blue-900">三大法人合計</td>
                  <td className="py-2.5 px-3 text-right text-blue-900">{institutionalFlows.total?.buy} 億</td>
                  <td className="py-2.5 px-3 text-right text-blue-900">{institutionalFlows.total?.sell} 億</td>
                  <td className={`py-2.5 px-3 text-right ${institutionalFlows.total?.net >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
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
