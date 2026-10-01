import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, 
  Flame, 
  TrendingUp, 
  Search, 
  Plus, 
  Trophy, 
  Clock, 
  ShieldAlert, 
  Star, 
  Check, 
  Bookmark, 
  Edit3, 
  Trash2, 
  X,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Filter,
  BarChart2,
  Sparkles,
  Layers,
  Table as TableIcon,
  Crown,
  Rocket
} from 'lucide-react';
import { INITIAL_STRONG_STOCKS } from '../data/strongStocksData';

const STORAGE_KEY_CUSTOM_STOCKS = 'twse_custom_strong_stocks';
const STORAGE_KEY_USER_NOTES = 'twse_strong_stock_notes';

// 連續漲停階梯定義 (精確對應使用者指定的 6 大階梯 + 曾觸及)
export const STREAK_GROUPS = [
  {
    id: 'MORE_THAN_5',
    title: '多於 5 天 (6+ 連板以上)',
    shortLabel: '多於 5 天',
    tag: '多於5天',
    icon: Trophy,
    iconColor: 'text-amber-300',
    headerBg: 'bg-gradient-to-r from-purple-800 to-indigo-900 text-white',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs animate-pulse',
    description: '市場頂級妖股天花板！連續飆出 6 根漲停以上，籌碼極致鎖死，全市場游資與主升總指標',
    filterFn: (s) => (s.streak || 0) > 5
  },
  {
    id: 'STREAK_5',
    title: '連續漲停 5 天 (5 連板)',
    shortLabel: '漲停 5 天',
    tag: '5連板',
    icon: Rocket,
    iconColor: 'text-rose-300',
    headerBg: 'bg-gradient-to-r from-rose-800 to-pink-900 text-white',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 shadow-2xs',
    description: '大波段主升浪核心霸主！連拉第 5 根漲停板，法人與主力聯手鎖碼，領軍大盤族群衝鋒',
    filterFn: (s) => s.streak === 5
  },
  {
    id: 'STREAK_4',
    title: '連續漲停 4 天 (4 連板)',
    shortLabel: '漲停 4 天',
    tag: '4連板',
    icon: Crown,
    iconColor: 'text-amber-300',
    headerBg: 'bg-gradient-to-r from-pink-700 to-rose-800 text-white',
    badgeBg: 'bg-pink-100 text-pink-800 border-pink-300 shadow-2xs',
    description: '脫離成本加速噴出期！連續 4 根漲停突破所有壓力線，強勢換手後籌碼高度集中',
    filterFn: (s) => s.streak === 4
  },
  {
    id: 'STREAK_3',
    title: '連續漲停 3 天 (3 連板)',
    shortLabel: '漲停 3 天',
    tag: '3連板',
    icon: Flame,
    iconColor: 'text-orange-400',
    headerBg: 'bg-gradient-to-r from-red-600 to-rose-700 text-white',
    badgeBg: 'bg-red-100 text-red-700 border-red-300 shadow-2xs',
    description: '波段主流確立！連拉 3 根漲停打破橫盤震盪，確立新主流飆股地位，成交量滾量上攻',
    filterFn: (s) => s.streak === 3
  },
  {
    id: 'STREAK_2',
    title: '連續漲停 2 天 (2 連板)',
    shortLabel: '漲停 2 天',
    tag: '2連板',
    icon: TrendingUp,
    iconColor: 'text-amber-300',
    headerBg: 'bg-gradient-to-r from-amber-600 to-orange-700 text-white',
    badgeBg: 'bg-orange-100 text-orange-700 border-orange-300 shadow-2xs',
    description: '換手接力確認強者恆強！第 2 根漲停板確認非單日一日行情，主力做多追價意願強烈',
    filterFn: (s) => s.streak === 2
  },
  {
    id: 'STREAK_1',
    title: '連續漲停 1 天 (今日首板)',
    shortLabel: '漲停 1 天',
    tag: '首板(1天)',
    icon: Zap,
    iconColor: 'text-yellow-300',
    headerBg: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs',
    description: '今日首度起漲攻頂！當日首度發動攻擊亮燈漲停，帶量長紅突破底型與關鍵均線',
    filterFn: (s) => s.streak === 1
  },
  {
    id: 'TOUCHED',
    title: '盤中曾觸及漲停 (衝高換手震盪)',
    shortLabel: '曾觸及漲停',
    tag: '曾觸及',
    icon: ShieldAlert,
    iconColor: 'text-slate-300',
    headerBg: 'bg-gradient-to-r from-slate-700 to-slate-800 text-white',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
    description: '盤中曾觸及 10% 漲停板隨後開板換手，量能爆發，持續關注籌碼換手後的續攻機會',
    filterFn: (s) => s.streak === 0
  }
];

