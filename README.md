# Finance

全方位台灣股市即時報價、每日收盤價數據庫與金管會證期局公告爬蟲儀表板網頁。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)

---

## 🌟 核心功能特色 (Features)

1. **每日收盤價數據庫 (Daily Closing Prices)**
   - 自動抓取台灣證券交易所 (TWSE) 約 1,400+ 檔上市股票與 ETF 之每日收盤價、開盤價、最高/最低價、成交股數與漲跌幅。
   - 提供多欄位排序（成交量、收盤價、漲跌幅）、即時搜尋（代號或中文名稱）與產業類別篩選（半導體、電腦周邊、金融保險、航運業、ETF 等）。

2. **即時報價監控 (Real-time Stock Quotes)**
   - 介接 TWSE MIS 盤中即時 API，輪詢提供最新成交價、五檔委託買賣報價 (5-Level Order Book Depth)。
   - 支援自選股 (Watchlist) 快速新增與刪除 (如 2330 台積電, 2317 鴻海, 2454 聯發科, 0050 元大台灣50 等)。
   - 提供 5 秒 / 10 秒 / 30 秒自動更新開關。

3. **大盤與市場情緒分析 (Market Summary)**
   - 展示加權指數 (TAIEX)、櫃買指數 (OTC)、市場總成交金額及大盤多空漲跌家數比例。
   - 強勢焦點股與漲幅榜跑馬燈。

4. **金管會與證交所重大訊息 (FSC & TWSE News Feed)**
   - 彙整金融監督管理委員會證期局與證交所發布之最新監理法規與市場重要公告。

5. **個股技術 K 線分析彈窗 (Interactive Stock Inspector)**
   - 點擊任一標的即可開啟彈窗，展示基於 Recharts 的盤中價格趨勢圖、本益比、52週高低價與 AI 基本面短評。

---

## 🛠️ 技術架構 (Tech Stack)

- **前端框架**: React 18 + Vite
- **UI 樣式**: Tailwind CSS (極簡深色金屬感 glassmorphism 介面，符合台股紅漲綠跌習慣)
- **圖表庫**: Recharts
- **圖標集**: Lucide React
- **爬蟲與數據來源**: 
  - 臺灣證券交易所 Open Data API (`https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL`)
  - 臺灣證券交易所 MIS 盤中即時 API (`https://mis.twse.com.tw/stock/api/getStockInfo.jsp`)
  - 金融監督管理委員會 (FSC) 官方公告

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
瀏覽器開啟 `http://localhost:3000` 即可體驗即時報價與每日收盤價爬蟲網頁。

### 3. 建置正式發行版本
```bash
npm run build
```

---

## 📤 部署至 GitHub Repository

將本專案推送至 [https://github.com/dainosososo/Finance.git](https://github.com/dainosososo/Finance.git)：

```bash
git init
git add .
git commit -m "first commit: Finance TWSE crawler web app"
git branch -M main
git remote add origin https://github.com/dainosososo/Finance.git
git push -u origin main
```

---

## 📄 授權條款 (License)

本專案採用 MIT 授權條款。
