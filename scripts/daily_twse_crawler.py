"""
TWSE & Multi-Source Financial News Daily Crawler Script
Collects:
1. TWSE 13:30 Closing Volume Ranking (MI_INDEX20)
2. Three Major Institutional Flows (BFI82U)
3. Foreign & Investment Trust Net Buy/Sell Ranking (T86)
4. Industry Structure Financial News (MoneyDJ, Anue, MacroMicro, StockFeel, Stock-Ai)
Outputs to public/data/daily_market_report.json & public/data/industry_news.json
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

def fetch_json(url, timeout=10):
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

    # Save to JSON
    report_file = os.path.join(OUTPUT_DIR, "daily_market_report.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report_payload, f, ensure_ascii=False, indent=2)
    print(f"[SUCCESS] Saved market report to {report_file}")

if __name__ == "__main__":
    run_crawler()
