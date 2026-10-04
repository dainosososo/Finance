import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Flame, 
  Globe, 
  Zap, 
  Bot, 
  Ship, 
  Search, 
  Layers, 
  ArrowRight, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Info, 
  Newspaper, 
  CheckCircle2, 
  ShieldCheck,
  Building,
  Activity,
  Workflow,
  Share2,
  ChevronRight
} from 'lucide-react';
import { INDUSTRY_CHAINS_DATA, searchIndustryChains } from '../services/industryChainService';

// 圖示對照表
const ICON_MAP = {
  Cpu: Cpu,
  Flame: Flame,
  Globe: Globe,
  Zap: Zap,
  Bot: Bot,
  Ship: Ship
};

export default function IndustryChainTracker({ onSelectStock }) {
  const [selectedChainId, setSelectedChainId] = useState('ALL'); // ALL 或特定產業鏈 ID
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState('FLOW'); // 'FLOW' (流程圖導覽) 或 'GRID' (緊湊矩陣)

  // 搜尋與族群過濾
  const displayedChains = useMemo(() => {
    let result = INDUSTRY_CHAINS_DATA;
    if (searchQuery.trim()) {
      result = searchIndustryChains(searchQuery);
    }
    if (selectedChainId !== 'ALL') {
      result = result.filter(c => c.id === selectedChainId);
    }
    return result;
  }, [selectedChainId, searchQuery]);

  // 當點擊公司卡片時，呼叫父層開啟三竹股市規格深度彈窗 (含 K線蠟燭圖與 SMC 聰明錢分析)
  const handleStockClick = (company) => {
    if (onSelectStock) {
      onSelectStock({
        code: company.code,
        name: company.name,
        price: company.price,
        change: company.change,
        pctChange: company.pctChange,
        volume: company.volume,
        tradeValue: (company.price * company.volume * 1000 / 100000000).toFixed(1) + ' 億',
        turnoverYi: (company.price * company.volume * 1000 / 100000000).toFixed(1)
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* ========================================================= */}
      {/* 1. 頂部儀表板標頭 (Header & Search Bar)                     */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        {/* 背景裝飾光暈 */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-48 h-48 bg-purple-400/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-white/20 backdrop-blur-md rounded-xl text-white">
                <Workflow className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                臺灣核心產業鏈全景智庫 (Supply Chain Matrix)
              </h2>
              <span className="text-[10px] bg-white/25 text-white font-mono font-bold px-2.5 py-0.5 rounded-full border border-white/30">
                即時消息・公司負責項目連動
              </span>
            </div>
            <p className="text-pink-100 text-xs sm:text-sm leading-relaxed max-w-3xl">
              深度解析「上游原物料 $\to$ 中游核心零組件與加工 $\to$ 下游終端整合」完整生態系。標註每檔台股所負責之關鍵產品、技術護城河與最新消息面，點擊任一標的立即檢視三竹 K 線圖與 SMC-RL 決策！
            </p>
          </div>

          {/* 搜尋欄位與視圖切換 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            {/* 搜尋框 */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-rose-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋公司、代號 (如: 欣興、水冷)..."
                className="w-full bg-white/15 backdrop-blur-md text-white placeholder-pink-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-white/25 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-pink-200 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 視圖切換 */}
            <div className="flex bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/20">
              <button
                onClick={() => setViewLayout('FLOW')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewLayout === 'FLOW' ? 'bg-white text-rose-700 shadow-xs' : 'text-pink-100 hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>流程圖導覽</span>
              </button>
              <button
                onClick={() => setViewLayout('GRID')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewLayout === 'GRID' ? 'bg-white text-rose-700 shadow-xs' : 'text-pink-100 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>矩陣清單</span>
              </button>
            </div>
          </div>
        </div>

        {/* 族群切換按鈕群 (橫向滑動晶片列) */}
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-4 mt-2 border-t border-white/15 text-xs">
          <button
            onClick={() => setSelectedChainId('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
              selectedChainId === 'ALL'
                ? 'bg-white text-rose-800 ring-2 ring-white/60 shadow-md font-extrabold'
                : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>全部核心族群 ({INDUSTRY_CHAINS_DATA.length})</span>
          </button>

          {INDUSTRY_CHAINS_DATA.map((chain) => {
            const Icon = ICON_MAP[chain.iconName] || Cpu;
            const isSelected = selectedChainId === chain.id;
            return (
              <button
                key={chain.id}
                onClick={() => setSelectedChainId(chain.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
                  isSelected
                    ? 'bg-white text-rose-800 ring-2 ring-white/60 shadow-md font-extrabold'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{chain.name.split('產')[0]}</span>
                <span className="text-[10px] opacity-80 font-mono">({chain.tag})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 產業鏈主體展示區 (Chains Loop)                           */}
      {/* ========================================================= */}
      {displayedChains.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-200 p-12 text-center text-slate-500 shadow-2xs">
          <Info className="w-10 h-10 mx-auto text-pink-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">查無符合條件的產業鏈或公司</h3>
          <p className="text-xs text-slate-500 mt-1">請嘗試變更搜尋關鍵字或點擊上方「全部核心族群」重設。</p>
        </div>
      ) : (
        displayedChains.map((chain) => {
          const Icon = ICON_MAP[chain.iconName] || Cpu;

          return (
            <div 
              key={chain.id} 
              className="bg-white rounded-2xl sm:rounded-3xl border border-pink-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* 族群頭銜列 */}
              <div className="bg-[#fff0f3] px-5 py-3.5 border-b border-pink-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {chain.name}
                      </h3>
                      <span className="text-[11px] font-bold bg-white text-rose-700 px-2 py-0.5 rounded-full border border-pink-200 shadow-2xs">
                        {chain.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-rose-800/80 font-sans">
                      {chain.subtitle}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1 bg-white/80 px-3 py-1 rounded-xl border border-pink-100">
                  <Info className="w-3.5 h-3.5 text-rose-500" />
                  <span>點擊任一標的卡片即可檢視即時 K 線與 SMC-RL 評估</span>
                </div>
              </div>

              {/* 族群簡介與最新即時消息面跑馬區 (Integrated News Intelligence) */}
              <div className="p-4 sm:p-5 bg-gradient-to-b from-[#fff8fa] to-white border-b border-pink-100">
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {chain.description}
                </p>

                {/* 整合最新消息面卡片 (Latest News & Catalysts) */}
                {chain.news && chain.news.length > 0 && (
                  <div className="bg-white p-3.5 rounded-xl border border-pink-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs border-b border-pink-100 pb-1.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Newspaper className="w-4 h-4 text-purple-600" />
                        最新消息面、法說動向與網上即時資訊 (Live Web Intelligence)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        持續動態聚合
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {chain.news.map((item, nIdx) => (
                        <div 
                          key={nIdx}
                          className="p-2.5 bg-[#fff8fa] hover:bg-rose-50/60 rounded-lg border border-pink-100 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[9.5px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded border border-rose-200">
                                {item.type}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                              {item.highlight}
                            </p>
                          </div>
                          <div className="text-[10px] text-rose-700/80 font-medium mt-2 pt-1 border-t border-pink-100 flex items-center justify-between">
                            <span>來源: {item.source}</span>
                            <span className="text-purple-600 font-bold">● 即時情報</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* 3. 上中下游階梯式流程導覽 (Upstream -> Midstream -> Downstream) */}
              {/* ========================================================= */}
              <div className="p-4 sm:p-5 space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
                  {chain.stages.map((stage, sIdx) => {
                    const isUpstream = sIdx === 0;
                    const isMidstream = sIdx === 1;
                    const isDownstream = sIdx === 2;

                    // 階梯色彩方案
                    const headerGradient = isUpstream
                      ? 'from-blue-600 to-indigo-600 text-white'
                      : isMidstream
                      ? 'from-rose-600 to-pink-600 text-white'
                      : 'from-emerald-600 to-teal-600 text-white';

                    const borderAccent = isUpstream
                      ? 'border-blue-200 bg-blue-50/20'
                      : isMidstream
                      ? 'border-pink-200 bg-rose-50/20'
                      : 'border-emerald-200 bg-emerald-50/20';

                    return (
                      <div 
                        key={sIdx}
                        className={`rounded-2xl border ${borderAccent} p-3.5 flex flex-col justify-between shadow-2xs relative`}
                      >
                        {/* 階梯標題欄 */}
                        <div>
                          <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${headerGradient} shadow-xs flex items-center justify-between mb-2`}>
                            <span className="font-black text-xs tracking-wide">
                              {stage.stageName}
                            </span>
                            <span className="text-[10px] opacity-85 font-mono">
                              環節 {sIdx + 1}/3
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mb-3 px-1 leading-relaxed">
                            {stage.stageDescription}
                          </p>

                          {/* 該環節所屬子品項與公司清單 */}
                          <div className="space-y-3">
                            {stage.nodes.map((node, nIdx) => (
                              <div key={nIdx} className="space-y-1.5">
                                <div className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5 px-1">
                                  <ChevronRight className="w-3.5 h-3.5 text-rose-500" />
                                  <span>{node.subCategory}</span>
                                </div>

                                <div className="space-y-2">
                                  {node.companies.map((comp) => {
                                    const isUp = comp.change >= 0;
                                    return (
                                      <div
                                        key={comp.code}
                                        onClick={() => handleStockClick(comp)}
                                        className="bg-white hover:bg-rose-50/70 p-3 rounded-xl border border-pink-200 shadow-2xs hover:border-rose-300 transition-all cursor-pointer group hover:-translate-y-0.5"
                                        title="點擊開啟個股技術圖與 SMC 強化學習分析"
                                      >
                                        {/* 公司代碼與名稱及報價 */}
                                        <div className="flex items-center justify-between mb-1.5">
                                          <div className="flex items-center space-x-2">
                                            <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-pink-200 group-hover:bg-rose-600 group-hover:text-white transition">
                                              {comp.code}
                                            </span>
                                            <span className="font-bold text-xs text-slate-900 group-hover:text-rose-700 transition">
                                              {comp.name}
                                            </span>
                                          </div>

                                          {/* 即時報價與漲跌幅 */}
                                          <div className="text-right font-mono flex items-center space-x-1.5">
                                            <span className="text-xs font-black text-slate-900">
                                              NT${comp.price}
                                            </span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-flex items-center ${
                                              isUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                                            }`}>
                                              {isUp ? '+' : ''}{comp.pctChange}%
                                            </span>
                                          </div>
                                        </div>

                                        {/* 負責項目 (Responsible Project) - 核心訴求 */}
                                        <div className="text-[11px] font-bold text-indigo-950 bg-indigo-50/80 px-2 py-1 rounded-md border border-indigo-100 flex items-start gap-1 mb-1.5">
                                          <span className="text-indigo-600 shrink-0 font-extrabold text-[10px] mt-0.5">● 負責:</span>
                                          <span className="leading-snug">{comp.role}</span>
                                        </div>

                                        {/* 技術優勢 (Tech Advantage) */}
                                        <div className="text-[10px] text-slate-500 leading-relaxed px-1">
                                          <strong className="text-slate-700">技術亮點:</strong> {comp.techAdvantage}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 下一步導引標籤 (上游 -> 中游 -> 下游) */}
                        {sIdx < 2 && (
                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-end text-[10px] text-rose-600 font-bold">
                            <span>流向中下游環節</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
