import React from 'react';
import { Newspaper, BellRing, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';

export default function FscNewsFeed({ newsList = [] }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-5">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              金管會與證交所 重大訊息與監理新聞
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                證期局即時廣播
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">即時監控金融監督管理委員會、證券期貨局與證交所發布之法令法規與公告</p>
          </div>
        </div>
        <span className="hidden sm:flex items-center text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          官方金管監理資訊
        </span>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {newsList.map((item) => (
          <div
            key={item.id}
            className="glass-card p-4 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-amber-500/40 transition-all space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`px-2 py-0.5 rounded font-bold ${
                  item.urgent 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {item.category}
                </span>
                <span className="text-gray-400 font-mono flex items-center gap-1">
                  <BellRing className="w-3 h-3 text-amber-400" />
                  {item.date}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-100 group-hover:text-amber-300 transition-colors leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
              <span className="text-gray-500 text-[11px]">證券暨期貨主管機關核定發布</span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>閱讀全文</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
