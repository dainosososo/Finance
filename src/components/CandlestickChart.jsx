import React, { useState, useRef, useMemo } from 'react';

/**
 * 專業級台股 Candlestick (K線蠟燭圖) 渲染組件
 * 支援:
 * - 陰陽燭實體 (紅漲綠跌, 台灣證券交易所規格)
 * - 上下影線 (最高價 High, 最低價 Low)
 * - 均線疊加 (MA5 藍色、MA20 橘黃色、MA60 紫色)
 * - 下方成交量量能柱 (Volume Sub-chart)
 * - 滑鼠十字準星 (Crosshair) 與即時 OHLC 數據讀取
 * - 所有價格皆標記新台幣 (NT$)
 */
export default function CandlestickChart({ 
  data = [], 
  height = 320, 
  isUp = true 
}) {
  const containerRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  // Compute price ranges & scales
  const chartMetrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    data.forEach(d => {
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
  }, [data]);

  if (!data || data.length === 0 || !chartMetrics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs font-mono">
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
  const paddingTop = 25;
  const volumeHeight = 55;
  const volumeGap = 15;
  const klineHeight = svgHeight - paddingTop - volumeHeight - volumeGap - 25; // bottom date axis

  const chartAreaWidth = svgWidth - paddingLeft - paddingRight;
  const barSpacing = chartAreaWidth / data.length;
  const candleWidth = Math.max(3, Math.min(18, barSpacing * 0.68));

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
  const ma5Points = data
    .map((d, i) => d.ma5 ? `${paddingLeft + (i + 0.5) * barSpacing},${getY(d.ma5)}` : null)
    .filter(Boolean)
    .join(' ');

  const ma20Points = data
    .map((d, i) => d.ma20 ? `${paddingLeft + (i + 0.5) * barSpacing},${getY(d.ma20)}` : null)
    .filter(Boolean)
    .join(' ');

  const ma60Points = data
    .map((d, i) => d.ma60 ? `${paddingLeft + (i + 0.5) * barSpacing},${getY(d.ma60)}` : null)
    .filter(Boolean)
    .join(' ');

  // Hovered item or last item as default
  const activeItem = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : data[data.length - 1];
  const itemIsUp = (activeItem?.close ?? activeItem?.price) >= (activeItem?.open ?? activeItem?.price);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * svgWidth - paddingLeft;
    const index = Math.floor(relativeX / barSpacing);
    if (index >= 0 && index < data.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Price ticks on Y-axis
  const priceTicks = [
    maxPrice,
    maxPrice * 0.75 + minPrice * 0.25,
    maxPrice * 0.5 + minPrice * 0.5,
    maxPrice * 0.25 + minPrice * 0.75,
    minPrice
  ];

  return (
    <div className="w-full flex flex-col select-none">
      {/* 1. Real-time OHLC Metric Bar */}
      <div className="flex flex-wrap items-center justify-between text-[11px] pb-2 px-1 border-b border-slate-200/80 mb-2 gap-y-1">
        <div className="flex items-center space-x-3 flex-wrap">
          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
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
            itemIsUp ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'
          }`}>
            {itemIsUp ? '▲ 紅K (多)' : '▼ 綠K (空)'}
          </span>
        </div>

        {/* MA Indicators Legend */}
        <div className="flex items-center space-x-3 font-mono text-[10px]">
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
          <span className="text-slate-500">
            量: {activeItem?.volume?.toLocaleString()} 張
          </span>
        </div>
      </div>

      {/* 2. Responsive Candlestick SVG Canvas */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full cursor-crosshair overflow-hidden"
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
                stroke="#E2E8F0" 
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text 
                x={svgWidth - paddingRight + 6} 
                y={getY(p) + 4} 
                fill="#64748B" 
                fontSize="10" 
                fontFamily="monospace"
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
            stroke="#CBD5E1" 
            strokeWidth="1"
          />
          <text 
            x={svgWidth - paddingRight + 6} 
            y={paddingTop + klineHeight + volumeGap + 10} 
            fill="#94A3B8" 
            fontSize="9" 
            fontFamily="monospace"
          >
            VOL(量)
          </text>

          {/* Candlestick Bars & Wicks */}
          {data.map((d, i) => {
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

            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

            const volY = getVolY(d.volume || 100);
            const volHeight = Math.max(2, (svgHeight - 25) - volY);

            return (
              <g key={i}>
                {/* 1. Upper & Lower Wick Line (影線) */}
                <line 
                  x1={x} 
                  y1={yHigh} 
                  x2={x} 
                  y2={yLow} 
                  stroke={candleColor} 
                  strokeWidth="1.5"
                />

                {/* 2. Candle Body (實體 K 棒) */}
                <rect 
                  x={x - candleWidth / 2} 
                  y={bodyTop} 
                  width={candleWidth} 
                  height={bodyHeight} 
                  fill={candleColor} 
                  stroke={candleColor}
                  strokeWidth="1"
                  rx="1"
                />

                {/* 3. Sub-chart Volume Bar */}
                <rect 
                  x={x - candleWidth / 2} 
                  y={volY} 
                  width={candleWidth} 
                  height={volHeight} 
                  fill={candleColor} 
                  opacity="0.65"
                  rx="1"
                />

                {/* X-axis Date/Time Labels for selected key intervals */}
                {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
                  <text 
                    x={x} 
                    y={svgHeight - 8} 
                    fill="#64748B" 
                    fontSize="10" 
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {d.time}
                  </text>
                )}
              </g>
            );
          })}

          {/* Overlay MA Lines */}
          {ma5Points && (
            <polyline 
              fill="none" 
              stroke="#2563EB" 
              strokeWidth="1.8" 
              points={ma5Points} 
              opacity="0.9"
            />
          )}
          {ma20Points && (
            <polyline 
              fill="none" 
              stroke="#D97706" 
              strokeWidth="1.8" 
              points={ma20Points} 
              opacity="0.9"
            />
          )}
          {ma60Points && (
            <polyline 
              fill="none" 
              stroke="#9333EA" 
              strokeWidth="1.8" 
              points={ma60Points} 
              opacity="0.9"
            />
          )}

          {/* Interactive Crosshair when Hovered */}
          {hoverIndex !== null && data[hoverIndex] && (
            <g>
              {/* Vertical Crosshair Line */}
              <line 
                x1={paddingLeft + (hoverIndex + 0.5) * barSpacing} 
                y1={paddingTop} 
                x2={paddingLeft + (hoverIndex + 0.5) * barSpacing} 
                y2={svgHeight - 25} 
                stroke="#64748B" 
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              {/* Horizontal Price Line */}
              <line 
                x1={paddingLeft} 
                y1={getY(data[hoverIndex].close ?? data[hoverIndex].price)} 
                x2={svgWidth - paddingRight} 
                y2={getY(data[hoverIndex].close ?? data[hoverIndex].price)} 
                stroke="#64748B" 
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              {/* Price Tag badge on Y-Axis */}
              <rect 
                x={svgWidth - paddingRight + 2} 
                y={getY(data[hoverIndex].close ?? data[hoverIndex].price) - 8} 
                width="60" 
                height="16" 
                fill="#0F172A" 
                rx="3"
              />
              <text 
                x={svgWidth - paddingRight + 6} 
                y={getY(data[hoverIndex].close ?? data[hoverIndex].price) + 4} 
                fill="#FFFFFF" 
                fontSize="9" 
                fontFamily="monospace"
                fontWeight="bold"
              >
                NT${(data[hoverIndex].close ?? data[hoverIndex].price).toFixed(1)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
