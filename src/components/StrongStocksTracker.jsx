import React, { useState, useEffect } from 'react';
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
  Filter,
  BarChart2,
  Sparkles
} from 'lucide-react';
import { INITIAL_STRONG_STOCKS } from '../data/strongStocksData';

const STORAGE_KEY_CUSTOM_STOCKS = 'twse_custom_strong_stocks';
const STORAGE_KEY_USER_NOTES = 'twse_strong_stock_notes';

export default function StrongStocksTracker({ 
  onSelectStock, 
  onAddWatchlist, 
  watchlist = [] 
}) {
  const [activeStreakFilter, setActiveStreakFilter] = useState('ALL'); 
  // 'ALL', 'STREAK_1', 'STREAK_2', 'STREAK_3', 'STREAK_4_PLUS', 'TOUCHED', 'MY_NOTES'
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('STREAK'); // 'STREAK', 'VOLUME', 'LIMIT_BUY', 'PRICE'
  
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
    streak: 1,
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
  const allStrongStocks = [...INITIAL_STRONG_STOCKS, ...customStocks];

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
    let badge = '🔥 首板';
    if (streakNum === 2) { label = '2連板'; badge = '🔥🔥 2連板'; }
    else if (streakNum === 3) { label = '3連板'; badge = '🔥🔥🔥 3連板'; }
    else if (streakNum >= 4) { label = `${streakNum}連板 (超級強勢)`; badge = `👑 ${streakNum}連板`; }
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
      catalyst: newStock.catalyst.trim() || '自選強勢股',
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
      streak: 1,
      limitBuyVolume: '',
      catalyst: '',
      note: ''
    });
    setShowAddModal(false);
  };

  const handleDeleteCustomStock = (code) => {
    setCustomStocks(prev => prev.filter(s => s.code !== code));
  };

  // Filter list by category & search term
  const filteredStocks = allStrongStocks.filter(item => {
    // 1. Streak Category Filter
    if (activeStreakFilter === 'STREAK_1' && item.streak !== 1) return false;
    if (activeStreakFilter === 'STREAK_2' && item.streak !== 2) return false;
    if (activeStreakFilter === 'STREAK_3' && item.streak !== 3) return false;
    if (activeStreakFilter === 'STREAK_4_PLUS' && item.streak < 4) return false;
    if (activeStreakFilter === 'TOUCHED' && item.streak !== 0) return false;
    if (activeStreakFilter === 'MY_NOTES' && !stockNotes[item.code]) return false;

    // 2. Search Term Filter
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
  });

  // Sort list
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (sortBy === 'STREAK') return (b.streak || 0) - (a.streak || 0);
    if (sortBy === 'LIMIT_BUY') return (b.limitBuyVolume || 0) - (a.limitBuyVolume || 0);
    if (sortBy === 'VOLUME') return (b.totalVolume || 0) - (a.totalVolume || 0);
    if (sortBy === 'PRICE') return parseFloat(b.price || 0) - parseFloat(a.price || 0);
    return 0;
  });

  // Dashboard Statistics
  const countTotal = allStrongStocks.length;
  const countStreak1 = allStrongStocks.filter(s => s.streak === 1).length;
  const countStreak2 = allStrongStocks.filter(s => s.streak === 2).length;
  const countStreak3 = allStrongStocks.filter(s => s.streak === 3).length;
  const countStreak4Plus = allStrongStocks.filter(s => s.streak >= 4).length;
  const countTouched = allStrongStocks.filter(s => s.streak === 0).length;
  const countNotes = Object.keys(stockNotes).length;

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      {/* ======================================================== */}
      {/* 1. Header Banner & Action Buttons                        */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 p-5 sm:p-6 rounded-3xl border border-pink-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
            <Zap className="w-6 h-6 animate-pulse text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                強勢股追蹤庫 • 漲停與連板監控
              </h2>
              <span className="text-xs bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                盤中即時追蹤
              </span>
            </div>
            <p className="text-xs sm:text-sm text-rose-900/80 mt-1">
              精準分類今日漲停板、連續漲停 1 天 (首板)、連續 2 連板、3 連板及 4+ 連板超級飆股，支援個人化筆記追蹤
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
      {/* 2. KPI Summary Cards (統計數據卡片)                      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setActiveStreakFilter('ALL')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            activeStreakFilter === 'ALL'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-rose-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] font-bold opacity-80">今日強勢總數</div>
          <div className="text-2xl font-black font-mono mt-0.5">{countTotal} <span className="text-xs font-normal">檔</span></div>
          <div className="text-[10px] opacity-75 mt-1">含觸及與連板</div>
        </div>

        <div 
          onClick={() => setActiveStreakFilter('STREAK_1')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            activeStreakFilter === 'STREAK_1'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-rose-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
            <span>🔥</span> 今日首板 (1天)
          </div>
          <div className="text-2xl font-black font-mono mt-0.5 text-red-600">
            {countStreak1} <span className="text-xs font-normal text-slate-500">檔</span>
          </div>
          <div className="text-[10px] opacity-75 mt-1">首度發動突破</div>
        </div>

        <div 
          onClick={() => setActiveStreakFilter('STREAK_2')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            activeStreakFilter === 'STREAK_2'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-rose-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] font-bold text-orange-600 flex items-center gap-1">
            <span>🔥🔥</span> 2 連板
          </div>
          <div className="text-2xl font-black font-mono mt-0.5 text-red-600">
            {countStreak2} <span className="text-xs font-normal text-slate-500">檔</span>
          </div>
          <div className="text-[10px] opacity-75 mt-1">換手確認強勢</div>
        </div>

        <div 
          onClick={() => setActiveStreakFilter('STREAK_3')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            activeStreakFilter === 'STREAK_3'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-rose-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] font-bold text-red-600 flex items-center gap-1">
            <span>🔥🔥🔥</span> 3 連板
          </div>
          <div className="text-2xl font-black font-mono mt-0.5 text-red-600">
            {countStreak3} <span className="text-xs font-normal text-slate-500">檔</span>
          </div>
          <div className="text-[10px] opacity-75 mt-1">主升波段核心</div>
        </div>

        <div 
          onClick={() => setActiveStreakFilter('STREAK_4_PLUS')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            activeStreakFilter === 'STREAK_4_PLUS'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-rose-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] font-bold text-purple-600 flex items-center gap-1">
            <span>👑</span> 4 連板以上
          </div>
          <div className="text-2xl font-black font-mono mt-0.5 text-purple-700">
            {countStreak4Plus} <span className="text-xs font-normal text-slate-500">檔</span>
          </div>
          <div className="text-[10px] opacity-75 mt-1">市場頂級妖股</div>
        </div>

        <div 
          onClick={() => setActiveStreakFilter('MY_NOTES')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            activeStreakFilter === 'MY_NOTES'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-rose-50/60 border-pink-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
            <span>📌</span> 自選追蹤筆記
          </div>
          <div className="text-2xl font-black font-mono mt-0.5 text-blue-700">
            {countNotes} <span className="text-xs font-normal text-slate-500">則</span>
          </div>
          <div className="text-[10px] opacity-75 mt-1">專屬研究紀錄</div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. Filter Tabs & Controls                                */}
      {/* ======================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-pink-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5 text-xs">
          {[
            { id: 'ALL', label: `全部 (${countTotal})` },
            { id: 'STREAK_1', label: `🔥 首板 (${countStreak1})` },
            { id: 'STREAK_2', label: `🔥🔥 2連板 (${countStreak2})` },
            { id: 'STREAK_3', label: `🔥🔥🔥 3連板 (${countStreak3})` },
            { id: 'STREAK_4_PLUS', label: `👑 4連板+ (${countStreak4Plus})` },
            { id: 'TOUCHED', label: `⚡ 曾觸及漲停 (${countTouched})` },
            { id: 'MY_NOTES', label: `📌 追蹤筆記 (${countNotes})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveStreakFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeStreakFilter === tab.id
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-[#fff5f7] text-rose-900 hover:bg-rose-100 border border-pink-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
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

      {/* ======================================================== */}
      {/* 4. Strong Stock List Table                               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-pink-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#fff0f3] text-rose-900 font-extrabold border-b border-pink-200">
              <tr>
                <th className="py-3 px-3.5">標的代號 / 名稱</th>
                <th className="py-3 px-3">連板強弱天數</th>
                <th className="py-3 px-3 text-right">現價 (漲停)</th>
                <th className="py-3 px-3 text-right">漲跌幅</th>
                <th className="py-3 px-3 text-right">封單委買量 (張)</th>
                <th className="py-3 px-3 text-right">首封時間</th>
                <th className="py-3 px-3 text-right">成交量 (張)</th>
                <th className="py-3 px-3">題材與漲停催化劑</th>
                <th className="py-3 px-3.5 min-w-[200px]">我的追蹤筆記備忘</th>
                <th className="py-3 px-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100">
              {sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    查無符合條件的強勢股票資料
                  </td>
                </tr>
              ) : (
                sortedStocks.map((st) => {
                  const hasNote = Boolean(stockNotes[st.code]);
                  const isWatchlisted = watchlist.includes(st.code);

                  return (
                    <tr 
                      key={st.code} 
                      className="hover:bg-rose-50/60 transition group cursor-pointer"
                      onClick={() => onSelectStock && onSelectStock({ Code: st.code, Name: st.name, ClosingPrice: st.price, Change: st.change })}
                    >
                      {/* 標的代號 / 名稱 */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-pink-200">
                            {st.code}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-rose-600 transition flex items-center gap-1.5">
                              <span>{st.name}</span>
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
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border ${
                          st.streak >= 4
                            ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs animate-pulse'
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

                      {/* 現價 */}
                      <td className="py-3 px-3 text-right font-mono font-black text-red-600 text-sm">
                        NT$ {st.price}
                      </td>

                      {/* 漲跌幅 */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-red-600">
                        <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                          {st.pctChange}
                        </span>
                      </td>

                      {/* 封單委買量 */}
                      <td className="py-3 px-3 text-right font-mono">
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
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-400 inline" />
                          {st.firstLockTime}
                        </span>
                      </td>

                      {/* 成交量 */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
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
                                if (e.key === 'Enter') handleSaveNote(st.code, tempNoteText);
                                if (e.key === 'Escape') setEditingNoteCode(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveNote(st.code, tempNoteText)}
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
                        className="py-3 px-3 text-center"
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
                              onClick={() => handleDeleteCustomStock(st.code)}
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
      </div>

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
                  <label className="block font-bold text-slate-700 mb-1">連板天數分類</label>
                  <select 
                    value={newStock.streak}
                    onChange={(e) => setNewStock({ ...newStock, streak: e.target.value })}
                    className="w-full bg-[#fff8fa] border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-bold"
                  >
                    <option value="1">🔥 首板 (連續漲停 1 天)</option>
                    <option value="2">🔥🔥 2 連板 (連續漲停 2 天)</option>
                    <option value="3">🔥🔥🔥 3 連板 (連續漲停 3 天)</option>
                    <option value="4">👑 4 連板及以上 (超級飆股)</option>
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
