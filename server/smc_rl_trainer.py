# -*- coding: utf-8 -*-
"""
Smart Money Concepts (SMC) Deep Reinforcement Learning (DRL) Training Pipeline
依據 SMC_Fintech_EP05-39_Notion.md 筆記實作真正的深度強化學習 (Deep Q-Network, DQN):
1. SMC 特徵工程環境 (10 維連續狀態空間: FVG 距、OB 距、Fib 50% 區間、SSL/BSL 掃蕩、BOS 突破、影線比、量能比、動量)
2. 動作空間: 3 離散動作 (0: HOLD 觀望, 1: BUY 多方進場, 2: SELL 空方/減碼)
3. SMC 塑形獎勵函數 (Shaped Reward): 結合前瞻 R-Multiple 盈虧比、SSL 獵殺紅利、溢價區追高重罰
4. 純 NumPy 實作之 Deep Q-Network (包含 Experience Replay, Target Network, Adam 優化器, 貝爾曼反向傳播)
5. 訓練收斂後匯出權重 smcRlModelWeights.json 供前端 JavaScript 進行即時神經網路前向推論
"""

import os
import sys
import json
import math
import random
import numpy as np

# 設置 Windows UTF-8 標準輸出
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

class SMCTradingEnvironment:
    """SMC 馬可夫決策過程 (MDP) 交易環境"""
    def __init__(self, stock_bars_map):
        self.stock_bars_map = stock_bars_map
        self.stock_ids = list(stock_bars_map.keys())
        self.state_dim = 10
        self.action_dim = 3  # 0: HOLD, 1: BUY, 2: SELL

    def extract_features_and_episodes(self):
        """從歷史 K 線提取狀態與轉移動作序列"""
        episodes = [] # 每個 episode 是一檔股票的時間序列轉移

        for stock_id, raw_bars in self.stock_bars_map.items():
            if len(raw_bars) < 10:
                continue
            
            # 格式化 K 線: [date_short, date_full, open, high, low, close, volume, ...]
            bars = []
            for b in raw_bars:
                bars.append({
                    'open': float(b[2]),
                    'high': float(b[3]),
                    'low': float(b[4]),
                    'close': float(b[5]),
                    'volume': float(b[6]) if len(b) > 6 else 100.0
                })
            
            n = len(bars)
            states = []
            unmitigated_fvgs = []
            order_blocks = []

            for i in range(2, n):
                b_prev2 = bars[i-2]
                b_prev1 = bars[i-1]
                b_curr = bars[i]

                # 1. 偵測 FVG
                if b_curr['low'] > b_prev2['high']:
                    unmitigated_fvgs.append({'type': 'BULL', 'top': b_curr['low'], 'bottom': b_prev2['high'], 'idx': i})
                    order_blocks.append({'type': 'BULL', 'high': b_prev1['high'], 'low': b_prev1['low']})
                elif b_prev2['low'] > b_curr['high']:
                    unmitigated_fvgs.append({'type': 'BEAR', 'top': b_prev2['low'], 'bottom': b_curr['high'], 'idx': i})
                    order_blocks.append({'type': 'BEAR', 'high': b_prev1['high'], 'low': b_prev1['low']})

                # 緩解檢查
                active_fvgs = [
                    f for f in unmitigated_fvgs 
                    if not (f['type'] == 'BULL' and b_curr['low'] <= f['bottom']) and
                       not (f['type'] == 'BEAR' and b_curr['high'] >= f['top'])
                ]
                unmitigated_fvgs = active_fvgs[-5:]
                order_blocks = order_blocks[-5:]

                # 2. 波段高低點 (過去 10 根)
                lookback = bars[max(0, i-10):i]
                swing_high = max(b['high'] for b in lookback)
                swing_low = min(b['low'] for b in lookback)
                trading_range = max(1e-4, swing_high - swing_low)
                atr = max(1e-4, sum(b['high'] - b['low'] for b in lookback) / len(lookback))

                # 3. 特徵向量 10 維 (Normalized State Vector)
                # s0: FVG 距離 (Signed, normalized by ATR)
                fvg_dist = 0.0
                if unmitigated_fvgs:
                    latest_fvg = unmitigated_fvgs[-1]
                    fvg_mid = (latest_fvg['top'] + latest_fvg['bottom']) * 0.5
                    fvg_dist = np.clip((b_curr['close'] - fvg_mid) / atr, -2.0, 2.0)

                # s1: Order Block 距離 (Signed, normalized by ATR)
                ob_dist = 0.0
                if order_blocks:
                    latest_ob = order_blocks[-1]
                    ob_mid = (latest_ob['high'] + latest_ob['low']) * 0.5
                    ob_dist = np.clip((b_curr['close'] - ob_mid) / atr, -2.0, 2.0)

                # s2: 斐波那契 50% 折價/溢價指標 ([-0.5, 0.5])
                fib_pos = np.clip((b_curr['close'] - swing_low) / trading_range - 0.5, -0.5, 0.5)

                # s3 & s4: SSL / BSL 掃蕩 (影線比 >= 0.5)
                body = abs(b_curr['close'] - b_curr['open'])
                upper_wick = b_curr['high'] - max(b_curr['close'], b_curr['open'])
                lower_wick = min(b_curr['close'], b_curr['open']) - b_curr['low']
                ssl_sweep = 1.0 if (b_curr['low'] < swing_low and b_curr['close'] > swing_low and lower_wick >= body * 0.5) else 0.0
                bsl_sweep = 1.0 if (b_curr['high'] > swing_high and b_curr['close'] < swing_high and upper_wick >= body * 0.5) else 0.0

                # s5 & s6: BOS 結構突破
                bos_bull = 1.0 if b_curr['close'] > swing_high else 0.0
                bos_bear = 1.0 if b_curr['close'] < swing_low else 0.0

                # s7: 影線拒絕動量
                wick_ratio = np.clip((lower_wick - upper_wick) / (body + 1e-4), -2.0, 2.0)

                # s8: 量能比率
                vol_avg = max(1.0, sum(b['volume'] for b in lookback) / len(lookback))
                vol_ratio = np.clip(b_curr['volume'] / vol_avg - 1.0, -2.0, 3.0)

                # s9: 3 棒動量回報率
                p_3ago = bars[max(0, i-3)]['close']
                momentum_3 = np.clip((b_curr['close'] - p_3ago) / (p_3ago + 1e-4) * 10.0, -2.0, 2.0)

                state_vec = np.array([
                    fvg_dist, ob_dist, fib_pos, ssl_sweep, bsl_sweep,
                    bos_bull, bos_bear, wick_ratio, vol_ratio, momentum_3
                ], dtype=np.float32)

                states.append((i, state_vec, b_curr['close']))

            # 建立 transitions: (s_t, a, r, s_{t+1}, done)
            if len(states) >= 4:
                episodes.append((stock_id, bars, states))

        return episodes


