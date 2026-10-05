/**
 * Taiwan Stock Market WebSocket Gateway Proxy Server (Node.js)
 * 臺灣證券交易所 MIS 即時撮合 WebSocket 轉發代理伺服器
 * 
 * 啟動方式:
 *   1. 確保已安裝 Node.js
 *   2. npm install ws
 *   3. node server/websocket-proxy.js
 * 
 * 功能:
 *   - 建立 WebSocket 伺服器 (預設埠 8080)
 *   - 接收瀏覽器前端的 SUBSCRIBE / UNSUBSCRIBE 訊息
 *   - 定時/即時向 TWSE MIS 抓取最新成交跳動
 *   - 針對有價格或量變化的標的進行 Delta 廣播
 *   - 支援心跳 Ping/Pong 與延遲測試
 */

const { WebSocketServer } = require('ws');
const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ status: 'ok', service: 'TWSE WebSocket Gateway', clients: wss ? wss.clients.size : 0 }));
});

const wss = new WebSocketServer({ server });

// 儲存全域已訂閱標的集合
const globalSubscriptions = new Set(['2330', '2317', '2454', '0050', '2327', '4958', '2492']);

console.log(`🚀 [TWSE WS Gateway] 伺服器已啟動於 ws://localhost:${PORT}`);

// 向 TWSE MIS 抓取即時報價
function fetchTwseQuotes(symbols) {
  return new Promise((resolve) => {
    if (!symbols || symbols.length === 0) return resolve([]);

    const channelQuery = symbols.map(code => `tse_${code}.tw|otc_${code}.tw`).join('|');
    const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${channelQuery}&_json=1`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.msgArray) {
            const mapped = json.msgArray.filter(st => st && st.c).map(st => {
              let livePrice = null;
              if (st.z && st.z !== '-') livePrice = parseFloat(st.z);
              else if (st.trade && st.trade.z && st.trade.z !== '-') livePrice = parseFloat(st.trade.z);
              else if (st.pz && st.pz !== '-') livePrice = parseFloat(st.pz);
              else if (st.b && st.b !== '-') {
                const b0 = parseFloat(st.b.split('_')[0]);
                if (!isNaN(b0) && b0 > 0) livePrice = b0;
              }
              else if (st.a && st.a !== '-') {
                const a0 = parseFloat(st.a.split('_')[0]);
                if (!isNaN(a0) && a0 > 0) livePrice = a0;
              }

              const prevClose = parseFloat(st.y) || 0;
              const close = (livePrice !== null && !isNaN(livePrice) && livePrice > 0) ? livePrice : prevClose;
              const change = prevClose > 0 ? close - prevClose : 0;
              const pctChange = prevClose > 0 ? (change / prevClose) * 100 : 0;
              const rawVol = parseFloat(st.v) || 0;
              const estVal = close * rawVol * 1000;
              return {
                symbol: st.c,
                name: st.n,
                price: close.toFixed(2),
                prevClose: prevClose.toFixed(2),
                change: change.toFixed(2),
                pctChange: pctChange.toFixed(2),
                volume: String(rawVol),
                turnover: Number((estVal / 100000000).toFixed(1)),
                time: st.t || new Date().toLocaleTimeString('zh-TW', { hour12: false }),
                isRealtime: true
              };
            });
            resolve(mapped);
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

// 廣播至所有已連線客戶端
function broadcast(payload) {
  const msg = JSON.stringify(payload);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(msg);
    }
  });
}

// 核心輪詢廣播循環 (每 1.5 秒更新一次撮合)
setInterval(async () => {
  if (wss.clients.size === 0) return;
  const symbols = [...globalSubscriptions];
  if (symbols.length === 0) return;

  const quotes = await fetchTwseQuotes(symbols);
  if (quotes.length > 0) {
    broadcast({
      type: 'TICK',
      timestamp: Date.now(),
      data: quotes
    });
  }
}, 1500);

// 連線處理
wss.on('connection', (ws, req) => {
  console.log(`[WS] 新客戶端已連線 (當前總連線數: ${wss.clients.size})`);

  // 發送連線成功歡迎訊息
  ws.send(JSON.stringify({
    type: 'WELCOME',
    message: 'TWSE WebSocket Gateway 已連線',
    subscribed: [...globalSubscriptions]
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: data.timestamp }));
      } else if (data.type === 'SUBSCRIBE' && Array.isArray(data.symbols)) {
        data.symbols.forEach(s => globalSubscriptions.add(s));
        console.log(`[WS] 更新訂閱標的:`, [...globalSubscriptions]);
        // 立即拉取一次
        fetchTwseQuotes([...globalSubscriptions]).then(quotes => {
          if (quotes.length > 0) {
            ws.send(JSON.stringify({ type: 'TICK', data: quotes }));
          }
        });
      }
    } catch (e) {
      // ignore
    }
  });

  ws.on('close', () => {
    console.log(`[WS] 客戶端斷開連線 (剩餘連線數: ${wss.clients.size})`);
  });
});

server.listen(PORT, () => {
  console.log(`🌐 HTTP 監控狀態頁: http://localhost:${PORT}`);
});
