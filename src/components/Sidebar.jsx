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
 * 螢幕左側可收闔側欄 (Collapsible Sidebar)
 * 包含功能:
 * 1. 即時成交與產業熱力圖 (網頁中心總覽)
 * 2. 產業結構分類焦點新聞時事
 * 3. 臺灣證交所即時排行與三大法人動向
 * 4. 即時自選
 * 5. 三大排行
 * 6. 產業時事
 * 7. 全股報價庫
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
      color: 'text-red-500',
      badge: '首頁'
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
      id: 'RANKINGS_INST',
      tabTarget: 'RANKINGS',
      label: '臺灣證交所即時排行與三大法人動向',
      sublabel: '外資投信自營即時盤後',
      icon: TrendingUp,
      color: 'text-blue-600',
      badge: '法人'
    },
    {
      id: 'REALTIME',
      tabTarget: 'REALTIME',
      label: '即時自選',
      sublabel: '五檔即時盤況與監控',
      icon: Zap,
      color: 'text-emerald-600',
      badge: '即時'
    },
    {
      id: 'RANKINGS',
      tabTarget: 'RANKINGS',
      label: '三大排行',
      sublabel: '漲跌幅、成交值、成交量',
      icon: Coins,
      color: 'text-amber-600',
      badge: '排行'
    },
    {
      id: 'NEWS',
      tabTarget: 'NEWS',
      label: '產業時事',
      sublabel: '證券交易所與金管會即時公文',
      icon: Newspaper,
      color: 'text-indigo-600',
      badge: '公告'
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
      className={`bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col z-30 select-none shadow-xs ${
        isCollapsed ? 'w-16' : 'w-64 lg:w-72'
      }`}
    >
      {/* Sidebar Header & Toggle */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-3.5">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs flex-shrink-0">
              台
            </div>
            <div className="truncate">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight block">
                功能導航側欄
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                TWSE Finance Pro
              </span>
            </div>
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? '展開側欄' : '收起側欄'}
          aria-label={isCollapsed ? '展開側欄' : '收起側欄'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>

      {/* Quick Status / Market Indicator when collapsed/expanded */}
      {!isCollapsed ? (
        <div className="p-3 mx-2 my-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-600 font-medium">大盤加權指數</span>
            <span className="font-mono font-bold text-slate-900">{taiexData?.taiex || '23,125.80'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-600">漲跌動態</span>
            <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
              {taiexData?.change || '+245.60'}
            </span>
          </div>
        </div>
      ) : (
        <div className="py-2 flex justify-center" title="加權指數 23,125.80">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      )}

      {/* Menu Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-none">
        <div className="px-2 py-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
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
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
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
                          ? 'bg-blue-700 text-blue-100' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] truncate block mt-0.5 ${
                    active ? 'text-blue-100' : 'text-slate-600'
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
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          onClick={onOpenReportModal}
          className={`w-full flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs active:scale-95 ${
            isCollapsed ? 'p-2.5' : 'px-3 py-2 space-x-2 text-xs'
          }`}
          title="開啟 13:30 證交所盤後日報"
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>13:30 盤後日報</span>}
        </button>

        {!isCollapsed && (
          <div className="text-[10px] text-center text-slate-600">
            三竹選股模組 • 盤後三大法人
          </div>
        )}
      </div>
    </aside>
  );
}
