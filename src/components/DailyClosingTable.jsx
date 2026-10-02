import React, { useState, useMemo } from 'react';
import { Database, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Search, BarChart } from 'lucide-react';

export default function DailyClosingTable({ dailyStocks = [], onSelectStock }) {
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('TradeVolume');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Extract unique sectors
  const sectors = useMemo(() => {
    const list = new Set(dailyStocks.map(s => s.Sector || '其他業'));
    return ['ALL', ...Array.from(list)];
  }, [dailyStocks]);

  // Filter & Sort Logic
  const filteredStocks = useMemo(() => {
    return dailyStocks.filter(stock => {
      const matchesSector = selectedSector === 'ALL' || stock.Sector === selectedSector;
      const term = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        (stock.Code && stock.Code.toLowerCase().includes(term)) ||
        (stock.Name && stock.Name.toLowerCase().includes(term));
      return matchesSector && matchesSearch;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Parse numerical values for proper financial sorting
      if (['ClosingPrice', 'Change', 'PctChange', 'TradeVolume', 'HighestPrice', 'LowestPrice'].includes(sortField)) {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dailyStocks, selectedSector, searchTerm, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage) || 1;
  const currentStocks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStocks.slice(start, start + itemsPerPage);
  }, [filteredStocks, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      {/* Table Header & Controls (Light Theme) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              臺灣證券交易所 全股每日收盤數據庫
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                共 {dailyStocks.length} 檔標的
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">每日即時彙整成交股數、最高價、最低價與收盤漲跌數據 (新台幣計價)</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜尋代號/名稱..."
              className="bg-slate-100 text-xs text-slate-900 placeholder-slate-400 pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white w-44"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Sector Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL">全部產業類別</option>
              {sectors.filter(s => s !== 'ALL').map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-sm font-sans">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 font-medium">
              <th className="py-3 px-4">股票代碼 / 名稱</th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('ClosingPrice')}>
                <div className="flex items-center gap-1">
                  <span>收盤價</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('Change')}>
                <div className="flex items-center gap-1">
                  <span>漲跌</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('PctChange')}>
                <div className="flex items-center gap-1">
                  <span>漲跌幅</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('HighestPrice')}>
                <div className="flex items-center gap-1">
                  <span>最高價</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('LowestPrice')}>
                <div className="flex items-center gap-1">
                  <span>最低價</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('TradeVolume')}>
                <div className="flex items-center gap-1">
                  <span>成交股數</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">技術分析</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {currentStocks.length > 0 ? (
              currentStocks.map((stock) => {
                const changeVal = parseFloat(stock.Change || 0);
                const isUp = changeVal >= 0;
                const isLimitUp = parseFloat(stock.PctChange || 0) >= 9.5;

                return (
                  <tr
                    key={stock.Code}
                    onClick={() => onSelectStock(stock)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {stock.Code}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {stock.Name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{stock.Sector || '台股'}</span>
                        </div>
                        {isLimitUp && (
                          <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.2 rounded animate-pulse">
                            漲停
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Closing Price */}
                    <td className="py-3 px-3 font-bold text-slate-900">
                      NT$ {stock.ClosingPrice}
                    </td>

                    {/* Change */}
                    <td className={`py-3 px-3 font-bold ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isUp ? `+${stock.Change}` : stock.Change}
                    </td>

                    {/* Pct Change */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        isUp ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {isUp ? `+${stock.PctChange}%` : `${stock.PctChange}%`}
                      </span>
                    </td>

                    {/* High & Low */}
                    <td className="py-3 px-3 text-slate-700">NT$ {stock.HighestPrice || stock.ClosingPrice}</td>
                    <td className="py-3 px-3 text-slate-700">NT$ {stock.LowestPrice || stock.ClosingPrice}</td>

                    {/* Trade Volume */}
                    <td className="py-3 px-3 text-slate-600">
                      {Number(stock.TradeVolume).toLocaleString()} 股
                    </td>

                    {/* Inspect Link */}
                    <td className="py-3 px-4 text-right">
                      <button className="text-xs text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all border border-blue-200 inline-flex items-center gap-1 font-sans font-semibold">
                        <BarChart className="w-3.5 h-3.5" />
                        <span>K線蠟燭圖</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                  未找到符合「{searchTerm}」的股票資料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-mono">
        <span className="text-slate-500">
          顯示第 <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> 至 <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredStocks.length)}</strong> 筆標的 (共 {filteredStocks.length} 筆)
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 font-semibold rounded-lg">
            頁數 {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
