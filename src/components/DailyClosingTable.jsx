import React, { useState, useMemo } from 'react';
import { Database, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Search, BarChart, ExternalLink } from 'lucide-react';

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
    <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              台灣證交所 每日收盤價數據庫
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                共 {dailyStocks.length} 檔標的
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">每日即時彙整成交股數、最高價、最低價與收盤漲跌數據</p>
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
              className="bg-dark-900 text-xs text-white placeholder-gray-500 pl-8 pr-3 py-2 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 w-44"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Sector Dropdown */}
          <div className="flex items-center space-x-1.5 bg-dark-900 border border-gray-700 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-dark-800">全部產業類別</option>
              {sectors.filter(s => s !== 'ALL').map(sec => (
                <option key={sec} value={sec} className="bg-dark-800">{sec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm font-sans">
          <thead>
            <tr className="bg-dark-900/90 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800 font-mono">
              <th className="py-3.5 px-4 font-semibold">股票代碼 / 名稱</th>
              <th className="py-3.5 px-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('ClosingPrice')}>
                <div className="flex items-center gap-1">
                  <span>收盤價</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500" />
                </div>
              </th>
              <th className="py-3.5 px-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('Change')}>
                <div className="flex items-center gap-1">
                  <span>漲跌</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500" />
                </div>
              </th>
              <th className="py-3.5 px-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('PctChange')}>
                <div className="flex items-center gap-1">
                  <span>漲跌幅</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500" />
                </div>
              </th>
              <th className="py-3.5 px-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('HighestPrice')}>
                <div className="flex items-center gap-1">
                  <span>最高價</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500" />
                </div>
              </th>
              <th className="py-3.5 px-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('LowestPrice')}>
                <div className="flex items-center gap-1">
                  <span>最低價</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500" />
                </div>
              </th>
              <th className="py-3.5 px-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('TradeVolume')}>
                <div className="flex items-center gap-1">
                  <span>成交股數</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right font-semibold">分析線圖</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-mono">
            {currentStocks.length > 0 ? (
              currentStocks.map((stock) => {
                const changeVal = parseFloat(stock.Change || 0);
                const isUp = changeVal >= 0;
                const isLimitUp = parseFloat(stock.PctChange || 0) >= 9.5;

                return (
                  <tr
                    key={stock.Code}
                    onClick={() => onSelectStock(stock)}
                    className="hover:bg-blue-900/10 cursor-pointer transition-colors group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {stock.Code}
                        </span>
                        <div>
                          <span className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                            {stock.Name}
                          </span>
                          <span className="text-[10px] text-gray-500 block">{stock.Sector || '台股'}</span>
                        </div>
                        {isLimitUp && (
                          <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.2 rounded animate-pulse">
                            漲停
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Closing Price */}
                    <td className="py-3 px-3 font-bold text-gray-100">
                      ${stock.ClosingPrice}
                    </td>

                    {/* Change */}
                    <td className={`py-3 px-3 font-bold ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isUp ? `+${stock.Change}` : stock.Change}
                    </td>

                    {/* Pct Change */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        isUp ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isUp ? `+${stock.PctChange}%` : `${stock.PctChange}%`}
                      </span>
                    </td>

                    {/* High & Low */}
                    <td className="py-3 px-3 text-gray-300">${stock.HighestPrice || stock.ClosingPrice}</td>
                    <td className="py-3 px-3 text-gray-300">${stock.LowestPrice || stock.ClosingPrice}</td>

                    {/* Trade Volume */}
                    <td className="py-3 px-3 text-gray-300">
                      {Number(stock.TradeVolume).toLocaleString()} 股
                    </td>

                    {/* Inspect Link */}
                    <td className="py-3 px-4 text-right">
                      <button className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg transition-all border border-blue-500/30 inline-flex items-center gap-1 font-sans">
                        <BarChart className="w-3.5 h-3.5" />
                        <span>K線走勢</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="py-10 text-center text-gray-500 text-xs">
                  未找到符合「{searchTerm}」的股票資料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-800 text-xs font-mono">
        <span className="text-gray-400">
          顯示第 <strong className="text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> 至 <strong className="text-white">{Math.min(currentPage * itemsPerPage, filteredStocks.length)}</strong> 筆標的 (共 {filteredStocks.length} 筆)
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 bg-dark-900 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-1 bg-dark-900 border border-gray-700 text-gray-200 rounded-lg">
            頁數 {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 bg-dark-900 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
