/**
 * Stock Detail Analysis Service (三竹股市 / 三竹選股標竿資料庫)
 * 提供個股深度多週期技術面、盤差、籌碼面、基本面、股利政策、產業鏈與專屬個股時事
 */

// 常用權值股與焦點股的深度基本資料庫
const STOCK_PRESETS = {
  '2330': {
    name: '台積電',
    code: '2330',
    market: '上市 (半導體)',
    sector: '半導體產業',
    price: 2480,
    change: 15.0,
    pctChange: 0.61,
    prevClose: 2465,
    open: 2470,
    high: 2495,
    low: 2465,
    volume: 38450, // 張
    turnover: '953.5 億',
    outVolume: 23450, // 外盤成交量
    inVolume: 15000,  // 內盤成交量
    outRatio: 61.0,   // 外盤比 (多方積極)
    inRatio: 39.0,    // 內盤比
    spread: 5.0,      // 盤差跳動點 (千元股跳動為 5 元)
    pe: 28.5,         // 本益比
    pb: 7.2,          // 股價淨值比
    eps: '87.00',     // 近四季累計 EPS
    revenueMonthly: '2,850.7 億',
    revYoY: '+33.0%',
    revMoM: '+7.8%',
    grossMargin: '55.2%',
    opMargin: '45.5%',
    roe: '29.4%',
    dividends: [
      { year: '2026 Q2', cash: 5.0, stock: 0.0, exDate: '2026/06/12', yield: '1.62%', fillDays: '當日填息' },
      { year: '2026 Q1', cash: 4.5, stock: 0.0, exDate: '2026/03/18', yield: '1.65%', fillDays: '2 天填息' },
      { year: '2025 全年', cash: 18.0, stock: 0.0, exDate: '2025/12/11', yield: '2.10%', fillDays: '1 天填息' },
      { year: '2024 全年', cash: 16.0, stock: 0.0, exDate: '2024/12/12', yield: '2.35%', fillDays: '3 天填息' }
    ],
    chips: {
      foreignStreak: '+8 日連買',
      trustStreak: '+12 日連買',
      dealerStreak: '+2 日買超',
      foreign5D: 42100, // 張
      trust5D: 18500,
      dealer5D: -1200,
      majorHoldingRatio: '87.4%', // 千張大戶持股比
      majorChange: '+0.35%',
      marginBalance: '12,450 張 (降 320 張)',
      shortBalance: '850 張 (微增 45 張)'
    },
    supplyChain: {
      position: '晶圓代工龍頭 (全球市佔 61%)',
      upstream: ['矽晶圓材料 (環球晶、台勝科)', '半導體設備 (ASML、應用材料)', '光阻劑/特殊氣體 (信越、長春)'],
      midstream: ['先進製程代工 2nm / 3nm / 5nm (台積電)', '同業比較 (聯電 2303、世界先進 5347、格羅方德)'],
      downstream: ['IC 設計旗艦客戶 (輝達 NVIDIA、蘋果 Apple、超微 AMD、聯發科 2454)', '先進封裝測試 (日月光投控 3711、京元電 2449)']
    },
    news: [
      { date: '2026-09-30 14:15', title: '台積電2奈米下半年量產如期推進，AI晶片大客戶搶訂先進封裝產能', source: 'MoneyDJ' },
      { date: '2026-09-29 18:30', title: '外資擴大買超台積電逾1.2萬張，目標價上看2600元以上', source: '鉅亨網' },
      { date: '2026-09-28 11:20', title: '晶圓代工產能稼動率維持高檔，台積電毛利率展望穩健樂觀', source: '財經 M 平方' }
    ]
  },
  '2317': {
    name: '鴻海',
    code: '2317',
    market: '上市 (電腦周邊)',
    sector: 'AI 伺服器與電子代工',
    price: 250.5,
    change: 3.5,
    pctChange: 1.42,
    prevClose: 247.0,
    open: 248.0,
    high: 252.0,
    low: 247.0,
    volume: 128910,
    turnover: '322.8 億',
    outVolume: 74200,
    inVolume: 54710,
    outRatio: 57.6,
    inRatio: 42.4,
    spread: 0.5,
    pe: 16.8,
    pb: 1.95,
    eps: '14.80',
    revenueMonthly: '6,182.1 億',
    revYoY: '+21.5%',
    revMoM: '+12.4%',
    grossMargin: '6.8%',
    opMargin: '3.6%',
    roe: '12.8%',
    dividends: [
      { year: '2025 全年', cash: 6.0, stock: 0.0, exDate: '2025/07/02', yield: '3.20%', fillDays: '14 天填息' },
      { year: '2024 全年', cash: 5.4, stock: 0.0, exDate: '2024/07/04', yield: '3.45%', fillDays: '9 天填息' }
    ],
    chips: {
      foreignStreak: '+5 日連買',
      trustStreak: '+7 日連買',
      dealerStreak: '+1 日買超',
      foreign5D: 28400,
      trust5D: 9200,
      dealer5D: 1400,
      majorHoldingRatio: '68.2%',
      majorChange: '+0.52%',
      marginBalance: '48,200 張',
      shortBalance: '3,100 張'
    },
    supplyChain: {
      position: '全球最大電子代工EMS / AI GB200 機櫃組裝領頭羊',
      upstream: ['AI 晶片 (NVIDIA Blackwell)', '散熱零組件 (奇鋐、雙鴻)', 'PCB載板 (欣興、景碩)'],
      midstream: ['整機機櫃系統整合 (鴻海 Foxconn)', '同業比較 (廣達 2382、緯創 3231、英業達 2356)'],
      downstream: ['雲端CSP巨頭 (微軟 Azure、亞馬遜 AWS、Google Cloud、Meta)']
    },
    news: [
      { date: '2026-09-30 13:50', title: '鴻海GB200 AI伺服器第四季出貨爆發，法說會展望能見度達2026年', source: '鉅亨網' },
      { date: '2026-09-29 16:10', title: '外資持續敲進鴻海，受惠AI伺服器與iPhone組裝雙引擎發酵', source: 'MoneyDJ' }
    ]
  },
  '2454': {
    name: '聯發科',
    code: '2454',
    market: '上市 (半導體)',
    sector: '半導體 IC 設計',
    price: 4910,
    change: 45.0,
    pctChange: 0.93,
    prevClose: 4865,
    open: 4880,
    high: 4940,
    low: 4870,
    volume: 18450,
    turnover: '905.8 億',
    outVolume: 11200,
    inVolume: 7250,
    outRatio: 60.7,
    inRatio: 39.3,
    spread: 10.0,
    pe: 22.4,
    pb: 5.6,
    eps: '84.40',
    revenueMonthly: '512.6 億',
    revYoY: '+24.1%',
    revMoM: '+4.5%',
    grossMargin: '50.2%',
    opMargin: '23.5%',
    roe: '25.8%',
    dividends: [
      { year: '2025 全年', cash: 62.0, stock: 0.0, exDate: '2025/06/20', yield: '4.85%', fillDays: '8 天填息' },
      { year: '2024 全年', cash: 55.0, stock: 0.0, exDate: '2024/06/18', yield: '5.10%', fillDays: '15 天填息' }
    ],
    chips: {
      foreignStreak: '+3 日連買',
      trustStreak: '+6 日連買',
      dealerStreak: '+1 日買超',
      foreign5D: 11200,
      trust5D: 5900,
      dealer5D: 420,
      majorHoldingRatio: '72.1%',
      majorChange: '+0.28%',
      marginBalance: '8,400 張',
      shortBalance: '420 張'
    },
    supplyChain: {
      position: '全球智慧型手機晶片與邊緣 AI 處理器龍頭',
      upstream: ['晶圓代工 (台積電 2330)', 'EDA工具 (Synopsys、Cadence)', 'IP授權 (ARM)'],
      midstream: ['天璣手機SOC、車用座艙晶片、ASIC晶片', '同業比較 (高通 Qualcomm、聯詠 3034、瑞昱 2379)'],
      downstream: ['終端品牌手機商 (vivo、OPPO、小米、三星) 與車載系統']
    },
    news: [
      { date: '2026-09-30 11:30', title: '聯發科天璣系列生成式AI旗艦晶片效能躍升，獲多款國際新機採納', source: 'Stock-Ai' }
    ]
  },
  '2603': {
    name: '長榮',
    code: '2603',
    market: '上市 (航運業)',
    sector: '航運物流與海運',
    price: 238.0,
    change: 3.0,
    pctChange: 1.28,
    prevClose: 235.0,
    open: 236.0,
    high: 239.5,
    low: 235.0,
    volume: 98400,
    turnover: '234.1 億',
    outVolume: 56400,
    inVolume: 42000,
    outRatio: 57.3,
    inRatio: 42.7,
    spread: 0.5,
    pe: 7.4,
    pb: 1.15,
    eps: '36.80',
    revenueMonthly: '412.4 億',
    revYoY: '+48.5%',
    revMoM: '+6.2%',
    grossMargin: '38.5%',
    opMargin: '31.2%',
    roe: '18.9%',
    dividends: [
      { year: '2025 全年', cash: 12.0, stock: 0.0, exDate: '2025/06/25', yield: '5.40%', fillDays: '21 天填息' },
      { year: '2024 全年', cash: 10.0, stock: 0.0, exDate: '2024/06/30', yield: '6.8%', fillDays: '30 天填息' }
    ],
    chips: {
      foreignStreak: '+4 日連買',
      trustStreak: '+3 日買超',
      dealerStreak: '+1 日買超',
      foreign5D: 22100,
      trust5D: 5100,
      dealer5D: 1800,
      majorHoldingRatio: '62.4%',
      majorChange: '+0.42%',
      marginBalance: '32,100 張',
      shortBalance: '2,800 張'
    },
    supplyChain: {
      position: '全球前七大貨櫃航運巨頭 / 海運聯盟龍頭',
      upstream: ['造船廠 (台船、韓造船)', '燃油供應商 (中油、國際船用重油)'],
      midstream: ['遠洋貨櫃航線營運 (美西、美東、歐地、地中海航線)', '同業比較 (陽明 2609、萬海 2615、馬士基 Maersk)'],
      downstream: ['國際進出口貨主、跨國零售商 (Walmart、Amazon)、貨運承攬業']
    },
    news: [
      { date: '2026-09-30 10:20', title: '紅海危機使歐洲航線運價維持高檔，長榮營收獲利動能充沛', source: '股感 StockFeel' }
    ]
  }
};

