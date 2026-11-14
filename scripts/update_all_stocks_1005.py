"""
Comprehensive script to update all TWSE (上市) and TPEx (上櫃) stocks with 10/05 official closing data,
append 10/05 K-line bars to stocksHistoryCompact.js, and refresh dailyTwseStocksMap.js and daily_closing_stocks.json.
"""
import urllib.request
import json
import http.client
import os
import re

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch_twse_stocks():
    print("Fetching TWSE STOCK_DAY_ALL...")
    req = urllib.request.Request('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL', headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Loaded {len(data)} TWSE stocks.")
        return data

def fetch_tpex_stocks():
    print("Fetching TPEx quotes...")
    req = urllib.request.Request('https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes', headers=HEADERS)
    try:
        resp = urllib.request.urlopen(req, timeout=25)
        raw = resp.read()
    except http.client.IncompleteRead as e:
        raw = e.partial
    data = json.loads(raw.decode('utf-8'))
    print(f"Loaded {len(data)} TPEx records.")
    return data

def run():
    twse_list = fetch_twse_stocks()
    tpex_list = fetch_tpex_stocks()

    workspace_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # 1. Map TWSE stocks
    twse_dict = {}
    for s in twse_list:
        code = s.get('Code', '').strip()
        if not code:
            continue
        try:
            close = float(str(s.get('ClosingPrice', '0')).replace(',', ''))
            chg = float(str(s.get('Change', '0')).replace(',', ''))
            op = float(str(s.get('OpeningPrice', '0')).replace(',', '')) if s.get('OpeningPrice') else close
            hi = float(str(s.get('HighestPrice', '0')).replace(',', '')) if s.get('HighestPrice') else max(op, close)
            lo = float(str(s.get('LowestPrice', '0')).replace(',', '')) if s.get('LowestPrice') else min(op, close)
            vol_shares = int(str(s.get('TradeVolume', '0')).replace(',', ''))
            vol_lots = round(vol_shares / 1000)
            trade_val = float(str(s.get('TradeValue', '0')).replace(',', ''))
            prev_close = round(close - chg, 2)
            pct = round((chg / prev_close) * 100, 2) if prev_close > 0 else 0.0
            turnover_yi = round(trade_val / 100000000, 1)

            twse_dict[code] = {
                'code': code,
                'name': s.get('Name', '').strip(),
                'date': '2026-10-05',
                'open': op,
                'high': hi,
                'low': lo,
                'close': close,
                'price': close,
                'change': chg,
                'pctChange': pct,
                'prevClose': prev_close,
                'volume': vol_lots,
                'tradeValue': trade_val,
                'turnover': f"{turnover_yi} 億" if turnover_yi >= 1.0 else f"{round(trade_val/10000, 1)} 萬",
                'market': '上市 (TWSE)'
            }
        except Exception as e:
            continue

    # 2. Map TPEx stocks
    tpex_dict = {}
    for s in tpex_list:
        code = s.get('SecuritiesCompanyCode', '').strip()
        if not code or len(code) > 6:
            continue
        try:
            close_str = str(s.get('Close', '')).strip().replace(',', '')
            if not close_str or close_str == '---':
                continue
            close = float(close_str)
            chg_str = str(s.get('Change', '0')).strip().replace(',', '').replace('+', '')
            chg = float(chg_str) if chg_str and chg_str != '---' else 0.0
            
            op_str = str(s.get('Open', '')).strip().replace(',', '')
            op = float(op_str) if op_str and op_str != '---' else close
            
            hi_str = str(s.get('High', '')).strip().replace(',', '')
            hi = float(hi_str) if hi_str and hi_str != '---' else max(op, close)
            
            lo_str = str(s.get('Low', '')).strip().replace(',', '')
            lo = float(lo_str) if lo_str and lo_str != '---' else min(op, close)

            vol_shares = int(str(s.get('TradingShares', '0')).replace(',', ''))
            vol_lots = round(vol_shares / 1000)
            trade_val = float(str(s.get('TransactionAmount', '0')).replace(',', ''))
            prev_close = round(close - chg, 2)
            pct = round((chg / prev_close) * 100, 2) if prev_close > 0 else 0.0
            turnover_yi = round(trade_val / 100000000, 1)

            tpex_dict[code] = {
                'code': code,
                'name': s.get('CompanyName', '').strip(),
                'date': '2026-10-05',
                'open': op,
                'high': hi,
                'low': lo,
                'close': close,
                'price': close,
                'change': chg,
                'pctChange': pct,
                'prevClose': prev_close,
                'volume': vol_lots,
                'tradeValue': trade_val,
                'turnover': f"{turnover_yi} 億" if turnover_yi >= 1.0 else f"{round(trade_val/10000, 1)} 萬",
                'market': '上櫃 (TPEx)'
            }
        except Exception as e:
            continue

    print(f"Parsed {len(twse_dict)} valid TWSE stocks and {len(tpex_dict)} valid TPEx stocks.")

    # 3. Update stocksHistoryCompact.js
    compact_path = os.path.join(workspace_dir, 'src', 'data', 'stocksHistoryCompact.js')
    print(f"Reading {compact_path}...")
    with open(compact_path, 'r', encoding='utf-8') as f:
        compact_content = f.read()

    prefix = "export const STOCKS_HISTORY_COMPACT = "
    json_str = compact_content[len(prefix):].rstrip(';\n ')
    stocks_history = json.loads(json_str)

    history_updated_count = 0
    for code, bars in stocks_history.items():
        if code in twse_dict:
            item = twse_dict[code]
            # Ensure previous bar does not have (今)
            if bars and len(bars) > 0:
                bars[-1][0] = str(bars[-1][0]).replace(' (今)', '').replace(' ()', '').strip()
                # Check if 10/05 is already the last bar
                if bars[-1][1] == '2026-10-05':
                    bars[-1] = ['10/05', '2026-10-05', item['open'], item['high'], item['low'], item['close'], item['volume'], item['change'], item['tradeValue']]
                else:
                    bars.append(['10/05', '2026-10-05', item['open'], item['high'], item['low'], item['close'], item['volume'], item['change'], item['tradeValue']])
                history_updated_count += 1

    print(f"Updated K-line history for {history_updated_count} stocks with 10/05 bar.")
    with open(compact_path, 'w', encoding='utf-8') as f:
        f.write("export const STOCKS_HISTORY_COMPACT = " + json.dumps(stocks_history, separators=(',', ':'), ensure_ascii=False) + ";\n")

    # 4. Update dailyTwseStocksMap.js
    map_path = os.path.join(workspace_dir, 'src', 'data', 'dailyTwseStocksMap.js')
    print(f"Reading {map_path}...")
    with open(map_path, 'r', encoding='utf-8') as f:
        map_content = f.read()
    
    start_idx = map_content.find('{')
    end_idx = map_content.rfind('}') + 1
    map_json_str = map_content[start_idx:end_idx]
    current_map = json.loads(map_json_str)

    matched_twse = 0
    matched_tpex = 0
    for code, cur in current_map.items():
        if code in twse_dict:
            cur.update(twse_dict[code])
            matched_twse += 1
        elif code in tpex_dict:
            cur.update(tpex_dict[code])
            matched_tpex += 1
        else:
            cur['date'] = '2026-10-05'

    # Add missing TWSE common stocks/ETFs
    for code, item in twse_dict.items():
        if code not in current_map and len(code) <= 6:
            current_map[code] = item

    # Add missing TPEx mainboard stocks (only 4-digit codes)
    for code, item in tpex_dict.items():
        if code not in current_map and re.match(r'^\d{4}$', code):
            current_map[code] = item

    print(f"Updated DAILY_TWSE_STOCKS_MAP (Matched TWSE: {matched_twse}, Matched TPEx: {matched_tpex}, Total: {len(current_map)} stocks).")
    with open(map_path, 'w', encoding='utf-8') as f:
        f.write("// 臺灣證券交易所 (TWSE 上市) 與證券櫃檯買賣中心 (TPEx 上櫃) 全市場官方真實行情字典庫\n")
        f.write("export const DAILY_TWSE_STOCKS_MAP = " + json.dumps(current_map, ensure_ascii=False, indent=2) + ";\n")

    # 5. Update public/data/daily_closing_stocks.json
    closing_json_path = os.path.join(workspace_dir, 'public', 'data', 'daily_closing_stocks.json')
    closing_list = []
    for code, s in current_map.items():
        closing_list.append({
            'Code': code,
            'Name': s.get('name', ''),
            'OpeningPrice': f"{s.get('open', 0):.2f}",
            'HighestPrice': f"{s.get('high', 0):.2f}",
            'LowestPrice': f"{s.get('low', 0):.2f}",
            'ClosingPrice': f"{s.get('price', s.get('close', 0)):.2f}",
            'Change': f"{s.get('change', 0):.2f}",
            'PctChange': f"{s.get('pctChange', 0):.2f}",
            'TradeVolume': str(int(s.get('volume', 0) * 1000)),
            'TradeValue': str(int(s.get('tradeValue', 0))),
            'TurnoverYi': str(round(float(s.get('tradeValue', 0)) / 100000000, 1)),
            'Sector': s.get('market', '上市 (TWSE)')
        })

    with open(closing_json_path, 'w', encoding='utf-8') as f:
        json.dump(closing_list, f, ensure_ascii=False, indent=2)
    print(f"Updated {closing_json_path} ({len(closing_list)} stocks).")

    # Also copy to dist if dist/data exists
    dist_closing = os.path.join(workspace_dir, 'dist', 'data', 'daily_closing_stocks.json')
    if os.path.exists(os.path.dirname(dist_closing)):
        with open(dist_closing, 'w', encoding='utf-8') as f:
            json.dump(closing_list, f, ensure_ascii=False, indent=2)
        print(f"Updated {dist_closing}.")

    # 6. Check 2455 specifically
    s2455 = current_map.get('2455')
    print("--- 2455 RESULT ---")
    print(s2455)

if __name__ == '__main__':
    run()
