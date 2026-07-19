const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const TIMEOUT = 180000;

const PROFUNDIDAD = {
  veloz: { label: 'Veloz', tempOffset: 0, topPOffset: 0, maxTokMult: 0.5, thinking: false, reasoning: 0 },
  normal: { label: 'Normal', tempOffset: 0, topPOffset: 0, maxTokMult: 1, thinking: false, reasoning: 0 },
  profundo: { label: 'Profundo', tempOffset: -0.3, topPOffset: -0.05, maxTokMult: 2, thinking: true, reasoning: 16384 }
};

const MODELS = {
  'deepseek-v4-flash': {
    model: 'deepseek-ai/deepseek-v4-flash',
    apiKey: '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',
    temperature: 0.3,
    top_p: 0.85,
    max_tokens: 4096
  },
  'deepseek-v4-pro': {
    model: 'deepseek-ai/deepseek-v4-pro',
    apiKey: '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',
    temperature: 0.7,
    top_p: 0.92,
    max_tokens: 32768,
    supportsThinking: true
  },
  'qwen-3.5-397b': {
    model: 'qwen/qwen3.5-397b-a17b',
    apiKey: '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',
    temperature: 0.5,
    top_p: 0.92,
    max_tokens: 32768,
    supportsThinking: true
  },
  'nemotron-3-super': {
    model: 'nvidia/nemotron-3-super-120b-a12b',
    apiKey: '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',
    temperature: 0.6,
    top_p: 0.9,
    max_tokens: 32768,
    supportsThinking: true
  },
  'gemma-3': {
    model: 'google/gemma-3n-e2b-it',
    apiKey: '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',
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 512,
    supportsThinking: false
  },
  'llama-4-maverick': {
    model: 'meta/llama-4-maverick-17b-128e-instruct',
    apiKey: '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',
    temperature: 1,
    top_p: 1,
    max_tokens: 512,
    supportsThinking: false
  }
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200); res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() })); return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { messages, model: modelId, depth: depthId } = JSON.parse(body);
        if (!messages || !messages[0] || !messages[0].content) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'El mensaje no puede estar vacío' })); return;
        }
        if (typeof messages[0].content === 'string' && !messages[0].content.trim()) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'El mensaje no puede estar vacío' })); return;
        }
        const cfg = MODELS[modelId];
        if (!cfg) {
          res.writeHead(400); res.end(JSON.stringify({ error: `Modelo "${modelId}" no v\u00E1lido. Usa: ${Object.keys(MODELS).join(', ')}` })); return;
        }
        const depth = PROFUNDIDAD[depthId] || PROFUNDIDAD.normal;
        const timeout = depthId === 'profundo' ? 300000 : TIMEOUT;
        const maxTok = Math.round(cfg.max_tokens * depth.maxTokMult);
        const temp = Math.max(0.1, Math.min(2, cfg.temperature + depth.tempOffset));
        const topP = Math.max(0.1, Math.min(1, cfg.top_p + depth.topPOffset));

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const payload = {
          model: cfg.model,
          messages,
          temperature: temp,
          top_p: topP,
          max_tokens: maxTok,
          stream: true
        };
        if (depth.thinking && cfg.supportsThinking) {
          payload.chat_template_kwargs = { enable_thinking: true, thinking: true };
          payload.reasoning_budget = depth.reasoning;
        }
        const r = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
          body: JSON.stringify(payload)
        });
        clearTimeout(timer);
        if (r.ok) {
          res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
          if (r.body) {
            const reader = r.body.getReader(); const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done) { res.end(); break; }
              res.write(decoder.decode(value));
            }
          } else { const text = await r.text(); res.write(text); res.end(); }
        } else {
          const data = await r.json();
          res.writeHead(r.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        }
      } catch (e) {
        if (e.name === 'AbortError') {
          res.writeHead(504); res.end(JSON.stringify({ error: 'La API de IA tardó demasiado. Intenta con un mensaje más corto o cambia de modelo.' }));
        } else if ((e.message||'').match(/fetch|ENOTFOUND|ECONNREFUSED|ECONNRESET|network|eai_again/i)) {
          res.writeHead(502); res.end(JSON.stringify({ error: 'La API de IA no está disponible (error de conexión). Reintenta en unos segundos.' }));
        } else {
          res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
        }
      }
    });
    return;
  }

  let fp = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  try {
    const c = fs.readFileSync(fp);
    const mime = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.ico':'image/x-icon' };
    res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'text/plain' });
    res.end(c);
  } catch { res.writeHead(404); res.end('Not found'); }
});

server.listen(PORT, () => console.log(`MemeCraft IA en http://localhost:${PORT}`));
