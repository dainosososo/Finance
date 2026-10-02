"""
TWSE & Multi-Source Financial News Daily Crawler Script
Collects:
1. TWSE 13:30 Closing Volume Ranking (MI_INDEX20)
2. Three Major Institutional Flows (BFI82U)
3. Foreign & Investment Trust Net Buy/Sell Ranking (T86)
4. Full TWSE Daily Closing Prices (STOCK_DAY_ALL)
Outputs to:
- public/data/daily_market_report.json
- public/data/daily_closing_stocks.json
"""

import json
import os
import urllib.request
import urllib.error
from datetime import datetime

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def fetch_json(url, timeout=12):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                data = response.read().decode('utf-8', errors='replace')
                return json.loads(data)
    except Exception as e:
        print(f"[WARN] Failed to fetch {url}: {e}")
    return None

def run_crawler():
    today_str = datetime.now().strftime("%Y-%m-%d")
    now_time_str = datetime.now().strftime("%H:%M:%S")
    print(f"[{datetime.now()}] Starting TWSE Daily Post-Market Crawler...")

    # 1. Fetch BFI82U (三大法人買賣金額)
    bfi_data = fetch_json("https://www.twse.com.tw/rwd/zh/fund/BFI82U?response=json")
    
    # 2. Fetch MI_INDEX20 (成交量前20名)
    mi_data = fetch_json("https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX20?response=json")

    # 3. Fetch T86 (三大法人買賣超)
    t86_data = fetch_json("https://www.twse.com.tw/rwd/zh/fund/T86?response=json&selectType=ALL")

    # 4. Fetch STOCK_DAY_ALL (全上市公司每日收盤價)
    stock_day_all = fetch_json("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL")

    # 5. Fetch FMTQIK (大盤統計資訊 - 每日市場成交資訊)
    fmtqik_data = fetch_json("https://www.twse.com.tw/rwd/zh/afterTrading/FMTQIK?response=json")

    # 6. Fetch MI_INDEX (大盤每日收盤行情 - 發行量加權股價指數)
    mi_index_data = fetch_json("https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?response=json")

    report_payload = {
        "date": today_str,
        "timestamp": now_time_str,
        "isClosed": True,
        "source": "twse_official_crawler"
    }

    # Process BFI82U
    if bfi_data and "data" in bfi_data and len(bfi_data["data"]) >= 4:
        def parse_yi(val):
            return round(float(str(val).replace(',', '')) / 100000000.0, 2)

        data_rows = bfi_data["data"]
        foreign_row = next((r for r in data_rows if "外資" in r[0]), data_rows[3])
        trust_row = next((r for r in data_rows if "投信" in r[0]), data_rows[2])
        total_row = data_rows[-1]

        report_payload["institutionalFlows"] = {
            "foreign": {
                "name": foreign_row[0],
                "buy": parse_yi(foreign_row[1]),
                "sell": parse_yi(foreign_row[2]),
                "net": parse_yi(foreign_row[3]),
                "direction": "buy" if parse_yi(foreign_row[3]) >= 0 else "sell"
            },
            "investmentTrust": {
                "name": trust_row[0],
                "buy": parse_yi(trust_row[1]),
                "sell": parse_yi(trust_row[2]),
                "net": parse_yi(trust_row[3]),
                "direction": "buy" if parse_yi(trust_row[3]) >= 0 else "sell"
            },
            "total": {
                "name": total_row[0],
                "buy": parse_yi(total_row[1]),
                "sell": parse_yi(total_row[2]),
                "net": parse_yi(total_row[3]),
                "direction": "buy" if parse_yi(total_row[3]) >= 0 else "sell"
            }
        }

    # Process MI_INDEX20 (成交量前20名)
    if mi_data and "data" in mi_data:
        report_payload["volumeRankings"] = []
        for idx, row in enumerate(mi_data["data"][:20]):
            try:
                code = str(row[1]).strip()
                name = str(row[2]).strip()
                vol = int(str(row[3]).replace(',', ''))
                turnover = f"{round(float(str(row[4]).replace(',', '')) / 100000000.0, 1)} 億"
                price = str(row[8])
                change = str(row[10])
                try:
                    pct = f"{round((float(change) / float(price)) * 100, 2)}%"
                except:
                    pct = "0.00%"
                report_payload["volumeRankings"].append({
                    "rank": idx + 1,
                    "code": code,
                    "name": name,
                    "volume": vol,
                    "turnover": turnover,
                    "price": price,
                    "change": change,
                    "pctChange": pct,
                    "sector": "一般產業"
                })
            except Exception as e:
                print(f"[WARN] Error parsing volume row {idx}: {e}")

    # Process T86 (三大法人個股買賣超)
    if t86_data and "data" in t86_data:
        foreign_list = []
        trust_list = []
        for row in t86_data["data"]:
            try:
                code = str(row[0]).strip()
                name = str(row[1]).strip()
                foreign_net = int(str(row[4] or '0').replace(',', '')) // 1000
                trust_net = int(str(row[7] or '0').replace(',', '')) // 1000
                if foreign_net != 0:
                    foreign_list.append({"code": code, "name": name, "netShares": foreign_net, "price": "市價", "sector": "一般產業"})
                if trust_net != 0:
                    trust_list.append({"code": code, "name": name, "netShares": trust_net, "price": "市價", "sector": "一般產業"})
            except:
                continue

        foreign_list.sort(key=lambda x: x["netShares"], reverse=True)
        trust_list.sort(key=lambda x: x["netShares"], reverse=True)

        report_payload["foreignRankings"] = {
            "buy": [{**s, "rank": i + 1} for i, s in enumerate(foreign_list[:20])],
            "sell": [{**s, "rank": i + 1} for i, s in enumerate(list(reversed(foreign_list[-20:])))]
        }
        report_payload["trustRankings"] = {
            "buy": [{**s, "rank": i + 1} for i, s in enumerate(trust_list[:20])],
            "sell": [{**s, "rank": i + 1} for i, s in enumerate(list(reversed(trust_list[-20:])))]
        }

    # Process FMTQIK (大盤每日成交量值)
    if fmtqik_data and "data" in fmtqik_data and len(fmtqik_data["data"]) > 0:
        # Last row is the most recent trading day
        latest = fmtqik_data["data"][-1]
        try:
            total_value = float(str(latest[2]).replace(',', '')) / 100000000  # 億
            report_payload["marketOverview"] = {
                "totalVolume": f"{total_value:,.2f} 億",
                "totalTransactions": str(latest[3]).replace(',', '') if len(latest) > 3 else "N/A",
                "taiexClose": str(latest[4]).replace(',', '') if len(latest) > 4 else "N/A",
                "taiexChange": str(latest[5]).replace(',', '') if len(latest) > 5 else "N/A"
            }
        except Exception as e:
            print(f"[WARN] Error parsing FMTQIK: {e}")

    # Process MI_INDEX to get TAIEX closing
    if mi_index_data and "data" in mi_index_data:
        for row in mi_index_data.get("data", []):
            if len(row) >= 2 and "發行量加權" in str(row[0]):
                try:
                    report_payload.setdefault("marketOverview", {})
                    report_payload["marketOverview"]["taiexIndex"] = str(row[1]).replace(',', '').strip()
                except:
                    pass

    # Compute market breadth from STOCK_DAY_ALL
    if stock_day_all and isinstance(stock_day_all, list):
        up_count = 0
        down_count = 0
        flat_count = 0
        for s in stock_day_all:
            try:
                chg = float(str(s.get("Change", "0")).replace(',', ''))
                if chg > 0:
                    up_count += 1
                elif chg < 0:
                    down_count += 1
                else:
                    flat_count += 1
            except:
                flat_count += 1
        report_payload.setdefault("marketOverview", {})
        report_payload["marketOverview"]["upCount"] = up_count
        report_payload["marketOverview"]["downCount"] = down_count
        report_payload["marketOverview"]["flatCount"] = flat_count

    # Extend volume rankings from STOCK_DAY_ALL (top 100 by TradeValue)
    if stock_day_all and isinstance(stock_day_all, list) and len(stock_day_all) > 0:
        all_ranked = []
        for s in stock_day_all:
            try:
                tv = float(str(s.get("TradeValue", "0")).replace(',', ''))
                code = s.get("Code", "")
                # Skip ETFs that start with 00 for volume ranking (optional, keep them)
                all_ranked.append({
                    "code": code,
                    "name": s.get("Name", ""),
                    "volume": int(str(s.get("TradeVolume", "0")).replace(',', '')),
                    "tradeValue": tv,
                    "turnover": f"{round(tv / 100000000, 1)} 億",
                    "price": s.get("ClosingPrice", "N/A"),
                    "change": s.get("Change", "0"),
                    "pctChange": "0.00%",
                    "sector": "一般產業"
                })
            except:
                continue
        all_ranked.sort(key=lambda x: x["tradeValue"], reverse=True)

        # Compute pctChange
        for item in all_ranked[:100]:
            try:
                price = float(str(item["price"]).replace(',', ''))
                chg = float(str(item["change"]).replace(',', ''))
                prev = price - chg
                if prev > 0:
                    item["pctChange"] = f"{round((chg / prev) * 100, 2)}%"
            except:
                pass
            item["rank"] = all_ranked.index(item) + 1

        # Merge with existing MI_INDEX20 rankings — MI_INDEX20 has more detail, so keep those
        existing_codes = set()
        if "volumeRankings" in report_payload:
            existing_codes = {r["code"] for r in report_payload["volumeRankings"]}
        
        extended = report_payload.get("volumeRankings", [])
        rank_offset = len(extended)
        for item in all_ranked[:100]:
            if item["code"] not in existing_codes:
                rank_offset += 1
                item["rank"] = rank_offset
                extended.append(item)
                existing_codes.add(item["code"])
            if len(extended) >= 100:
                break
        report_payload["volumeRankings"] = extended[:100]

    # Save market report JSON
    report_file = os.path.join(OUTPUT_DIR, "daily_market_report.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report_payload, f, ensure_ascii=False, indent=2)
    print(f"[SUCCESS] Saved market report to {report_file}")

    # Process and save full STOCK_DAY_ALL
    if stock_day_all and isinstance(stock_day_all, list) and len(stock_day_all) > 0:
        cleaned_stocks = []
        for s in stock_day_all:
            code = s.get("Code", "")
            name = s.get("Name", "")
            close_price = s.get("ClosingPrice", "")
            cleaned_stocks.append(s)

        stocks_file = os.path.join(OUTPUT_DIR, "daily_closing_stocks.json")
        with open(stocks_file, "w", encoding="utf-8") as f:
            json.dump(cleaned_stocks, f, ensure_ascii=False, indent=2)
        print(f"[SUCCESS] Saved {len(cleaned_stocks)} daily closing stocks to {stocks_file}")

    # 5. Fetch Key Stocks K-Line History (STOCK_DAY) for genuine daily candlestick data
    fetch_key_stocks_kline()

def fetch_key_stocks_kline():
    import time
    key_stocks = [
        {"code": "2330", "name": "台積電"},
        {"code": "2317", "name": "鴻海"},
        {"code": "2454", "name": "聯發科"},
        {"code": "2603", "name": "長榮"},
        {"code": "0050", "name": "元大台灣50"},
        {"code": "2308", "name": "台達電"},
        {"code": "2881", "name": "富邦金"},
        {"code": "2882", "name": "國泰金"},
        {"code": "3231", "name": "緯創"},
        {"code": "2382", "name": "廣達"}
    ]
    
    now = datetime.now()
    # Query current month and previous month
    curr_ym = now.strftime("%Y%m01")
    if now.month == 1:
        prev_ym = f"{now.year - 1}1201"
    else:
        prev_ym = f"{now.year}{now.month - 1:02d}01"
        
    months_to_fetch = [prev_ym, curr_ym]
    kline_result = {}

    print(f"[INFO] Fetching historical K-line candlestick data for key stocks across {months_to_fetch}...")
    for item in key_stocks:
        code = item["code"]
        name = item["name"]
        kline_result[code] = {
            "code": code,
            "name": name,
            "days": []
        }
        seen_dates = set()

        for ym in months_to_fetch:
            url = f"https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date={ym}&stockNo={code}&response=json"
            data = fetch_json(url, timeout=8)
            if data and data.get("stat") == "OK" and data.get("data"):
                for row in data["data"]:
                    date_str = str(row[0]).strip()
                    if date_str in seen_dates:
                        continue
                    seen_dates.add(date_str)
                    
                    try:
                        parts = date_str.split('/')
                        roc_yr = int(parts[0])
                        ad_yr = roc_yr + 1911
                        mm = parts[1].zfill(2)
                        dd = parts[2].zfill(2)
                        
                        vol = int(int(str(row[1]).replace(',', '')) / 1000) # 轉為張數
                        open_p = float(str(row[3]).replace(',', ''))
                        high_p = float(str(row[4]).replace(',', ''))
                        low_p = float(str(row[5]).replace(',', ''))
                        close_p = float(str(row[6]).replace(',', ''))
                        chg_str = str(row[7]).replace(',', '')
                        chg_val = float(chg_str) if chg_str else 0.0

                        kline_result[code]["days"].append({
                            "time": f"{mm}/{dd}",
                            "fullDate": f"{ad_yr}-{mm}-{dd}",
                            "open": open_p,
                            "high": high_p,
                            "low": low_p,
                            "close": close_p,
                            "price": close_p,
                            "volume": vol,
                            "change": chg_val
                        })
                    except Exception as parse_err:
                        continue
            time.sleep(0.1)

    kline_file = os.path.join(OUTPUT_DIR, "stock_kline_history.json")
    with open(kline_file, "w", encoding="utf-8") as f:
        json.dump(kline_result, f, ensure_ascii=False, indent=2)
    print(f"[SUCCESS] Saved historical K-line data for {len(kline_result)} stocks to {kline_file}")

if __name__ == "__main__":
    run_crawler()
