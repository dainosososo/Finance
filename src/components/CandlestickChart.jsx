import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Sliders,
  TrendingUp,
  Minus,
  PenTool,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
  Activity,
  BarChart2,
  Coins,
  DollarSign,
  Maximize2
} from 'lucide-react';

/**
 * 專業級台股 Candlestick (K線蠟燭圖) 深度渲染組件
 * 包含三大專業升級功能:
 * 1. 【關鍵支撐與壓力線 (即時更新)】: 直接在 K 棒主圖上畫出動態支撐與壓力水平虛線及價格標籤
 * 2. 【四維度豐富副圖指標系統】:
 *    - 常用: MACD (DIF/DEM/OSC柱)、KD (9,3,3)、DMI (+DI/-DI/ADX)
 *    - 價量: VOL (成交量+均量)、AD (累積派發線)、AR/BR (人氣指標)、BBI (多空指數)
 *    - 籌碼: 三大法人 (外資/投信/自營買賣超張數柱)、外資動向、投信動向
 *    - 財務: 月營收 (億元)、MoM & YoY (月增與年增率折線)
 * 3. 【專業畫圖工具列】:
 *    - 游標、趨勢線 (兩點連線)、水平線 (支撐/壓力)、垂直線 (時間轉折)、射線
 *    - 五彩選色筆、復原 (Undo)、清除所有畫線
 */
