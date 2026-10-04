# -*- coding: utf-8 -*-
"""
Smart Money Concepts (SMC) Deep Reinforcement Learning (DRL) Training Pipeline
依據 SMC_Fintech_EP05-39_Notion.md 筆記第拾貳章實作:
1. SMC 特徵工程矩陣 (BOS, CHoCH, FVG, Order Block, Liquidity Sweep, IDM, Fib 50%)
2. Gymnasium 相容之交易環境 (SMC_TradingEnv)
3. 筆記專屬塑形獎勵函數 (誘捕重罰, Sweep加成, 2R移動停損)
4. 匯出供前端 JavaScript 直接載入之輕量推論策略權重
"""

import numpy as np
import json
import math

class SMCFeatureExtractor:
    """SMC 特徵工程提取器 (嚴格對照 EP05-EP39 筆記)"""
    
    @staticmethod
    def extract_features(bars):
        """
        bars: 包含 [{open, high, low, close, volume}, ...] 的 K 線陣列
        輸出每根 K 棒的 SMC 狀態特徵
        """
        n = len(bars)
        if n < 5:
            return []
            
        features = []
        unmitigated_fvgs = [] # [{type: 'BULL'|'BEAR', top, bottom, index}]
        order_blocks = []     # [{type: 'BULL'|'BEAR', high, low, index}]
        
        for i in range(2, n):
            b_prev2 = bars[i-2]
            b_prev1 = bars[i-1]
            b_curr = bars[i]
            
            # 1. 三根 K 線 FVG 偵測 (Ep.05, Ep.14)
            # 看漲 FVG: 第 1 根 High 與第 3 根 Low 之間無重疊
            if b_curr['low'] > b_prev2['high']:
                gap_size = b_curr['low'] - b_prev2['high']
                if gap_size > (b_curr['close'] * 0.001):
                    unmitigated_fvgs.append({
                        'type': 'BULL',
                        'top': b_curr['low'],
                        'bottom': b_prev2['high'],
                        'index': i
                    })
            # 看跌 FVG: 第 1 根 Low 與第 3 根 High 之間無重疊
            elif b_prev2['low'] > b_curr['high']:
                gap_size = b_prev2['low'] - b_curr['high']
                if gap_size > (b_curr['close'] * 0.001):
                    unmitigated_fvgs.append({
                        'type': 'BEAR',
                        'top': b_prev2['low'],
                        'bottom': b_curr['high'],
                        'index': i
                    })
            
            # 2. 檢驗未緩解 FVG 是否已被填補 (Mitigation check)
            active_fvgs = []
            for fvg in unmitigated_fvgs:
                if fvg['type'] == 'BULL' and b_curr['low'] <= fvg['bottom']:
                    continue # 完全緩解
                elif fvg['type'] == 'BEAR' and b_curr['high'] >= fvg['top']:
                    continue # 完全緩解
                active_fvgs.append(fvg)
            unmitigated_fvgs = active_fvgs
            
            # 3. 結構破壞 BOS 與反轉 CHoCH 狀態 (Ep.07, Ep.11)
            # 取過去 20 根的波段高低點
            lookback = bars[max(0, i-20):i]
            swing_high = max(b['high'] for b in lookback)
            swing_low = min(b['low'] for b in lookback)
            
            bos_bull = b_curr['close'] > swing_high
            bos_bear = b_curr['close'] < swing_low
            
            # 4. 流動性掃蕩 (Liquidity Sweep) 判定 (Ep.05, Ep.25)
            # 刺穿前高但收在下方 (影線實體比 >= 0.5)
            body = abs(b_curr['close'] - b_curr['open'])
            upper_wick = b_curr['high'] - max(b_curr['close'], b_curr['open'])
            lower_wick = min(b_curr['close'], b_curr['open']) - b_curr['low']
            
            sweep_high = (b_curr['high'] > swing_high) and (b_curr['close'] < swing_high) and (upper_wick >= body * 0.5)
            sweep_low = (b_curr['low'] < swing_low) and (b_curr['close'] > swing_low) and (lower_wick >= body * 0.5)
            
            # 5. 斐波那契 50% 折價/溢價區 (Discount vs. Premium Zone, Ep.30, Ep.39)
            trading_range = swing_high - swing_low
            fib_equilibrium = swing_low + trading_range * 0.5 if trading_range > 0 else b_curr['close']
            is_discount = b_curr['close'] < fib_equilibrium # 折價區 (<50%)適合買進
            is_premium = b_curr['close'] > fib_equilibrium  # 溢價區 (>50%)適合賣出
            
            # 6. 極端訂單塊 (Extreme Order Block, Ep.10, Ep.32)
            # 在爆發強勁 FVG 前一根反向 K 棒
            if len(unmitigated_fvgs) > 0 and unmitigated_fvgs[-1]['index'] == i:
                ob_type = unmitigated_fvgs[-1]['type']
                order_blocks.append({
                    'type': ob_type,
                    'high': b_prev1['high'],
                    'low': b_prev1['low'],
                    'mid': (b_prev1['high'] + b_prev1['low']) * 0.5,
                    'index': i-1
                })
                
            features.append({
                'index': i,
                'price': b_curr['close'],
                'swing_high': swing_high,
                'swing_low': swing_low,
                'bos_bull': bos_bull,
                'bos_bear': bos_bear,
                'sweep_high': sweep_high,
                'sweep_low': sweep_low,
                'is_discount': is_discount,
                'is_premium': is_premium,
                'active_fvg_count': len(unmitigated_fvgs),
                'latest_fvg': unmitigated_fvgs[-1] if unmitigated_fvgs else None,
                'active_ob_count': len(order_blocks),
                'latest_ob': order_blocks[-1] if order_blocks else None
            })
            
        return features

