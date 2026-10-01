import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Sliders,
  Calendar,
  Maximize2
} from 'lucide-react';

/**
 * 專業級台股 Candlestick (K線蠟燭圖) 渲染組件
 * 支援:
 * - 陰陽燭實體 (紅漲綠跌, 台灣證券交易所規格)
 * - 上下影線 (最高價 High, 最低價 Low)
 * - 均線疊加 (MA5 藍色、MA20 橘黃色、MA60 紫色)
 * - 下方成交量量能柱 (Volume Sub-chart)
 * - 【自由縮放 (Free Zoom / Scale)】: 支援近20棒、40棒、60棒、120棒、全部(180棒)，以及即時拖曳滑桿與滾輪縮放
 * - 【歷史平移回溯 (Pan & Scroll)】: 支援查看更久遠歷史K棒，或一鍵回到最新當日
 * - 【櫻花粉 (Sakura Pink) 資訊區塊設計】: 提升層次與辨識度
 */
export default function CandlestickChart({ 
  data = [], 
  height = 340, 
  isUp = true 
}) {
  const containerRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  // 縮放設定: 預設顯示 40 棒，可自由在 12 ~ data.length 之間縮放
  const [zoomCount, setZoomCount] = useState(40);
  // 平移位移: 0 代表最右側 (最新當日)，正數代表往左回溯更早期的歷史
  const [panOffset, setPanOffset] = useState(0);

  // 當資料更動時，自動適配縮放上限
  useEffect(() => {
    if (data.length > 0) {
      setZoomCount(prev => Math.min(Math.max(15, prev), data.length));
      setPanOffset(0);
    }
  }, [data]);

  // 切割目前視窗可見的 K 棒子集 (Window Slicing)
  const currentWindow = useMemo(() => {
    if (!data || data.length === 0) return [];
    const total = data.length;
    const count = Math.min(zoomCount, total);
    // 計算起始與結束索引
    const end = Math.max(count, total - panOffset);
    const start = Math.max(0, end - count);
    return data.slice(start, end);
  }, [data, zoomCount, panOffset]);

  // 計算可見視窗的價格與成交量上下界 (動態自適應刻度)
  const chartMetrics = useMemo(() => {
    if (!currentWindow || currentWindow.length === 0) return null;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    currentWindow.forEach(d => {
      const low = d.low ?? d.price;
      const high = d.high ?? d.price;
      if (low < minPrice) minPrice = low;
      if (high > maxPrice) maxPrice = high;
      if (d.ma5 && d.ma5 < minPrice) minPrice = d.ma5;
      if (d.ma5 && d.ma5 > maxPrice) maxPrice = d.ma5;
      if (d.ma20 && d.ma20 < minPrice) minPrice = d.ma20;
      if (d.ma20 && d.ma20 > maxPrice) maxPrice = d.ma20;
      if (d.volume && d.volume > maxVol) maxVol = d.volume;
    });

    if (minPrice === maxPrice) {
      minPrice *= 0.98;
      maxPrice *= 1.02;
    }

    const pricePadding = (maxPrice - minPrice) * 0.08;
    minPrice = Math.max(0, minPrice - pricePadding);
    maxPrice = maxPrice + pricePadding;

    return { minPrice, maxPrice, maxVol };
  }, [currentWindow]);

  if (!data || data.length === 0 || !chartMetrics) {
    return (
      <div className="flex items-center justify-center h-64 text-rose-400 text-xs font-mono bg-[#fff5f7] rounded-xl border border-pink-200">
        尚無技術 K 線數據
      </div>
    );
  }

  const { minPrice, maxPrice, maxVol } = chartMetrics;

  // Layout measurements
  const svgWidth = 720;
  const svgHeight = height;
  const paddingLeft = 10;
  const paddingRight = 65; // for price axis
  const paddingTop = 20;
  const volumeHeight = 50;
  const volumeGap = 15;
  const klineHeight = svgHeight - paddingTop - volumeHeight - volumeGap - 25; // bottom date axis

  const chartAreaWidth = svgWidth - paddingLeft - paddingRight;
  const barSpacing = chartAreaWidth / currentWindow.length;
  const candleWidth = Math.max(2.5, Math.min(22, barSpacing * 0.68));

  // Coordinate mapping functions
  const getY = (price) => {
    if (maxPrice === minPrice) return paddingTop + klineHeight / 2;
    return paddingTop + klineHeight - ((price - minPrice) / (maxPrice - minPrice)) * klineHeight;
  };

  const getVolY = (vol) => {
    if (!maxVol) return svgHeight - 25;
    const volTop = paddingTop + klineHeight + volumeGap;
    return volTop + volumeHeight - (vol / maxVol) * volumeHeight;
  };

  // Generate MA polyline paths
  const ma5Points = currentWindow
    .map((d, i) => d.ma5 ? `${paddingLeft + (i + 0.5) * barSpacing},${getY(d.ma5)}` : null)
    .filter(Boolean)
    .join(' ');

  const ma20Points = currentWindow
    .map((d, i) => d.ma20 ? `${paddingLeft + (i + 0.5) * barSpacing},${getY(d.ma20)}` : null)
    .filter(Boolean)
    .join(' ');

  const ma60Points = currentWindow
    .map((d, i) => d.ma60 ? `${paddingLeft + (i + 0.5) * barSpacing},${getY(d.ma60)}` : null)
    .filter(Boolean)
    .join(' ');

  // Hovered item or last item as default
  const activeItem = hoverIndex !== null && currentWindow[hoverIndex] 
    ? currentWindow[hoverIndex] 
    : currentWindow[currentWindow.length - 1];
  const itemIsUp = (activeItem?.close ?? activeItem?.price) >= (activeItem?.open ?? activeItem?.price);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * svgWidth - paddingLeft;
    const index = Math.floor(relativeX / barSpacing);
    if (index >= 0 && index < currentWindow.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // 滾輪縮放 (Wheel Zoom)
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // 放大 (看更少棒數)
      setZoomCount(prev => Math.max(12, prev - 5));
    } else {
      // 縮小 (看更多棒數)
      setZoomCount(prev => Math.min(data.length, prev + 5));
    }
  };

  // 縮放控制函數
  const zoomIn = () => setZoomCount(prev => Math.max(15, prev - 10));
  const zoomOut = () => setZoomCount(prev => Math.min(data.length, prev + 15));
  const setPresetBars = (count) => {
    setZoomCount(Math.min(count, data.length));
    setPanOffset(0);
  };

  // 平移控制
  const panLeft = () => {
    setPanOffset(prev => Math.min(data.length - zoomCount, prev + 10));
  };
  const panRight = () => {
    setPanOffset(prev => Math.max(0, prev - 10));
  };
  const resetToLatest = () => {
    setPanOffset(0);
  };

  // Price ticks on Y-axis
  const priceTicks = [
    maxPrice,
    maxPrice * 0.75 + minPrice * 0.25,
    maxPrice * 0.5 + minPrice * 0.5,
    maxPrice * 0.25 + minPrice * 0.75,
    minPrice
  ];

  // 均勻選取 5 個時間標籤
  const dateStep = Math.max(1, Math.floor(currentWindow.length / 5));
  const dateLabelIndices = [0, dateStep, dateStep * 2, dateStep * 3, currentWindow.length - 1];

  const maxPan = Math.max(0, data.length - zoomCount);

  return (
    <div className="w-full flex flex-col select-none space-y-3">
      {/* 1. 頂部自由縮放與平移工具列 (櫻花粉精緻風格) */}
      <div className="bg-[#fff0f3] p-2.5 rounded-2xl border border-pink-200/90 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-xs">
        {/* 縮放棒數快捷按鈕 */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 font-sans">
            <Sliders className="w-3.5 h-3.5" />
            天數縮放:
          </span>
          {[
            { label: '20棒', count: 20 },
            { label: '40棒', count: 40 },
            { label: '60棒 (季)', count: 60 },
            { label: '120棒 (半年)', count: 120 },
            { label: `全部 (${data.length}棒)`, count: data.length }
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => setPresetBars(preset.count)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                zoomCount === preset.count
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white/90 text-rose-800 hover:bg-rose-100/80 border border-pink-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* 自由縮放微調與平移回溯控制 */}
        <div className="flex items-center space-x-2">
          {/* Zoom In / Out Buttons */}
          <div className="flex items-center bg-white/90 rounded-xl p-0.5 border border-pink-200 shadow-2xs">
            <button
              onClick={zoomIn}
              className="p-1.5 hover:bg-rose-50 text-rose-700 rounded-lg transition"
              title="放大 (查看更少棒數，細節更清晰)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-rose-900 px-1.5">
              {currentWindow.length} 棒
            </span>
            <button
              onClick={zoomOut}
              className="p-1.5 hover:bg-rose-50 text-rose-700 rounded-lg transition"
              title="縮小 (查看更久之前更多棒數)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Pan History Controls (若總棒數大於可見棒數) */}
          {maxPan > 0 && (
            <div className="flex items-center space-x-1 bg-white/90 rounded-xl p-0.5 border border-pink-200">
              <button
                onClick={panLeft}
                disabled={panOffset >= maxPan}
                className="px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-40 rounded-lg transition flex items-center gap-0.5"
                title="往左回溯更早之前的K線"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>看更早</span>
              </button>
              
              {panOffset > 0 && (
                <button
                  onClick={resetToLatest}
                  className="px-2 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-2xs"
                  title="一鍵回到最新當日"
                >
                  回到最新
                </button>
              )}

              <button
                onClick={panRight}
                disabled={panOffset <= 0}
                className="px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-40 rounded-lg transition flex items-center gap-0.5"
                title="往右移至較新K線"
              >
                <span>往後</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. 即時 OHLC 數據讀取列 (櫻花粉淺色卡片) */}
      <div className="bg-[#fff5f7] p-2.5 rounded-2xl border border-pink-200 flex flex-wrap items-center justify-between text-[11px] gap-y-1">
        <div className="flex items-center space-x-2.5 flex-wrap">
          <span className="font-mono font-bold text-rose-900 bg-rose-100/80 px-2 py-0.5 rounded border border-pink-200">
            {activeItem?.time}
          </span>
          <div className="flex items-center space-x-2 font-mono">
            <span>開: <strong className="text-slate-800">NT$ {activeItem?.open ?? activeItem?.price}</strong></span>
            <span>高: <strong className="text-red-600">NT$ {activeItem?.high ?? activeItem?.price}</strong></span>
            <span>低: <strong className="text-emerald-600">NT$ {activeItem?.low ?? activeItem?.price}</strong></span>
            <span>收: <strong className={itemIsUp ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
              NT$ {activeItem?.close ?? activeItem?.price}
            </strong></span>
          </div>
          <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
            itemIsUp ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
          }`}>
            {itemIsUp ? '▲ 紅K (多)' : '▼ 綠K (空)'}
          </span>
        </div>

        {/* MA 均線標示 */}
        <div className="flex items-center space-x-2.5 font-mono text-[10px]">
          {activeItem?.ma5 && (
            <span className="text-blue-600 flex items-center gap-1 font-semibold">
              <span className="w-2 h-0.5 bg-blue-600 inline-block"></span>
              MA5: NT$ {activeItem.ma5}
            </span>
          )}
          {activeItem?.ma20 && (
            <span className="text-amber-600 flex items-center gap-1 font-semibold">
              <span className="w-2 h-0.5 bg-amber-600 inline-block"></span>
              MA20: NT$ {activeItem.ma20}
            </span>
          )}
          {activeItem?.ma60 && (
            <span className="text-purple-600 flex items-center gap-1 font-semibold">
              <span className="w-2 h-0.5 bg-purple-600 inline-block"></span>
              MA60: NT$ {activeItem.ma60}
            </span>
          )}
          <span className="text-slate-600">
            量: {activeItem?.volume?.toLocaleString()} 張
          </span>
        </div>
      </div>

      {/* 3. 響應式 K 線 SVG 畫布 */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className="relative w-full cursor-crosshair overflow-hidden bg-white rounded-2xl border border-pink-200/90 p-2 shadow-xs"
        title="可直接使用滑鼠滾輪自由縮放查看更長天數"
      >
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto max-h-[380px] overflow-visible"
        >
          {/* Background Grid Lines */}
          {priceTicks.map((p, idx) => (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={getY(p)} 
                x2={svgWidth - paddingRight} 
                y2={getY(p)} 
                stroke="#FCE7F3" 
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text 
                x={svgWidth - paddingRight + 6} 
                y={getY(p) + 4} 
                fill="#831843" 
                fontSize="10" 
                fontFamily="monospace"
                fontWeight="500"
              >
                NT${p >= 100 ? p.toFixed(0) : p.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Volume Baseline Separator */}
          <line 
            x1={paddingLeft} 
            y1={paddingTop + klineHeight + volumeGap - 4} 
            x2={svgWidth - paddingRight} 
            y2={paddingTop + klineHeight + volumeGap - 4} 
            stroke="#FBCFE8" 
            strokeWidth="1"
          />
          <text 
            x={svgWidth - paddingRight + 6} 
            y={paddingTop + klineHeight + volumeGap + 10} 
            fill="#9D174D" 
            fontSize="9" 
            fontFamily="monospace"
            fontWeight="bold"
          >
            VOL(量)
          </text>

          {/* Candlestick Bars & Wicks */}
          {currentWindow.map((d, i) => {
            const x = paddingLeft + (i + 0.5) * barSpacing;
            const open = d.open ?? d.price;
            const high = d.high ?? d.price;
            const low = d.low ?? d.price;
            const close = d.close ?? d.price;

            const candleUp = close >= open;
            const candleColor = candleUp ? '#DC2626' : '#16A34A'; // Taiwan Stock Red/Green
            const yHigh = getY(high);
            const yLow = getY(low);
            const yOpen = getY(open);
            const yClose = getY(close);

            const candleTop = Math.min(yOpen, yClose);
            const candleHeight = Math.max(2, Math.abs(yClose - yOpen));

            const isHovered = hoverIndex === i;

            return (
              <g key={i} className="transition-opacity">
                {/* Upper & Lower Wick */}
                <line 
                  x1={x} 
                  y1={yHigh} 
                  x2={x} 
                  y2={yLow} 
                  stroke={candleColor} 
                  strokeWidth={isHovered ? '2' : '1.2'} 
                />

                {/* Candle Body */}
                <rect 
                  x={x - candleWidth / 2} 
                  y={candleTop} 
                  width={candleWidth} 
                  height={candleHeight} 
                  fill={candleColor} 
                  rx="1"
                  className={isHovered ? 'filter drop-shadow-sm' : ''}
                />

                {/* Volume Bar */}
                {d.volume && (
                  <rect 
                    x={x - candleWidth / 2} 
                    y={getVolY(d.volume)} 
                    width={candleWidth} 
                    height={svgHeight - 25 - getVolY(d.volume)} 
                    fill={candleUp ? '#F87171' : '#4ADE80'} 
                    opacity={isHovered ? '1' : '0.75'}
                    rx="0.5"
                  />
                )}
              </g>
            );
          })}

          {/* Overlay MA Lines */}
          {ma5Points && (
            <polyline 
              fill="none" 
              stroke="#2563EB" 
              strokeWidth="1.6" 
              points={ma5Points} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}
          {ma20Points && (
            <polyline 
              fill="none" 
              stroke="#D97706" 
              strokeWidth="1.6" 
              points={ma20Points} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}
          {ma60Points && (
            <polyline 
              fill="none" 
              stroke="#7C3AED" 
              strokeWidth="1.6" 
              points={ma60Points} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Crosshair on Hover */}
          {hoverIndex !== null && currentWindow[hoverIndex] && (
            <g pointerEvents="none">
              <line 
                x1={paddingLeft + (hoverIndex + 0.5) * barSpacing} 
                y1={paddingTop} 
                x2={paddingLeft + (hoverIndex + 0.5) * barSpacing} 
                y2={svgHeight - 25} 
                stroke="#BE185D" 
                strokeDasharray="2 2" 
                strokeWidth="1" 
              />
              <line 
                x1={paddingLeft} 
                y1={getY(currentWindow[hoverIndex].close ?? currentWindow[hoverIndex].price)} 
                x2={svgWidth - paddingRight} 
                y2={getY(currentWindow[hoverIndex].close ?? currentWindow[hoverIndex].price)} 
                stroke="#BE185D" 
                strokeDasharray="2 2" 
                strokeWidth="1" 
              />
            </g>
          )}

          {/* Bottom X-axis Date Labels */}
          {dateLabelIndices.map((idx) => {
            const item = currentWindow[idx];
            if (!item) return null;
            const x = paddingLeft + (idx + 0.5) * barSpacing;
            return (
              <text 
                key={idx} 
                x={x} 
                y={svgHeight - 8} 
                textAnchor="middle" 
                fill="#9D174D" 
                fontSize="10" 
                fontFamily="monospace"
                fontWeight="600"
              >
                {item.time?.split(' ')[0] || item.rawDate}
              </text>
            );
          })}
        </svg>

        {/* 提示訊息 */}
        <div className="flex justify-between items-center text-[10px] text-pink-700/80 px-2 pt-1 font-mono">
          <span>支援滾輪縮放與按鈕拖曳</span>
          <span>
            當前視窗: {currentWindow[0]?.time} ~ {currentWindow[currentWindow.length - 1]?.time}
          </span>
        </div>
      </div>
    </div>
  );
}