export default function StrongStocksTracker({ 
  onSelectStock, 
  onAddWatchlist, 
  watchlist = [] 
}) {
  // 檢視模式：
  // 'MULTI_TABLE' = 階梯多 Table 獨立分組全覽 (依序呈現多於5天、5天、4天、3天、2天、1天各 Table)
  // 'SINGLE_TABLE' = 單一 Table 專注檢視 (點選上方 Tab 切換只看特定天數的 Table)
  // 'ALL_IN_ONE' = 全部強勢股合一總 Table
  // 'MY_NOTES' = 僅看我的追蹤筆記 Table
  const [viewMode, setViewMode] = useState('MULTI_TABLE'); 
  const [activeSingleTab, setActiveSingleTab] = useState('MORE_THAN_5');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('STREAK'); // 'STREAK', 'LIMIT_BUY', 'VOLUME', 'PRICE'
  
  // 摺疊狀態控制 (在 Multi-table 模式下可獨立摺疊/展開任一 Table)
  const [collapsedTables, setCollapsedTables] = useState({});

  const toggleTableCollapse = (groupId) => {
    setCollapsedTables(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Custom user stocks & notes persisted in localStorage
  const [customStocks, setCustomStocks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_STOCKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stockNotes, setStockNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_NOTES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal for manually adding strong stock
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({
    code: '',
    name: '',
    sector: '半導體',
    price: '',
    streak: '1',
    limitBuyVolume: '',
    catalyst: '',
    note: ''
  });

  // Editing note inline
  const [editingNoteCode, setEditingNoteCode] = useState(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Persist notes & custom stocks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_STOCKS, JSON.stringify(customStocks));
    } catch (e) {
      console.warn('Failed to save custom strong stocks', e);
    }
  }, [customStocks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER_NOTES, JSON.stringify(stockNotes));
    } catch (e) {
      console.warn('Failed to save stock notes', e);
    }
  }, [stockNotes]);

  // Combine initial dataset with user custom-added stocks
  const allStrongStocks = useMemo(() => {
    return [...INITIAL_STRONG_STOCKS, ...customStocks];
  }, [customStocks]);

  // Save or edit a note
  const handleSaveNote = (code, noteText) => {
    setStockNotes(prev => ({
      ...prev,
      [code]: noteText
    }));
    setEditingNoteCode(null);
    setTempNoteText('');
  };

  // Add custom strong stock
  const handleAddCustomStock = (e) => {
    e.preventDefault();
    if (!newStock.code || !newStock.name) return;

    const streakNum = parseInt(newStock.streak, 10) || 1;
    let label = '首板 (1天)';
    let badge = '🔥 首板 (1天)';
    if (streakNum > 5) { label = `${streakNum}連板 (多於5天)`; badge = `🏆 ${streakNum}連板 (多於5天)`; }
    else if (streakNum === 5) { label = '5連板'; badge = '🚀 5連板'; }
    else if (streakNum === 4) { label = '4連板'; badge = '👑 4連板'; }
    else if (streakNum === 3) { label = '3連板'; badge = '🔥🔥🔥 3連板'; }
    else if (streakNum === 2) { label = '2連板'; badge = '🔥🔥 2連板'; }
    else if (streakNum === 0) { label = '曾觸及漲停'; badge = '⚡ 曾觸及漲停'; }

    const entry = {
      code: newStock.code.trim(),
      name: newStock.name.trim(),
      sector: newStock.sector.trim() || '自選族群',
      price: newStock.price ? Number(newStock.price).toFixed(2) : '100.00',
      change: '+10.00',
      pctChange: '+10.00%',
      streak: streakNum,
      streakLabel: label,
      streakBadge: badge,
      firstLockTime: '自訂記錄',
      limitBuyVolume: newStock.limitBuyVolume ? parseInt(newStock.limitBuyVolume, 10) : 5000,
      limitBuyAmount: '--',
      totalVolume: 12000,
      turnoverRate: '--',
      catalyst: newStock.catalyst.trim() || '自選手動強勢股',
      reason: newStock.note.trim() || '使用者手動記錄追蹤',
      isCustom: true
    };

    setCustomStocks(prev => [entry, ...prev]);

    if (newStock.note) {
      setStockNotes(prev => ({ ...prev, [entry.code]: newStock.note }));
    }

    setNewStock({
      code: '',
      name: '',
      sector: '半導體',
      price: '',
      streak: '1',
      limitBuyVolume: '',
      catalyst: '',
      note: ''
    });
    setShowAddModal(false);
  };

  const handleDeleteCustomStock = (code) => {
    setCustomStocks(prev => prev.filter(s => s.code !== code));
  };

  // Helper filter by search term
  const matchesSearch = (item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const note = (stockNotes[item.code] || '').toLowerCase();
    return (
      item.code.toLowerCase().includes(term) ||
      item.name.toLowerCase().includes(term) ||
      (item.sector && item.sector.toLowerCase().includes(term)) ||
      (item.catalyst && item.catalyst.toLowerCase().includes(term)) ||
      note.includes(term)
    );
  };

  // Helper sort function
  const sortStockList = (list) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'STREAK') return (b.streak || 0) - (a.streak || 0);
      if (sortBy === 'LIMIT_BUY') return (b.limitBuyVolume || 0) - (a.limitBuyVolume || 0);
      if (sortBy === 'VOLUME') return (b.totalVolume || 0) - (a.totalVolume || 0);
      if (sortBy === 'PRICE') return parseFloat(b.price || 0) - parseFloat(a.price || 0);
      return 0;
    });
  };

  // KPI Summary Counts
  const countTotal = allStrongStocks.length;
  const countMoreThan5 = allStrongStocks.filter(s => s.streak > 5).length;
  const countStreak5 = allStrongStocks.filter(s => s.streak === 5).length;
  const countStreak4 = allStrongStocks.filter(s => s.streak === 4).length;
  const countStreak3 = allStrongStocks.filter(s => s.streak === 3).length;
  const countStreak2 = allStrongStocks.filter(s => s.streak === 2).length;
  const countStreak1 = allStrongStocks.filter(s => s.streak === 1).length;
  const countTouched = allStrongStocks.filter(s => s.streak === 0).length;
  const countNotes = Object.keys(stockNotes).length;

  // Single table selected group data
  const currentSingleGroup = STREAK_GROUPS.find(g => g.id === activeSingleTab) || STREAK_GROUPS[0];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* ======================================================== */}
      {/* 1. Header Banner & Action Buttons                        */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 p-5 sm:p-6 rounded-3xl border border-pink-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
            <Trophy className="w-6 h-6 animate-pulse text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                強勢股追蹤庫 • 漲停連板階梯監控
              </h2>
              <span className="text-xs bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Table 分組表格化呈現
              </span>
            </div>
            <p className="text-xs sm:text-sm text-rose-900/80 mt-1">
              以獨立 Table 分組完整呈現：<strong className="text-purple-700">多於 5 天</strong>、<strong className="text-rose-700">漲停 5 天</strong>、<strong className="text-pink-700">漲停 4 天</strong>、<strong className="text-red-700">漲停 3 天</strong>、<strong className="text-orange-700">漲停 2 天</strong> 與 <strong className="text-amber-700">漲停 1 天 (首板)</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>記錄自選手繪強勢股</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. 階梯統計數據卡片 (點擊可快速跳轉/篩選)                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* 全覽 */}
        <div 
          onClick={() => setViewMode('MULTI_TABLE')}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            viewMode === 'MULTI_TABLE'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-rose-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[10px] font-bold opacity-80">階梯多 Table 全覽</div>
          <div className="text-xl font-black font-mono mt-0.5">{countTotal} <span className="text-[10px] font-normal">檔</span></div>
          <div className="text-[10px] opacity-75 mt-0.5">平鋪所有表格</div>
        </div>

        {/* 多於 5 天 */}
        <div 
          onClick={() => { setViewMode('SINGLE_TABLE'); setActiveSingleTab('MORE_THAN_5'); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            viewMode === 'SINGLE_TABLE' && activeSingleTab === 'MORE_THAN_5'
              ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
              : 'bg-white hover:bg-purple-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
            <span>🏆</span> 多於 5 天
          </div>
          <div className="text-xl font-black font-mono mt-0.5 text-purple-800">
            {countMoreThan5} <span className="text-[10px] font-normal text-slate-500">檔</span>
          </div>
          <div className="text-[10px] opacity-75 mt-0.5">6+連板妖股</div>
        </div>

        {/* 漲停 5 天 */}
        <div 
          onClick={() => { setViewMode('SINGLE_TABLE'); setActiveSingleTab('STREAK_5'); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            viewMode === 'SINGLE_TABLE' && activeSingleTab === 'STREAK_5'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-rose-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
            <span>🚀</span> 漲停 5 天
          </div>
          <div className="text-xl font-black font-mono mt-0.5 text-rose-700">
            {countStreak5} <span className="text-[10px] font-normal text-slate-500">檔</span>
          </div>
          <div className="text-[10px] opacity-75 mt-0.5">5連板龍頭</div>
        </div>

        {/* 漲停 4 天 */}
        <div 
          onClick={() => { setViewMode('SINGLE_TABLE'); setActiveSingleTab('STREAK_4'); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            viewMode === 'SINGLE_TABLE' && activeSingleTab === 'STREAK_4'
              ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
              : 'bg-white hover:bg-pink-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[10px] font-bold text-pink-700 flex items-center gap-1">
            <span>👑</span> 漲停 4 天
          </div>
          <div className="text-xl font-black font-mono mt-0.5 text-pink-700">
            {countStreak4} <span className="text-[10px] font-normal text-slate-500">檔</span>
          </div>
          <div className="text-[10px] opacity-75 mt-0.5">4連板加速</div>
        </div>

        {/* 漲停 3 天 */}
        <div 
          onClick={() => { setViewMode('SINGLE_TABLE'); setActiveSingleTab('STREAK_3'); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            viewMode === 'SINGLE_TABLE' && activeSingleTab === 'STREAK_3'
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'bg-white hover:bg-red-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[10px] font-bold text-red-600 flex items-center gap-1">
            <span>🔥🔥🔥</span> 漲停 3 天
          </div>
          <div className="text-xl font-black font-mono mt-0.5 text-red-600">
            {countStreak3} <span className="text-[10px] font-normal text-slate-500">檔</span>
          </div>
          <div className="text-[10px] opacity-75 mt-0.5">3連板主流</div>
        </div>

        {/* 漲停 2 天 */}
        <div 
          onClick={() => { setViewMode('SINGLE_TABLE'); setActiveSingleTab('STREAK_2'); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            viewMode === 'SINGLE_TABLE' && activeSingleTab === 'STREAK_2'
              ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
              : 'bg-white hover:bg-orange-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[10px] font-bold text-orange-600 flex items-center gap-1">
            <span>🔥🔥</span> 漲停 2 天
          </div>
          <div className="text-xl font-black font-mono mt-0.5 text-orange-600">
            {countStreak2} <span className="text-[10px] font-normal text-slate-500">檔</span>
          </div>
          <div className="text-[10px] opacity-75 mt-0.5">2連板接力</div>
        </div>

        {/* 漲停 1 天 */}
        <div 
          onClick={() => { setViewMode('SINGLE_TABLE'); setActiveSingleTab('STREAK_1'); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            viewMode === 'SINGLE_TABLE' && activeSingleTab === 'STREAK_1'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white hover:bg-amber-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
            <span>🔥</span> 漲停 1 天
          </div>
          <div className="text-xl font-black font-mono mt-0.5 text-amber-700">
            {countStreak1} <span className="text-[10px] font-normal text-slate-500">檔</span>
          </div>
          <div className="text-[10px] opacity-75 mt-0.5">今日首板突破</div>
        </div>

        {/* 我的筆記 */}
        <div 
          onClick={() => setViewMode('MY_NOTES')}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            viewMode === 'MY_NOTES'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white hover:bg-blue-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
            <span>📌</span> 追蹤筆記
          </div>
          <div className="text-xl font-black font-mono mt-0.5 text-blue-700">
            {countNotes} <span className="text-[10px] font-normal text-slate-500">則</span>
          </div>
          <div className="text-[10px] opacity-75 mt-0.5">自訂操作策略</div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. 視圖切換與搜尋控制列                                   */}
      {/* ======================================================== */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-pink-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5 text-xs">
          <button
            onClick={() => setViewMode('MULTI_TABLE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              viewMode === 'MULTI_TABLE'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-[#fff5f7] text-rose-900 hover:bg-rose-100 border border-pink-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>階梯多 Table 平鋪全覽</span>
          </button>

          <button
            onClick={() => { setViewMode('SINGLE_TABLE'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              viewMode === 'SINGLE_TABLE'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-[#fff5f7] text-rose-900 hover:bg-rose-100 border border-pink-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>單組 Table 分頁切換</span>
          </button>

          <button
            onClick={() => setViewMode('ALL_IN_ONE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              viewMode === 'ALL_IN_ONE'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-[#fff5f7] text-rose-900 hover:bg-rose-100 border border-pink-200'
            }`}
          >
            全部合一總 Table ({countTotal})
          </button>

          <button
            onClick={() => setViewMode('MY_NOTES')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              viewMode === 'MY_NOTES'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-[#fff5f7] text-rose-900 hover:bg-rose-100 border border-pink-200'
            }`}
          >
            📌 追蹤筆記 Table ({countNotes})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
            <input 
              type="text"
              placeholder="搜尋代號 / 名稱 / 題材 / 筆記..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#fff8fa] border border-pink-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-rose-300 focus:outline-none focus:border-rose-500 w-44 sm:w-56"
            />
          </div>

          <div className="flex items-center space-x-1 bg-[#fff8fa] p-0.5 rounded-xl border border-pink-200 text-xs">
            <span className="text-[10px] font-bold text-rose-800 px-1.5">排序:</span>
            {[
              { id: 'STREAK', label: '連板' },
              { id: 'LIMIT_BUY', label: '封單量' },
              { id: 'VOLUME', label: '成交量' },
              { id: 'PRICE', label: '價格' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  sortBy === s.id
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-800 hover:bg-rose-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-tabs when in SINGLE_TABLE mode */}
      {viewMode === 'SINGLE_TABLE' && (
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          {STREAK_GROUPS.map(grp => {
            const count = allStrongStocks.filter(grp.filterFn).length;
            const Icon = grp.icon;
            const isActive = activeSingleTab === grp.id;
            return (
              <button
                key={grp.id}
                onClick={() => setActiveSingleTab(grp.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/40'
                    : 'bg-white text-slate-700 hover:bg-rose-50 border border-pink-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-rose-500'}`} />
                <span>{grp.shortLabel} Table</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. Table 呈現邏輯 (Render Mode)                          */}
      {/* ======================================================== */}

      {/* VIEW MODE 1: 階梯多 Table 平鋪全覽模式 (Ladder Multi-Table View) */}
      {viewMode === 'MULTI_TABLE' && (
        <div className="space-y-6">
          {STREAK_GROUPS.map((group) => {
            const groupStocks = allStrongStocks.filter(group.filterFn);
            const filteredGroupStocks = sortStockList(groupStocks.filter(matchesSearch));
            const isCollapsed = collapsedTables[group.id];

            return (
              <StreakStockTable
                key={group.id}
                group={group}
                stocks={filteredGroupStocks}
                totalInGroup={groupStocks.length}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => toggleTableCollapse(group.id)}
                stockNotes={stockNotes}
                editingNoteCode={editingNoteCode}
                tempNoteText={tempNoteText}
                setEditingNoteCode={setEditingNoteCode}
                setTempNoteText={setTempNoteText}
                onSaveNote={handleSaveNote}
                watchlist={watchlist}
                onAddWatchlist={onAddWatchlist}
                onSelectStock={onSelectStock}
                onDeleteCustomStock={handleDeleteCustomStock}
              />
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: 單組 Table 分頁切換模式 */}
      {viewMode === 'SINGLE_TABLE' && (
        <div className="space-y-4">
          {(() => {
            const groupStocks = allStrongStocks.filter(currentSingleGroup.filterFn);
            const filteredGroupStocks = sortStockList(groupStocks.filter(matchesSearch));
            return (
              <StreakStockTable
                group={currentSingleGroup}
                stocks={filteredGroupStocks}
                totalInGroup={groupStocks.length}
                isCollapsed={false}
                onToggleCollapse={() => {}}
                stockNotes={stockNotes}
                editingNoteCode={editingNoteCode}
                tempNoteText={tempNoteText}
                setEditingNoteCode={setEditingNoteCode}
                setTempNoteText={setTempNoteText}
                onSaveNote={handleSaveNote}
                watchlist={watchlist}
                onAddWatchlist={onAddWatchlist}
                onSelectStock={onSelectStock}
                onDeleteCustomStock={handleDeleteCustomStock}
              />
            );
          })()}
        </div>
      )}

      {/* VIEW MODE 3: 全部合一總 Table 模式 */}
      {viewMode === 'ALL_IN_ONE' && (
        <div className="space-y-4">
          <StreakStockTable
            group={{
              id: 'ALL_IN_ONE',
              title: '全部強勢股合一總覽 Table',
              badge: '🎯 全部強勢標的',
              headerBg: 'bg-gradient-to-r from-slate-900 to-rose-950 text-white',
              badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
              description: '彙整台股今日所有漲停連板階梯、首板與曾觸及漲停之全覽總表'
            }}
            stocks={sortStockList(allStrongStocks.filter(matchesSearch))}
            totalInGroup={allStrongStocks.length}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            stockNotes={stockNotes}
            editingNoteCode={editingNoteCode}
            tempNoteText={tempNoteText}
            setEditingNoteCode={setEditingNoteCode}
            setTempNoteText={setTempNoteText}
            onSaveNote={handleSaveNote}
            watchlist={watchlist}
            onAddWatchlist={onAddWatchlist}
            onSelectStock={onSelectStock}
            onDeleteCustomStock={handleDeleteCustomStock}
          />
        </div>
      )}

      {/* VIEW MODE 4: 追蹤筆記專屬 Table */}
      {viewMode === 'MY_NOTES' && (
        <div className="space-y-4">
          {(() => {
            const noteStocks = allStrongStocks.filter(s => Boolean(stockNotes[s.code]));
            const filtered = sortStockList(noteStocks.filter(matchesSearch));
            return (
              <StreakStockTable
                group={{
                  id: 'MY_NOTES',
                  title: '我的自選追蹤操作筆記 Table',
                  badge: '📌 個人操作備忘',
                  headerBg: 'bg-gradient-to-r from-blue-800 to-indigo-950 text-white',
                  badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
                  description: '已記錄操作策略、進出場提醒與關鍵價位的強勢標的專屬清單'
                }}
                stocks={filtered}
                totalInGroup={noteStocks.length}
                isCollapsed={false}
                onToggleCollapse={() => {}}
                stockNotes={stockNotes}
                editingNoteCode={editingNoteCode}
                tempNoteText={tempNoteText}
                setEditingNoteCode={setEditingNoteCode}
                setTempNoteText={setTempNoteText}
                onSaveNote={handleSaveNote}
                watchlist={watchlist}
                onAddWatchlist={onAddWatchlist}
                onSelectStock={onSelectStock}
                onDeleteCustomStock={handleDeleteCustomStock}
              />
            );
          })()}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. Modal: 手動記錄自選手繪強勢股                         */}
      {/* ======================================================== */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-3xl border border-pink-200 p-6 w-full max-w-lg shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-pink-200 mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                  <Zap className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  記錄自選強勢股票 (連板追蹤)
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomStock} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">股票代號 *</label>
                  <input 
                    type="text"
                    required
                    placeholder="如 2330"
                    value={newStock.code}
                    onChange={(e) => setNewStock({ ...newStock, code: e.target.value })}
                    className="w-full bg-[#fff8fa] border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">股票名稱 *</label>
                  <input 
                    type="text"
                    required
                    placeholder="如 台積電"
                    value={newStock.name}
                    onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                    className="w-full bg-[#fff8fa] border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">連板天數階梯分類 *</label>
                  <select 
                    value={newStock.streak}
                    onChange={(e) => setNewStock({ ...newStock, streak: e.target.value })}
                    className="w-full bg-[#fff8fa] border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-bold"
                  >
                    <option value="6">🏆 多於 5 天 (6+ 連板 / 妖股天花板)</option>
                    <option value="5">🚀 漲停 5 天 (5 連板龍頭)</option>
                    <option value="4">👑 漲停 4 天 (4 連板加速)</option>
                    <option value="3">🔥🔥🔥 漲停 3 天 (3 連板主流)</option>
                    <option value="2">🔥🔥 漲停 2 天 (2 連板接力)</option>
                    <option value="1">🔥 漲停 1 天 (今日首板)</option>
                    <option value="0">⚡ 曾觸及漲停 (衝高換手)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">現價 (漲停價)</label>
                  <input 
                    type="number"
                    step="0.05"
                    placeholder="如 248.00"
                    value={newStock.price}
                    onChange={(e) => setNewStock({ ...newStock, price: e.target.value })}
                    className="w-full bg-[#fff8fa] border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">所屬族群題材</label>
                  <input 
                    type="text"
                    placeholder="如 矽光子 / CPO / 重電"
                    value={newStock.catalyst}
                    onChange={(e) => setNewStock({ ...newStock, catalyst: e.target.value })}
                    className="w-full bg-[#fff8fa] border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">封單量 (張)</label>
                  <input 
                    type="number"
                    placeholder="如 15000"
                    value={newStock.limitBuyVolume}
                    onChange={(e) => setNewStock({ ...newStock, limitBuyVolume: e.target.value })}
                    className="w-full bg-[#fff8fa] border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">操作策略 / 追蹤筆記備忘</label>
                <textarea 
                  rows="2"
                  placeholder="如：明日開盤觀察是否跳空開高、外資連買三天..."
                  value={newStock.note}
                  onChange={(e) => setNewStock({ ...newStock, note: e.target.value })}
                  className="w-full bg-[#fff8fa] border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-pink-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  儲存強勢股記錄
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 獨立 Table 組件 (StreakStockTable)
 * 專為每一個連板階梯量身打造的獨立表格區塊
 */
function StreakStockTable({
  group,
  stocks = [],
  totalInGroup = 0,
  isCollapsed = false,
  onToggleCollapse,
  stockNotes = {},
  editingNoteCode,
  tempNoteText,
  setEditingNoteCode,
  setTempNoteText,
  onSaveNote,
  watchlist = [],
  onAddWatchlist,
  onSelectStock,
  onDeleteCustomStock
}) {
  const Icon = group.icon || Zap;

  return (
    <div className="bg-white rounded-3xl border border-pink-200 overflow-hidden shadow-xs transition duration-200">
      {/* Table Header Banner */}
      <div 
        onClick={onToggleCollapse}
        className={`${group.headerBg} px-5 py-3.5 flex items-center justify-between cursor-pointer select-none`}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center">
            <Icon className={`w-5 h-5 ${group.iconColor || 'text-white'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>{group.title}</span>
              </h3>
              <span className="bg-white/20 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-white/30 shadow-2xs">
                共 {stocks.length} 檔 {stocks.length !== totalInGroup && `(總共 ${totalInGroup} 檔)`}
              </span>
            </div>
            {group.description && (
              <p className="text-xs text-white/80 mt-0.5 line-clamp-1">
                {group.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            type="button"
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            title={isCollapsed ? '展開表格' : '摺疊表格'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Table Body Content */}
      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#fff0f3] text-rose-900 font-extrabold border-b border-pink-200">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">排名 / 代號與名稱</th>
                <th className="py-3 px-3 whitespace-nowrap">連板強弱天數</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">現價 (漲停)</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">漲跌幅</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">封單委買量 (張)</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">首封時間</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">成交量 (張)</th>
                <th className="py-3 px-3 whitespace-nowrap">題材與漲停催化劑</th>
                <th className="py-3 px-3.5 min-w-[200px] whitespace-nowrap">我的追蹤筆記備忘</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100">
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-10 text-center text-slate-400 bg-slate-50/50">
                    此階梯分類目前無符合篩選條件之標的
                  </td>
                </tr>
              ) : (
                stocks.map((st, idx) => {
                  const hasNote = Boolean(stockNotes[st.code]);
                  const isWatchlisted = watchlist.includes(st.code);

                  return (
                    <tr 
                      key={st.code} 
                      className="hover:bg-rose-50/60 transition group cursor-pointer"
                      onClick={() => onSelectStock && onSelectStock({ Code: st.code, Name: st.name, ClosingPrice: st.price, Change: st.change })}
                    >
                      {/* 排名 / 代號與名稱 */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono text-xs font-bold text-slate-400 w-4 text-center">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-pink-200">
                            {st.code}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-rose-600 transition flex items-center gap-1.5">
                              <span>{st.name}</span>
                              {st.market && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({st.market})
                                </span>
                              )}
                              {st.isCustom && (
                                <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">
                                  自記
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-sans">{st.sector}</div>
                          </div>
                        </div>
                      </td>

                      {/* 連板強弱天數 */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border ${
                          st.streak > 5
                            ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs animate-pulse'
                            : st.streak === 5
                            ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-2xs'
                            : st.streak === 4
                            ? 'bg-pink-100 text-pink-800 border-pink-300 shadow-2xs'
                            : st.streak === 3
                            ? 'bg-red-100 text-red-700 border-red-300 shadow-2xs'
                            : st.streak === 2
                            ? 'bg-orange-100 text-orange-700 border-orange-300'
                            : st.streak === 1
                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}>
                          {st.streakBadge}
                        </span>
                      </td>

                      {/* 現價 (漲停價) */}
                      <td className="py-3 px-3 text-right font-mono font-black text-red-600 text-sm whitespace-nowrap">
                        NT$ {st.price}
                      </td>

                      {/* 漲跌幅 */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-red-600 whitespace-nowrap">
                        <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                          {st.pctChange}
                        </span>
                      </td>

                      {/* 封單委買量 */}
                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        {st.limitBuyVolume > 0 ? (
                          <div>
                            <strong className="text-slate-900 font-bold">
                              {st.limitBuyVolume.toLocaleString()} 張
                            </strong>
                            {st.limitBuyAmount && st.limitBuyAmount !== '--' && (
                              <div className="text-[10px] text-slate-400">({st.limitBuyAmount})</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans">曾打開換手</span>
                        )}
                      </td>

                      {/* 首封時間 */}
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-400 inline" />
                          {st.firstLockTime}
                        </span>
                      </td>

                      {/* 成交量 */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                        {st.totalVolume ? st.totalVolume.toLocaleString() : '--'}
                      </td>

                      {/* 題材與漲停催化劑 */}
                      <td className="py-3 px-3">
                        <div className="max-w-xs">
                          <span className="inline-block bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px] border border-pink-200 mb-0.5">
                            {st.catalyst}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-1 group-hover:line-clamp-none transition-all">
                            {st.reason}
                          </p>
                        </div>
                      </td>

                      {/* 我的追蹤筆記備忘 (可即時編輯與保存) */}
                      <td 
                        className="py-3 px-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {editingNoteCode === st.code ? (
                          <div className="flex items-center space-x-1">
                            <input 
                              type="text"
                              autoFocus
                              value={tempNoteText}
                              onChange={(e) => setTempNoteText(e.target.value)}
                              placeholder="輸入操作策略備忘..."
                              className="w-full bg-[#fff8fa] border border-rose-300 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') onSaveNote(st.code, tempNoteText);
                                if (e.key === 'Escape') setEditingNoteCode(null);
                              }}
                            />
                            <button
                              onClick={() => onSaveNote(st.code, tempNoteText)}
                              className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700 cursor-pointer"
                              title="儲存"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingNoteCode(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 cursor-pointer"
                              title="取消"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingNoteCode(st.code);
                              setTempNoteText(stockNotes[st.code] || '');
                            }}
                            className="flex items-center justify-between group/note p-1.5 rounded-lg border border-dashed border-pink-200 hover:border-rose-400 bg-rose-50/30 hover:bg-rose-50 cursor-text transition"
                            title="點擊可直接編輯操作備忘錄"
                          >
                            <span className={`text-[11px] ${hasNote ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
                              {stockNotes[st.code] || '+ 點此新增追蹤備忘...'}
                            </span>
                            <Edit3 className="w-3 h-3 text-rose-400 opacity-0 group-hover/note:opacity-100 transition shrink-0 ml-1" />
                          </div>
                        )}
                      </td>

                      {/* 操作按鈕 */}
                      <td 
                        className="py-3 px-3 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          {onAddWatchlist && (
                            <button
                              onClick={() => onAddWatchlist(st.code)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                isWatchlisted 
                                  ? 'bg-amber-50 text-amber-600 border-amber-300' 
                                  : 'bg-white text-slate-400 hover:text-amber-600 border-slate-200'
                              }`}
                              title={isWatchlisted ? '已在自選清單' : '加入自選追蹤'}
                            >
                              <Star className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-amber-500' : ''}`} />
                            </button>
                          )}

                          <button
                            onClick={() => onSelectStock && onSelectStock({ Code: st.code, Name: st.name, ClosingPrice: st.price, Change: st.change })}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-pink-200 transition cursor-pointer"
                            title="開啟三竹K線深度技術分析"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {st.isCustom && (
                            <button
                              onClick={() => onDeleteCustomStock(st.code)}
                              className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 transition cursor-pointer"
                              title="刪除此筆自訂記錄"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