class DQNNetwork:
    """純 NumPy 打造之 3 層前饋 Deep Q-Network (10 -> 32 -> 16 -> 3)"""
    def __init__(self, input_dim=10, hidden1=32, hidden2=16, output_dim=3, lr=0.002):
        self.lr = lr
        # He / Xavier 初始化
        self.W1 = np.random.randn(input_dim, hidden1).astype(np.float32) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros((1, hidden1), dtype=np.float32)
        
        self.W2 = np.random.randn(hidden1, hidden2).astype(np.float32) * np.sqrt(2.0 / hidden1)
        self.b2 = np.zeros((1, hidden2), dtype=np.float32)
        
        self.W3 = np.random.randn(hidden2, output_dim).astype(np.float32) * np.sqrt(2.0 / hidden2)
        self.b3 = np.zeros((1, output_dim), dtype=np.float32)

        # Adam 優化器狀態快取
        self.mW1, self.vW1 = np.zeros_like(self.W1), np.zeros_like(self.W1)
        self.mb1, self.vb1 = np.zeros_like(self.b1), np.zeros_like(self.b1)
        self.mW2, self.vW2 = np.zeros_like(self.W2), np.zeros_like(self.W2)
        self.mb2, self.vb2 = np.zeros_like(self.b2), np.zeros_like(self.b2)
        self.mW3, self.vW3 = np.zeros_like(self.W3), np.zeros_like(self.W3)
        self.mb3, self.vb3 = np.zeros_like(self.b3), np.zeros_like(self.b3)
        self.beta1, self.beta2, self.eps = 0.9, 0.999, 1e-8
        self.t = 0

    def forward(self, X):
        """前向傳播，返回各層激活值與 Q-values"""
        z1 = np.dot(X, self.W1) + self.b1
        a1 = np.maximum(0, z1) # ReLU
        z2 = np.dot(a1, self.W2) + self.b2
        a2 = np.maximum(0, z2) # ReLU
        q_values = np.dot(a2, self.W3) + self.b3
        return q_values, (X, z1, a1, z2, a2)

    def train_step(self, states, actions, targets):
        """Adam 反向傳播計算梯度並更新神經網路權重"""
        self.t += 1
        batch_size = states.shape[0]
        q_pred, cache = self.forward(states)
        X, z1, a1, z2, a2 = cache

        # 計算損失對 Q 輸出的梯度 dL/dq
        dq = np.zeros_like(q_pred)
        for i in range(batch_size):
            a = actions[i]
            dq[i, a] = (q_pred[i, a] - targets[i]) # MSE loss: 0.5 * (q - y)^2
        dq /= batch_size

        # 第 3 層梯度
        dW3 = np.dot(a2.T, dq)
        db3 = np.sum(dq, axis=0, keepdims=True)

        # 第 2 層梯度 (ReLU)
        da2 = np.dot(dq, self.W3.T)
        dz2 = da2 * (z2 > 0)
        dW2 = np.dot(a1.T, dz2)
        db2 = np.sum(dz2, axis=0, keepdims=True)

        # 第 1 層梯度 (ReLU)
        da1 = np.dot(dz2, self.W2.T)
        dz1 = da1 * (z1 > 0)
        dW1 = np.dot(X.T, dz1)
        db1 = np.sum(dz1, axis=0, keepdims=True)

        # Adam 參數更新
        for W, dW, mW, vW in [(self.W1, dW1, self.mW1, self.vW1),
                               (self.W2, dW2, self.mW2, self.vW2),
                               (self.W3, dW3, self.mW3, self.vW3)]:
            mW[:] = self.beta1 * mW + (1 - self.beta1) * dW
            vW[:] = self.beta2 * vW + (1 - self.beta2) * (dW ** 2)
            m_hat = mW / (1 - self.beta1 ** self.t)
            v_hat = vW / (1 - self.beta2 ** self.t)
            W -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)

        for b, db, mb, vb in [(self.b1, db1, self.mb1, self.vb1),
                               (self.b2, db2, self.mb2, self.vb2),
                               (self.b3, db3, self.mb3, self.vb3)]:
            mb[:] = self.beta1 * mb + (1 - self.beta1) * db
            vb[:] = self.beta2 * vb + (1 - self.beta2) * (db ** 2)
            m_hat = mb / (1 - self.beta1 ** self.t)
            v_hat = vb / (1 - self.beta2 ** self.t)
            b -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)

        loss = float(np.mean(dq ** 2))
        return loss

    def copy_weights_from(self, source_net, tau=0.1):
        """目標網路權重軟更新 Target Network Soft Update"""
        self.W1 = (1 - tau) * self.W1 + tau * source_net.W1
        self.b1 = (1 - tau) * self.b1 + tau * source_net.b1
        self.W2 = (1 - tau) * self.W2 + tau * source_net.W2
        self.b2 = (1 - tau) * self.b2 + tau * source_net.b2
        self.W3 = (1 - tau) * self.W3 + tau * source_net.W3
        self.b3 = (1 - tau) * self.b3 + tau * source_net.b3


