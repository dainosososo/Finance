import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileText, 
  Download, 
  Share2, 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-dark-900 border border-gray-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-dark-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                13:30 台股盤後精簡報告
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  每日收盤總整理
                </span>
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {reportData.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 產生時間 {reportData.timestamp}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Market Overview Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">加權指數</div>
              <div className="text-base font-bold text-white font-mono">{taiexData?.taiex || '23,125.80'}</div>
              <div className="text-xs text-red-400 font-semibold">{taiexData?.change || '+245.60'} ({taiexData?.pctChange || '+1.07%'})</div>
            </div>

            <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">市場總成交量</div>
              <div className="text-base font-bold text-white font-mono">{taiexData?.volume || '4,125.80 億'}</div>
              <div className="text-xs text-gray-400">大盤成交金額</div>
            </div>

            <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">外資買賣超</div>
              <div className={`text-base font-bold font-mono ${flows.foreign?.net >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {flows.foreign?.net >= 0 ? '+' : ''}{flows.foreign?.net} 億
              </div>
              <div className="text-xs text-gray-400">外資與陸資合計</div>
            </div>

            <div className="bg-dark-800/60 p-3.5 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">三大法人合計</div>
              <div className={`text-base font-bold font-mono ${flows.total?.net >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {flows.total?.net >= 0 ? '+' : ''}{flows.total?.net} 億
              </div>
              <div className="text-xs text-gray-400">外資+投信+自營</div>
            </div>
          </div>

          {/* Quick Focus Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Top Volumes */}
            <div className="bg-dark-800/40 border border-gray-800/80 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 mb-3">
                <Flame className="w-3.5 h-3.5" />
                <span>成交量前五名</span>
              </div>
              <div className="space-y-2 text-xs">
                {topVolumes.map((s) => (
                  <div 
                    key={s.code} 
                    onClick={() => onSelectStock && onSelectStock({ Code: s.code, Name: s.name, ClosingPrice: s.price })}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-gray-800/60 transition cursor-pointer"
                  >
                    <span className="text-gray-200">{s.rank}. {s.name} <span className="text-gray-500 font-mono">({s.code})</span></span>
                    <span className="font-mono font-bold text-white">{s.volume.toLocaleString()} 張</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Foreign Top Buys */}
            <div className="bg-dark-800/40 border border-gray-800/80 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>外資買超前五名</span>
              </div>
              <div className="space-y-2 text-xs">
                {foreignBuys.map((s) => (
                  <div 
                    key={s.code}
                    onClick={() => onSelectStock && onSelectStock({ Code: s.code, Name: s.name, ClosingPrice: s.price })}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-gray-800/60 transition cursor-pointer"
                  >
                    <span className="text-gray-200">{s.rank}. {s.name} <span className="text-gray-500 font-mono">({s.code})</span></span>
                    <span className="font-mono font-bold text-red-400">+{s.netShares.toLocaleString()} 張</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Top Buys */}
            <div className="bg-dark-800/40 border border-gray-800/80 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>投信買超前五名</span>
              </div>
              <div className="space-y-2 text-xs">
                {trustBuys.map((s) => (
                  <div 
                    key={s.code}
                    onClick={() => onSelectStock && onSelectStock({ Code: s.code, Name: s.name, ClosingPrice: s.price })}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-gray-800/60 transition cursor-pointer"
                  >
                    <span className="text-gray-200">{s.rank}. {s.name} <span className="text-gray-500 font-mono">({s.code})</span></span>
                    <span className="font-mono font-bold text-red-400">+{s.netShares.toLocaleString()} 張</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formatted Text Box for Quick Copy */}
          <div>
            <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center justify-between">
              <span>純文字日報預覽 (已排版格式)：</span>
              <span className="text-[11px] text-gray-500">適合複製至 LINE / Discord / 筆記</span>
            </div>
            <pre className="bg-dark-950 p-4 rounded-xl border border-gray-800 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
              {summaryText}
            </pre>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-gray-800 bg-dark-800/60 flex items-center justify-between">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span>資料來源：臺灣證券交易所 × 財經五大媒體</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載報表 (.txt)</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已複製到剪貼簿！' : '一鍵複製完整日報'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
