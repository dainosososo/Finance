/**
 * Cloudflare Worker / Vercel Edge Serverless Proxy for TWSE MIS & OpenAPI
 * 
 * 部署至 Cloudflare Workers (免費方案每日 100,000 次請求)
 * 解決前端瀏覽器直接連線台灣證交所產生的 CORS 阻擋與 IP 限流問題。
 * 
 * 端點規格:
 * 1. GET /mis?ex_ch=tse_2330.tw|tse_2317.tw
 *    -> 轉發至 https://mis.twse.com.tw/stock/api/getStockInfo.jsp
 * 2. GET /openapi/twse-all
 *    -> 轉發至 https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL
 * 3. GET /openapi/tpex-all
 *    -> 轉發至 https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 處理 CORS Preflight (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3, s-maxage=3', // 邊緣快取 3 秒，防止頻繁衝擊 TWSE
    };

    try {
      // 1. TWSE 盤中撮合 MIS 即時行情
      if (url.pathname.startsWith('/mis') || url.pathname.startsWith('/api/twse-mis')) {
        const exCh = url.searchParams.get('ex_ch') || 'tse_2330.tw';
        const twseMisUrl = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(exCh)}&_json=1&_=${Date.now()}`;
        
        const response = await fetch(twseMisUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://mis.twse.com.tw/stock/fibest.jsp?lang=zh_tw',
            'Accept': 'application/json, text/javascript, */*; q=0.01'
          }
        });

        const data = await response.text();
        return new Response(data, {
          status: response.status,
          headers: corsHeaders
        });
      }

      // 2. TWSE 全市場收盤 OpenAPI
      if (url.pathname.startsWith('/openapi/twse-all')) {
        const twseApiUrl = 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL';
        const response = await fetch(twseApiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          }
        });
        const data = await response.text();
        return new Response(data, {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Cache-Control': 'public, max-age=30, s-maxage=60'
          }
        });
      }

      // 3. TPEx 櫃買中心收盤 OpenAPI
      if (url.pathname.startsWith('/openapi/tpex-all')) {
        const tpexApiUrl = 'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes';
        const response = await fetch(tpexApiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          }
        });
        const data = await response.text();
        return new Response(data, {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Cache-Control': 'public, max-age=30, s-maxage=60'
          }
        });
      }

      // 預設說明首頁
      return new Response(JSON.stringify({
        status: 'online',
        service: 'TWSE & TPEx Edge Serverless Proxy Gateway',
        endpoints: [
          '/mis?ex_ch=tse_2330.tw|tse_2317.tw',
          '/openapi/twse-all',
          '/openapi/tpex-all'
        ],
        timestamp: new Date().toISOString()
      }, null, 2), {
        headers: corsHeaders
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
