import React, { useState } from 'react';
import { 
  Newspaper, 
  ExternalLink, 
  Search, 
  Building2, 
  Cpu, 
  Server, 
  Zap, 
  Ship, 
  Landmark, 
  BatteryCharging, 
  Microscope,
  Layers,
  Sparkles,
  Flame
} from 'lucide-react';

const INDUSTRY_FILTERS = [
  { id: 'ALL', name: '全部產業', icon: Layers },
  { id: '半導體產業', name: '半導體產業', icon: Cpu },
  { id: 'AI 伺服器與電腦周邊', name: 'AI 伺服器/代工', icon: Server },
  { id: '電子零組件與散熱', name: '電子零組件/散熱', icon: Zap },
  { id: '航運物流與海運', name: '航運物流', icon: Ship },
  { id: '金融保險金控', name: '金融金控', icon: Landmark },
  { id: '重電綠能與電動車', name: '重電綠能/電動車', icon: BatteryCharging },
  { id: '生技醫療與光學', name: '生技/光學', icon: Microscope },
];

const SOURCE_FILTERS = [
  { id: 'ALL', name: '全部來源' },
  { id: 'MoneyDJ 理財網', name: 'MoneyDJ 理財網', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: '鉅亨網', name: '鉅亨網 (Anue)', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { id: '財經 M 平方', name: '財經 M 平方', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: '股感 StockFeel', name: '股感 StockFeel', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'Stock-Ai', name: 'Stock-Ai 投資指標', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
];

export default function IndustryNewsFeed({ newsList = [], onSelectStock }) {
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering logic
  const filteredNews = newsList.filter(item => {
    const matchIndustry = selectedIndustry === 'ALL' || item.industry === selectedIndustry;
    const matchSource = selectedSource === 'ALL' || item.source === selectedSource;
    const matchSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.companies.some(c => c.name.includes(searchQuery) || c.code.includes(searchQuery));

    return matchIndustry && matchSource && matchSearch;
  });

  const getSourceBadgeClass = (source) => {
    switch (source) {
      case 'MoneyDJ 理財網': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case '鉅亨網': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case '財經 M 平方': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case '股感 StockFeel': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Stock-Ai': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default: return 'bg-gray-700/50 text-gray-300 border-gray-600/50';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                產業結構分類焦點新聞時事
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 5 大財經媒體聯播
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                整合 MoneyDJ、鉅亨網、財經 M 平方、股感 StockFeel、Stock-Ai，剖析台股各產業鏈代表個股
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋產業關鍵字 / 公司 / 代號..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-dark-800/80 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 w-full sm:w-60 transition-all"
          />
        </div>
      </div>

      {/* 1. Industry Structure Filter Tabs */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>依台股產業結構分類篩選：</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {INDUSTRY_FILTERS.map((ind) => {
            const Icon = ind.icon;
            const isActive = selectedIndustry === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustry(ind.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border border-purple-500'
                    : 'bg-dark-800/60 text-gray-400 hover:text-gray-200 hover:bg-dark-700 border border-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{ind.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Media Source Filter Pills */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-gray-500 text-xs shrink-0">來源媒體：</span>
        {SOURCE_FILTERS.map((src) => {
          const isSelected = selectedSource === src.id;
          return (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border whitespace-nowrap ${
                isSelected
                  ? 'bg-gray-200 text-gray-900 border-gray-200 font-bold'
                  : 'bg-dark-800/40 text-gray-400 border-gray-800/80 hover:text-gray-200 hover:bg-dark-700/60'
              }`}
            >
              {src.name}
            </button>
          );
        })}
      </div>

      {/* News Grid Cards */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xs">
          沒有符合目前篩選條件的產業新聞時事
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-dark-800/50 hover:bg-dark-800/80 border border-gray-800/80 hover:border-purple-500/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-purple-500/5"
            >
              <div>
                {/* Card Top: Badges & Time */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${getSourceBadgeClass(item.source)}`}>
                      {item.source}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-dark-700 text-gray-300">
                      {item.industry}
                    </span>
                    {item.hot && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> 熱門
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500 shrink-0 font-mono">
                    {item.date}
                  </span>
                </div>

                {/* News Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                  {item.title}
                </h3>

                {/* News Summary */}
                <p className="text-xs text-gray-400 line-clamp-3 mb-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* Card Bottom: Companies & Link */}
              <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between gap-2">
                {/* Related Companies */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-gray-500">相關公司：</span>
                  {item.companies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => onSelectStock && onSelectStock({ Code: c.code, Name: c.name })}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition active:scale-95"
                    >
                      <Building2 className="w-2.5 h-2.5" />
                      <span>{c.name} ({c.code})</span>
                    </button>
                  ))}
                </div>

                {/* Read Full Article Button */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition shrink-0 group/link"
                >
                  <span>看原文</span>
                  <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
