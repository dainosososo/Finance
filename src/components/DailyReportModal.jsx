import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileText, 
  Download, 
  TrendingUp, 
  Building2, 
  Coins, 
  Flame,
  Calendar,
  Clock
} from 'lucide-react';
import { generateDailySummaryText } from '../services/marketReportService';

export default function DailyReportModal({ 
  reportData, 
  taiexData, 
  onClose,
  onSelectStock 
}) {
  const [copied, setCopied] = useState(false);

  if (!reportData) return null;

  const summaryText = generateDailySummaryText(reportData, taiexData);
  const flows = reportData.institutionalFlows || {};
  const topVolumes = (reportData.volumeRankings || []).slice(0, 5);
  const foreignBuys = (reportData.foreignRankings?.buy || []).slice(0, 5);
  const trustBuys = (reportData.trustRankings?.buy || []).slice(0, 5);

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `台股1330盤後重點日報_${reportData.date || 'today'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header (Light Theme) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                13:30 台股盤後精簡日報
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-50 text-red-600 border border-red-200">
                  每日收盤定案版
                </span>
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {reportData.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 產生時間 {reportData.timestamp}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Market Overview Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">加權指數</div>
              <div className="text-base font-black text-slate-900 font-mono">{taiexData?.taiex || '---'}</div>
              {(() => {
                const chg = taiexData?.change || '-102.55';
                const isUp = !String(chg).includes('-');
                return (
                  <div className={`text-xs font-bold ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
                    {chg} ({taiexData?.pctChange || '-0.21%'})
                  </div>
                );
              })()}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">市場總成交金額</div>
              <div className="text-base font-black text-slate-900 font-mono">{taiexData?.volume || '4,125.80 億'}</div>
              <div className="text-xs text-slate-400">大盤成交量能</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">外資買賣超</div>
              <div className={`text-base font-black font-mono ${flows.foreign?.net >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {flows.foreign?.net >= 0 ? '+' : ''}{flows.foreign?.net} 億
              </div>
              <div className="text-xs text-slate-400">外資及陸資合計</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">三大法人合計</div>
              <div className={`text-base font-black font-mono ${flows.total?.net >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {flows.total?.net >= 0 ? '+' : ''}{flows.total?.net} 億
              </div>
              <div className="text-xs text-slate-400">淨資金買賣動向</div>
            </div>
          </div>

          {/* Quick Focus Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Top Volumes */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 mb-2.5">
                <Flame className="w-3.5 h-3.5" />
                <span>成交量前五名</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {topVolumes.map((s) => (
                  <div 
                    key={s.code} 
                    onClick={() => onSelectStock && onSelectStock({ Code: s.code, Name: s.name, ClosingPrice: s.price })}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-white transition cursor-pointer"
                  >
                    <span className="text-slate-800 font-medium">{s.rank}. {s.name} <span className="text-slate-400 font-mono">({s.code})</span></span>
                    <span className="font-mono font-bold text-slate-900">{s.volume?.toLocaleString()} 張</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Foreign Top Buys */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 mb-2.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>外資買超前五名</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {foreignBuys.map((s) => (
                  <div 
                    key={s.code}
                    onClick={() => onSelectStock && onSelectStock({ Code: s.code, Name: s.name, ClosingPrice: s.price })}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-white transition cursor-pointer"
                  >
                    <span className="text-slate-800 font-medium">{s.rank}. {s.name} <span className="text-slate-400 font-mono">({s.code})</span></span>
                    <span className="font-mono font-bold text-red-600">+{s.netShares?.toLocaleString()} 張</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Top Buys */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 mb-2.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>投信買超前五名</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {trustBuys.map((s) => (
                  <div 
                    key={s.code}
                    onClick={() => onSelectStock && onSelectStock({ Code: s.code, Name: s.name, ClosingPrice: s.price })}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-white transition cursor-pointer"
                  >
                    <span className="text-slate-800 font-medium">{s.rank}. {s.name} <span className="text-slate-400 font-mono">({s.code})</span></span>
                    <span className="font-mono font-bold text-red-600">+{s.netShares?.toLocaleString()} 張</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formatted Text Box for Quick Copy */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>純文字日報排版內容 (新台幣 NT$ 計價)：</span>
              <span className="text-[11px] text-slate-400">可一鍵複製至 LINE / Discord / 筆記分享</span>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap select-all shadow-inner">
              {summaryText}
            </pre>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            資料來源：臺灣證券交易所 (TWSE Open Data)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載報表 (.txt)</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已複製成功！' : '一鍵複製完整日報'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
