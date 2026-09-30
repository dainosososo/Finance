# Finance 台灣股市即時爬蟲與盤後觀測站

全方位台灣股市即時報價、13:30 盤後三大排行榜、三大法人動向、每日收盤精簡日報、產業結構分類新聞時事與金管會重大訊息觀測站。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)

---

## 🔗 專案連結 (Submission Links)

- **① GitHub Repository**: [https://github.com/dainosososo/Finance](https://github.com/dainosososo/Finance)
- **② Live Website (線上即時網址)**: [https://dainosososo.github.io/Finance/](https://dainosososo.github.io/Finance/)

> 老師與使用者可直接點擊上方 Live Website 體驗所有即時抓取與盤後排行功能。

---

## 🌟 核心功能特色 (Features)

### 1. 📊 臺灣證交所盤後與即時排行榜 (TWSE Rankings & Institutional Flows)
- **成交量排行 (Top 20)**：基於 TWSE `MI_INDEX20`，統計全市場當日成交量最高前 20 名熱門股，包含成交股數、成交金額、收盤價、漲跌與產業別。
- **外資買賣超排行 (Top 20)**：基於 TWSE `T86`，分別列出外資（含陸資）買超前 20 名與賣超前 20 名之個股及張數。
- **投信買賣超排行 (Top 20)**：基於 TWSE `T86`，分別列出國內投信基金重押買超與減碼賣超前 20 名個股。
- **三大法人資金動向總覽**：基於 TWSE `BFI82U`，清晰展示外資、投信、自營商（自行買賣與避險）之當日買進、賣出、買賣超金額（億元）及全市場合計。
- **⚡ 即時線上抓取 (Real-Time Live Data)**：**不鎖死在 13:35！** 盤中隨時點擊「即時線上抓取」或開啟自動輪詢，即刻連線證交所及券商爬蟲刷新最新成交量與盤中行情。
- **📋 13:30 每日收盤精簡日報**：收盤後一鍵彙整大盤指數、總成交量、三大法人合計、熱門排行前三名與重點時事，支援「一鍵複製到剪貼簿」與「.txt 下載」功能。

### 2. 📰 產業結構分類時事新聞 (Multi-Source Financial News by Industry)
- **5 大權威財經媒體聯播**：
  - **MoneyDJ 理財網**（產業深度調查與供應鏈動態）
  - **Stock-Ai 投資級指標**（宏觀經濟與個股數據關聯）
  - **鉅亨網 Anue**（即時股市快訊與企業重大營收）
  - **財經 M 平方 MacroMicro**（景氣循環週期與產業趨勢）
  - **股感 StockFeel**（白話產業分析與競爭優勢剖析）
- **依台股核心產業結構分類標記**：
  - 💻 半導體產業（台積電、聯發科、日月光、聯電等）
  - 🤖 AI 伺服器與電腦周邊（鴻海、廣達、緯創、技嘉等）
  - 🔌 電子零組件與散熱（台達電、奇鋐、雙鴻、國巨等）
  - 🚢 航運物流與海運（長榮、陽明、萬海等）
  - 🏦 金融保險金控（富邦金、國泰金、中信金等）
  - ⚡ 重電綠能與電動車（華城、中興電、東元等）
  - 🔬 生技醫療與光學（大立光、保瑞、藥華藥等）
- **標記關聯個股**：每篇新聞附帶代表公司代號，點擊可直接開啟個股即時走勢圖。

### 3. 📈 即時報價監控與五檔盤況 (Real-time Stock Quotes)
- 介接 TWSE MIS 盤中即時 API，輪詢提供最新成交價、五檔委託買賣報價 (5-Level Order Book Depth)。
- 支援自選股 (Watchlist) 快速新增與刪除（如 2330 台積電, 2317 鴻海, 2454 聯發科, 0050 元大台灣50 等）。
- 提供 5 秒 / 10 秒 / 30 秒自動更新開關。

### 4. 🗄️ 每日收盤價數據庫 (Daily Closing Prices)
- 自動抓取台灣證券交易所 (TWSE) 約 1,400+ 檔上市股票與 ETF 之每日收盤價、開盤價、最高/最低價、成交股數與漲跌幅。
- 提供多欄位排序（成交量、收盤價、漲跌幅）、即時搜尋（代號或中文名稱）與產業類別篩選。

### 5. 🏛️ 金管會重大法規與公告 (FSC Regulatory Feed)
- 彙整金融監督管理委員會證期局與證交所發布之最新監理法規與市場重要公告。

### 6. 🔍 個股技術分析彈窗 (Interactive Stock Inspector)
- 點擊任一標的即可開啟彈窗，展示基於 Recharts 的價格趨勢圖、本益比、52週高低價與基本面短評。

---

## 🛠️ 技術架構 (Tech Stack)

- **前端框架**: React 18 + Vite
- **UI 樣式**: Tailwind CSS (深色高質感 glassmorphism 介面，符合台股紅漲綠跌習慣)
- **圖表庫**: Recharts
- **圖標庫**: Lucide React
- **爬蟲與資料管線**:
  - `scripts/daily_twse_crawler.py`: Python 自動化爬蟲腳本，抓取 TWSE `BFI82U`、`MI_INDEX20`、`T86` 並匯出至 `public/data/`。
  - `.github/workflows/daily_crawler.yml`: GitHub Actions 排程工作流，每日收盤後自動執行備份。
  - `src/services/marketReportService.js`: 前端即時混合資料層，支援盤中隨時線上呼叫 TWSE 與各大財經媒體，具備 CORS 代理備援與擬真回退機制。

---

## 🚀 快速開始 (Quick Start)

### 1. 安裝依賴套件
```bash
npm install
```

### 2. 啟動開發伺服器
```bash
npm run dev
```
開啟 `http://localhost:3000` 即可在本地體驗即時報價與三大排行爬蟲網頁。

### 3. 執行 Python 盤後爬蟲腳本
```bash
python scripts/daily_twse_crawler.py
```

### 4. 建置正式發行版本
```bash
npm run build
```

---

## 📄 授權條款 (License)

本專案採用 MIT 授權條款。
