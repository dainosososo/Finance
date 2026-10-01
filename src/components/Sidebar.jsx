import React from 'react';
import { 
  Flame,
  Zap, 
  TrendingUp, 
  Coins, 
  Newspaper, 
  Database, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  PieChart, 
  Layers, 
  FileText,
  BarChart3,
  Globe2,
  Sparkles
} from 'lucide-react';

/**
 * 螢幕左側可收闔側欄 (Collapsible Sidebar) - 櫻花粉風格
 * 包含功能:
 * 1. 即時成交與產業熱力圖 (網頁中心總覽)
 * 2. 產業結構分類焦點新聞時事 (跳轉至 NEWS)
 * 3. 臺灣證交所即時排行與三大法人動向 (跳轉至 RANKINGS)
 * 4. 即時自選 (跳轉至 REALTIME)
 * 5. 三大排行 (跳轉至 RANKINGS)
 * 6. 產業時事 (跳轉至 NEWS)
 * 7. 全股報價庫 (跳轉至 DAILY)
 */
export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  activeTab,
  setActiveTab,
  onOpenReportModal,
  taiexData
}) {
  const menuItems = [
    {
      id: 'ALL',
      label: '即時成交與產業熱力圖',
      sublabel: '網頁中心雙熱力圖',
      icon: Flame,
      color: 'text-rose-600',
      badge: '首頁'
    },
    {
      id: 'MARKET',
      tabTarget: 'MARKET',
      label: '大盤加權指數與市場總覽 (TWSE)',
      sublabel: 'TAIEX、櫃買、總成交值與多空比',
      icon: Layers,
      color: 'text-rose-600',
      badge: '大盤'
    },
    {
      id: 'REALTIME',
      tabTarget: 'REALTIME',
      label: '即時自選',
      sublabel: '自選監控與三竹深度分析',
      icon: Zap,
      color: 'text-emerald-600',
      badge: '即時'
    },
    {
      id: 'RANKINGS_INST',
      tabTarget: 'RANKINGS',
      label: '臺灣證交所即時排行與三大法人動向',
      sublabel: '外資投信自營即時盤後',
      icon: TrendingUp,
      color: 'text-blue-600',
      badge: '法人'
    },
    {
      id: 'NEWS_SECTOR',
      tabTarget: 'NEWS',
      label: '產業結構分類焦點新聞時事',
      sublabel: '五大焦點板塊剖析',
      icon: Building2,
      color: 'text-purple-600',
      badge: '時事'
    },
    {
      id: 'DAILY',
      tabTarget: 'DAILY',
      label: '全股報價庫',
      sublabel: '台灣證券交易所全市場資料庫',
      icon: Database,
      color: 'text-slate-600',
      badge: '全市場'
    }
  ];

  const handleItemClick = (item) => {
    setActiveTab(item.tabTarget || item.id);
  };

  const isCurrentActive = (item) => {
    if (item.id === 'ALL' && activeTab === 'ALL') return true;
    if (item.tabTarget === activeTab) return true;
    return activeTab === item.id;
  };

  return (
    <aside 
      className={`bg-[#fff5f7] border-r border-pink-200 transition-all duration-300 ease-in-out flex flex-col z-30 select-none shadow-xs ${
        isCollapsed ? 'w-16' : 'w-64 lg:w-72'
      }`}
    >
      {/* Sidebar Header & Toggle */}
      <div className="h-16 border-b border-pink-200/80 flex items-center justify-between px-3.5 bg-[#fff0f3]">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-xs flex-shrink-0">
              台
            </div>
            <div className="truncate">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight block">
                功能導航側欄
              </span>
              <span className="text-[10px] text-rose-700 font-mono">
                TWSE Finance Pro
              </span>
            </div>
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl text-rose-700 hover:text-rose-950 hover:bg-rose-100/70 transition-all active:scale-95 ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? '展開側欄' : '收起側欄'}
          aria-label={isCollapsed ? '展開側欄' : '收起側欄'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-rose-700" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-rose-700" />
          )}
        </button>
      </div>

      {/* Quick Status / Market Indicator when collapsed/expanded */}
      {!isCollapsed ? (
        <div 
          onClick={() => setActiveTab('MARKET')}
          className="p-3 mx-2 my-2 bg-white/90 rounded-xl border border-pink-200 shadow-2xs cursor-pointer hover:border-pink-400 hover:bg-white transition"
          title="點擊查看完整大盤加權與市場總覽"
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-rose-800 font-semibold">大盤加權指數</span>
            <span className="font-mono font-bold text-slate-900">{taiexData?.taiex || '23,125.80'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">漲跌動態</span>
            <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
              {taiexData?.change || '+245.60'}
            </span>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setActiveTab('MARKET')}
          className="py-2 flex justify-center cursor-pointer" 
          title="加權指數 23,125.80 (點擊查看市場總覽)"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
        </div>
      )}

      {/* Menu Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-none">
        <div className="px-2 py-1 text-[10px] font-bold text-rose-800 uppercase tracking-wider">
          {!isCollapsed && '市場導航核心'}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isCurrentActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full group flex items-center rounded-xl transition-all text-left ${
                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 space-x-3'
              } ${
                active 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-slate-800 hover:bg-rose-100/70 hover:text-rose-950'
              }`}
            >
              <div className={`flex-shrink-0 ${active ? 'text-white' : item.color}`}>
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold truncate block ${active ? 'text-white' : 'text-slate-900'}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ml-1 flex-shrink-0 ${
                        active 
                          ? 'bg-rose-700 text-rose-100' 
                          : 'bg-rose-100 text-rose-800 border border-pink-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] truncate block mt-0.5 ${
                    active ? 'text-rose-100' : 'text-rose-800/70'
                  }`}>
                    {item.sublabel}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Action */}
      <div className="p-3 border-t border-pink-200 bg-[#fff0f3] space-y-2">
        <button
          onClick={onOpenReportModal}
          className={`w-full flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs active:scale-95 ${
            isCollapsed ? 'p-2.5' : 'px-3 py-2 space-x-2 text-xs'
          }`}
          title="開啟 13:30 證交所盤後日報"
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>13:30 盤後日報</span>}
        </button>

        {!isCollapsed && (
          <div className="text-[10px] text-center text-rose-800/80 font-mono">
            三竹選股模組 • 盤後三大法人
          </div>
        )}
      </div>
    </aside>
  );
}
