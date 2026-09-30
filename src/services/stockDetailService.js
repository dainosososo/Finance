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
    price: 990,
    change: 15.0,
    pctChange: 1.54,
    prevClose: 975,
    open: 980,
    high: 995,
    low: 978,
    volume: 38450, // 張
    turnover: '378.5 億',
    outVolume: 23450, // 外盤成交量
    inVolume: 15000,  // 內盤成交量
    outRatio: 61.0,   // 外盤比 (多方積極)
    inRatio: 39.0,    // 內盤比
    spread: 1.0,      // 盤差跳動點
    pe: 25.4,         // 本益比
    pb: 6.8,          // 股價淨值比
    eps: '39.80',     // 近四季累計 EPS
    revenueMonthly: '2,508.7 億',
    revYoY: '+33.0%',
    revMoM: '+7.8%',
    grossMargin: '53.2%',
    opMargin: '42.5%',
    roe: '27.4%',
    dividends: [
      { year: '2026 Q2', cash: 4.0, stock: 0.0, exDate: '2026/06/12', yield: '1.62%', fillDays: '當日填息' },
      { year: '2026 Q1', cash: 4.0, stock: 0.0, exDate: '2026/03/18', yield: '1.65%', fillDays: '2 天填息' },
      { year: '2025 全年', cash: 14.0, stock: 0.0, exDate: '2025/12/11', yield: '2.10%', fillDays: '1 天填息' },
      { year: '2024 全年', cash: 13.0, stock: 0.0, exDate: '2024/12/12', yield: '2.35%', fillDays: '3 天填息' }
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
      { date: '2026-09-29 18:30', title: '外資擴大買超台積電逾1.2萬張，目標價上看千元以上', source: '鉅亨網' },
      { date: '2026-09-28 11:20', title: '晶圓代工產能稼動率維持高檔，台積電毛利率展望穩健樂觀', source: '財經 M 平方' }
    ]
  },
  '2317': {
    name: '鴻海',
    code: '2317',
    market: '上市 (電腦周邊)',
    sector: 'AI 伺服器與電子代工',
    price: 185,
    change: 3.5,
    pctChange: 1.93,
    prevClose: 181.5,
    open: 182.0,
    high: 186.0,
    low: 181.0,
    volume: 128910,
    turnover: '238.4 億',
    outVolume: 74200,
    inVolume: 54710,
    outRatio: 57.6,
    inRatio: 42.4,
    spread: 0.5,
    pe: 14.8,
    pb: 1.65,
    eps: '11.50',
    revenueMonthly: '5,482.1 億',
    revYoY: '+21.5%',
    revMoM: '+12.4%',
    grossMargin: '6.4%',
    opMargin: '3.1%',
    roe: '10.8%',
    dividends: [
      { year: '2025 全年', cash: 5.4, stock: 0.0, exDate: '2025/07/02', yield: '3.20%', fillDays: '14 天填息' },
      { year: '2024 全年', cash: 5.3, stock: 0.0, exDate: '2024/07/04', yield: '3.45%', fillDays: '9 天填息' }
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
    price: 1235,
    change: 30.0,
    pctChange: 2.49,
    prevClose: 1205,
    open: 1210,
    high: 1245,
    low: 1205,
    volume: 18450,
    turnover: '228.6 億',
    outVolume: 11200,
    inVolume: 7250,
    outRatio: 60.7,
    inRatio: 39.3,
    spread: 5.0,
    pe: 18.2,
    pb: 4.8,
    eps: '68.40',
    revenueMonthly: '445.6 億',
    revYoY: '+24.1%',
    revMoM: '+4.5%',
    grossMargin: '49.8%',
    opMargin: '21.5%',
    roe: '23.8%',
    dividends: [
      { year: '2025 全年', cash: 55.0, stock: 0.0, exDate: '2025/06/20', yield: '4.85%', fillDays: '8 天填息' },
      { year: '2024 全年', cash: 54.0, stock: 0.0, exDate: '2024/06/18', yield: '5.10%', fillDays: '15 天填息' }
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
    price: 195.5,
    change: 4.5,
    pctChange: 2.36,
    prevClose: 191.0,
    open: 192.0,
    high: 197.0,
    low: 191.5,
    volume: 98400,
    turnover: '192.1 億',
    outVolume: 56400,
    inVolume: 42000,
    outRatio: 57.3,
    inRatio: 42.7,
    spread: 0.5,
    pe: 6.2,
    pb: 0.95,
    eps: '32.10',
    revenueMonthly: '382.4 億',
    revYoY: '+48.5%',
    revMoM: '+6.2%',
    grossMargin: '38.5%',
    opMargin: '31.2%',
    roe: '18.9%',
    dividends: [
      { year: '2025 全年', cash: 10.0, stock: 0.0, exDate: '2025/06/25', yield: '5.40%', fillDays: '21 天填息' },
      { year: '2024 全年', cash: 70.0, stock: 0.0, exDate: '2024/06/30', yield: '12.8%', fillDays: '45 天填息' }
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
    return enrichWithCalculatedMetrics(existing);
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
 * 計算多週期技術線圖數據 (1D, 5D, 1M, 3M, 1Y)
 */
function enrichWithCalculatedMetrics(stock) {
  const base = stock.price;
  const isUp = stock.change >= 0;

  // 1D: 盤中分時走勢 (09:00 ~ 13:30, 7 個關鍵時段)
  const chart1D = [
    { time: '09:00', price: Number((base - stock.change).toFixed(2)), volume: Math.floor(stock.volume * 0.18), ma: Number((base - stock.change).toFixed(2)) },
    { time: '09:30', price: Number((base - stock.change * 0.6).toFixed(2)), volume: Math.floor(stock.volume * 0.15), ma: Number((base - stock.change * 0.8).toFixed(2)) },
    { time: '10:00', price: Number((base - stock.change * 0.2).toFixed(2)), volume: Math.floor(stock.volume * 0.12), ma: Number((base - stock.change * 0.5).toFixed(2)) },
    { time: '11:00', price: Number((base + (isUp ? 2.5 : -2.5)).toFixed(2)), volume: Math.floor(stock.volume * 0.14), ma: Number(base.toFixed(2)) },
    { time: '12:00', price: Number((base - (isUp ? 1.0 : -1.0)).toFixed(2)), volume: Math.floor(stock.volume * 0.11), ma: Number(base.toFixed(2)) },
    { time: '13:00', price: Number((base + (isUp ? 1.5 : -1.5)).toFixed(2)), volume: Math.floor(stock.volume * 0.16), ma: Number(base.toFixed(2)) },
    { time: '13:30', price: Number(base.toFixed(2)), volume: Math.floor(stock.volume * 0.14), ma: Number(base.toFixed(2)) }
  ];

  // 5D: 近五日走勢
  const chart5D = [
    { time: '09/24', price: Number((base * 0.965).toFixed(2)), volume: Math.floor(stock.volume * 0.9), ma5: Number((base * 0.97).toFixed(2)) },
    { time: '09/25', price: Number((base * 0.978).toFixed(2)), volume: Math.floor(stock.volume * 1.05), ma5: Number((base * 0.972).toFixed(2)) },
    { time: '09/26', price: Number((base * 0.985).toFixed(2)), volume: Math.floor(stock.volume * 0.88), ma5: Number((base * 0.976).toFixed(2)) },
    { time: '09/29', price: Number((base - stock.change).toFixed(2)), volume: Math.floor(stock.volume * 1.1), ma5: Number((base * 0.985).toFixed(2)) },
    { time: '09/30 (今)', price: Number(base.toFixed(2)), volume: stock.volume, ma5: Number((base * 0.99).toFixed(2)) }
  ];

  // 1M: 近一個月日 K 線走勢 (含 MA5, MA20 均線)
  const chart1M = [];
  const days1M = 20;
  let currP = base * 0.92;
  for (let i = 1; i <= days1M; i++) {
    const dayDelta = (Math.random() - 0.45) * (base * 0.02);
    currP = Math.max(base * 0.8, currP + dayDelta);
    if (i === days1M) currP = base;
    chart1M.push({
      time: `09/${String(i).padStart(2, '0')}`,
      price: Number(currP.toFixed(2)),
      ma5: Number((currP * 0.99).toFixed(2)),
      ma20: Number((base * 0.95).toFixed(2)),
      volume: Math.floor(stock.volume * (0.7 + Math.random() * 0.6))
    });
  }

  // 3M: 近一季趨勢 (含 MA20, MA60 季線)
  const chart3M = [];
  const weeks3M = 12;
  let wPrice = base * 0.85;
  for (let w = 1; w <= weeks3M; w++) {
    wPrice += (base * 0.015) + (Math.random() - 0.4) * (base * 0.02);
    if (w === weeks3M) wPrice = base;
    chart3M.push({
      time: `第${w}週`,
      price: Number(wPrice.toFixed(2)),
      ma20: Number((wPrice * 0.98).toFixed(2)),
      ma60: Number((base * 0.89).toFixed(2)),
      volume: Math.floor(stock.volume * (0.8 + Math.random() * 0.5))
    });
  }

  // 1Y: 近一年趨勢 (含 52 週高低區間與年線 MA240)
  const chart1Y = [
    { time: '2025 Q4', price: Number((base * 0.75).toFixed(2)), ma60: Number((base * 0.72).toFixed(2)), ma240: Number((base * 0.70).toFixed(2)), volume: 154200 },
    { time: '2026 Q1', price: Number((base * 0.82).toFixed(2)), ma60: Number((base * 0.78).toFixed(2)), ma240: Number((base * 0.74).toFixed(2)), volume: 182300 },
    { time: '2026 Q2', price: Number((base * 0.91).toFixed(2)), ma60: Number((base * 0.86).toFixed(2)), ma240: Number((base * 0.80).toFixed(2)), volume: 224500 },
    { time: '2026 Q3', price: Number(base.toFixed(2)), ma60: Number((base * 0.94).toFixed(2)), ma240: Number((base * 0.86).toFixed(2)), volume: 284100 }
  ];

  return {
    ...stock,
    charts: {
      '1D': chart1D,
      '5D': chart5D,
      '1M': chart1M,
      '3M': chart3M,
      '1Y': chart1Y
    }
  };
}
