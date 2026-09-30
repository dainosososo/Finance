import React from 'react';
import { Newspaper, BellRing, ExternalLink, ShieldCheck } from 'lucide-react';

export default function FscNewsFeed({ newsList = [] }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              金管會與證交所 重大訊息與監理新聞
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                證期局即時廣播
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">即時監控金融監督管理委員會、證券期貨局與證交所發布之法令法規與公告</p>
          </div>
        </div>
        <span className="hidden sm:flex items-center text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          官方金管監理資訊
        </span>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {newsList.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50 hover:bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`px-2 py-0.5 rounded font-bold ${
                  item.urgent 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {item.category}
                </span>
                <span className="text-slate-400 font-mono flex items-center gap-1 text-[11px]">
                  <BellRing className="w-3 h-3 text-amber-600" />
                  {item.date}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">證券暨期貨主管機關核定發布</span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 hover:text-amber-800 font-bold inline-flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform"
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
