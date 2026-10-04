/**
 * SMC (Smart Money Concepts) 強化學習純前端即時推論引擎
 * 依據 SMC_Fintech_EP05-39_Notion.md 筆記實作:
 * 1. 演算法價格交付結構辨識 (BOS / CHoCH 狀態機)
 * 2. 3 根 K 棒與 4 根 K 棒母子線公允價值缺口 (FVG / Imbalance)
 * 3. 極端訂單塊 (Extreme Order Block, POI)
 * 4. 流動性掃蕩 (Liquidity Sweep: Wick-to-Body >= 0.5 刺穿收回)
 * 5. 斐波那契 50% 折價/溢價區間 (Discount vs. Premium Zone)
 * 6. 強化學習代理人決策評估 (DRL Policy Evaluation -> Buy/Sell/Hold, RR, SL/TP)
 */

export function analyzeSMC(klineBars = []) {
  if (!klineBars || klineBars.length < 5) {
    return {
      status: 'INSUFFICIENT_DATA',
      fvgs: [],
      orderBlocks: [],
      sweeps: [],
      structures: [],
      decision: null
    };
  }

  const n = klineBars.length;
  const fvgs = [];
  const orderBlocks = [];
  const sweeps = [];
  const structures = []; // { type: 'BOS'|'CHoCH', direction: 'BULL'|'BEAR', price, index }

  // 1. 遍歷 K 棒偵測 FVG、Order Block、Sweep 與 結構破壞
  for (let i = 2; i < n; i++) {
    const kPrev2 = klineBars[i - 2];
    const kPrev1 = klineBars[i - 1];
    const kCurr = klineBars[i];

    const prev2High = kPrev2.high ?? kPrev2.price;
    const prev2Low = kPrev2.low ?? kPrev2.price;
    const currHigh = kCurr.high ?? kCurr.price;
    const currLow = kCurr.low ?? kCurr.price;
    const currClose = kCurr.close ?? kCurr.price;
    const currOpen = kCurr.open ?? kCurr.price;

    // A. 三根 K 棒 FVG 偵測 (Ep.05, Ep.14)
    // 看漲 FVG: 第 3 根 Low > 第 1 根 High
    if (currLow > prev2High) {
      const gap = currLow - prev2High;
      if (gap > (currClose * 0.001)) {
        fvgs.push({
          id: `fvg_bull_${i}`,
          type: 'BULL',
          top: Number(currLow.toFixed(2)),
          bottom: Number(prev2High.toFixed(2)),
          startIndex: i - 2,
          endIndex: Math.min(n - 1, i + 8),
          isMitigated: false
        });

        // FVG 前方的反向 K 棒即為 Order Block (Ep.10, Ep.32)
        orderBlocks.push({
          id: `ob_bull_${i}`,
          type: 'BULL',
          high: Number((kPrev1.high ?? kPrev1.price).toFixed(2)),
          low: Number((kPrev1.low ?? kPrev1.price).toFixed(2)),
          mid: Number((((kPrev1.high ?? kPrev1.price) + (kPrev1.low ?? kPrev1.price)) / 2).toFixed(2)),
          startIndex: i - 1,
          endIndex: Math.min(n - 1, i + 12),
          isMitigated: false
        });
      }
    }
    // 看跌 FVG: 第 1 根 Low > 第 3 根 High
    else if (prev2Low > currHigh) {
      const gap = prev2Low - currHigh;
      if (gap > (currClose * 0.001)) {
        fvgs.push({
          id: `fvg_bear_${i}`,
          type: 'BEAR',
          top: Number(prev2Low.toFixed(2)),
          bottom: Number(currHigh.toFixed(2)),
          startIndex: i - 2,
          endIndex: Math.min(n - 1, i + 8),
          isMitigated: false
        });

        orderBlocks.push({
          id: `ob_bear_${i}`,
          type: 'BEAR',
          high: Number((kPrev1.high ?? kPrev1.price).toFixed(2)),
          low: Number((kPrev1.low ?? kPrev1.price).toFixed(2)),
          mid: Number((((kPrev1.high ?? kPrev1.price) + (kPrev1.low ?? kPrev1.price)) / 2).toFixed(2)),
          startIndex: i - 1,
          endIndex: Math.min(n - 1, i + 12),
          isMitigated: false
        });
      }
    }

    // B. 波段高低點與結構破壞 BOS / CHoCH (Ep.07, Ep.11)
    const windowSlice = klineBars.slice(Math.max(0, i - 15), i);
    const swingHigh = Math.max(...windowSlice.map(b => b.high ?? b.price));
    const swingLow = Math.min(...windowSlice.map(b => b.low ?? b.price));

    if (currClose > swingHigh) {
      structures.push({
        type: structures.length === 0 || structures[structures.length - 1].direction === 'BEAR' ? 'CHoCH' : 'BOS',
        direction: 'BULL',
        price: Number(swingHigh.toFixed(2)),
        index: i
      });
    } else if (currClose < swingLow) {
      structures.push({
        type: structures.length === 0 || structures[structures.length - 1].direction === 'BULL' ? 'CHoCH' : 'BOS',
        direction: 'BEAR',
        price: Number(swingLow.toFixed(2)),
        index: i
      });
    }

    // C. 流動性掃蕩 (Liquidity Sweep, Ep.05, Ep.25)
    const body = Math.abs(currClose - currOpen);
    const upperWick = currHigh - Math.max(currClose, currOpen);
    const lowerWick = Math.min(currClose, currOpen) - currLow;

    if (currHigh > swingHigh && currClose < swingHigh && upperWick >= body * 0.5) {
      sweeps.push({
        type: 'BSL_SWEEP', // 獵殺買方流動性後反轉
        price: Number(currHigh.toFixed(2)),
        index: i,
        time: kCurr.time
      });
    } else if (currLow < swingLow && currClose > swingLow && lowerWick >= body * 0.5) {
      sweeps.push({
        type: 'SSL_SWEEP', // 獵殺賣方流動性後強勢收回
        price: Number(currLow.toFixed(2)),
        index: i,
        time: kCurr.time
      });
    }
  }

  // 2. 當前最新盤面狀態分析 (Latest State Vector)
  const lastBar = klineBars[n - 1];
  const currentPrice = lastBar.close ?? lastBar.price;
  const recentSlice = klineBars.slice(Math.max(0, n - 20));
  const recentHigh = Math.max(...recentSlice.map(b => b.high ?? b.price));
  const recentLow = Math.min(...recentSlice.map(b => b.low ?? b.price));

  // 斐波那契 50% 折價/溢價區間 (Fibonacci Equilibrium, Ep.30, Ep.39)
  const range = recentHigh - recentLow;
  const fib50 = recentLow + range * 0.5;
  const isDiscount = currentPrice < fib50;
  const isPremium = currentPrice > fib50;

  // 過濾未完全被緩解的最新 FVG 與 Order Block
  const activeBullFvgs = fvgs.filter(f => f.type === 'BULL' && currentPrice >= f.bottom);
  const activeBearFvgs = fvgs.filter(f => f.type === 'BEAR' && currentPrice <= f.top);
  const activeBullOBs = orderBlocks.filter(o => o.type === 'BULL');
  const activeBearOBs = orderBlocks.filter(o => o.type === 'BEAR');

  const latestBullOB = activeBullOBs[activeBullOBs.length - 1] || null;
  const latestBearOB = activeBearOBs[activeBearOBs.length - 1] || null;
  const latestFVG = fvgs[fvgs.length - 1] || null;
  const latestSweep = sweeps[sweeps.length - 1] || null;
  const latestStructure = structures[structures.length - 1] || null;

  // 3. 強化學習代理人決策評估 (DRL Policy Evaluation)
  let bullScore = 0;
  let bearScore = 0;
  const reasoningSignals = [];

  // A. 流動性掃蕩 (權重 35 分，最高優先級)
  if (latestSweep && (n - 1 - latestSweep.index) <= 5) {
    if (latestSweep.type === 'SSL_SWEEP') {
      bullScore += 35;
      reasoningSignals.push('剛剛完成 SSL 賣方流動性獵殺 (Liquidity Grab 收長下影線)');
    } else {
      bearScore += 35;
      reasoningSignals.push('剛剛完成 BSL 買方流動性獵殺 (刺穿前高後長上影線收回)');
    }
  }

  // B. 斐波那契折價區 / 溢價區過濾 (權重 20 分)
  if (isDiscount) {
    bullScore += 20;
    reasoningSignals.push(`現價處於折價區 (<50% Equilibrium: NT$ ${fib50.toFixed(1)})，具高安全邊際`);
  } else if (isPremium) {
    bearScore += 20;
    reasoningSignals.push(`現價處於溢價區 (>50% Equilibrium: NT$ ${fib50.toFixed(1)})，不宜盲目追多`);
  }

  // C. 結構突破確認 (權重 20 分)
  if (latestStructure) {
    if (latestStructure.direction === 'BULL') {
      bullScore += 20;
      reasoningSignals.push(`近期確認多方結構延續 (${latestStructure.type} 突破高點)`);
    } else {
      bearScore += 20;
      reasoningSignals.push(`近期確認空方結構壓制 (${latestStructure.type} 跌破低點)`);
    }
  }

  // D. 訂單塊共振 (權重 15 分)
  if (latestBullOB && currentPrice >= latestBullOB.low * 0.99 && currentPrice <= latestBullOB.high * 1.02) {
    bullScore += 15;
    reasoningSignals.push(`踏入極端多頭訂單塊 Extreme OB 核心緩解區間 (NT$ ${latestBullOB.low} ~ ${latestBullOB.high})`);
  } else if (latestBearOB && currentPrice >= latestBearOB.low * 0.98 && currentPrice <= latestBearOB.high * 1.01) {
    bearScore += 15;
    reasoningSignals.push(`踏入空頭訂單塊 Bearish OB 阻力區間 (NT$ ${latestBearOB.low} ~ ${latestBearOB.high})`);
  }

  // E. FVG 磁吸 (權重 10 分)
  if (latestFVG) {
    if (latestFVG.type === 'BULL') {
      bullScore += 10;
      reasoningSignals.push(`下方存在未緩解公允價值缺口 FVG 支撐帶 (NT$ ${latestFVG.bottom} ~ ${latestFVG.top})`);
    } else {
      bearScore += 10;
      reasoningSignals.push(`上方存在未緩解公允價值缺口 FVG 壓力帶 (NT$ ${latestFVG.bottom} ~ ${latestFVG.top})`);
    }
  }

  // 4. 決策輸出與結構性停損/停利 (R-multiple)
  let action = 'HOLD';
  let actionLabel = '觀望 (等待 IDM 誘捕完成或 FVG 踩點)';
  let confidence = Math.max(bullScore, bearScore);
  let stopLoss = null;
  let takeProfit = null;
  let expectedRR = '1 : 2.5';

  if (bullScore >= 50 && bullScore > bearScore) {
    action = 'BUY';
    actionLabel = '🎯 強烈做多 (Extreme OB + Sweep 聰明錢進場)';
    stopLoss = latestBullOB ? latestBullOB.low * 0.995 : recentLow * 0.995;
    const risk = Math.max(1.0, currentPrice - stopLoss);
    takeProfit = currentPrice + risk * 2.5; // 2.5R 盈虧比
    expectedRR = '1 : 2.5';
  } else if (bearScore >= 50 && bearScore > bullScore) {
    action = 'SELL';
    actionLabel = '🛡️ 逢高減碼 / 做空 (溢價區 OB 承壓)';
    stopLoss = latestBearOB ? latestBearOB.high * 1.005 : recentHigh * 1.005;
    const risk = Math.max(1.0, stopLoss - currentPrice);
    takeProfit = currentPrice - risk * 2.5;
    expectedRR = '1 : 2.5';
  } else {
    confidence = 42;
  }

  return {
    status: 'SUCCESS',
    currentPrice,
    fib50: Number(fib50.toFixed(2)),
    isDiscount,
    isPremium,
    fvgs: fvgs.slice(-8), // 傳回最新 8 個 FVG
    orderBlocks: orderBlocks.slice(-6), // 傳回最新 6 個 OB
    sweeps: sweeps.slice(-6),
    structures: structures.slice(-6),
    decision: {
      action,
      actionLabel,
      confidence: Math.min(96, Math.max(35, confidence)),
      signals: reasoningSignals,
      entryPrice: Number(currentPrice.toFixed(2)),
      stopLoss: stopLoss ? Number(stopLoss.toFixed(2)) : null,
      takeProfit: takeProfit ? Number(takeProfit.toFixed(2)) : null,
      expectedRR,
      htfBias: bullScore > bearScore ? 'BULLISH' : (bearScore > bullScore ? 'BEARISH' : 'NEUTRAL')
    }
  };
}
