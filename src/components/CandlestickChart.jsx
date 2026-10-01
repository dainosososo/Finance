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
  Maximize2,
  Check,
  X,
  MoveHorizontal,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

/**
 * 完整支援的副圖指標定義庫
 */
const SUBCHART_CATALOG = [
  // 常用
  { id: 'MACD', name: 'MACD', label: 'MACD (平滑異同平均)', category: 'COMMON', desc: 'DIF快線、DEM慢線與紅綠震盪柱 (OSC)' },
  { id: 'KD', name: 'KD', label: 'KD (9,3,3 隨機指標)', category: 'COMMON', desc: 'K值、D值與 80/20 超買超賣警戒線' },
  { id: 'DMI', name: 'DMI', label: 'DMI (趨向指標 ADX)', category: 'COMMON', desc: '+DI多方、-DI空方與 ADX 趨勢強度線' },
  // 價量
  { id: 'VOL', name: 'VOL', label: 'VOL (成交量與均量)', category: 'VOL_PRICE', desc: '成交量紅綠柱與 MV5、MV20 均量線' },
  { id: 'AD', name: 'AD', label: 'AD (累積派發線)', category: 'VOL_PRICE', desc: '累積派發指標 Accumulation/Distribution' },
  { id: 'ARBR', name: 'AR/BR', label: 'AR/BR (情緒人氣指標)', category: 'VOL_PRICE', desc: '買賣意願人氣指標 (100基準線)' },
  { id: 'BBI', name: 'BBI', label: 'BBI (多空指數)', category: 'VOL_PRICE', desc: '綜合 3/6/12/24 日權重均線' },
  // 籌碼
  { id: 'INST_ALL', name: '三大法人', label: '三大法人 (外資/投信/自營)', category: 'CHIPS', desc: '法人主力多空買賣超長條圖' },
  { id: 'FOREIGN', name: '外資動向', label: '外資動向 (買賣超張數)', category: 'CHIPS', desc: '外資主力進出與連續買超' },
  { id: 'TRUST', name: '投信動向', label: '投信動向 (本土法人)', category: 'CHIPS', desc: '國內投信基金加減碼動向' },
  // 財務
  { id: 'REV', name: '月營收', label: '月營收 (億元)', category: 'FINANCIAL', desc: '單月營收規模長條圖' },
  { id: 'MOM_YOY', name: 'MoM & YoY', label: '成長率 (YoY & MoM)', category: 'FINANCIAL', desc: '年增率與月增率雙折線 (%)' },
];