/**
 * 取得或動態產生符合三竹標準的個股分析數據
 */
export function getStockDetailData(symbolOrStock) {
  const code = typeof symbolOrStock === 'string' ? symbolOrStock : (symbolOrStock?.Code || symbolOrStock?.symbol || '2330');
  const existing = STOCK_PRESETS[code];

  if (existing) {
    const passedPrice = parseFloat(symbolOrStock?.ClosingPrice || symbolOrStock?.price || 0);
    const passedChange = parseFloat(symbolOrStock?.Change || symbolOrStock?.change || 0);
    let merged = { ...existing };
    if (passedPrice > 0) {
      merged.price = passedPrice;
      if (!isNaN(passedChange) && passedChange !== 0) {
        merged.change = passedChange;
        merged.prevClose = Number((passedPrice - passedChange).toFixed(2));
        merged.pctChange = Number(((passedChange / merged.prevClose) * 100).toFixed(2));
        merged.open = Number((passedPrice - passedChange * 0.4).toFixed(2));
        merged.high = Number((Math.max(passedPrice, merged.open) + Math.abs(passedChange) * 0.5).toFixed(2));
        merged.low = Number((Math.min(passedPrice, merged.open) - Math.abs(passedChange) * 0.5).toFixed(2));
      }
    }
    return enrichWithCalculatedMetrics(merged);
  }

  // 若為未預設標的，以該股真實行情動態產生擬真高規格三竹數據
  const basePrice = parseFloat(symbolOrStock?.ClosingPrice || symbolOrStock?.price || 100);
  const change = parseFloat(symbolOrStock?.Change || symbolOrStock?.change || 1.5);
  const name = symbolOrStock?.Name || symbolOrStock?.name || `個股 ${code}`;
  const sector = symbolOrStock?.Sector || '上市產業';
  const pct = basePrice > 0 ? ((change / basePrice) * 100).toFixed(2) : '1.50';

  const generated = {
    name,
    code,
    market: '上市 (TWSE)',
    sector,
    price: basePrice,
    change: change,
    pctChange: parseFloat(pct),
    prevClose: Number((basePrice - change).toFixed(2)),
    open: Number((basePrice - change * 0.4).toFixed(2)),
    high: Number((basePrice + Math.abs(change) * 0.8).toFixed(2)),
    low: Number((basePrice - Math.abs(change) * 0.8).toFixed(2)),
    volume: Math.floor(Math.random() * 30000 + 8000),
    turnover: `${((basePrice * 15000 * 1000) / 100000000).toFixed(1)} 億`,
    outVolume: Math.floor(Math.random() * 8000 + 5000),
    inVolume: Math.floor(Math.random() * 6000 + 3000),
    outRatio: 56.4,
    inRatio: 43.6,
    spread: 0.5,
    pe: 16.8,
    pb: 1.85,
    eps: (basePrice / 18).toFixed(2),
    revenueMonthly: `${(basePrice * 1.5).toFixed(1)} 億`,
    revYoY: '+16.8%',
    revMoM: '+3.2%',
    grossMargin: '31.5%',
    opMargin: '14.2%',
    roe: '15.4%',
    dividends: [
      { year: '2025 全年', cash: (basePrice * 0.045).toFixed(1), stock: 0.0, exDate: '2025/07/15', yield: '4.50%', fillDays: '12 天填息' },
      { year: '2024 全年', cash: (basePrice * 0.042).toFixed(1), stock: 0.0, exDate: '2024/07/18', yield: '4.20%', fillDays: '16 天填息' }
    ],
    chips: {
      foreignStreak: change >= 0 ? '+3 日連買' : '-2 日連賣',
      trustStreak: change >= 0 ? '+5 日連買' : '-1 日調節',
      dealerStreak: '+1 日買超',
      foreign5D: change >= 0 ? 8400 : -5200,
      trust5D: change >= 0 ? 3200 : -1400,
      dealer5D: 850,
      majorHoldingRatio: '58.6%',
      majorChange: '+0.15%',
      marginBalance: '15,200 張',
      shortBalance: '1,200 張'
    },
    supplyChain: {
      position: `${sector} 產業關鍵代表供應商`,
      upstream: ['原材料與核心零組件採購', '專利技術授權與軟硬體支援'],
      midstream: [`${name} 核心產品研發與精密製造`, '同業族群標的連動比較'],
      downstream: ['全球終端應用通路商與品牌大廠客戶']
    },
    news: [
      { date: '2026-09-30 14:00', title: `${name}(${code})營運動能穩健，法人長線資金持續關注籌碼變化`, source: 'MoneyDJ' },
      { date: '2026-09-29 16:30', title: `${name}公布最新單月獲利數字，毛利率受惠產品組合優化持續回升`, source: '鉅亨網' }
    ]
  };

  return enrichWithCalculatedMetrics(generated);
}

