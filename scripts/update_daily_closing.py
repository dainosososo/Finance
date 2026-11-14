#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新 public/data/daily_closing_stocks.json 為最新台股日收盤資料
從 TWSE Open API + TPEX Open API 拉取當日資料
"""
import json
import sys
import urllib.request
import urllib.error
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_sector(code):
    if not code:
        return '其他業'
    if code.startswith('00'):
        return 'ETF'
    if code.startswith('28'):
        return '金融保險'
    if code.startswith('26'):
        return '航運業'
    if code.startswith('24') or code.startswith('23'):
        return '電子/半導體'
    if code.startswith('13'):
        return '塑膠工業'
    if code.startswith('20'):
        return '鋼鐵工業'
    return '其他業'

def fetch_json(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers={
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode('utf-8'))
    except Exception as e:
        print(f'  Fetch error {url[:60]}: {e}')
        return None

def normalize_twse_record(s):
    code = s.get('Code', '')
    close = float(s.get('ClosingPrice', 0) or 0)
    change_str = str(s.get('Change', '0')).replace(',', '').strip()
    change_str = change_str.lstrip('+')
    change = float(change_str) if change_str else 0.0
    prev_close = close - change
    pct_change = (change / prev_close * 100) if prev_close > 0 else 0.0
    trade_value = float(str(s.get('TradeValue', '0')).replace(',', '') or 0)
    turnover_yi = round(trade_value / 1e8, 1)
    return {
        'Code': code,
        'Name': s.get('Name', ''),
        'OpeningPrice': str(s.get('OpeningPrice', close)),
        'HighestPrice': str(s.get('HighestPrice', close)),
        'LowestPrice': str(s.get('LowestPrice', close)),
        'ClosingPrice': f'{close:.2f}',
        'Change': f'{change:.2f}',
        'PctChange': f'{pct_change:.2f}',
        'TradeVolume': str(s.get('TradeVolume', '0')).replace(',', ''),
        'TradeValue': str(s.get('TradeValue', '0')).replace(',', ''),
        'TurnoverYi': str(turnover_yi),
        'Sector': get_sector(code) + ' (TWSE)',
        'Date': s.get('Date', ''),
    }

def normalize_tpex_record(s):
    code = s.get('SecuritiesCompanyCode', '')
    close_str = s.get('Close', '0') or '0'
    close = float(close_str.replace(',', '')) if close_str and close_str != '--' else 0.0
    change_str = str(s.get('Change', '0')).replace(',', '').replace('+', '').strip()
    change = float(change_str) if change_str and change_str not in ['--', ''] else 0.0
    prev_close = close - change
    pct_change = (change / prev_close * 100) if prev_close > 0 else 0.0
    trade_shares = s.get('TradingShares', '0') or '0'
    trade_amount = float(str(s.get('TransactionAmount', '0')).replace(',', '') or 0)
    return {
        'Code': code,
        'Name': s.get('CompanyName', ''),
        'OpeningPrice': str(s.get('Open', close)).replace(',', ''),
        'HighestPrice': str(s.get('High', close)).replace(',', ''),
        'LowestPrice': str(s.get('Low', close)).replace(',', ''),
        'ClosingPrice': f'{close:.2f}',
        'Change': f'{change:.2f}',
        'PctChange': f'{pct_change:.2f}',
        'TradeVolume': str(trade_shares).replace(',', ''),
        'TradeValue': str(int(trade_amount)).replace(',', ''),
        'TurnoverYi': str(round(trade_amount / 1e8, 1)),
        'Sector': get_sector(code) + ' (OTC)',
        'Date': s.get('Date', ''),
    }

def main():
    print('=' * 60)
    print('台股日收盤資料更新工具 (TWSE + TPEX Open API)')
    print('=' * 60)

    all_stocks = []
    date_str = ''

    # 1. 上市 TWSE
    print('\n1. 拉取 TWSE 上市全股日收盤資料...')
    twse_url = 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL'
    twse_data = fetch_json(twse_url)
    if twse_data and isinstance(twse_data, list) and len(twse_data) > 0:
        date_str = twse_data[0].get('Date', '')
        for s in twse_data:
            if s.get('Code') and s.get('ClosingPrice'):
                all_stocks.append(normalize_twse_record(s))
        print(f'   TWSE: {len(twse_data)} 筆, 日期: {date_str}')
    else:
        print('   TWSE API 無法取得資料，跳過')

    # 2. 上櫃 TPEx mainboard
    print('\n2. 拉取 TPEx 上櫃主板日收盤資料...')
    tpex_url = 'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes'
    tpex_data = fetch_json(tpex_url)
    if tpex_data and isinstance(tpex_data, list) and len(tpex_data) > 0:
        tpex_date = tpex_data[0].get('Date', '')
        existing_codes = {s['Code'] for s in all_stocks}
        added = 0
        for s in tpex_data:
            code = s.get('SecuritiesCompanyCode', '')
            close = s.get('Close', '')
            if code and close and close not in ('--', '') and code not in existing_codes:
                try:
                    all_stocks.append(normalize_tpex_record(s))
                    added += 1
                except Exception:
                    pass
        print(f'   TPEx: {len(tpex_data)} 筆, 日期: {tpex_date}, 新增: {added} 筆')
    else:
        print('   TPEx API 無法取得資料，跳過')

    if not all_stocks:
        print('\nERROR: 無法取得任何股票資料！')
        sys.exit(1)

    # 3. 寫入 public/data/daily_closing_stocks.json
    out_path = os.path.join(BASE_DIR, 'public', 'data', 'daily_closing_stocks.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(all_stocks, f, ensure_ascii=False, separators=(',', ':'))

    print(f'\n寫入完成: {out_path}')
    print(f'總計 {len(all_stocks)} 筆, 日期: {date_str}')

    # Quick check
    sample_codes = ['2330', '2454', '2882', '0050']
    for code in sample_codes:
        found = next((s for s in all_stocks if s['Code'] == code), None)
        if found:
            print(f'  {code}: {found.get("Name","")} 收盤={found.get("ClosingPrice")} 漲跌={found.get("Change")}')

if __name__ == '__main__':
    main()