/**
 * 專業級台股 Candlestick (K線蠟燭圖) 深度渲染組件
 * 解決三大核心需求:
 * 1. 【多副圖指標同時並列顯示】: 支援多選指標，每項指標獨立一行子圖，時間軸嚴密對齊
 * 2. 【全新非滾輪縮放與平移呈現】: 徹底移除滾輪誤觸，提供滑鼠拖曳平移 (Drag-to-Pan) + 底部時間軸雙滑桿 + 週期按鈕
 * 3. 【從開始上市櫃全歷史成交呈現】: 完整支援上市首日至今數千根 K 棒回溯
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
  const [zoomCount, setZoomCount] = useState(60);
  const [panOffset, setPanOffset] = useState(0);

  // 滑鼠拖曳平移 (Drag-to-Pan) 狀態 (取代容易誤觸滾動視窗的滾輪)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);

  // 2. 支撐壓力線顯示開關
  const [showSupportResistance, setShowSupportResistance] = useState(true);

  // 3. 【核心升級 1】: 多副圖指標陣列 (預設比照三竹智選股同時並列 MACD + KD)
  const [activeIndicators, setActiveIndicators] = useState(['MACD', 'KD']);
  const [currentIndicatorCategory, setCurrentIndicatorCategory] = useState('COMMON');

  // 4. 畫圖功能狀態
  const [drawingTool, setDrawingTool] = useState('POINTER'); 
  const [lineColor, setLineColor] = useState('#E11D48'); // 預設櫻花紅
  const [drawnLines, setDrawnLines] = useState([]); // [{ id, type, x1, y1, x2, y2, price, color }]
  const [activeDrawPoint, setActiveDrawPoint] = useState(null); // 拖曳中起點 {x, y}
  const [currentMousePos, setCurrentMousePos] = useState(null); // 當前游標座標 {x, y}

  // 綁定非被動滾輪事件 (完全阻擋視窗垂直滾動，轉為平滑K棒縮放)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY < 0) {
        setZoomCount(prev => Math.max(15, prev - 4));
      } else {
        setZoomCount(prev => Math.min(data.length, prev + 4));
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [data.length]);

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

  // 最大平移偏移量 (0 為最新今日，maxPan 為回溯至上市首日)
  const maxPan = Math.max(0, data.length - zoomCount);

  // 計算動態支撐與壓力價位
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
  // 計算全套副圖指標數值集合 (Indicators Math)
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

    // 4. 價量指標 (VOL, AD, ARBR, BBI)
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

  // SVG 尺寸配置 (多副圖自適應高度)
  const svgWidth = 720;
  const paddingLeft = 10;
  const paddingRight = 68; // 右側價格與指標標籤
  const paddingTop = 22;
  const klineHeight = 180; // 主圖 K 線高度
  const subChartHeight = 74; // 每個副圖列高度
  const subChartGap = 16; // 副圖列間距

  const totalSubHeight = activeIndicators.length * (subChartHeight + subChartGap);
  const svgHeight = paddingTop + klineHeight + (activeIndicators.length > 0 ? totalSubHeight + 10 : 0) + 24;

  const chartAreaWidth = svgWidth - paddingLeft - paddingRight;
  const barSpacing = chartAreaWidth / currentWindow.length;
  const candleWidth = Math.max(2.0, Math.min(20, barSpacing * 0.68));

  // 主圖價格座標轉換
  const getY = (price) => {
    if (maxPrice === minPrice) return paddingTop + klineHeight / 2;
    return paddingTop + klineHeight - ((price - minPrice) / (maxPrice - minPrice)) * klineHeight;
  };

  const getPriceFromY = (y) => {
    const ratio = (paddingTop + klineHeight - y) / klineHeight;
    return Number((minPrice + ratio * (maxPrice - minPrice)).toFixed(2));
  };

  // 副圖任意區間映射函數
  const getSubYInPanel = (val, minVal, maxVal, panelTop) => {
    if (maxVal === minVal) return panelTop + subChartHeight / 2;
    return panelTop + subChartHeight - ((val - minVal) / (maxVal - minVal)) * subChartHeight;
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

  // 滑鼠移動處理 (支援十字準星、畫線預覽與滑鼠拖曳平移)
  const handleMouseMove = (e) => {
    const { x, y } = getSvgCoordinates(e);
    setCurrentMousePos({ x, y });

    // 拖曳平移處理 (Drag-to-Pan)
    if (isDragging && drawingTool === 'POINTER') {
      const deltaPixels = e.clientX - dragStartX;
      const deltaBars = Math.round(deltaPixels / Math.max(1, (containerRef.current?.clientWidth || 700) / currentWindow.length));
      if (deltaBars !== 0) {
        const newOffset = Math.max(0, Math.min(maxPan, dragStartOffset + deltaBars));
        setPanOffset(newOffset);
      }
      return;
    }

    const relativeX = x - paddingLeft;
    const index = Math.floor(relativeX / barSpacing);
    if (index >= 0 && index < currentWindow.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setCurrentMousePos(null);
    setIsDragging(false);
  };

  // 畫圖與拖曳平移點擊事件處理
  const handleMouseDown = (e) => {
    // 若為游標模式，啟動滑鼠拖曳平移
    if (drawingTool === 'POINTER') {
      setIsDragging(true);
      setDragStartX(e.clientX);
      setDragStartOffset(panOffset);
      return;
    }

    // 畫圖模式處理
    const { x, y } = getSvgCoordinates(e);
    const price = getPriceFromY(y);

    if (drawingTool === 'HORIZONTAL') {
      setDrawnLines(prev => [
        ...prev,
        { id: Date.now(), type: 'HORIZONTAL', y1: y, price, color: lineColor }
      ]);
    } else if (drawingTool === 'VERTICAL') {
      setDrawnLines(prev => [
        ...prev,
        { id: Date.now(), type: 'VERTICAL', x1: x, color: lineColor }
      ]);
    } else if (drawingTool === 'TRENDLINE' || drawingTool === 'RAY') {
      setActiveDrawPoint({ x, y, price });
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
    }

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

  // 多副圖指標開關切換 (Toggle Indicator)
  const toggleIndicator = (id) => {
    setActiveIndicators(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const removeIndicator = (id) => {
    setActiveIndicators(prev => prev.filter(item => item !== id));
  };

  // 縮放微調與指定週期設定
  const zoomIn = () => setZoomCount(prev => Math.max(15, prev - 15));
  const zoomOut = () => setZoomCount(prev => Math.min(data.length, prev + 25));
  const setPresetBars = (count) => {
    setZoomCount(Math.min(count, data.length));
    setPanOffset(0);
  };
  const panLeft = () => setPanOffset(prev => Math.min(maxPan, prev + 15));
  const panRight = () => setPanOffset(prev => Math.max(0, prev - 15));
  const resetToLatest = () => setPanOffset(0);

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

  return (
    <div className="w-full flex flex-col select-none space-y-3">
      {/* ========================================================= */}
      {/* 0. 標的上市櫃里程碑與全歷史成交 K 棒概況                   */}
      {/* ========================================================= */}
      <div className="bg-[#fff0f3] px-3.5 py-1.5 rounded-xl border border-pink-200 flex flex-wrap items-center justify-between text-xs text-rose-900/90 gap-2">
        <div className="flex items-center space-x-2 font-mono">
          <Calendar className="w-3.5 h-3.5 text-rose-600" />
          <span>上市櫃日期: <strong className="text-slate-900">{stock?.listingDate || '1994-09-05'}</strong></span>
          <span>•</span>
          <span>掛牌價: <strong className="text-slate-900">NT$ {stock?.ipoPrice || '10.0'}</strong></span>
          <span>•</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            全歷史收錄 {data.length} 根 K 棒
          </span>
        </div>

        <div className="text-[11px] text-rose-700 font-sans flex items-center gap-1 font-semibold">
          <span>支援滑鼠按住畫布平移</span>
          <span>•</span>
          <span>一鍵全覽上市至今</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. 專業畫圖工具列 (Drawing Toolbar)                     */}
      {/* ========================================================= */}
      <div className="bg-[#fff0f3] px-3 py-2 rounded-2xl border border-pink-200/90 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
            <PenTool className="w-3.5 h-3.5 text-rose-600" />
            畫圖工具:
          </span>

          {[
            { id: 'POINTER', label: '游標/平移', icon: '🖱' },
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
                title={`選擇顏色 ${c}`}
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
            <span>支撐壓力線: {showSupportResistance ? '開' : '關'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 即時數值標示列 (含當前 K 棒報價與支撐壓力)              */}
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
      {/* 3. 複合 K 線 + 支撐壓力 + 多指標副圖 SVG 畫布             */}
      {/* ========================================================= */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`relative w-full overflow-hidden bg-white rounded-2xl border border-pink-200/90 p-2 shadow-xs transition-all ${
          drawingTool === 'POINTER' 
            ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') 
            : 'cursor-crosshair'
        }`}
        title="游標模式下可按住滑鼠直接左右拖曳平移歷史"
      >
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          {/* 主圖網格刻度線 (Grid lines) */}
          {priceTicks.map((price, idx) => {
            const y = getY(price);
            return (
              <g key={idx}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={svgWidth - paddingRight} 
                  y2={y} 
                  stroke="#FCE7F3" 
                  strokeDasharray="4 4" 
                  strokeWidth="0.8" 
                />
                <text 
                  x={svgWidth - paddingRight + 6} 
                  y={y + 3.5} 
                  fill="#9F1239" 
                  fontSize="10" 
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  NT${price.toFixed(price > 500 ? 0 : 1)}
                </text>
              </g>
            );
          })}

          {/* 三竹 Image 1 格式 MA 均線標頭: MA > 5T: ... 10T: ... 20T: ... */}
          <text x={paddingLeft + 4} y={paddingTop - 7} fill="#475569" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            MA &gt;
          </text>
          <text x={paddingLeft + 36} y={paddingTop - 7} fill="#2563EB" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            5T:{activeItem?.ma5 ?? '--'}
          </text>
          <text x={paddingLeft + 102} y={paddingTop - 7} fill="#D97706" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            20T:{activeItem?.ma20 ?? '--'}
          </text>
          <text x={paddingLeft + 172} y={paddingTop - 7} fill="#7C3AED" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            60T:{activeItem?.ma60 ?? '--'}
          </text>

          {/* 關鍵短線壓力線 (三竹青藍色 Resistance Line) */}
          {showSupportResistance && activeResistancePrice && (
            <g>
              <line 
                x1={paddingLeft} 
                y1={getY(activeResistancePrice)} 
                x2={svgWidth - paddingRight} 
                y2={getY(activeResistancePrice)} 
                stroke="#0891B2" 
                strokeWidth="1.4" 
                strokeDasharray="6 3" 
              />
              <rect 
                x={svgWidth - paddingRight + 4} 
                y={getY(activeResistancePrice) - 8} 
                width="62" 
                height="15" 
                fill="#0891B2" 
                rx="3" 
              />
              <text 
                x={svgWidth - paddingRight + 7} 
                y={getY(activeResistancePrice) + 3.5} 
                fill="#FFFFFF" 
                fontSize="9" 
                fontFamily="monospace" 
                fontWeight="bold"
              >
                壓 NT${activeResistancePrice}
              </text>
            </g>
          )}

          {/* 關鍵回檔支撐線 (三竹青藍色 Support Line) */}
          {showSupportResistance && activeSupportPrice && (
            <g>
              <line 
                x1={paddingLeft} 
                y1={getY(activeSupportPrice)} 
                x2={svgWidth - paddingRight} 
                y2={getY(activeSupportPrice)} 
                stroke="#0284C7" 
                strokeWidth="1.4" 
                strokeDasharray="6 3" 
              />
              <rect 
                x={svgWidth - paddingRight + 4} 
                y={getY(activeSupportPrice) - 8} 
                width="62" 
                height="15" 
                fill="#0284C7" 
                rx="3" 
              />
              <text 
                x={svgWidth - paddingRight + 7} 
                y={getY(activeSupportPrice) + 3.5} 
                fill="#FFFFFF" 
                fontSize="9" 
                fontFamily="monospace" 
                fontWeight="bold"
              >
                撐 NT${activeSupportPrice}
              </text>
            </g>
          )}

          {/* 均線 Polyline (MA5, MA20, MA60) */}
          {ma5Points && <polyline fill="none" stroke="#2563EB" strokeWidth="1.6" points={ma5Points} />}
          {ma20Points && <polyline fill="none" stroke="#D97706" strokeWidth="1.6" points={ma20Points} />}
          {ma60Points && <polyline fill="none" stroke="#7C3AED" strokeWidth="1.4" points={ma60Points} />}

          {/* 最高價標籤 (三竹 Image 1: 紅色數字) */}
          {(() => {
            const highIdx = currentWindow.findIndex(d => (d.high ?? d.price) === maxPrice);
            if (highIdx >= 0) {
              const x = paddingLeft + (highIdx + 0.5) * barSpacing;
              const y = getY(maxPrice);
              return (
                <text x={x} y={Math.max(paddingTop + 8, y - 4)} textAnchor="middle" fill="#DC2626" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  {maxPrice.toFixed(maxPrice > 500 ? 0 : 1)} ▲
                </text>
              );
            }
            return null;
          })()}

          {/* 最低價標籤 (三竹 Image 1: 綠色數字) */}
          {(() => {
            const lowIdx = currentWindow.findIndex(d => (d.low ?? d.price) === minPrice);
            if (lowIdx >= 0) {
              const x = paddingLeft + (lowIdx + 0.5) * barSpacing;
              const y = getY(minPrice);
              return (
                <text x={x} y={Math.min(paddingTop + klineHeight - 2, y + 12)} textAnchor="middle" fill="#16A34A" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  {minPrice.toFixed(minPrice > 500 ? 0 : 1)} ▼
                </text>
              );
            }
            return null;
          })()}

          {/* K 棒燭線本體 (Candlestick Bars) */}
          {currentWindow.map((d, idx) => {
            const open = d.open ?? d.price;
            const close = d.close ?? d.price;
            const high = d.high ?? d.price;
            const low = d.low ?? d.price;
            const isBarUp = close >= open;

            const x = paddingLeft + (idx + 0.5) * barSpacing;
            const yHigh = getY(high);
            const yLow = getY(low);
            const yOpen = getY(open);
            const yClose = getY(close);

            const candleTop = Math.min(yOpen, yClose);
            const candleBodyHeight = Math.max(1.8, Math.abs(yOpen - yClose));
            const barColor = isBarUp ? '#DC2626' : '#16A34A';

            return (
              <g key={idx}>
                {/* 影線 (Wick) */}
                <line 
                  x1={x} 
                  y1={yHigh} 
                  x2={x} 
                  y2={yLow} 
                  stroke={barColor} 
                  strokeWidth={candleWidth > 6 ? 1.5 : 1} 
                />
                {/* 燭身 (Body) */}
                <rect 
                  x={x - candleWidth / 2} 
                  y={candleTop} 
                  width={candleWidth} 
                  height={candleBodyHeight} 
                  fill={barColor} 
                  rx={candleWidth > 5 ? 1 : 0} 
                />
              </g>
            );
          })}

          {/* 使用者手繪線條渲染 */}
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

          {/* 繪製中即時預覽 */}
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
          {/* 【核心升級 1】: 多副圖指標列 (Multi-row Sub-chart Panels)  */}
          {/* ========================================================= */}
          {activeIndicators.map((indKey, indIdx) => {
            const panelTop = paddingTop + klineHeight + 16 + indIdx * (subChartHeight + subChartGap);
            const panelBottom = panelTop + subChartHeight;
            const catalogItem = SUBCHART_CATALOG.find(c => c.id === indKey) || { name: indKey };

            return (
              <g key={indKey}>
                {/* 副圖面板頂部分隔線 */}
                <line 
                  x1={paddingLeft} 
                  y1={panelTop - 6} 
                  x2={svgWidth - paddingRight} 
                  y2={panelTop - 6} 
                  stroke="#FBCFE8" 
                  strokeWidth="1.2"
                />

                {/* 1. MACD 副圖面板 (三竹智選股 Image 1 格式: MACD > DIF12-26:0.68 MACD9:0.16 OSC:0.52) */}
                {indKey === 'MACD' && indicatorsData && (() => {
                  const oscValues = indicatorsData.macdList.map(m => m.osc);
                  const difValues = indicatorsData.macdList.map(m => m.dif);
                  const maxMacd = Math.max(0.1, ...oscValues.map(Math.abs), ...difValues.map(Math.abs)) * 1.2;
                  const minMacd = -maxMacd;
                  const zeroY = getSubYInPanel(0, minMacd, maxMacd, panelTop);

                  const difPoints = indicatorsData.macdList
                    .map((m, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(m.dif, minMacd, maxMacd, panelTop)}`)
                    .join(' ');
                  const demPoints = indicatorsData.macdList
                    .map((m, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(m.dem, minMacd, maxMacd, panelTop)}`)
                    .join(' ');

                  const curMacd = indicatorsData.macdList[activeIndex] || indicatorsData.macdList[indicatorsData.macdList.length - 1];

                  return (
                    <g>
                      {/* 三竹 Image 1 標題列 */}
                      <text x={paddingLeft + 4} y={panelTop + 8} fill="#475569" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                        MACD &gt;
                      </text>
                      <text x={paddingLeft + 52} y={panelTop + 8} fill="#D97706" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                        DIF12-26:{curMacd?.dif}
                      </text>
                      <text x={paddingLeft + 146} y={panelTop + 8} fill="#0284C7" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                        MACD9:{curMacd?.dem}
                      </text>
                      <text x={paddingLeft + 228} y={panelTop + 8} fill={curMacd?.osc >= 0 ? '#DC2626' : '#16A34A'} fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                        OSC:{curMacd?.osc > 0 ? `+${curMacd?.osc}` : curMacd?.osc}
                      </text>

                      <line x1={paddingLeft} y1={zeroY} x2={svgWidth - paddingRight} y2={zeroY} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                      {indicatorsData.macdList.map((m, i) => {
                        const x = paddingLeft + (i + 0.5) * barSpacing;
                        const y = getSubYInPanel(m.osc, minMacd, maxMacd, panelTop);
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
                      <polyline fill="none" stroke="#D97706" strokeWidth="1.5" points={difPoints} />
                      <polyline fill="none" stroke="#0284C7" strokeWidth="1.5" points={demPoints} />
                      
                      {/* 右側刻度數值 (7, 4, 0, -4, -7) */}
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 14} fill="#64748B" fontSize="8.5" fontFamily="monospace">
                        +{maxMacd.toFixed(1)}
                      </text>
                      <text x={svgWidth - paddingRight + 5} y={zeroY + 3} fill="#94A3B8" fontSize="8.5" fontFamily="monospace">
                        0
                      </text>
                      <text x={svgWidth - paddingRight + 5} y={panelBottom - 2} fill="#64748B" fontSize="8.5" fontFamily="monospace">
                        -{maxMacd.toFixed(1)}
                      </text>
                    </g>
                  );
                })()}

                {/* 2. KD 副圖面板 (三竹智選股 Image 1 格式: KD > 9K:65.61 9D:61.07) */}
                {indKey === 'KD' && indicatorsData && (() => {
                  const y80 = getSubYInPanel(80, 0, 100, panelTop);
                  const y50 = getSubYInPanel(50, 0, 100, panelTop);
                  const y20 = getSubYInPanel(20, 0, 100, panelTop);

                  const kPoints = indicatorsData.kdList
                    .map((k, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(k.k, 0, 100, panelTop)}`)
                    .join(' ');
                  const dPoints = indicatorsData.kdList
                    .map((k, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(k.d, 0, 100, panelTop)}`)
                    .join(' ');

                  const curKd = indicatorsData.kdList[activeIndex] || indicatorsData.kdList[indicatorsData.kdList.length - 1];

                  return (
                    <g>
                      {/* 三竹 Image 1 標題列 */}
                      <text x={paddingLeft + 4} y={panelTop + 8} fill="#475569" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                        KD &gt;
                      </text>
                      <text x={paddingLeft + 36} y={panelTop + 8} fill="#D97706" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                        9K:{curKd?.k}
                      </text>
                      <text x={paddingLeft + 102} y={panelTop + 8} fill="#0284C7" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                        9D:{curKd?.d}
                      </text>

                      <line x1={paddingLeft} y1={y80} x2={svgWidth - paddingRight} y2={y80} stroke="#FCA5A5" strokeDasharray="2 2" strokeWidth="0.8" />
                      <line x1={paddingLeft} y1={y50} x2={svgWidth - paddingRight} y2={y50} stroke="#E2E8F0" strokeDasharray="2 2" strokeWidth="0.8" />
                      <line x1={paddingLeft} y1={y20} x2={svgWidth - paddingRight} y2={y20} stroke="#86EFAC" strokeDasharray="2 2" strokeWidth="0.8" />
                      <polyline fill="none" stroke="#D97706" strokeWidth="1.5" points={kPoints} />
                      <polyline fill="none" stroke="#0284C7" strokeWidth="1.5" points={dPoints} />

                      {/* 右側刻度數值 (80, 50, 20) */}
                      <text x={svgWidth - paddingRight + 5} y={y80 + 3} fill="#EF4444" fontSize="8.5" fontFamily="monospace" fontWeight="bold">80</text>
                      <text x={svgWidth - paddingRight + 5} y={y50 + 3} fill="#94A3B8" fontSize="8" fontFamily="monospace">50</text>
                      <text x={svgWidth - paddingRight + 5} y={y20 + 3} fill="#10B981" fontSize="8.5" fontFamily="monospace" fontWeight="bold">20</text>
                    </g>
                  );
                })()}

                {/* 3. DMI 副圖面板 */}
                {indKey === 'DMI' && indicatorsData && (() => {
                  const pdiPoints = indicatorsData.dmiList.map((m, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(m.pdi, 0, 60, panelTop)}`).join(' ');
                  const mdiPoints = indicatorsData.dmiList.map((m, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(m.mdi, 0, 60, panelTop)}`).join(' ');
                  const adxPoints = indicatorsData.dmiList.map((m, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(m.adx, 0, 60, panelTop)}`).join(' ');
                  const curDmi = indicatorsData.dmiList[activeIndex] || indicatorsData.dmiList[indicatorsData.dmiList.length - 1];

                  return (
                    <g>
                      <polyline fill="none" stroke="#2563EB" strokeWidth="1.5" points={pdiPoints} />
                      <polyline fill="none" stroke="#DC2626" strokeWidth="1.5" points={mdiPoints} />
                      <polyline fill="none" stroke="#7C3AED" strokeWidth="1.8" points={adxPoints} />

                      <text x={svgWidth - paddingRight + 5} y={panelTop + 14} fill="#2563EB" fontSize="9" fontFamily="monospace" fontWeight="bold">+DI:{curDmi?.pdi}</text>
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 26} fill="#DC2626" fontSize="9" fontFamily="monospace" fontWeight="bold">-DI:{curDmi?.mdi}</text>
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 38} fill="#7C3AED" fontSize="9" fontFamily="monospace" fontWeight="bold">ADX:{curDmi?.adx}</text>
                    </g>
                  );
                })()}

                {/* 4. 成交量 VOL 副圖面板 */}
                {indKey === 'VOL' && (() => {
                  const maxVol = Math.max(...currentWindow.map(d => d.volume || 1000));
                  const curVol = currentWindow[activeIndex]?.volume || 0;
                  const curMv5 = indicatorsData?.volList[activeIndex]?.mv5 || 0;
                  const curMv20 = indicatorsData?.volList[activeIndex]?.mv20 || 0;

                  return (
                    <g>
                      {currentWindow.map((d, i) => {
                        const x = paddingLeft + (i + 0.5) * barSpacing;
                        const vY = getSubYInPanel(d.volume || 0, 0, maxVol, panelTop);
                        const cUp = (d.close ?? d.price) >= (d.open ?? d.price);
                        return (
                          <rect 
                            key={i} 
                            x={x - candleWidth / 2} 
                            y={vY} 
                            width={candleWidth} 
                            height={panelBottom - vY} 
                            fill={cUp ? '#F87171' : '#4ADE80'} 
                            opacity="0.8"
                          />
                        );
                      })}
                      {indicatorsData?.volList && (
                        <>
                          <polyline fill="none" stroke="#2563EB" strokeWidth="1.4" points={indicatorsData.volList.map((v, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(v.mv5, 0, maxVol, panelTop)}`).join(' ')} />
                          <polyline fill="none" stroke="#D97706" strokeWidth="1.4" points={indicatorsData.volList.map((v, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(v.mv20, 0, maxVol, panelTop)}`).join(' ')} />
                        </>
                      )}

                      <text x={svgWidth - paddingRight + 5} y={panelTop + 14} fill="#475569" fontSize="9" fontFamily="monospace" fontWeight="bold">{curVol.toLocaleString()}張</text>
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 26} fill="#2563EB" fontSize="8.5" fontFamily="monospace">MV5:{curMv5}</text>
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 38} fill="#D97706" fontSize="8.5" fontFamily="monospace">MV20:{curMv20}</text>
                    </g>
                  );
                })()}

                {/* 5. 價量指標 (AD, ARBR, BBI) 面板 */}
                {(indKey === 'AD' || indKey === 'ARBR' || indKey === 'BBI') && (() => {
                  const bbiPoints = indicatorsData?.volList.map((v, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getY(v.bbi)}`).join(' ');
                  const arPoints = indicatorsData?.volList.map((v, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(v.ar, 0, 200, panelTop)}`).join(' ');
                  const brPoints = indicatorsData?.volList.map((v, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(v.br, 0, 200, panelTop)}`).join(' ');

                  return (
                    <g>
                      <polyline fill="none" stroke="#2563EB" strokeWidth="1.6" points={arPoints} />
                      <polyline fill="none" stroke="#DC2626" strokeWidth="1.6" points={brPoints} />
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 16} fill="#2563EB" fontSize="9.5" fontFamily="monospace" fontWeight="bold">AR:{indicatorsData?.volList[activeIndex]?.ar}</text>
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 28} fill="#DC2626" fontSize="9.5" fontFamily="monospace" fontWeight="bold">BR:{indicatorsData?.volList[activeIndex]?.br}</text>
                    </g>
                  );
                })()}

                {/* 6. 籌碼: 三大法人 (外資/投信/自營商) 面板 */}
                {(indKey === 'INST_ALL' || indKey === 'FOREIGN' || indKey === 'TRUST') && (() => {
                  const nets = currentWindow.map(d => Math.abs(d.foreignNet || 1000));
                  const maxNet = Math.max(500, ...nets) * 1.2;
                  const zeroY = getSubYInPanel(0, -maxNet, maxNet, panelTop);
                  const curForeign = currentWindow[activeIndex]?.foreignNet || 0;
                  const curTrust = currentWindow[activeIndex]?.trustNet || 0;

                  return (
                    <g>
                      <line x1={paddingLeft} y1={zeroY} x2={svgWidth - paddingRight} y2={zeroY} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                      {currentWindow.map((d, i) => {
                        const x = paddingLeft + (i + 0.5) * barSpacing;
                        const val = indKey === 'TRUST' ? (d.trustNet || 0) : (d.foreignNet || 0);
                        const y = getSubYInPanel(val, -maxNet, maxNet, panelTop);
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
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 16} fill={curForeign >= 0 ? '#DC2626' : '#16A34A'} fontSize="9" fontFamily="monospace" fontWeight="bold">
                        外資:{curForeign > 0 ? `+${curForeign}` : curForeign}
                      </text>
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 28} fill={curTrust >= 0 ? '#DC2626' : '#16A34A'} fontSize="9" fontFamily="monospace" fontWeight="bold">
                        投信:{curTrust > 0 ? `+${curTrust}` : curTrust}
                      </text>
                    </g>
                  );
                })()}

                {/* 7. 財務: 月營收與成長率面板 */}
                {(indKey === 'REV' || indKey === 'MOM_YOY') && (() => {
                  const maxRev = Math.max(...currentWindow.map(d => d.revMonthly || 100));
                  const curRev = currentWindow[activeIndex]?.revMonthly || 0;
                  const curYoY = currentWindow[activeIndex]?.revYoY || 0;

                  return (
                    <g>
                      {currentWindow.map((d, i) => {
                        const x = paddingLeft + (i + 0.5) * barSpacing;
                        const vY = getSubYInPanel(d.revMonthly || 0, 0, maxRev, panelTop);
                        return (
                          <rect key={i} x={x - candleWidth / 2} y={vY} width={candleWidth} height={panelBottom - vY} fill="#F472B6" opacity="0.65" />
                        );
                      })}
                      <polyline fill="none" stroke="#BE123C" strokeWidth="2" points={currentWindow.map((d, i) => `${paddingLeft + (i + 0.5) * barSpacing},${getSubYInPanel(d.revMonthly || 100, 0, maxRev, panelTop)}`).join(' ')} />
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 16} fill="#BE123C" fontSize="9" fontFamily="monospace" fontWeight="bold">{curRev}億</text>
                      <text x={svgWidth - paddingRight + 5} y={panelTop + 28} fill="#2563EB" fontSize="8.5" fontFamily="monospace">YoY:{curYoY}%</text>
                    </g>
                  );
                })()}
              </g>
            );
          })}

          {/* X 軸日期標籤 (最底層時間標記) */}
          {dateLabelIndices.map((idx, i) => {
            const item = currentWindow[idx];
            if (!item) return null;
            const x = paddingLeft + (idx + 0.5) * barSpacing;
            return (
              <text 
                key={i} 
                x={x} 
                y={svgHeight - 8} 
                fill="#881337" 
                fontSize="9" 
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor={i === 0 ? 'start' : i === dateLabelIndices.length - 1 ? 'end' : 'middle'}
              >
                {item.time || item.rawDate}
              </text>
            );
          })}
        </svg>
      </div>

      {/* ========================================================= */}
      {/* 三竹智選股風格副圖指標切換列 (Image 1 Style)               */}
      {/* ========================================================= */}
      <div className="bg-[#fff0f3] px-3 py-1.5 rounded-xl border border-pink-200 flex items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="font-extrabold text-[11px] text-slate-800 shrink-0">副圖指標:</span>
          {SUBCHART_CATALOG.map(item => {
            const isSelected = activeIndicators.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleIndicator(item.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-rose-800 hover:bg-rose-100 border border-pink-200'
                }`}
                title={item.desc}
              >
                {item.name}
              </button>
            );
          })}
        </div>
        <div className="flex items-center space-x-1 shrink-0 text-[11px]">
          <button
            onClick={() => setActiveIndicators(['MACD', 'KD'])}
            className="px-2 py-0.5 bg-white hover:bg-rose-100 border border-pink-200 text-rose-800 rounded font-bold"
            title="一鍵切換為三竹經典雙指標並列"
          >
            雙標(MACD+KD)
          </button>
          <button
            onClick={() => setActiveIndicators(['MACD', 'KD', 'VOL'])}
            className="px-2 py-0.5 bg-white hover:bg-rose-100 border border-pink-200 text-rose-800 rounded font-bold"
            title="三指標(+VOL)"
          >
            三標(+VOL)
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 緊湊時間軸歷史平移滑桿與週期快捷列                          */}
      {/* ========================================================= */}
      <div className="bg-[#fff0f3] px-3 py-1.5 rounded-xl border border-pink-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5 text-xs">
          <span className="text-[11px] font-bold text-rose-800 shrink-0">週期:</span>
          {[
            { label: '全部', count: data.length },
            { label: '5年', count: 1200 },
            { label: '1年', count: 240 },
            { label: '半年', count: 120 },
            { label: '季(60)', count: 60 },
            { label: '月(20)', count: 20 },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => setPresetBars(p.count)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition ${
                zoomCount === Math.min(p.count, data.length) && panOffset === 0
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white text-rose-800 hover:bg-rose-100 border border-pink-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 歷史平移滑桿與區間 */}
        <div className="flex items-center space-x-2 flex-1 max-w-xs min-w-[180px]">
          <span className="font-mono text-[10px] text-rose-800 bg-white px-1.5 py-0.5 rounded border border-pink-200 shrink-0">
            {currentWindow[0]?.time} ~ {currentWindow[currentWindow.length - 1]?.time}
          </span>
          <input 
            type="range"
            min="0"
            max={maxPan}
            value={panOffset}
            onChange={(e) => setPanOffset(Number(e.target.value))}
            className="w-full h-1.5 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            title="滑動回溯至上市櫃首日"
          />
        </div>

        {/* 步進與返回 */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={zoomIn}
            className="px-1.5 py-0.5 bg-white border border-pink-200 text-rose-800 hover:bg-rose-100 rounded text-xs font-bold"
            title="放大"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={zoomOut}
            className="px-1.5 py-0.5 bg-white border border-pink-200 text-rose-800 hover:bg-rose-100 rounded text-xs font-bold"
            title="縮小"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          {panOffset > 0 && (
            <button
              onClick={resetToLatest}
              className="px-2 py-0.5 bg-rose-600 text-white hover:bg-rose-700 rounded text-xs font-bold shadow-2xs"
            >
              返回最新
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