/**
 * 計算多週期技術線圖數據 (1D, 5D, 1M, 3M, 1Y 以及 分時, 日K, 週K, 月K, 60分K, 還原K)
 * 完整產生開盤 (open)、最高 (high)、最低 (low)、收盤 (close) 蠟燭線 OHLC 數值
 */
function enrichWithCalculatedMetrics(stock) {
  const base = stock.price;
  const isUp = stock.change >= 0;

  // 1. 1D: 盤中分時分鐘走勢 (09:00 ~ 13:30)
  const chart1D = [
    { time: '09:00', open: Number((base - stock.change).toFixed(2)), high: Number((base - stock.change * 0.7).toFixed(2)), low: Number((base - stock.change * 1.1).toFixed(2)), close: Number((base - stock.change * 0.9).toFixed(2)), price: Number((base - stock.change * 0.9).toFixed(2)), volume: Math.floor(stock.volume * 0.16), ma: Number((base - stock.change).toFixed(2)) },
    { time: '09:30', open: Number((base - stock.change * 0.9).toFixed(2)), high: Number((base - stock.change * 0.4).toFixed(2)), low: Number((base - stock.change * 1.0).toFixed(2)), close: Number((base - stock.change * 0.5).toFixed(2)), price: Number((base - stock.change * 0.5).toFixed(2)), volume: Math.floor(stock.volume * 0.14), ma: Number((base - stock.change * 0.7).toFixed(2)) },
    { time: '10:00', open: Number((base - stock.change * 0.5).toFixed(2)), high: Number((base - stock.change * 0.1).toFixed(2)), low: Number((base - stock.change * 0.6).toFixed(2)), close: Number((base - stock.change * 0.2).toFixed(2)), price: Number((base - stock.change * 0.2).toFixed(2)), volume: Math.floor(stock.volume * 0.12), ma: Number((base - stock.change * 0.4).toFixed(2)) },
    { time: '10:30', open: Number((base - stock.change * 0.2).toFixed(2)), high: Number((base + (isUp ? 1.5 : -1.0)).toFixed(2)), low: Number((base - stock.change * 0.3).toFixed(2)), close: Number((base + (isUp ? 0.8 : -1.2)).toFixed(2)), price: Number((base + (isUp ? 0.8 : -1.2)).toFixed(2)), volume: Math.floor(stock.volume * 0.10), ma: Number(base.toFixed(2)) },
    { time: '11:00', open: Number((base + (isUp ? 0.8 : -1.2)).toFixed(2)), high: Number((base + (isUp ? 2.5 : -0.5)).toFixed(2)), low: Number((base - (isUp ? 0.5 : 2.5)).toFixed(2)), close: Number((base + (isUp ? 1.8 : -1.8)).toFixed(2)), price: Number((base + (isUp ? 1.8 : -1.8)).toFixed(2)), volume: Math.floor(stock.volume * 0.11), ma: Number(base.toFixed(2)) },
    { time: '11:30', open: Number((base + (isUp ? 1.8 : -1.8)).toFixed(2)), high: Number((base + (isUp ? 2.0 : -1.0)).toFixed(2)), low: Number((base + (isUp ? 0.5 : -2.2)).toFixed(2)), close: Number((base + (isUp ? 1.0 : -1.5)).toFixed(2)), price: Number((base + (isUp ? 1.0 : -1.5)).toFixed(2)), volume: Math.floor(stock.volume * 0.09), ma: Number(base.toFixed(2)) },
    { time: '12:00', open: Number((base + (isUp ? 1.0 : -1.5)).toFixed(2)), high: Number((base + (isUp ? 1.6 : -0.8)).toFixed(2)), low: Number((base - (isUp ? 0.2 : 2.0)).toFixed(2)), close: Number((base + (isUp ? 0.5 : -1.0)).toFixed(2)), price: Number((base + (isUp ? 0.5 : -1.0)).toFixed(2)), volume: Math.floor(stock.volume * 0.08), ma: Number(base.toFixed(2)) },
    { time: '12:30', open: Number((base + (isUp ? 0.5 : -1.0)).toFixed(2)), high: Number((base + (isUp ? 2.0 : -0.5)).toFixed(2)), low: Number((base + (isUp ? 0.2 : -1.8)).toFixed(2)), close: Number((base + (isUp ? 1.2 : -1.2)).toFixed(2)), price: Number((base + (isUp ? 1.2 : -1.2)).toFixed(2)), volume: Math.floor(stock.volume * 0.10), ma: Number(base.toFixed(2)) },
    { time: '13:00', open: Number((base + (isUp ? 1.2 : -1.2)).toFixed(2)), high: Number((base + (isUp ? 2.8 : -0.2)).toFixed(2)), low: Number((base + (isUp ? 0.8 : -1.5)).toFixed(2)), close: Number((base + (isUp ? 2.0 : -1.0)).toFixed(2)), price: Number((base + (isUp ? 2.0 : -1.0)).toFixed(2)), volume: Math.floor(stock.volume * 0.13), ma: Number(base.toFixed(2)) },
    { time: '13:30', open: Number((base + (isUp ? 2.0 : -1.0)).toFixed(2)), high: Number(stock.high.toFixed(2)), low: Number(stock.low.toFixed(2)), close: Number(base.toFixed(2)), price: Number(base.toFixed(2)), volume: Math.floor(stock.volume * 0.17), ma: Number(base.toFixed(2)) }
  ];

  // 2. 5D: 近五日走勢
  const chart5D = [
    { time: '09/24', open: Number((base * 0.96).toFixed(2)), high: Number((base * 0.972).toFixed(2)), low: Number((base * 0.955).toFixed(2)), close: Number((base * 0.968).toFixed(2)), price: Number((base * 0.968).toFixed(2)), volume: Math.floor(stock.volume * 0.92), ma5: Number((base * 0.965).toFixed(2)) },
    { time: '09/25', open: Number((base * 0.968).toFixed(2)), high: Number((base * 0.982).toFixed(2)), low: Number((base * 0.964).toFixed(2)), close: Number((base * 0.976).toFixed(2)), price: Number((base * 0.976).toFixed(2)), volume: Math.floor(stock.volume * 1.05), ma5: Number((base * 0.970).toFixed(2)) },
    { time: '09/26', open: Number((base * 0.976).toFixed(2)), high: Number((base * 0.990).toFixed(2)), low: Number((base * 0.972).toFixed(2)), close: Number((base * 0.982).toFixed(2)), price: Number((base * 0.982).toFixed(2)), volume: Math.floor(stock.volume * 0.88), ma5: Number((base * 0.975).toFixed(2)) },
    { time: '09/29', open: Number((base * 0.982).toFixed(2)), high: Number((base * 0.992).toFixed(2)), low: Number((base * 0.978).toFixed(2)), close: Number((base - stock.change).toFixed(2)), price: Number((base - stock.change).toFixed(2)), volume: Math.floor(stock.volume * 1.12), ma5: Number((base * 0.982).toFixed(2)) },
    { time: '09/30 (今)', open: Number(stock.open.toFixed(2)), high: Number(stock.high.toFixed(2)), low: Number(stock.low.toFixed(2)), close: Number(base.toFixed(2)), price: Number(base.toFixed(2)), volume: stock.volume, ma5: Number((base * 0.988).toFixed(2)) }
  ];

  // 3. 1M: 近一個月日 K 線走勢 (20 交易日燭線)
  const chart1M = [];
  const days1M = 20;
  let currClose = base * 0.90;
  for (let i = 1; i <= days1M; i++) {
    const dayDelta = (Math.random() - 0.44) * (base * 0.025);
    const dayOpen = currClose;
    currClose = (i === days1M) ? base : Math.max(base * 0.82, currClose + dayDelta);
    const dayHigh = Math.max(dayOpen, currClose) + Math.random() * (base * 0.012);
    const dayLow = Math.min(dayOpen, currClose) - Math.random() * (base * 0.012);
    const vol = Math.floor(stock.volume * (0.65 + Math.random() * 0.7));

    chart1M.push({
      time: `09/${String(i).padStart(2, '0')}`,
      open: Number(dayOpen.toFixed(2)),
      high: Number(dayHigh.toFixed(2)),
      low: Number(dayLow.toFixed(2)),
      close: Number(currClose.toFixed(2)),
      price: Number(currClose.toFixed(2)),
      volume: vol,
      ma5: Number((currClose * (0.98 + (i / days1M) * 0.02)).toFixed(2)),
      ma20: Number((base * 0.94).toFixed(2))
    });
  }

  // 4. 3M: 近一季週 K 走勢 (12 根週 K 燭線)
  const chart3M = [];
  const weeks3M = 12;
  let wClose = base * 0.82;
  for (let w = 1; w <= weeks3M; w++) {
    const wDelta = (base * 0.018) + (Math.random() - 0.42) * (base * 0.03);
    const wOpen = wClose;
    wClose = (w === weeks3M) ? base : (wClose + wDelta);
    const wHigh = Math.max(wOpen, wClose) + Math.random() * (base * 0.025);
    const wLow = Math.min(wOpen, wClose) - Math.random() * (base * 0.02);
    const vol = Math.floor(stock.volume * (3.5 + Math.random() * 2.0));

    chart3M.push({
      time: `第${w}週`,
      open: Number(wOpen.toFixed(2)),
      high: Number(wHigh.toFixed(2)),
      low: Number(wLow.toFixed(2)),
      close: Number(wClose.toFixed(2)),
      price: Number(wClose.toFixed(2)),
      volume: vol,
      ma20: Number((wClose * 0.97).toFixed(2)),
      ma60: Number((base * 0.88).toFixed(2))
    });
  }

  // 5. 1Y: 近一年月 K 走勢 (12 根月 K 燭線)
  const chart1Y = [];
  const months1Y = 12;
  let mClose = base * 0.72;
  for (let m = 1; m <= months1Y; m++) {
    const mOpen = mClose;
    const mDelta = (base * 0.025) + (Math.random() - 0.4) * (base * 0.04);
    mClose = (m === months1Y) ? base : (mClose + mDelta);
    const mHigh = Math.max(mOpen, mClose) + Math.random() * (base * 0.035);
    const mLow = Math.min(mOpen, mClose) - Math.random() * (base * 0.03);
    const vol = Math.floor(stock.volume * (14 + Math.random() * 8));

    chart1Y.push({
      time: `${25 + Math.floor(m / 10)}/${String((m % 12) + 1).padStart(2, '0')}月`,
      open: Number(mOpen.toFixed(2)),
      high: Number(mHigh.toFixed(2)),
      low: Number(mLow.toFixed(2)),
      close: Number(mClose.toFixed(2)),
      price: Number(mClose.toFixed(2)),
      volume: vol,
      ma60: Number((mClose * 0.93).toFixed(2)),
      ma240: Number((base * 0.78).toFixed(2))
    });
  }

  // 6. 三竹多週期 K 線專屬數據集合 (分時, 日K, 週K, 月K, 60分K, 還原K)
  const klines = {
    '分時': chart1D,
    '日K': chart1M,
    '週K': chart3M,
    '月K': chart1Y,
    '60分K': chart1D.map((p, idx) => ({
      ...p,
      time: `${String(9 + Math.floor(idx * 0.6)).padStart(2, '0')}:00`,
      ma5: Number((p.close * 0.99).toFixed(2))
    })),
    '還原K': chart1M.map(p => ({
      ...p,
      open: Number((p.open * 1.04).toFixed(2)),
      high: Number((p.high * 1.04).toFixed(2)),
      low: Number((p.low * 1.04).toFixed(2)),
      close: Number((p.close * 1.04).toFixed(2)),
      price: Number((p.close * 1.04).toFixed(2)),
      ma5: Number((p.ma5 * 1.04).toFixed(2)),
      ma20: Number((p.ma20 * 1.04).toFixed(2))
    }))
  };

  return {
    ...stock,
    charts: {
      '1D': chart1D,
      '5D': chart5D,
      '1M': chart1M,
      '3M': chart3M,
      '1Y': chart1Y
    },
    klines
  };
}