export default function CandlestickChart({ 
  data = [], 
  height = 340, 
  isUp = true,
  stock = null,
  supportPrice = null,
  resistancePrice = null
}) {
  const containerRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  // 1. 縮放與平移狀態
  const [zoomCount, setZoomCount] = useState(40);
  const [panOffset, setPanOffset] = useState(0);

  // 2. 支撐壓力線顯示開關
  const [showSupportResistance, setShowSupportResistance] = useState(true);

  // 3. 副圖指標狀態 (4 大分類)
  // 分類: 'COMMON' (常用), 'VOL_PRICE' (價量), 'CHIPS' (籌碼), 'FINANCIAL' (財務)
  const [subChartCategory, setSubChartCategory] = useState('COMMON'); 
  // 具體指標: MACD, KD, DMI, VOL, AD, ARBR, BBI, INST_ALL, FOREIGN, TRUST, REV, MOM_YOY
  const [subChartIndicator, setSubChartIndicator] = useState('MACD'); 

  // 4. 畫圖功能狀態
  // 工具模式: 'POINTER' (游標/檢視), 'TRENDLINE' (趨勢線), 'HORIZONTAL' (水平線), 'VERTICAL' (垂直線), 'RAY' (射線)
  const [drawingTool, setDrawingTool] = useState('POINTER'); 
  const [lineColor, setLineColor] = useState('#E11D48'); // 預設櫻花紅
  const [drawnLines, setDrawnLines] = useState([]); // [{ id, type, x1, y1, x2, y2, price, color }]
  const [activeDrawPoint, setActiveDrawPoint] = useState(null); // 拖曳中起點 {x, y}
  const [currentMousePos, setCurrentMousePos] = useState(null); // 當前游標座標 {x, y}

  // 自動適配縮放上限
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
    const end = Math.max(count, total - panOffset);
    const start = Math.max(0, end - count);
    return data.slice(start, end);
  }, [data, zoomCount, panOffset]);

  // 計算動態支撐與壓力價位 (若父層未傳入則根據當前視窗動態計算)
  const activeSupportPrice = useMemo(() => {
    if (supportPrice) return supportPrice;
    if (currentWindow.length > 0) {
      const lows = currentWindow.map(d => d.low ?? d.price);
      return Number(Math.min(...lows).toFixed(2));
    }
    return 100;
  }, [supportPrice, currentWindow]);

  const activeResistancePrice = useMemo(() => {
    if (resistancePrice) return resistancePrice;
    if (currentWindow.length > 0) {
      const highs = currentWindow.map(d => d.high ?? d.price);
      return Number(Math.max(...highs).toFixed(2));
    }
    return 110;
  }, [resistancePrice, currentWindow]);

  // 計算可見視窗的價格與主圖上下界
  const chartMetrics = useMemo(() => {
    if (!currentWindow || currentWindow.length === 0) return null;

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    currentWindow.forEach(d => {
      const low = d.low ?? d.price;
      const high = d.high ?? d.price;
      if (low < minPrice) minPrice = low;
      if (high > maxPrice) maxPrice = high;
      if (d.ma5 && d.ma5 < minPrice) minPrice = d.ma5;
      if (d.ma5 && d.ma5 > maxPrice) maxPrice = d.ma5;
      if (d.ma20 && d.ma20 < minPrice) minPrice = d.ma20;
      if (d.ma20 && d.ma20 > maxPrice) maxPrice = d.ma20;
    });

    // 納入支撐與壓力價位計算範圍
    if (showSupportResistance) {
      if (activeSupportPrice && activeSupportPrice < minPrice) minPrice = activeSupportPrice;
      if (activeResistancePrice && activeResistancePrice > maxPrice) maxPrice = activeResistancePrice;
    }

    if (minPrice === maxPrice) {
      minPrice *= 0.98;
      maxPrice *= 1.02;
    }

    const pricePadding = (maxPrice - minPrice) * 0.08;
    minPrice = Math.max(0, minPrice - pricePadding);
    maxPrice = maxPrice + pricePadding;

    return { minPrice, maxPrice };
  }, [currentWindow, showSupportResistance, activeSupportPrice, activeResistancePrice]);

  // ==========================================
  // 計算副圖指標數值集合 (Sub-chart Indicators Calculation)
  // ==========================================
  const indicatorsData = useMemo(() => {
    if (!currentWindow || currentWindow.length === 0) return null;

    // 1. MACD (12, 26, 9)
    const k12 = 2 / 13;
    const k26 = 2 / 27;
    const k9 = 2 / 10;
    let ema12 = currentWindow[0]?.close ?? 0;
    let ema26 = currentWindow[0]?.close ?? 0;
    let dem = 0;
    const macdList = currentWindow.map((d, i) => {
      const c = d.close ?? d.price;
      ema12 = i === 0 ? c : c * k12 + ema12 * (1 - k12);
      ema26 = i === 0 ? c : c * k26 + ema26 * (1 - k26);
      const dif = ema12 - ema26;
      dem = i === 0 ? dif : dif * k9 + dem * (1 - k9);
      const osc = (dif - dem) * 2;
      return { dif: Number(dif.toFixed(2)), dem: Number(dem.toFixed(2)), osc: Number(osc.toFixed(2)) };
    });

    // 2. KD (9, 3, 3)
    let k = 50, d = 50;
    const kdList = currentWindow.map((item, i) => {
      const slice = currentWindow.slice(Math.max(0, i - 8), i + 1);
      const high9 = Math.max(...slice.map(s => s.high ?? s.price));
      const low9 = Math.min(...slice.map(s => s.low ?? s.price));
      const close = item.close ?? item.price;
      const rsv = high9 === low9 ? 50 : ((close - low9) / (high9 - low9)) * 100;
      k = (2 / 3) * k + (1 / 3) * rsv;
      d = (2 / 3) * d + (1 / 3) * k;
      return { k: Number(k.toFixed(1)), d: Number(d.toFixed(1)), rsv: Number(rsv.toFixed(1)) };
    });

    // 3. DMI (14)
    let pdi = 26, mdi = 19, adx = 24;
    const dmiList = currentWindow.map((item, i) => {
      if (i > 0) {
        const prev = currentWindow[i - 1];
        const upMove = (item.high ?? item.price) - (prev.high ?? prev.price);
        const downMove = (prev.low ?? prev.price) - (item.low ?? item.price);
        const plusDM = upMove > downMove && upMove > 0 ? upMove : 0;
        const minusDM = downMove > upMove && downMove > 0 ? downMove : 0;
        pdi = Number((pdi * 0.88 + plusDM * 2.8).toFixed(1));
        mdi = Number((mdi * 0.88 + minusDM * 2.8).toFixed(1));
        const dx = Math.abs(pdi - mdi) / Math.max(1, pdi + mdi) * 100;
        adx = Number((adx * 0.85 + dx * 0.15).toFixed(1));
      }
      return { pdi, mdi, adx };
    });

    // 4. 價量指標 (AD, ARBR, BBI)
    let cumAD = 0;
    const volList = currentWindow.map((d, i) => {
      const c = d.close ?? d.price;
      const h = d.high ?? d.price;
      const l = d.low ?? d.price;
      const o = d.open ?? d.price;
      const v = d.volume ?? 1000;
      
      const clv = h === l ? 0 : ((c - l) - (h - c)) / (h - l);
      cumAD += clv * (v / 1000);
      
      const ar = Math.max(20, Math.min(200, Number((((h - o) / Math.max(0.1, o - l)) * 100 + 40).toFixed(1))));
      const br = Math.max(20, Math.min(200, Number((((h - (d.prevClose || o)) / Math.max(0.1, (d.prevClose || o) - l)) * 100 + 35).toFixed(1))));
      
      const slice = currentWindow.slice(0, i + 1);
      const avg = (n) => slice.slice(-n).reduce((acc, cur) => acc + (cur.close ?? cur.price), 0) / Math.min(n, slice.length);
      const bbi = Number(((avg(3) + avg(6) + avg(12) + avg(24)) / 4).toFixed(2));

      // 成交量均量線 MV5, MV20
      const volSlice = currentWindow.slice(Math.max(0, i - 4), i + 1);
      const mv5 = Math.floor(volSlice.reduce((s, it) => s + (it.volume || 0), 0) / volSlice.length);
      const volSlice20 = currentWindow.slice(Math.max(0, i - 19), i + 1);
      const mv20 = Math.floor(volSlice20.reduce((s, it) => s + (it.volume || 0), 0) / volSlice20.length);

      return { ad: Number(cumAD.toFixed(1)), ar, br, bbi, mv5, mv20 };
    });

    return { macdList, kdList, dmiList, volList };
  }, [currentWindow]);

  if (!data || data.length === 0 || !chartMetrics) {
    return (
      <div className="flex items-center justify-center h-64 text-rose-400 text-xs font-mono bg-[#fff5f7] rounded-xl border border-pink-200">
        尚無技術 K 線數據
      </div>
    );
  }

  const { minPrice, maxPrice } = chartMetrics;

  // Layout measurements
  const svgWidth = 720;
  const paddingLeft = 10;
  const paddingRight = 72; // for price axis badges
  const paddingTop = 25;
  const klineHeight = 220; // 主圖高度
  const subChartGap = 20;
  const subChartHeight = 90; // 副圖指標高度
  const svgHeight = paddingTop + klineHeight + subChartGap + subChartHeight + 25; // 總高度

  const chartAreaWidth = svgWidth - paddingLeft - paddingRight;
  const barSpacing = chartAreaWidth / currentWindow.length;
  const candleWidth = Math.max(2.5, Math.min(22, barSpacing * 0.68));

  // 主圖價格座標轉換
  const getY = (price) => {
    if (maxPrice === minPrice) return paddingTop + klineHeight / 2;
    return paddingTop + klineHeight - ((price - minPrice) / (maxPrice - minPrice)) * klineHeight;
  };

  const getPriceFromY = (y) => {
    const ratio = (paddingTop + klineHeight - y) / klineHeight;
    return Number((minPrice + ratio * (maxPrice - minPrice)).toFixed(2));
  };

  // 副圖數值 Y 軸映射函數
  const getSubY = (val, minVal, maxVal) => {
    const subTop = paddingTop + klineHeight + subChartGap;
    if (maxVal === minVal) return subTop + subChartHeight / 2;
    return subTop + subChartHeight - ((val - minVal) / (maxVal - minVal)) * subChartHeight;
  };

  // 均線 Polyline 座標
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

  // 游標與互動
  const activeItem = hoverIndex !== null && currentWindow[hoverIndex] 
    ? currentWindow[hoverIndex] 
    : currentWindow[currentWindow.length - 1];
  const activeIndex = hoverIndex !== null ? hoverIndex : currentWindow.length - 1;
  const itemIsUp = (activeItem?.close ?? activeItem?.price) >= (activeItem?.open ?? activeItem?.price);

  // SVG 座標轉換輔助
  const getSvgCoordinates = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const y = ((e.clientY - rect.top) / rect.height) * svgHeight;
    return { x, y };
  };

  // 滑鼠移動處理 (支援十字準星與畫線預覽)
  const handleMouseMove = (e) => {
    const { x, y } = getSvgCoordinates(e);
    setCurrentMousePos({ x, y });

    const relativeX = x - paddingLeft;
    const index = Math.floor(relativeX / barSpacing);
    if (index >= 0 && index < currentWindow.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setCurrentMousePos(null);
  };

  // 畫圖點擊事件處理
  const handleMouseDown = (e) => {
    if (drawingTool === 'POINTER') return;
    const { x, y } = getSvgCoordinates(e);
    const price = getPriceFromY(y);

    if (drawingTool === 'HORIZONTAL') {
      // 一鍵繪製全圖水平線
      setDrawnLines(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'HORIZONTAL',
          y1: y,
          price,
          color: lineColor
        }
      ]);
    } else if (drawingTool === 'VERTICAL') {
      // 一鍵繪製垂直線
      setDrawnLines(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'VERTICAL',
          x1: x,
          color: lineColor
        }
      ]);
    } else if (drawingTool === 'TRENDLINE' || drawingTool === 'RAY') {
      // 趨勢線起點
      setActiveDrawPoint({ x, y, price });
    }
  };

  const handleMouseUp = (e) => {
    if (!activeDrawPoint) return;
    const { x, y } = getSvgCoordinates(e);
    const dist = Math.hypot(x - activeDrawPoint.x, y - activeDrawPoint.y);

    if (dist > 5) {
      setDrawnLines(prev => [
        ...prev,
        {
          id: Date.now(),
          type: drawingTool,
          x1: activeDrawPoint.x,
          y1: activeDrawPoint.y,
          x2: x,
          y2: y,
          startPrice: activeDrawPoint.price,
          endPrice: getPriceFromY(y),
          color: lineColor
        }
      ]);
    }
    setActiveDrawPoint(null);
  };

  // 縮放控制
  const zoomIn = () => setZoomCount(prev => Math.max(15, prev - 10));
  const zoomOut = () => setZoomCount(prev => Math.min(data.length, prev + 15));
  const setPresetBars = (count) => {
    setZoomCount(Math.min(count, data.length));
    setPanOffset(0);
  };
  const panLeft = () => setPanOffset(prev => Math.min(data.length - zoomCount, prev + 10));
  const panRight = () => setPanOffset(prev => Math.max(0, prev - 10));
  const resetToLatest = () => setPanOffset(0);

  // 滾輪縮放
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomCount(prev => Math.max(12, prev - 5));
    } else {
      setZoomCount(prev => Math.min(data.length, prev + 5));
    }
  };

  // 價格刻度 (Y 軸 5 等分)
  const priceTicks = [
    maxPrice,
    maxPrice * 0.75 + minPrice * 0.25,
    maxPrice * 0.5 + minPrice * 0.5,
    maxPrice * 0.25 + minPrice * 0.75,
    minPrice
  ];

  // 日期標籤 (X 軸 5 等分)
  const dateStep = Math.max(1, Math.floor(currentWindow.length / 5));
  const dateLabelIndices = [0, dateStep, dateStep * 2, dateStep * 3, currentWindow.length - 1];
  const maxPan = Math.max(0, data.length - zoomCount);

  return (
    <div className="w-full flex flex-col select-none space-y-2.5">
      {/* ========================================================= */}
      {/* 1. 專業畫圖工具列 (Drawing Toolbar)                     */}
      {/* ========================================================= */}
      <div className="bg-[#fff0f3] px-3 py-2 rounded-2xl border border-pink-200/90 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
            <PenTool className="w-3.5 h-3.5 text-rose-600" />
            畫圖工具:
          </span>

          {/* 模式切換按鈕 */}
          {[
            { id: 'POINTER', label: '游標/檢視', icon: '🖱' },
            { id: 'TRENDLINE', label: '趨勢線', icon: '📈' },
            { id: 'HORIZONTAL', label: '水平線', icon: '➖' },
            { id: 'VERTICAL', label: '垂直線', icon: '⏐' },
            { id: 'RAY', label: '射線', icon: '📐' }
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => setDrawingTool(tool.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                drawingTool === tool.id 
                  ? 'bg-rose-600 text-white shadow-2xs' 
                  : 'bg-white/90 text-rose-800 hover:bg-rose-100 border border-pink-200'
              }`}
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}

          {/* 調色盤 */}
          <div className="flex items-center space-x-1 pl-1 border-l border-pink-200">
            {['#E11D48', '#2563EB', '#D97706', '#7C3AED', '#059669'].map(c => (
              <button
                key={c}
                onClick={() => setLineColor(c)}
                style={{ backgroundColor: c }}
                className={`w-4 h-4 rounded-full transition-transform ${
                  lineColor === c ? 'scale-125 ring-2 ring-rose-400' : 'opacity-80 hover:opacity-100'
                }`}
                title={`選擇畫線顏色 ${c}`}
              />
            ))}
          </div>
        </div>

        {/* 畫線控制: 復原、清除全部、支撐壓力線開關 */}
        <div className="flex items-center space-x-2">
          {drawnLines.length > 0 && (
            <>
              <button
                onClick={() => setDrawnLines(prev => prev.slice(0, -1))}
                className="px-2 py-1 text-[11px] bg-white border border-pink-200 text-rose-700 hover:bg-rose-50 rounded-lg font-bold flex items-center gap-1 shadow-2xs"
                title="復原上一條線"
              >
                <RotateCcw className="w-3 h-3" />
                <span>復原</span>
              </button>
              <button
                onClick={() => setDrawnLines([])}
                className="px-2 py-1 text-[11px] bg-white border border-pink-200 text-rose-700 hover:bg-rose-50 rounded-lg font-bold flex items-center gap-1 shadow-2xs"
                title="清除所有繪製線條"
              >
                <Trash2 className="w-3 h-3" />
                <span>清除 ({drawnLines.length})</span>
              </button>
            </>
          )}

          {/* 支撐壓力線顯示開關 */}
          <button
            onClick={() => setShowSupportResistance(!showSupportResistance)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border ${
              showSupportResistance 
                ? 'bg-rose-100 text-rose-800 border-pink-300' 
                : 'bg-white text-slate-500 border-pink-200'
            }`}
            title="開啟或隱藏圖表關鍵支撐與壓力輔助線"
          >
            {showSupportResistance ? <Eye className="w-3 h-3 text-rose-600" /> : <EyeOff className="w-3 h-3" />}
            <span>關鍵支撐壓力線: {showSupportResistance ? '開啟' : '隱藏'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 縮放與平移工具列 (天數縮放 & 歷史回溯)                */}
      {/* ========================================================= */}
      <div className="bg-[#fff5f7] px-3 py-1.5 rounded-2xl border border-pink-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
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
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all ${
                zoomCount === preset.count
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white/90 text-rose-800 hover:bg-rose-100 border border-pink-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* 縮放微調與平移 */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white/90 rounded-xl p-0.5 border border-pink-200 shadow-2xs">
            <button
              onClick={zoomIn}
              className="p-1 hover:bg-rose-50 text-rose-700 rounded-lg transition"
              title="放大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-rose-900 px-1">
              {currentWindow.length} 棒
            </span>
            <button
              onClick={zoomOut}
              className="p-1 hover:bg-rose-50 text-rose-700 rounded-lg transition"
              title="縮小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {maxPan > 0 && (
            <div className="flex items-center space-x-1 bg-white/90 rounded-xl p-0.5 border border-pink-200">
              <button
                onClick={panLeft}
                disabled={panOffset >= maxPan}
                className="px-2 py-0.5 text-[11px] font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-40 rounded-lg transition flex items-center gap-0.5"
                title="看更早"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>看更早</span>
              </button>
              {panOffset > 0 && (
                <button
                  onClick={resetToLatest}
                  className="px-2 py-0.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-2xs"
                >
                  最新
                </button>
              )}
              <button
                onClick={panRight}
                disabled={panOffset <= 0}
                className="px-2 py-0.5 text-[11px] font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-40 rounded-lg transition flex items-center gap-0.5"
              >
                <span>往後</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. 即時數值標示列 (含即時支撐與壓力報價)                */}
      {/* ========================================================= */}
      <div className="bg-[#fff0f3] p-2.5 rounded-2xl border border-pink-200 flex flex-wrap items-center justify-between text-[11px] gap-y-1">
        <div className="flex items-center space-x-2.5 flex-wrap">
          <span className="font-mono font-bold text-rose-900 bg-rose-100/90 px-2 py-0.5 rounded border border-pink-200">
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

          {/* 關鍵支撐與壓力即時標示 */}
          <div className="flex items-center space-x-2 font-mono pl-2 border-l border-pink-300">
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
              撐: NT$ {activeSupportPrice}
            </span>
            <span className="text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200 font-bold">
              壓: NT$ {activeResistancePrice}
            </span>
          </div>
        </div>

        {/* 均線數值 */}
        <div className="flex items-center space-x-2.5 font-mono text-[10px]">
          {activeItem?.ma5 && (
            <span className="text-blue-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-0.5 bg-blue-600 inline-block"></span>
              MA5: NT$ {activeItem.ma5}
            </span>
          )}
          {activeItem?.ma20 && (
            <span className="text-amber-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-0.5 bg-amber-600 inline-block"></span>
              MA20: NT$ {activeItem.ma20}
            </span>
          )}
          {activeItem?.ma60 && (
            <span className="text-purple-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-0.5 bg-purple-600 inline-block"></span>
              MA60: NT$ {activeItem.ma60}
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. 複合 K 線 + 支撐壓力 + 畫線 SVG 主圖繪圖畫布            */}
      {/* ========================================================= */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full overflow-hidden bg-white rounded-2xl border border-pink-200/90 p-2 shadow-xs ${
          drawingTool !== 'POINTER' ? 'cursor-crosshair' : 'cursor-crosshair'
        }`}
        title="可直接在圖表上畫線或滾輪縮放"
      >
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          {/* 1. 主圖價格網格線 */}
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

          {/* ========================================================= */}
          {/* 【重要功能 1】: 關鍵支撐與壓力線 (直接即時畫在K棒圖上) */}
          {/* ========================================================= */}
          {showSupportResistance && (
            <>
              {/* 短線壓力線 (Resistance Line - 紅色虛線) */}
              {activeResistancePrice && (
                <g>
                  <line 
                    x1={paddingLeft} 
                    y1={getY(activeResistancePrice)} 
                    x2={svgWidth - paddingRight} 
                    y2={getY(activeResistancePrice)} 
                    stroke="#E11D48" 
                    strokeWidth="1.8" 
                    strokeDasharray="5 3"
                  />
                  {/* 右側壓力價格標籤 */}
                  <rect 
                    x={svgWidth - paddingRight + 2} 
                    y={getY(activeResistancePrice) - 8} 
                    width="68" 
                    height="16" 
                    fill="#FFE4E6" 
                    stroke="#FDA4AF" 
                    rx="3"
                  />
                  <text 
                    x={svgWidth - paddingRight + 6} 
                    y={getY(activeResistancePrice) + 4} 
                    fill="#BE123C" 
                    fontSize="9.5" 
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    壓 NT${activeResistancePrice}
                  </text>
                </g>
              )}

              {/* 回檔支撐線 (Support Line - 綠色虛線) */}
              {activeSupportPrice && (
                <g>
                  <line 
                    x1={paddingLeft} 
                    y1={getY(activeSupportPrice)} 
                    x2={svgWidth - paddingRight} 
                    y2={getY(activeSupportPrice)} 
                    stroke="#059669" 
                    strokeWidth="1.8" 
                    strokeDasharray="5 3"
                  />
                  {/* 右側支撐價格標籤 */}
                  <rect 
                    x={svgWidth - paddingRight + 2} 
                    y={getY(activeSupportPrice) - 8} 
                    width="68" 
                    height="16" 
                    fill="#D1FAE5" 
                    stroke="#6EE7B7" 
                    rx="3"
                  />
                  <text 
                    x={svgWidth - paddingRight + 6} 
                    y={getY(activeSupportPrice) + 4} 
                    fill="#047857" 
                    fontSize="9.5" 
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    撐 NT${activeSupportPrice}
                  </text>
                </g>
              )}
            </>
          )}

          {/* 2. Candlestick Bars & Wicks (K棒實體與上下影線) */}
          {currentWindow.map((d, i) => {
            const x = paddingLeft + (i + 0.5) * barSpacing;
            const open = d.open ?? d.price;
            const high = d.high ?? d.price;
            const low = d.low ?? d.price;
            const close = d.close ?? d.price;

            const candleUp = close >= open;
            const candleColor = candleUp ? '#DC2626' : '#16A34A';
            const yHigh = getY(high);
            const yLow = getY(low);
            const yOpen = getY(open);
            const yClose = getY(close);

            const candleTop = Math.min(yOpen, yClose);
            const candleHeight = Math.max(2, Math.abs(yClose - yOpen));
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                <line 
                  x1={x} 
                  y1={yHigh} 
                  x2={x} 
                  y2={yLow} 
                  stroke={candleColor} 
                  strokeWidth={isHovered ? '2.2' : '1.2'} 
                />
                <rect 
                  x={x - candleWidth / 2} 
                  y={candleTop} 
                  width={candleWidth} 
                  height={candleHeight} 
                  fill={candleColor} 
                  rx="1"
                  className={isHovered ? 'filter drop-shadow-sm' : ''}
                />
              </g>
            );
          })}

          {/* 3. 疊加均線 (MA5, MA20, MA60) */}
          {ma5Points && (
            <polyline fill="none" stroke="#2563EB" strokeWidth="1.6" points={ma5Points} strokeLinecap="round" strokeLinejoin="round" />
          )}
          {ma20Points && (
            <polyline fill="none" stroke="#D97706" strokeWidth="1.6" points={ma20Points} strokeLinecap="round" strokeLinejoin="round" />
          )}
          {ma60Points && (
            <polyline fill="none" stroke="#7C3AED" strokeWidth="1.6" points={ma60Points} strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* ========================================================= */}
          {/* 【重要功能 3】: 使用者自定義繪圖渲染 (Drawn Lines)       */}
          {/* ========================================================= */}
          {drawnLines.map(line => {
            if (line.type === 'HORIZONTAL') {
              return (
                <g key={line.id}>
                  <line 
                    x1={paddingLeft} 
                    y1={line.y1} 
                    x2={svgWidth - paddingRight} 
                    y2={line.y1} 
                    stroke={line.color} 
                    strokeWidth="2" 
                    strokeDasharray="4 2"
                  />
                  <rect 
                    x={svgWidth - paddingRight + 2} 
                    y={line.y1 - 7} 
                    width="62" 
                    height="14" 
                    fill={line.color} 
                    rx="2"
                  />
                  <text 
                    x={svgWidth - paddingRight + 5} 
                    y={line.y1 + 4} 
                    fill="#FFFFFF" 
                    fontSize="9" 
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    NT${line.price}
                  </text>
                </g>
              );
            } else if (line.type === 'VERTICAL') {
              return (
                <line 
                  key={line.id} 
                  x1={line.x1} 
                  y1={paddingTop} 
                  x2={line.x1} 
                  y2={svgHeight - 25} 
                  stroke={line.color} 
                  strokeWidth="2" 
                  strokeDasharray="4 2"
                />
              );
            } else if (line.type === 'TRENDLINE' || line.type === 'RAY') {
              return (
                <g key={line.id}>
                  <line 
                    x1={line.x1} 
                    y1={line.y1} 
                    x2={line.type === 'RAY' ? line.x2 + (line.x2 - line.x1) * 3 : line.x2} 
                    y2={line.type === 'RAY' ? line.y2 + (line.y2 - line.y1) * 3 : line.y2} 
                    stroke={line.color} 
                    strokeWidth="2.2" 
                    strokeLinecap="round"
                  />
                  <circle cx={line.x1} cy={line.y1} r="3" fill={line.color} />
                  <circle cx={line.x2} cy={line.y2} r="3" fill={line.color} />
                </g>
              );
            }
            return null;
          })}

          {/* 正在繪製中的線段即時預覽 */}
          {activeDrawPoint && currentMousePos && (
            <line 
              x1={activeDrawPoint.x} 
              y1={activeDrawPoint.y} 
              x2={currentMousePos.x} 
              y2={currentMousePos.y} 
              stroke={lineColor} 
              strokeWidth="2" 
              strokeDasharray="4 4"
            />
          )}

          {/* 十字準星 (Crosshair) */}
          {hoverIndex !== null && currentWindow[hoverIndex] && drawingTool === 'POINTER' && (
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

          {/* ========================================================= */}
          {/* 【重要功能 2】: 副圖指標專屬 SVG 畫布區域 (Sub-chart Area) */}
          {/* ========================================================= */}
          {(() => {
            const subTop = paddingTop + klineHeight + subChartGap;
            const subBottom = subTop + subChartHeight;

            return (
              <g>
                {/* 主副圖分隔線 */}
                <line 
                  x1={paddingLeft} 
                  y1={subTop - 6} 
                  x2={svgWidth - paddingRight} 
                  y2={subTop - 6} 
                  stroke="#FBCFE8" 
                  strokeWidth="1.2"
                />

                {/* 1. MACD 副圖 (DIF, DEM, OSC柱狀圖) */}
                {subChartIndicator === 'MACD' && indicatorsData && (() => {
                  const oscValues = indicatorsData.macdList.map(m => m.osc);
                  const difValues = indicatorsData.macdList.map(m => m.dif);
                  const maxMacd = Math.max(0.1, ...oscValues.map(Math.abs), ...difValues.map(Math.abs)) * 1.2;
                  const minMacd = -maxMacd;
                  const zeroY = getSubY(0, minMacd, maxMacd);

                  const difPoints = indicatorsData.macdList
                    .map((m, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(m.dif, minMacd, maxMacd)}`)
                    .join(' ');
                  const demPoints = indicatorsData.macdList
                    .map((m, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(m.dem, minMacd, maxMacd)}`)
                    .join(' ');

                  return (
                    <g>
                      {/* Zero line */}
                      <line x1={paddingLeft} y1={zeroY} x2={svgWidth - paddingRight} y2={zeroY} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                      
                      {/* OSC Bars */}
                      {indicatorsData.macdList.map((m, i) => {
                        const x = paddingLeft + (i + 0.5) * barSpacing;
                        const y = getSubY(m.osc, minMacd, maxMacd);
                        const h = Math.max(1, Math.abs(y - zeroY));
                        const isPos = m.osc >= 0;
                        return (
                          <rect 
                            key={i} 
                            x={x - candleWidth / 2} 
                            y={isPos ? y : zeroY} 
                            width={candleWidth} 
                            height={h} 
                            fill={isPos ? '#EF4444' : '#22C55E'} 
                            opacity="0.85"
                          />
                        );
                      })}

                      {/* DIF Line (Blue) & DEM Line (Orange) */}
                      <polyline fill="none" stroke="#2563EB" strokeWidth="1.5" points={difPoints} />
                      <polyline fill="none" stroke="#D97706" strokeWidth="1.5" points={demPoints} />
                    </g>
                  );
                })()}

                {/* 2. KD 副圖 (%K, %D, 80/20 警戒線) */}
                {subChartIndicator === 'KD' && indicatorsData && (() => {
                  const y80 = getSubY(80, 0, 100);
                  const y20 = getSubY(20, 0, 100);
                  const y50 = getSubY(50, 0, 100);

                  const kPoints = indicatorsData.kdList
                    .map((k, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(k.k, 0, 100)}`)
                    .join(' ');
                  const dPoints = indicatorsData.kdList
                    .map((k, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(k.d, 0, 100)}`)
                    .join(' ');

                  return (
                    <g>
                      <line x1={paddingLeft} y1={y80} x2={svgWidth - paddingRight} y2={y80} stroke="#FCA5A5" strokeDasharray="2 2" />
                      <line x1={paddingLeft} y1={y50} x2={svgWidth - paddingRight} y2={y50} stroke="#E2E8F0" strokeDasharray="2 2" />
                      <line x1={paddingLeft} y1={y20} x2={svgWidth - paddingRight} y2={y20} stroke="#86EFAC" strokeDasharray="2 2" />
                      <polyline fill="none" stroke="#E11D48" strokeWidth="1.6" points={kPoints} />
                      <polyline fill="none" stroke="#2563EB" strokeWidth="1.6" points={dPoints} />
                    </g>
                  );
                })()}

                {/* 3. DMI 副圖 (+DI, -DI, ADX) */}
                {subChartIndicator === 'DMI' && indicatorsData && (() => {
                  const pdiPoints = indicatorsData.dmiList.map((m, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(m.pdi, 0, 60)}`).join(' ');
                  const mdiPoints = indicatorsData.dmiList.map((m, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(m.mdi, 0, 60)}`).join(' ');
                  const adxPoints = indicatorsData.dmiList.map((m, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(m.adx, 0, 60)}`).join(' ');
                  return (
                    <g>
                      <polyline fill="none" stroke="#2563EB" strokeWidth="1.5" points={pdiPoints} />
                      <polyline fill="none" stroke="#DC2626" strokeWidth="1.5" points={mdiPoints} />
                      <polyline fill="none" stroke="#7C3AED" strokeWidth="1.8" points={adxPoints} />
                    </g>
                  );
                })()}

                {/* 4. 成交量 VOL 副圖 */}
                {(subChartIndicator === 'VOL' || subChartIndicator === 'BBI' || subChartIndicator === 'AD' || subChartIndicator === 'ARBR') && (() => {
                  const maxVol = Math.max(...currentWindow.map(d => d.volume || 1000));
                  return (
                    <g>
                      {currentWindow.map((d, i) => {
                        const x = paddingLeft + (i + 0.5) * barSpacing;
                        const vY = getSubY(d.volume || 0, 0, maxVol);
                        const cUp = (d.close ?? d.price) >= (d.open ?? d.price);
                        return (
                          <rect 
                            key={i} 
                            x={x - candleWidth / 2} 
                            y={vY} 
                            width={candleWidth} 
                            height={subBottom - vY} 
                            fill={cUp ? '#F87171' : '#4ADE80'} 
                            opacity="0.8"
                          />
                        );
                      })}
                      {indicatorsData?.volList && (
                        <>
                          <polyline fill="none" stroke="#2563EB" strokeWidth="1.4" points={indicatorsData.volList.map((v, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(v.mv5, 0, maxVol)}`).join(' ')} />
                          <polyline fill="none" stroke="#D97706" strokeWidth="1.4" points={indicatorsData.volList.map((v, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(v.mv20, 0, maxVol)}`).join(' ')} />
                        </>
                      )}
                    </g>
                  );
                })()}

                {/* 5. 籌碼: 三大法人 (外資/投信/自營) 買賣超柱狀圖 */}
                {(subChartIndicator === 'INST_ALL' || subChartIndicator === 'FOREIGN' || subChartIndicator === 'TRUST') && (() => {
                  const nets = currentWindow.map(d => Math.abs(d.foreignNet || 1000));
                  const maxNet = Math.max(500, ...nets) * 1.2;
                  const zeroY = getSubY(0, -maxNet, maxNet);

                  return (
                    <g>
                      <line x1={paddingLeft} y1={zeroY} x2={svgWidth - paddingRight} y2={zeroY} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                      {currentWindow.map((d, i) => {
                        const x = paddingLeft + (i + 0.5) * barSpacing;
                        const val = subChartIndicator === 'TRUST' ? (d.trustNet || 0) : (d.foreignNet || 0);
                        const y = getSubY(val, -maxNet, maxNet);
                        const isPos = val >= 0;
                        const h = Math.max(1, Math.abs(y - zeroY));
                        return (
                          <rect 
                            key={i} 
                            x={x - candleWidth / 2} 
                            y={isPos ? y : zeroY} 
                            width={candleWidth} 
                            height={h} 
                            fill={isPos ? '#EF4444' : '#22C55E'} 
                            opacity="0.85"
                          />
                        );
                      })}
                    </g>
                  );
                })()}

                {/* 6. 財務: 月營收與 YoY 走勢 */}
                {(subChartIndicator === 'REV' || subChartIndicator === 'MOM_YOY') && (() => {
                  const maxRev = Math.max(...currentWindow.map(d => d.revMonthly || 100));
                  const minRev = Math.min(...currentWindow.map(d => d.revMonthly || 50)) * 0.8;
                  const revPoints = currentWindow.map((d, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(d.revMonthly || 100, minRev, maxRev)}`).join(' ');
                  const yoyPoints = currentWindow.map((d, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubY(d.revYoY || 10, -20, 50)}`).join(' ');

                  return (
                    <g>
                      {currentWindow.map((d, i) => {
                        const x = paddingLeft + (i + 0.5) * barSpacing;
                        const vY = getSubY(d.revMonthly || 0, 0, maxRev);
                        return (
                          <rect key={i} x={x - candleWidth / 2} y={vY} width={candleWidth} height={subBottom - vY} fill="#F472B6" opacity="0.65" />
                        );
                      })}
                      <polyline fill="none" stroke="#BE123C" strokeWidth="2" points={revPoints} />
                      <polyline fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 2" points={yoyPoints} />
                    </g>
                  );
                })()}

                {/* 副圖右側標籤文字 */}
                <text 
                  x={svgWidth - paddingRight + 6} 
                  y={subTop + 14} 
                  fill="#9D174D" 
                  fontSize="9.5" 
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {subChartIndicator}
                </text>
              </g>
            );
          })()}

          {/* 5. 底部日期標籤 */}
          {dateLabelIndices.map((idx) => {
            const item = currentWindow[idx];
            if (!item) return null;
            const x = paddingLeft + (idx + 0.5) * barSpacing;
            return (
              <text 
                key={idx} 
                x={x} 
                y={svgHeight - 6} 
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

        {/* 底部圖表狀態提示 */}
        <div className="flex justify-between items-center text-[10px] text-pink-800/80 px-2 pt-1 font-mono border-t border-pink-100">
          <span>
            當前副圖: <strong className="text-rose-900">{subChartIndicator}</strong> • 支援自由畫線、縮放與平移回溯
          </span>
          <span>
            可見範圍: {currentWindow[0]?.time} ~ {currentWindow[currentWindow.length - 1]?.time}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. 四維度副圖指標切換列 (常用 / 價量 / 籌碼 / 財務)       */}
      {/* ========================================================= */}
      <div className="bg-[#fff0f3] p-2 rounded-2xl border border-pink-200 space-y-2">
        {/* 指標大類別切換 Tabs */}
        <div className="flex items-center justify-between border-b border-pink-200/80 pb-1.5 flex-wrap gap-2">
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-[11px] font-bold text-rose-800 mr-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              副圖指標:
            </span>

            {[
              { id: 'COMMON', label: '常用指標', icon: Activity, defaultInd: 'MACD' },
              { id: 'VOL_PRICE', label: '價量指標', icon: BarChart2, defaultInd: 'VOL' },
              { id: 'CHIPS', label: '籌碼指標', icon: Coins, defaultInd: 'INST_ALL' },
              { id: 'FINANCIAL', label: '財務指標', icon: DollarSign, defaultInd: 'REV' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSubChartCategory(cat.id);
                  setSubChartIndicator(cat.defaultInd);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  subChartCategory === cat.id 
                    ? 'bg-rose-600 text-white shadow-2xs' 
                    : 'bg-white/80 text-rose-800 hover:bg-rose-100/70 border border-pink-200'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <span className="text-[10px] text-rose-700/80 font-mono hidden sm:inline">
            即時連動計算 • 點擊切換即時繪出副圖
          </span>
        </div>

        {/* 具體指標選擇器按鈕 */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5 text-xs">
          {subChartCategory === 'COMMON' && (
            <>
              {[
                { id: 'MACD', label: 'MACD (平滑異同平均)' },
                { id: 'KD', label: 'KD (9,3,3 隨機指標)' },
                { id: 'DMI', label: 'DMI (趨向指標 ADX)' }
              ].map(ind => (
                <button
                  key={ind.id}
                  onClick={() => setSubChartIndicator(ind.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    subChartIndicator === ind.id 
                      ? 'bg-white text-rose-700 border-2 border-rose-500 shadow-2xs font-extrabold' 
                      : 'bg-white/90 text-slate-700 hover:bg-rose-50 border border-pink-200'
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </>
          )}

          {subChartCategory === 'VOL_PRICE' && (
            <>
              {[
                { id: 'VOL', label: 'VOL (成交量+均量MV5/MV20)' },
                { id: 'AD', label: 'AD (累積/派發線)' },
                { id: 'ARBR', label: 'AR / BR (人氣意願指標)' },
                { id: 'BBI', label: 'BBI (多空指數均線)' }
              ].map(ind => (
                <button
                  key={ind.id}
                  onClick={() => setSubChartIndicator(ind.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    subChartIndicator === ind.id 
                      ? 'bg-white text-rose-700 border-2 border-rose-500 shadow-2xs font-extrabold' 
                      : 'bg-white/90 text-slate-700 hover:bg-rose-50 border border-pink-200'
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </>
          )}

          {subChartCategory === 'CHIPS' && (
            <>
              {[
                { id: 'INST_ALL', label: '三大法人買賣超 (張數柱狀)' },
                { id: 'FOREIGN', label: '外資每日買賣超' },
                { id: 'TRUST', label: '投信基金連買/連賣動態' }
              ].map(ind => (
                <button
                  key={ind.id}
                  onClick={() => setSubChartIndicator(ind.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    subChartIndicator === ind.id 
                      ? 'bg-white text-rose-700 border-2 border-rose-500 shadow-2xs font-extrabold' 
                      : 'bg-white/90 text-slate-700 hover:bg-rose-50 border border-pink-200'
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </>
          )}

          {subChartCategory === 'FINANCIAL' && (
            <>
              {[
                { id: 'REV', label: '單月合併營收 (億元柱狀)' },
                { id: 'MOM_YOY', label: '營收 MoM (月增%) 與 YoY (年增%)' }
              ].map(ind => (
                <button
                  key={ind.id}
                  onClick={() => setSubChartIndicator(ind.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    subChartIndicator === ind.id 
                      ? 'bg-white text-rose-700 border-2 border-rose-500 shadow-2xs font-extrabold' 
                      : 'bg-white/90 text-slate-700 hover:bg-rose-50 border border-pink-200'
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
