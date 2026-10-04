import urllib.request
import json
import time
import os
import re

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data")
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

TRADING_DAYS = [
    "20260901", "20260902", "20260903", "20260904",
    "20260907", "20260908", "20260909", "20260910", "20260911",
    "20260914", "20260915", "20260916", "20260917", "20260918",
    "20260921", "20260922", "20260923", "20260924", "20260929", "20260930",
    "20261001", "20261002"
]

all_stock_history = {}

def clean_num(val):
    if not val:
        return 0.0
    s = str(val).replace(',', '').strip()
    s = re.sub(r'<[^>]*>', '', s)
    try:
        return float(s)
    except:
        return 0.0

print(f"Starting fetch of authentic TWSE daily K-lines for {len(TRADING_DAYS)} trading days...")

for date_str in TRADING_DAYS:
    url = f"https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?date={date_str}&type=ALLBUT0999&response=json"
    req = urllib.request.Request(url, headers=HEADERS)
    
    mm = date_str[4:6]
    dd = date_str[6:8]
    time_label = f"{mm}/{dd}"
    if date_str == "20261002":
        time_label = "10/02 (今)"
    full_date = f"{date_str[:4]}-{mm}-{dd}"
    
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            payload = json.loads(r.read().decode('utf-8', errors='replace'))
            if payload.get("stat") != "OK":
                print(f"[WARN] {date_str} stat is {payload.get('stat')}")
                continue
            
            table_found = False
            for t in payload.get("tables", []):
                title = t.get("title", "")
                if "每日收盤行情" in title:
                    table_found = True
                    rows = t.get("data", [])
                    print(f"[{date_str}] Processed {len(rows)} stocks.")
                    
                    for row in rows:
                        code = str(row[0]).strip()
                        name = str(row[1]).strip()
                        raw_vol = clean_num(row[2])
                        vol_lots = round(raw_vol / 1000.0) # 轉為張數
                        trade_val = clean_num(row[4])
                        open_p = clean_num(row[5])
                        high_p = clean_num(row[6])
                        low_p = clean_num(row[7])
                        close_p = clean_num(row[8])
                        
                        sign_str = str(row[9])
                        chg_raw = clean_num(row[10])
                        if "-" in sign_str:
                            chg_raw = -chg_raw
                            
                        # 若無成交(開高低皆0)，沿用收盤價
                        if open_p == 0 and close_p > 0:
                            open_p = close_p
                            high_p = close_p
                            low_p = close_p
                            
                        if close_p == 0:
                            continue
                            
                        if code not in all_stock_history:
                            all_stock_history[code] = {
                                "code": code,
                                "name": name,
                                "days": []
                            }
                            
                        all_stock_history[code]["days"].append({
                            "time": time_label,
                            "fullDate": full_date,
                            "open": open_p,
                            "high": high_p,
                            "low": low_p,
                            "close": close_p,
                            "price": close_p,
                            "volume": vol_lots,
                            "rawVolume": raw_vol,
                            "tradeValue": trade_val,
                            "change": chg_raw
                        })
                    break
                    
            if not table_found:
                print(f"[WARN] No closing table found for {date_str}")
    except Exception as e:
        print(f"[ERROR] Failed to fetch {date_str}: {e}")
        
    time.sleep(0.4)

out_file = os.path.join(OUTPUT_DIR, "stocksDailyHistory.json")
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(all_stock_history, f, ensure_ascii=False)

print(f"SUCCESS! Saved authentic TWSE K-line history for {len(all_stock_history)} stocks to {out_file}")