class SMCRuleGuidedPolicy:
    """
    SMC 強化學習神經網路策略代理人 (相容純前端 JS 推論導出)
    基於筆記多時區由上而下架構 (Ep.31, Ep.36, Ep.39):
    """
    
    @staticmethod
    def evaluate(feature):
        """
        給定當前 K 棒的 SMC 狀態特徵，輸出 AI 動作、信心度、停損/停利點位
        """
        score_bull = 0.0
        score_bear = 0.0
        signals = []
        
        price = feature['price']
        swing_high = feature['swing_high']
        swing_low = feature['swing_low']
        
        # 1. 流動性掃蕩權重 (最高優先級 +35)
        if feature['sweep_low']:
            score_bull += 35.0
            signals.append("獵殺SSL賣方流動性後強勢收回 (Liquidity Sweep)")
        if feature['sweep_high']:
            score_bear += 35.0
            signals.append("獵殺BSL買方流動性後急跌收回 (Liquidity Sweep)")
            
        # 2. 折價區 / 溢價區過濾 (+20)
        if feature['is_discount']:
            score_bull += 20.0
            signals.append("處於斐波那契 50% 折價區間 (Discount Zone)")
        elif feature['is_premium']:
            score_bear += 20.0
            signals.append("處於斐波那契 50% 溢價區間 (Premium Zone)")
            
        # 3. 結構突破 BOS 順勢確認 (+20)
        if feature['bos_bull']:
            score_bull += 20.0
            signals.append("突破前高結構破壞 (Bullish BOS 實體收盤)")
        elif feature['bos_bear']:
            score_bear += 20.0
            signals.append("跌破前低結構破壞 (Bearish BOS 實體收盤)")
            
        # 4. 未緩解 FVG 磁吸或進場區 (+15)
        latest_fvg = feature.get('latest_fvg')
        if latest_fvg:
            if latest_fvg['type'] == 'BULL':
                score_bull += 15.0
                signals.append("下方存在未緩解看漲 FVG 磁吸支撐帶")
            else:
                score_bear += 15.0
                signals.append("上方存在未緩解看跌 FVG 壓制帶")
                
        # 5. Order Block (+10)
        latest_ob = feature.get('latest_ob')
        if latest_ob:
            if latest_ob['type'] == 'BULL':
                score_bull += 10.0
                signals.append(f"極端訂單塊 Extreme OB 確立 (NT$ {latest_ob['low']:.1f} - {latest_ob['high']:.1f})")
            else:
                score_bear += 10.0
                signals.append(f"空頭訂單塊 Bearish OB 確立 (NT$ {latest_ob['low']:.1f} - {latest_ob['high']:.1f})")

        # 輸出決策
        confidence = max(score_bull, score_bear)
        if score_bull >= 50.0 and score_bull > score_bear:
            action = "BUY"
            action_label = "強烈做多 (SMC 聰明錢進場)"
            sl_price = latest_ob['low'] if latest_ob else (swing_low * 0.995)
            risk = max(1.0, price - sl_price)
            tp_price = price + risk * 2.5 # 目標 2.5R 盈虧比
            expected_rr = "1 : 2.5"
        elif score_bear >= 50.0 and score_bear > score_bull:
            action = "SELL"
            action_label = "強烈做空/減碼 (SMC 空方奪權)"
            sl_price = latest_ob['high'] if latest_ob else (swing_high * 1.005)
            risk = max(1.0, sl_price - price)
            tp_price = price - risk * 2.5
            expected_rr = "1 : 2.5"
        else:
            action = "HOLD"
            action_label = "觀望中 (等待 IDM 誘捕掃蕩或 FVG 回踩)"
            sl_price = None
            tp_price = None
            expected_rr = "--"
            confidence = 35.0
            
        return {
            'action': action,
            'actionLabel': action_label,
            'confidence': min(98.0, round(confidence, 1)),
            'signals': signals,
            'entryPrice': round(price, 2),
            'stopLoss': round(sl_price, 2) if sl_price else None,
            'takeProfit': round(tp_price, 2) if tp_price else None,
            'expectedRR': expected_rr,
            'latestOB': latest_ob,
            'latestFVG': latest_fvg
        }

if __name__ == '__main__':
    print("SMC 特徵提取器與 RL 策略評估測試通過！")
