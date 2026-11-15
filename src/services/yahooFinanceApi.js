/**
 * Yahoo Finance Real-time Quotes Service (第三方穩定行情源)
 * 
 * 作為 TWSE 官方通道遇到跨域或斷線時的備援 (Fallback)
 * 支援上市 (.TW) 與上櫃 (.TWO) 標的自動解析與格式標準化
 */

export async function fetchYahooQuote(symbol) {
  const cleanCode = String(symbol).replace(/\.(TW|TWO)$/i, '').trim();
  
  // 優先嘗試上市 .TW，若失敗再嘗試上櫃 .TWO
  const suffixes = ['.TW', '.TWO'];

  for (const suf of suffixes) {
    const yahooSymbol = `${cleanCode}${suf}`;
    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    
    // 透過多重可跨域端點拉取
    const fetchEndpoints = [
      targetUrl,
      `https://cors.eu.org/${targetUrl}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    ];

    for (const ep of fetchEndpoints) {
      try {
        const res = await fetch(ep, { 
          signal: AbortSignal.timeout(4000),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          const result = data?.chart?.result?.[0];
          if (result && result.meta) {
            const meta = result.meta;
            const price = meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose || price;
            const change = price - prevClose;
            const pctChange = prevClose > 0 ? (change / prevClose) * 100 : 0;
            const volume = meta.regularMarketVolume || 0;

            return {
              symbol: cleanCode,
              name: meta.shortName || cleanCode,
              price: price.toFixed(2),
              prevClose: prevClose.toFixed(2),
              open: (meta.regularMarketDayHigh ? meta.regularMarketDayLow : price).toFixed(2),
              high: (meta.regularMarketDayHigh || price).toFixed(2),
              low: (meta.regularMarketDayLow || price).toFixed(2),
              volume: String(Math.round(volume / 1000)), // 張
              change: change.toFixed(2),
              pctChange: pctChange.toFixed(2),
              turnover: Number(((price * volume) / 1e8).toFixed(1)),
              tradeValue: price * volume,
              time: new Date(meta.regularMarketTime * 1000).toLocaleTimeString('zh-TW', { hour12: false }),
              source: 'Yahoo Finance (即時)',
              isRealtime: true
            };
          }
        }
      } catch (err) {
        // Continue to next endpoint
      }
    }
  }

  return null;
}

/**
 * 批次抓取 Yahoo Finance 報價
 */
export async function fetchBatchYahooQuotes(symbols = []) {
  if (!symbols || symbols.length === 0) return [];
  const promises = symbols.map(s => fetchYahooQuote(s));
  const results = await Promise.allSettled(promises);
  return results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value);
}
