// 2025-04-20 機能修正済みコード
const ALLOW_ORIGIN = 'https://aichatsurvice.girlfriend.jp';

function handleOptions(request) {
  // プリフライトリクエストへの応答
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': ALLOW_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  });
}

async function getAIReply(message, apiKey) {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const body = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message }],
    max_tokens: 256
  });
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body
  });
  if (!res.ok) throw new Error('OpenAI API error');
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id') || 'client_test';
    const value = await env["ai-chat-config"].get(clientId);

    if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': ALLOW_ORIGIN
          }
        });
      }
      const userMsg = body.message;
      if (!userMsg) {
        return new Response(JSON.stringify({ error: 'No message' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': ALLOW_ORIGIN
          }
        });
      }
      // KVストアから取得したconfigからAPIキーを抽出
      let apiKey;
      try {
        apiKey = config.openai_api_key;
      } catch (e) {
        apiKey = null;
      }
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'APIキーが設定されていません（client_idごと）' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': ALLOW_ORIGIN
          }
        });
      }
      try {
        const reply = await getAIReply(userMsg, apiKey);
        return new Response(JSON.stringify({ reply }), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': ALLOW_ORIGIN
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'AI応答取得エラー' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': ALLOW_ORIGIN
          }
        });
      }
    }
    // GETリクエスト時は従来通りconfig返却
    if (!value) {
      return new Response('設定が見つかりません', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': ALLOW_ORIGIN
        }
      });
    }
    let config;
    try {
      config = JSON.parse(value);
    } catch (e) {
      return new Response('設定データが不正です', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': ALLOW_ORIGIN
        }
      });
    }
    return new Response(JSON.stringify(config, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': ALLOW_ORIGIN
      }
    });
  }
};