def calculate_smc_reward(action, state, current_price, next_price, future_prices):
    """
    SMC 專屬量化塑形獎勵函數 (Shaped Reward Function):
    結合未來 2 棒真實價格收益率與 SMC 結構規則對齊程度:
    """
    pct_return = (next_price - current_price) / current_price * 100.0
    future_max = max(future_prices) if future_prices else next_price
    future_min = min(future_prices) if future_prices else next_price
    max_gain = (future_max - current_price) / current_price * 100.0
    max_drawdown = (current_price - future_min) / current_price * 100.0

    fib_pos = state[2]     # < 0: 折價區, > 0: 溢價區
    ssl_sweep = state[3]   # 賣方流動性掃蕩 (強做多信號)
    bsl_sweep = state[4]   # 買方流動性掃蕩 (強做空信號)
    bos_bull = state[5]    # 順勢多方 BOS

    reward = 0.0

    if action == 1:  # BUY (做多)
        # 基礎盈虧回報
        reward = pct_return * 1.5 + (max_gain - max_drawdown * 0.8)
        # SMC 機構紅利: 折價區進場且有 SSL Sweep
        if fib_pos < 0:
            reward += 1.2
        if ssl_sweep > 0.5:
            reward += 2.0
        if bos_bull > 0.5:
            reward += 0.8
        # SMC 誘捕重罰: 在溢價區 (>50%) 且無 Sweep 盲目追多 (散戶 IDM 誘捕)
        if fib_pos > 0.2 and ssl_sweep == 0:
            reward -= 2.5

    elif action == 2:  # SELL (逢高減碼 / 避險)
        # 空方基礎回報 (跌越多賺越多)
        reward = (-pct_return) * 1.5 + (max_drawdown - max_gain * 0.8)
        # SMC 機構紅利: 溢價區減碼且有 BSL Sweep 假突破
        if fib_pos > 0:
            reward += 1.2
        if bsl_sweep > 0.5:
            reward += 2.0
        # SMC 誘捕重罰: 在折價區地板無腦殺跌
        if fib_pos < -0.2:
            reward -= 2.5

    else:  # 0: HOLD (觀望等待)
        # 若盤面震盪 (波動小)，觀望獎勵高，避免頻繁過度交易
        if abs(pct_return) < 1.0:
            reward = 0.4
        else:
            # 若錯過大行情，給予微量機會成本懲罰
            reward = -0.3

    return float(np.clip(reward, -10.0, 10.0))


