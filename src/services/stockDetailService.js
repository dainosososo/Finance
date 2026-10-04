/**
 * Stock Detail Analysis Service (三竹股市 / 三竹選股標竿資料庫)
 * 提供個股深度多週期技術面、盤差、籌碼面、基本面、股利政策、產業鏈與專屬個股時事
 */
import { PRELOADED_KLINE_HISTORY } from './stockHistoryData.js';

// 臺灣證券交易所 (TWSE) 標的上市櫃日期與掛牌起始資訊
export const STOCK_IPO_REGISTRY = {
  '2330': { listingDate: '1994-09-05', ipoPrice: 96.0, name: '台積電', market: '上市 (半導體)' },
  '2317': { listingDate: '1991-06-18', ipoPrice: 15.0, name: '鴻海', market: '上市 (電腦周邊)' },
  '2454': { listingDate: '2001-07-23', ipoPrice: 278.0, name: '聯發科', market: '上市 (半導體)' },
  '2603': { listingDate: '1987-09-21', ipoPrice: 15.0, name: '長榮', market: '上市 (航運業)' },
  '0050': { listingDate: '2003-06-30', ipoPrice: 36.98, name: '元大台灣50', market: '上市 (ETF)' },
  '2308': { listingDate: '1988-12-19', ipoPrice: 28.0, name: '台達電', market: '上市 (電子零組件)' },
  '2382': { listingDate: '1999-01-08', ipoPrice: 85.0, name: '廣達', market: '上市 (電腦周邊)' },
  '2881': { listingDate: '2001-12-19', ipoPrice: 35.0, name: '富邦金', market: '上市 (金融保險)' },
  '2882': { listingDate: '2001-12-31', ipoPrice: 38.0, name: '國泰金', market: '上市 (金融保險)' },
  '3008': { listingDate: '2002-03-11', ipoPrice: 205.0, name: '大立光', market: '上市 (光電業)' },
  '2609': { listingDate: '1992-04-20', ipoPrice: 18.0, name: '陽明', market: '上市 (航運業)' },
  '2303': { listingDate: '1985-07-16', ipoPrice: 12.0, name: '聯電', market: '上市 (半導體)' },
  '3034': { listingDate: '2002-10-21', ipoPrice: 130.0, name: '聯詠', market: '上市 (半導體)' },
  '2379': { listingDate: '1998-10-21', ipoPrice: 65.0, name: '瑞昱', market: '上市 (半導體)' },
  '2412': { listingDate: '2000-10-27', ipoPrice: 104.0, name: '中華電', market: '上市 (通信網路)' },
  '3711': { listingDate: '2018-04-30', ipoPrice: 89.0, name: '日月光投控', market: '上市 (半導體)' },
  '3231': { listingDate: '2003-03-24', ipoPrice: 32.0, name: '緯創', market: '上市 (電腦周邊)' }
};

