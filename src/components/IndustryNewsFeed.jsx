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
  Flame,
  Globe
} from 'lucide-react';

const INDUSTRY_FILTERS = [
  { id: 'ALL', name: '全部產業', icon: Layers },
  { id: '國際科技巨頭與美股連動', name: '🌐 國際巨頭(美股)', icon: Globe },
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
  { id: 'CMoney 股市爆料同學會', name: '🔥 CMoney 同學會', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  { id: '股癌 Gooaye', name: '🎙️ 股癌 觀點', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { id: '韭菜畢業班', name: '🌱 韭菜畢業班', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: '國際巨頭官方快訊', name: '🌐 國際巨頭 (Google/Tesla/NVDA)', color: 'text-violet-700 bg-violet-50 border-violet-200' },
  { id: 'MoneyDJ 理財網', name: 'MoneyDJ 理財網', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: '鉅亨網', name: '鉅亨網 (Anue)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: '財經 M 平方', name: '財經 M 平方', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: '股感 StockFeel', name: '股感 StockFeel', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'Stock-Ai', name: 'Stock-Ai 投資指標', color: 'text-rose-700 bg-rose-50 border-rose-200' },
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
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.companies?.some(c => c.name?.includes(searchQuery) || c.code?.includes(searchQuery));

    return matchIndustry && matchSource && matchSearch;
  });

  const getSourceBadgeClass = (source) => {
    switch (source) {
      case 'CMoney 股市爆料同學會': return 'bg-orange-50 text-orange-700 border-orange-200 font-bold';
      case '股癌 Gooaye': return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold';
      case '韭菜畢業班': return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case '國際巨頭官方快訊': return 'bg-violet-50 text-violet-700 border-violet-200 font-bold';
      case 'MoneyDJ 理財網': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '鉅亨網': return 'bg-blue-50 text-blue-700 border-blue-200';
      case '財經 M 平方': return 'bg-purple-50 text-purple-700 border-purple-200';
      case '股感 StockFeel': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Stock-Ai': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                產業結構分類焦點新聞時事
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 5 大財經媒體聯播
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                整合 MoneyDJ、鉅亨網、財經 M 平方、股感 StockFeel、Stock-Ai，剖析台股各產業鏈代表個股
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋產業關鍵字 / 公司 / 代號..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white w-full sm:w-60 transition-all"
          />
        </div>
      </div>

      {/* 1. Industry Structure Filter Tabs */}
      <div className="mb-4">
        <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-600" />
          <span>依台股產業結構分類篩選：</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {INDUSTRY_FILTERS.map((ind) => {
            const Icon = ind.icon;
            const isActive = selectedIndustry === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustry(ind.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200'
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
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 text-xs shrink-0 font-medium">來源媒體：</span>
        {SOURCE_FILTERS.map((src) => {
          const isSelected = selectedSource === src.id;
          return (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              {src.name}
            </button>
          );
        })}
      </div>

      {/* News Grid Cards */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          沒有符合目前篩選條件的產業新聞時事
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-purple-300 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div>
                {/* Card Top: Badges & Time */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold border ${getSourceBadgeClass(item.source)}`}>
                      {item.source}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-white text-slate-700 border border-slate-200">
                      {item.industry}
                    </span>
                    {item.hot && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> 熱門
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                    {item.date}
                  </span>
                </div>

                {/* News Title */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-2">
                  {item.title}
                </h3>

                {/* News Summary */}
                <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* Card Bottom: Companies & Link */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                {/* Related Companies */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500">相關公司：</span>
                  {item.companies?.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => onSelectStock && onSelectStock({ Code: c.code, Name: c.name })}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold transition active:scale-95"
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
                  className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-800 font-semibold transition shrink-0 group/link"
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