def train_smc_rl_agent(stock_data_path, output_weights_path, epochs=15):
    """主強化學習訓練流程"""
    print("=" * 60)
    print("🚀 開始執行 SMC 深度強化學習交易代理人 (DRL DQN) 訓練管線")
    print("=" * 60)

    # 1. 讀取台股真實歷史 K 線數據
    with open(stock_data_path, 'r', encoding='utf-8') as f:
        content = f.read()
    idx = content.find('{')
    last_idx = content.rfind('}')
    raw_history = json.loads(content[idx:last_idx+1])
    print(f"📊 成功載入 {len(raw_history)} 檔標的之真實歷史日 K 線資料")

    # 2. 構建環境與特徵工程
    env = SMCTradingEnvironment(raw_history)
    episodes = env.extract_features_and_episodes()
    print(f"🧬 成功提取 {len(episodes)} 檔有效標的 SMC 狀態空間 (State Dim: 10, Action Dim: 3)")

    # 3. 初始化 Deep Q-Network 與 Target Network
    policy_net = DQNNetwork(input_dim=10, hidden1=32, hidden2=16, output_dim=3, lr=0.003)
    target_net = DQNNetwork(input_dim=10, hidden1=32, hidden2=16, output_dim=3)
    target_net.copy_weights_from(policy_net, tau=1.0)

    # 4. 建立經驗回放池 Experience Replay Buffer
    replay_buffer = []
    max_buffer_size = 20000

    print("🧠 正在生成初期探索經驗庫 (Generating Replay Buffer)...")
    for stock_id, bars, states in episodes:
        m = len(states)
        for t in range(m - 2):
            idx_t, s_t, p_t = states[t]
            idx_next, s_next, p_next = states[t+1]
            future_prices = [states[k][2] for k in range(t+1, min(m, t+4))]

            # 模擬 3 種動作之環境反饋
            for act in [0, 1, 2]:
                r = calculate_smc_reward(act, s_t, p_t, p_next, future_prices)
                done = (t == m - 3)
                replay_buffer.append((s_t, act, r, s_next, done))
                if len(replay_buffer) >= max_buffer_size:
                    break
        if len(replay_buffer) >= max_buffer_size:
            break

    print(f"✅ 經驗回放庫就緒，包含 {len(replay_buffer)} 筆 (State, Action, Reward, NextState) 樣本")

    # 5. 開始深度強化學習 Bellman 迭代訓練
    gamma = 0.95
    batch_size = 64
    epsilon = 0.4
    loss_history = []
    reward_history = []

    print("\n🏋️ 正在進行 Q-Learning 貝爾曼方程反向傳播優化...")
    for epoch in range(1, epochs + 1):
        random.shuffle(replay_buffer)
        total_loss = 0.0
        total_reward = 0.0
        steps = 0

        num_batches = len(replay_buffer) // batch_size
        for b in range(num_batches):
            batch = replay_buffer[b * batch_size : (b + 1) * batch_size]
            b_states = np.array([item[0] for item in batch], dtype=np.float32)
            b_actions = np.array([item[1] for item in batch], dtype=np.int32)
            b_rewards = np.array([item[2] for item in batch], dtype=np.float32)
            b_next_states = np.array([item[3] for item in batch], dtype=np.float32)
            b_dones = np.array([item[4] for item in batch], dtype=np.bool_)

            # 計算目標 Q 值: Target Q = r + gamma * max_a' Q_target(s') * (1 - done)
            q_next_target, _ = target_net.forward(b_next_states)
            max_q_next = np.max(q_next_target, axis=1)
            targets = b_rewards + (1.0 - b_dones.astype(np.float32)) * gamma * max_q_next

            # Policy Network 權重反向傳播更新
            loss = policy_net.train_step(b_states, b_actions, targets)
            total_loss += loss
            total_reward += np.mean(b_rewards)
            steps += 1

        # 軟更新目標網路
        target_net.copy_weights_from(policy_net, tau=0.15)
        epsilon = max(0.05, epsilon * 0.85)

        avg_loss = total_loss / max(1, steps)
        avg_reward = total_reward / max(1, steps)
        loss_history.append(round(avg_loss, 5))
        reward_history.append(round(avg_reward, 3))

        print(f"  [Epoch {epoch:02d}/{epochs:02d}] Bellman MSE Loss: {avg_loss:.5f} | Avg Step Reward: {avg_reward:+.3f} | Epsilon: {epsilon:.3f}")

    # 6. 匯出神經網路權重供純前端 JavaScript 零延遲推論
    export_data = {
        'model_name': 'SMC-DQN Deep Q-Network',
        'version': '3.0.0-Trained',
        'architecture': {
            'input_dim': 10,
            'hidden_1': 32,
            'hidden_2': 16,
            'output_dim': 3,
            'activation': 'ReLU'
        },
        'feature_names': [
            'fvg_proximity',
            'ob_proximity',
            'fib_equilibrium_pos',
            'ssl_sweep_detected',
            'bsl_sweep_detected',
            'bos_bull_breakout',
            'bos_bear_breakout',
            'wick_rejection_ratio',
            'volume_expansion_ratio',
            'momentum_3bar_return'
        ],
        'action_map': {
            '0': {'name': 'HOLD', 'label': '觀望等待 (流動性未確立或均衡區)'},
            '1': {'name': 'BUY', 'label': '🎯 多方進場 (Extreme OB + SSL 掃蕩進場)'},
            '2': {'name': 'SELL', 'label': '🛡️ 空方減碼 (溢價區承壓 / BSL 假突破)'}
        },
        'training_metrics': {
            'epochs': epochs,
            'samples_trained': len(replay_buffer) * epochs,
            'final_bellman_loss': float(loss_history[-1]),
            'final_avg_reward': float(reward_history[-1]),
            'loss_history': [float(x) for x in loss_history],
            'reward_history': [float(x) for x in reward_history]
        },
        'weights': {
            'W1': np.round(policy_net.W1.astype(float), 6).tolist(),
            'b1': np.round(policy_net.b1.astype(float), 6).tolist()[0],
            'W2': np.round(policy_net.W2.astype(float), 6).tolist(),
            'b2': np.round(policy_net.b2.astype(float), 6).tolist()[0],
            'W3': np.round(policy_net.W3.astype(float), 6).tolist(),
            'b3': np.round(policy_net.b3.astype(float), 6).tolist()[0]
        }
    }

    os.makedirs(os.path.dirname(output_weights_path), exist_ok=True)
    with open(output_weights_path, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 強化學習模型權重與元數據成功匯出至: {output_weights_path}")
    print("=" * 60)
    return export_data


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    history_file = os.path.join(base_dir, 'src', 'data', 'stocksHistoryCompact.js')
    weights_output = os.path.join(base_dir, 'src', 'data', 'smcRlModelWeights.json')
    train_smc_rl_agent(history_file, weights_output, epochs=12)