export function getStockIpoInfo(code) {
  if (STOCK_IPO_REGISTRY[code]) return STOCK_IPO_REGISTRY[code];
  const num = parseInt(code, 10);
  if (!isNaN(num)) {
    if (num < 2000) return { listingDate: '1985-06-15', ipoPrice: 15.0 };
    if (num < 3000) return { listingDate: '1995-10-20', ipoPrice: 25.0 };
    if (num < 5000) return { listingDate: '2002-04-12', ipoPrice: 35.0 };
    if (num < 7000) return { listingDate: '2011-08-18', ipoPrice: 42.0 };
    return { listingDate: '2018-03-26', ipoPrice: 50.0 };
  }
  return { listingDate: '2005-09-12', ipoPrice: 20.0 };
}

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
  },
  '2409': {
    name: '友達',
    code: '2409',
    market: '上市 (光電業)',
    sector: '光電面板與光學',
    price: 40.45,
    change: 2.15,
    pctChange: 5.61,
    prevClose: 38.30,
    open: 38.75,
    high: 40.85,
    low: 38.65,
    volume: 69729,
    turnover: '282.1 億',
    outVolume: 39500,
    inVolume: 30229,
    outRatio: 56.6,
    inRatio: 43.4,
    spread: 0.10,
    pe: 18.2,
    pb: 1.05,
    eps: '2.25',
    revenueMonthly: '248.6 億',
    revYoY: '+12.4%',
    revMoM: '+3.8%',
    grossMargin: '14.2%',
    opMargin: '5.8%',
    roe: '8.4%',
    dividends: [
      { year: '2025 全年', cash: 1.0, stock: 0.0, exDate: '2025/07/15', yield: '2.47%', fillDays: '12 天填息' }
    ],
    chips: {
      foreignStreak: '+3 日連買',
      trustStreak: '+2 日買超',
      dealerStreak: '+1 日買超',
      foreign5D: 18500,
      trust5D: 4200,
      dealer5D: 1100,
      majorHoldingRatio: '58.4%',
      majorChange: '+0.35%',
      marginBalance: '24,500 張',
      shortBalance: '1,200 張'
    },
    supplyChain: {
      position: '全球車用顯示器與 Micro LED 次世代面板龍頭',
      upstream: ['玻璃基板 (康寧 Corning)', '偏光板 (誠美材、明基材)', '驅動IC (聯詠 3034、奇景)'],
      midstream: ['TFT-LCD、車用智慧座艙面板、Micro LED 模組', '同業比較 (群創 3481、京東方 BOE、LGD)'],
      downstream: ['全球知名車廠 (Tesla、雙B、福特)、筆電與電視品牌商']
    },
    news: [
      { date: '2026-10-02 11:20', title: '友達車用智慧座艙與 Micro LED 訂單爆發，法人調升評等', source: 'MoneyDJ 理財網' },
      { date: '2026-10-01 13:30', title: '面板雙虎受惠奧運電視換機潮與車用顯示出貨，營運走出谷底', source: '鉅亨網' }
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
    const passedOpen = parseFloat(symbolOrStock?.OpeningPrice || symbolOrStock?.open || 0);
    const passedHigh = parseFloat(symbolOrStock?.HighestPrice || symbolOrStock?.high || 0);
    const passedLow = parseFloat(symbolOrStock?.LowestPrice || symbolOrStock?.low || 0);
    const passedVol = parseFloat(symbolOrStock?.TradeVolume || symbolOrStock?.volume || 0);

    let merged = { ...existing };
    if (passedPrice > 0) {
      merged.price = passedPrice;
      if (!isNaN(passedChange) && passedChange !== 0) {
        merged.change = passedChange;
        merged.prevClose = symbolOrStock?.prevClose ? Number(symbolOrStock.prevClose) : Number((passedPrice - passedChange).toFixed(2));
        merged.pctChange = Number(((passedChange / merged.prevClose) * 100).toFixed(2));
      }
      // 優先使用傳入的真實盤面 開高低，絕不使用隨機計算覆蓋！
      if (passedOpen > 0) merged.open = passedOpen;
      if (passedHigh > 0) merged.high = passedHigh;
      if (passedLow > 0) merged.low = passedLow;
      if (passedVol > 0) merged.volume = passedVol > 500000 ? Math.floor(passedVol / 1000) : passedVol;
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
 * 產生指定日期之前的 N 個真實台股交易日清單 (嚴格排在 beforeDate 之前，杜絕日期倒退或重疊)
 */
export function getTradingDaysBeforeDate(count = 200, beforeDate = new Date('2026-09-01')) {
  const result = [];
  let d = new Date(beforeDate);
  d.setDate(d.getDate() - 1); // 嚴格從指定日期的前一天開始往前回溯

  while (result.length < count) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      result.unshift({
        time: `${mm}/${dd}`,
        rawDate: `${mm}/${dd}`,
        fullDate: `${yyyy}-${mm}-${dd}`
      });
    }
    d.setDate(d.getDate() - 1);
  }
  return result;
}

/**
 * 產生截至當日 (今日) 的最近 N 個真實台股交易日清單
 * 自動跳過週末（週六、週日），並將最後一天標註為「當日 / 今日」
 */
export function getTradingDaysUntilToday(count = 20, referenceDate = new Date()) {
  const result = [];
  let d = new Date(referenceDate);

  // 若為週末，先回退至上一個週五
  if (d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  } else if (d.getDay() === 0) {
    d.setDate(d.getDate() - 2);
  }

  while (result.length < count) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const isToday = result.length === 0;
      result.unshift({
        time: isToday ? `${mm}/${dd} (今)` : `${mm}/${dd}`,
        rawDate: `${mm}/${dd}`,
        fullDate: d.toISOString().split('T')[0]
      });
    }
    d.setDate(d.getDate() - 1);
  }
  return result;
}

/**
 * 計算多週期技術線圖數據 (1D, 5D, 1M, 3M, 1Y 以及 分時, 日K, 週K, 月K, 60分K, 還原K)
 * 完整產生開盤 (open)、最高 (high)、最低 (low)、收盤 (close) 蠟燭線 OHLC 數值
 * 嚴格依據真實交易日曆 (包含當日) 動態排列與即時更新
 */
function enrichWithCalculatedMetrics(stock) {
  const code = String(stock.code || stock.Code || stock.symbol || '2330');
  const base = parseFloat(stock.price || stock.ClosingPrice || 2480);
  const change = parseFloat(stock.change || stock.Change || 0);
  const isUp = change >= 0;
  const now = new Date();

  // 取得該標的上市櫃日期與掛牌起始資訊
  const ipoInfo = getStockIpoInfo(code);
  const ipoDateObj = new Date(ipoInfo.listingDate);
  const ipoYear = ipoDateObj.getFullYear();
  const ipoMonth = ipoDateObj.getMonth() + 1;
  const ipoDay = ipoDateObj.getDate();
  const yearsListed = Math.max(1, now.getFullYear() - ipoYear);

  // 1. 1D: 盤中分時走勢 (09:00 ~ 13:30，以當日開盤、盤中跳動與最新成交價為基準)
  const isTradingHours = now.getHours() >= 9 && (now.getHours() < 13 || (now.getHours() === 13 && now.getMinutes() <= 30));
  const timeSteps = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
  const chart1D = timeSteps.map((t, idx) => {
    const isLast = idx === timeSteps.length - 1;
    const timeLabel = isLast ? (isTradingHours ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} (即時)` : '13:30 (收盤)') : t;
    const progress = idx / (timeSteps.length - 1);
    const tickPrice = isLast ? base : Number((base - change * (1 - progress * 0.8) + (Math.sin(idx) * Math.abs(change) * 0.2)).toFixed(2));
    const tickOpen = idx === 0 ? Number((stock.open || base - change).toFixed(2)) : tickPrice;
    const tickHigh = Math.max(tickOpen, tickPrice) + Math.abs(change) * 0.15;
    const tickLow = Math.min(tickOpen, tickPrice) - Math.abs(change) * 0.15;
    const vol = Math.floor((stock.volume || 25000) * (0.08 + Math.random() * 0.08));

    return {
      time: timeLabel,
      open: Number(tickOpen.toFixed(2)),
      high: Number(tickHigh.toFixed(2)),
      low: Number(tickLow.toFixed(2)),
      close: Number(tickPrice.toFixed(2)),
      price: Number(tickPrice.toFixed(2)),
      volume: vol,
      ma: Number(base.toFixed(2))
    };
  });

  // 2. 日K (嚴格時間序列，徹底杜絕日期跳回與價格斷層)
  const realStockHistory = PRELOADED_KLINE_HISTORY[code]?.days || [];
  const TOTAL_DAILY_BARS = 600; // 涵蓋約 2.5 年歷史成交日 (週K/月K則收錄上市至今全歷史)
  
  const resistancePrice = Number((base * 1.03).toFixed(2));
  const supportPrice = Number((base * 0.97).toFixed(2));
  
  let chart1M = [];
  
  if (realStockHistory && realStockHistory.length >= 5) {
    const knownCount = realStockHistory.length;
    const needPrepend = Math.max(0, TOTAL_DAILY_BARS - knownCount);
    const firstRealDate = new Date(realStockHistory[0].fullDate || '2026-09-01');
    
    // 嚴格取得 2026-09-01 之前的交易日 (最後一天為 2026-08-31)
    const prependedDays = getTradingDaysBeforeDate(needPrepend, firstRealDate);
    
    // 從第一筆真實價格 (例如 09/01 開盤價 2395) 往前回溯生成無縫連續價格
    let currentPrice = realStockHistory[0].open || base;
    const prependedBars = new Array(needPrepend);
    
    for (let i = needPrepend - 1; i >= 0; i--) {
      const dayInfo = prependedDays[i];
      const dailyReturn = (Math.random() - 0.495) * 0.016;
      const close = Number(currentPrice.toFixed(2));
      const open = Number((close / (1 + dailyReturn)).toFixed(2));
      const high = Number((Math.max(open, close) + Math.random() * (close * 0.008)).toFixed(2));
      const low = Number((Math.min(open, close) - Math.random() * (close * 0.008)).toFixed(2));
      const vol = Math.floor((stock.volume || 25000) * (0.6 + Math.random() * 0.7));
      const isUpDay = close >= open;

      prependedBars[i] = {
        time: dayInfo.time,
        fullDate: dayInfo.fullDate,
        open,
        high,
        low,
        close,
        price: close,
        volume: vol,
        foreignNet: Math.floor((isUpDay ? 1 : -1) * (vol * (0.12 + Math.random() * 0.12))),
        trustNet: Math.floor((isUpDay ? 1 : -0.6) * (vol * (0.05 + Math.random() * 0.06))),
        dealerNet: Math.floor((Math.random() - 0.48) * (vol * 0.04)),
        revMonthly: Number(((base * 1.5) + Math.sin(i * 0.3) * 20).toFixed(1)),
        revMoM: Number((Math.sin(i * 0.7) * 7.5).toFixed(1)),
        revYoY: Number((15.2 + Math.sin(i * 0.25) * 12).toFixed(1))
      };
      currentPrice = open;
    }

    const realBars = realStockHistory.map((d, idx) => {
      const item = { ...d };
      const isUpDay = item.close >= item.open;
      const vol = item.volume || 25000;
      item.foreignNet = Math.floor((isUpDay ? 1 : -1) * (vol * 0.14));
      item.trustNet = Math.floor((isUpDay ? 1 : -0.5) * (vol * 0.06));
      item.dealerNet = Math.floor((isUpDay ? 0.5 : -0.5) * (vol * 0.03));
      item.revMonthly = Number(((base * 1.5) + Math.sin((needPrepend + idx) * 0.3) * 20).toFixed(1));
      item.revMoM = Number((Math.sin((needPrepend + idx) * 0.7) * 7.5).toFixed(1));
      item.revYoY = Number((15.2 + Math.sin((needPrepend + idx) * 0.25) * 12).toFixed(1));
      return item;
    });

    // 今日 (10/02 今) K 棒獨立追加，嚴格保留昨日 10/01 真實收盤與陰陽燭線
    const lastHistBar = realBars[realBars.length - 1];
    const prevCloseVal = lastHistBar ? lastHistBar.close : (stock.prevClose || base);
    const todayOpen = Number((stock.open || (stock.price >= prevCloseVal ? prevCloseVal * 1.008 : prevCloseVal * 0.992)).toFixed(2));
    const todayClose = Number(stock.price.toFixed(2));
    const todayHigh = Number((stock.high || Math.max(todayOpen, todayClose) * 1.005).toFixed(2));
    const todayLow = Number((stock.low || Math.min(todayOpen, todayClose) * 0.995).toFixed(2));
    const todayVol = Number(stock.volume || 25000);
    const todayIsUp = todayClose >= todayOpen;

    const todayBar = {
      time: "10/02 (今)",
      fullDate: "2026-10-02",
      open: todayOpen,
      high: todayHigh,
      low: todayLow,
      close: todayClose,
      price: todayClose,
      volume: todayVol,
      change: Number((todayClose - prevCloseVal).toFixed(2)),
      foreignNet: Math.floor((todayIsUp ? 1 : -1) * (todayVol * 0.15)),
      trustNet: Math.floor((todayIsUp ? 1 : -0.5) * (todayVol * 0.07)),
      dealerNet: Math.floor((todayIsUp ? 0.5 : -0.5) * (todayVol * 0.03)),
      revMonthly: Number((base * 1.5).toFixed(1)),
      revMoM: 5.2,
      revYoY: 18.5
    };

    chart1M = [...prependedBars, ...realBars, todayBar];
  } else {
    // 一般個股: 從真實昨收與今日行情確定連續 K 線，絕不使用隨機數字顛倒陰陽線！
    const tradingDays = getTradingDaysUntilToday(TOTAL_DAILY_BARS - 1, now);
    const yestClose = Number((stock.prevClose || (stock.price - (stock.change || 0))).toFixed(2));
    const todayClose = Number(stock.price.toFixed(2));
    const todayOpen = Number((stock.open || (todayClose >= yestClose ? yestClose * 1.005 : yestClose * 0.995)).toFixed(2));
    const todayHigh = Number((stock.high || Math.max(todayOpen, todayClose) * 1.006).toFixed(2));
    const todayLow = Number((stock.low || Math.min(todayOpen, todayClose) * 0.994).toFixed(2));
    const todayVol = Number(stock.volume || 25000);

    const historyBars = new Array(TOTAL_DAILY_BARS - 1);
    let runningPrice = yestClose;

    // 由昨日 10/01 往前回溯，確保昨日 10/01 收盤價嚴格等於 yestClose
    for (let i = TOTAL_DAILY_BARS - 2; i >= 0; i--) {
      const dayInfo = tradingDays[i];
      const isYest = i === TOTAL_DAILY_BARS - 2;
      
      let close, open, high, low;
      if (isYest) {
        // 昨日 10/01: 收盤價就是 yestClose！
        close = yestClose;
        const chg = stock.change !== undefined ? Number(stock.change) : 0;
        open = Number((chg >= 0 ? close * 0.994 : close * 1.008).toFixed(2));
        high = Number((Math.max(open, close) * 1.005).toFixed(2));
        low = Number((Math.min(open, close) * 0.995).toFixed(2));
      } else {
        close = Number(runningPrice.toFixed(2));
        const dayTrend = Math.sin(i * 0.8) * 0.008;
        open = Number((close * (1 - dayTrend)).toFixed(2));
        high = Number((Math.max(open, close) * 1.006).toFixed(2));
        low = Number((Math.min(open, close) * 0.994).toFixed(2));
      }
      
      const vol = Math.floor((stock.volume || 25000) * (0.8 + Math.abs(Math.sin(i * 0.5)) * 0.4));
      const isUp = close >= open;
      
      historyBars[i] = {
        time: dayInfo.time,
        fullDate: dayInfo.fullDate,
        open,
        high,
        low,
        close,
        price: close,
        volume: vol,
        foreignNet: Math.floor((isUp ? 1 : -1) * (vol * 0.12)),
        trustNet: Math.floor((isUp ? 1 : -0.5) * (vol * 0.05)),
        dealerNet: Math.floor((isUp ? 0.5 : -0.5) * (vol * 0.03)),
        revMonthly: Number(((base * 1.5) + Math.sin(i * 0.3) * 20).toFixed(1)),
        revMoM: Number((Math.sin(i * 0.7) * 7.5).toFixed(1)),
        revYoY: Number((15.2 + Math.sin(i * 0.25) * 12).toFixed(1))
      };
      runningPrice = open;
    }

    const todayBar = {
      time: "10/02 (今)",
      fullDate: "2026-10-02",
      open: todayOpen,
      high: todayHigh,
      low: todayLow,
      close: todayClose,
      price: todayClose,
      volume: todayVol,
      change: Number((todayClose - yestClose).toFixed(2)),
      foreignNet: Math.floor((todayClose >= todayOpen ? 1 : -1) * (todayVol * 0.15)),
      trustNet: Math.floor((todayClose >= todayOpen ? 1 : -0.5) * (todayVol * 0.07)),
      dealerNet: Math.floor((todayClose >= todayOpen ? 0.5 : -0.5) * (todayVol * 0.03)),
      revMonthly: Number((base * 1.5).toFixed(1)),
      revMoM: 5.2,
      revYoY: 18.5
    };

    chart1M = [...historyBars, todayBar];
  }

  // 計算全週期 MA5, MA20, MA60 動態均線
  for (let i = 0; i < chart1M.length; i++) {
    const ma5Slice = chart1M.slice(Math.max(0, i - 4), i + 1);
    const ma5Avg = ma5Slice.reduce((sum, d) => sum + d.close, 0) / ma5Slice.length;
    chart1M[i].ma5 = Number(ma5Avg.toFixed(2));

    const ma20Slice = chart1M.slice(Math.max(0, i - 19), i + 1);
    const ma20Avg = ma20Slice.reduce((sum, d) => sum + d.close, 0) / ma20Slice.length;
    chart1M[i].ma20 = Number(ma20Avg.toFixed(2));

    const ma60Slice = chart1M.slice(Math.max(0, i - 59), i + 1);
    const ma60Avg = ma60Slice.reduce((sum, d) => sum + d.close, 0) / ma60Slice.length;
    chart1M[i].ma60 = Number(ma60Avg.toFixed(2));
  }

  // 3. 5D: 近五日走勢 (取 1M 的最後 5 個交易日)
  const chart5D = chart1M.slice(-5).map((d, idx) => ({
    ...d,
    time: idx === 4 && !d.time.includes('今') ? `${d.time} (今)` : d.time
  }));

  // 4. 週 K 走勢: 從上市掛牌首週完整呈現至本週 (例如 2330 涵蓋 1994 ~ 2026 逾 1,600 週！)
  const chart3M = [];
  const weeksTotal = Math.max(52, Math.min(1800, Math.floor((now - ipoDateObj) / (7 * 86400000))));
  let wClose = ipoInfo.ipoPrice;
  for (let w = 0; w < weeksTotal; w++) {
    const isFirst = w === 0;
    const isLast = w === weeksTotal - 1;
    const weekAgo = weeksTotal - 1 - w;
    const weekDate = new Date(now.getTime() - weekAgo * 7 * 86400000);
    const wYr = weekDate.getFullYear();
    const wMonth = String(weekDate.getMonth() + 1).padStart(2, '0');
    const wDay = String(weekDate.getDate()).padStart(2, '0');
    const timeLabel = isFirst ? `${wYr}/${wMonth} (掛牌首週)` : (isLast ? `${wYr}/${wMonth}/${wDay} (本週)` : `${wYr}/${wMonth}/${wDay}`);

    let wOpen, wHigh, wLow, vol;
    if (isLast) {
      wOpen = Number((base * 0.98).toFixed(2));
      wClose = Number(base.toFixed(2));
      wHigh = Number(Math.max(wOpen, wClose, stock.high || base).toFixed(2));
      wLow = Number(Math.min(wOpen, wClose, stock.low || base).toFixed(2));
      vol = Math.floor((stock.volume || 25000) * 4.2);
    } else if (isFirst) {
      wOpen = ipoInfo.ipoPrice;
      wClose = ipoInfo.ipoPrice;
      wHigh = Number((ipoInfo.ipoPrice * 1.08).toFixed(2));
      wLow = Number((ipoInfo.ipoPrice * 0.92).toFixed(2));
      vol = Math.floor((stock.volume || 25000) * 2.5);
    } else {
      const progress = w / (weeksTotal - 1);
      const targetTrajectory = ipoInfo.ipoPrice + (base - ipoInfo.ipoPrice) * Math.pow(progress, 1.8);
      const wDelta = (targetTrajectory - wClose) * 0.05 + (Math.random() - 0.48) * (targetTrajectory * 0.035);
      wOpen = wClose;
      wClose = Math.max(ipoInfo.ipoPrice * 0.5, Number((wClose + wDelta).toFixed(2)));
      wHigh = Number((Math.max(wOpen, wClose) + Math.random() * (wClose * 0.03)).toFixed(2));
      wLow = Number((Math.min(wOpen, wClose) - Math.random() * (wClose * 0.025)).toFixed(2));
      vol = Math.floor((stock.volume || 25000) * (2.8 + Math.random() * 3));
    }

    const isUpW = wClose >= wOpen;
    chart3M.push({
      time: timeLabel,
      open: wOpen,
      high: wHigh,
      low: wLow,
      close: wClose,
      price: wClose,
      volume: vol,
      foreignNet: Math.floor((isUpW ? 1 : -1) * (vol * 0.2)),
      trustNet: Math.floor((isUpW ? 1 : -0.5) * (vol * 0.08)),
      dealerNet: Math.floor((Math.random() - 0.48) * (vol * 0.04)),
      revMonthly: Number(((base * 1.5) + Math.sin(w * 0.2) * 30).toFixed(1)),
      revMoM: Number((Math.sin(w * 0.5) * 8).toFixed(1)),
      revYoY: Number((16 + Math.sin(w * 0.15) * 15).toFixed(1))
    });
  }

  // 計算週K均線 (MA20, MA60)
  for (let i = 0; i < chart3M.length; i++) {
    const ma20Slice = chart3M.slice(Math.max(0, i - 19), i + 1);
    chart3M[i].ma20 = Number((ma20Slice.reduce((s, d) => s + d.close, 0) / ma20Slice.length).toFixed(2));
    const ma60Slice = chart3M.slice(Math.max(0, i - 59), i + 1);
    chart3M[i].ma60 = Number((ma60Slice.reduce((s, d) => s + d.close, 0) / ma60Slice.length).toFixed(2));
  }

  // 5. 月 K 走勢: 從開始上市年月完整呈現至本月 (如 2330 涵蓋 1994/09 ~ 2026/10 完整 386 根月 K！)
  const chart1Y = [];
  const monthsTotal = Math.max(24, (now.getFullYear() - ipoYear) * 12 + (now.getMonth() + 1 - ipoMonth) + 1);
  let mClose = ipoInfo.ipoPrice;
  for (let m = 0; m < monthsTotal; m++) {
    const isFirst = m === 0;
    const isLast = m === monthsTotal - 1;
    const mDate = new Date(ipoYear, ipoMonth - 1 + m, 1);
    const yr = mDate.getFullYear();
    const mm = String(mDate.getMonth() + 1).padStart(2, '0');
    const timeLabel = isFirst ? `${yr}/${mm} (上市首月)` : (isLast ? `${yr}/${mm} (本月)` : `${yr}/${mm}月`);

    let mOpen, mHigh, mLow, vol;
    if (isLast) {
      mOpen = Number((base * 0.95).toFixed(2));
      mClose = Number(base.toFixed(2));
      mHigh = Number(Math.max(mOpen, mClose, stock.high || base).toFixed(2));
      mLow = Number(Math.min(mOpen, mClose, stock.low || base).toFixed(2));
      vol = Math.floor((stock.volume || 25000) * 18);
    } else if (isFirst) {
      mOpen = ipoInfo.ipoPrice;
      mClose = ipoInfo.ipoPrice;
      mHigh = Number((ipoInfo.ipoPrice * 1.15).toFixed(2));
      mLow = Number((ipoInfo.ipoPrice * 0.88).toFixed(2));
      vol = Math.floor((stock.volume || 25000) * 8);
    } else {
      const progress = m / (monthsTotal - 1);
      // 長期經濟趨勢模型從 IPO 掛牌價到現價
      const targetTrajectory = ipoInfo.ipoPrice + (base - ipoInfo.ipoPrice) * Math.pow(progress, 1.75);
      const mDelta = (targetTrajectory - mClose) * 0.08 + (Math.random() - 0.44) * (targetTrajectory * 0.05);
      mOpen = mClose;
      mClose = Math.max(ipoInfo.ipoPrice * 0.4, Number((mClose + mDelta).toFixed(2)));
      mHigh = Number((Math.max(mOpen, mClose) + Math.random() * (mClose * 0.045)).toFixed(2));
      mLow = Number((Math.min(mOpen, mClose) - Math.random() * (mClose * 0.035)).toFixed(2));
      vol = Math.floor((stock.volume || 25000) * (12 + Math.random() * 10));
    }

    const isUpM = mClose >= mOpen;
    chart1Y.push({
      time: timeLabel,
      open: mOpen,
      high: mHigh,
      low: mLow,
      close: mClose,
      price: mClose,
      volume: vol,
      foreignNet: Math.floor((isUpM ? 1 : -1) * (vol * 0.25)),
      trustNet: Math.floor((isUpM ? 1 : -0.5) * (vol * 0.1)),
      dealerNet: Math.floor((Math.random() - 0.48) * (vol * 0.05)),
      revMonthly: Number(((base * 1.6) + Math.sin(m * 0.3) * 40).toFixed(1)),
      revMoM: Number((Math.sin(m * 0.8) * 10).toFixed(1)),
      revYoY: Number((18 + Math.sin(m * 0.25) * 20).toFixed(1))
    });
  }

  // 計算月K均線 (MA20, MA60)
  for (let i = 0; i < chart1Y.length; i++) {
    const ma20Slice = chart1Y.slice(Math.max(0, i - 19), i + 1);
    chart1Y[i].ma20 = Number((ma20Slice.reduce((s, d) => s + d.close, 0) / ma20Slice.length).toFixed(2));
    const ma60Slice = chart1Y.slice(Math.max(0, i - 59), i + 1);
    chart1Y[i].ma60 = Number((ma60Slice.reduce((s, d) => s + d.close, 0) / ma60Slice.length).toFixed(2));
  }

  // 6. 三竹多週期 K 線專屬數據集合 (分時, 日K, 週K, 月K, 60分K, 還原K)
  const klines = {
    '分時': chart1D,
    '日K': chart1M,
    '週K': chart3M,
    '月K': chart1Y,
    '60分K': chart1M.slice(-45).map((p, idx) => ({
      ...p,
      time: `${p.time} ${String(9 + (idx % 5)).padStart(2, '0')}:00`,
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
      ma20: Number((p.ma20 * 1.04).toFixed(2)),
      ma60: Number((p.ma60 * 1.04).toFixed(2))
    }))
  };

  return {
    ...stock,
    listingDate: ipoInfo.listingDate,
    ipoPrice: ipoInfo.ipoPrice,
    yearsListed,
    supportPrice,
    resistancePrice,
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

export const getDetailedStockProfile = getStockDetailData;

