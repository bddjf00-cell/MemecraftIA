const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const LOG = [];
const START = Date.now();

function log(m) { const t = new Date().toLocaleTimeString(); const s = `[${t}] ${m}`; LOG.push(s); console.log(s); }
function ok(m) { log(`  OK  ${m}`); }
function fail(m) { log(`  FAIL ${m}`); }
function fix(m) { log(`  FIX ${m}`); }

function fetchAPI(modelo, prompt, tiempo) {
  return new Promise(res => {
    const body = JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: modelo });
    const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/chat', method: 'POST',
      headers: { 'Content-Type': 'application/json' }, timeout: tiempo || 60000 },
      r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res({ status: r.statusCode, data: JSON.parse(d) }) } catch { res({ status: r.statusCode, data: { error: 'JSON inválido' } }) } }); });
    req.on('error', e => res({ status: 0, data: { error: e.message } }));
    req.on('timeout', () => { req.destroy(); res({ status: 0, data: { error: 'timeout' } }); });
    req.write(body); req.end();
  });
}

function healthCheck() {
  return new Promise(res => {
    const req = http.get('http://localhost:3000/api/health', r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)) } catch { res(null) } }); });
    req.on('error', () => res(null)); req.setTimeout(5000, () => { req.destroy(); res(null); });
  });
}

function matarPuerto(puerto) {
  try {
    const out = execSync(`netstat -ano | find ":${puerto}"`, { encoding: 'utf8', timeout: 5000, stdio: ['pipe','pipe','ignore'] });
    const lines = out.split('\n').filter(l => l.includes('LISTEN'));
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        try { execSync(`taskkill /pid ${pid} /f 2>nul`, { stdio: 'ignore' }); } catch {}
      }
    }
  } catch {}
}
function asegurarServidor() {
  return new Promise(async res => {
    let salud = await healthCheck();
    if (salud) { ok(`Servidor activo (uptime: ${Math.floor(salud.uptime)}s)`); res(true); return; }
    log('Servidor caído. Iniciando...');
    matarPuerto(3000);
    spawn('node', [path.join(__dirname, 'server.js')], { detached: true, stdio: 'ignore' });
    for (let i=0; i<10; i++) {
      await new Promise(r => setTimeout(r, 1000));
      salud = await healthCheck();
      if (salud) { ok(`Servidor iniciado`); res(true); return; }
    }
    fail('No se pudo iniciar servidor');
    res(false);
  });
}

async function testCodeQuality() {
  let okCount = 0, failCount = 0;

  // 1. Health
  const h = await healthCheck();
  if (h) { ok(`health check`); okCount++; } else { fail(`health check`); failCount++; }

  // 2. Archivos críticos
  for (const a of ['index.html', 'server.js']) {
    if (fs.existsSync(path.join(__dirname, a))) { ok(`${a} existe`); okCount++; }
    else { fail(`${a} no encontrado`); failCount++; }
  }

  // 3. Verificar código HTML
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const checks = [
    ['function str(', 'str() para proteger [object Object]'],
    ['AbortController', 'AbortController'],
    ['btnStop', 'botón Detener'],
    ['STORAGE_KEY', 'persistencia localStorage'],
    ['mode-btn', 'modo selector'],
    ['MODO_PROMPTS', 'system prompts por modo'],
    ['model-card', 'tarjetas visuales de modelo'],
    ['model-logo', 'imágenes de modelo'],
    ['FUNCIONES', 'datos de 100 funciones'],
    ['modal-overlay', 'modal de funciones'],
    ['abrirFunciones', 'apertura del modal'],
    ['discord.gg', 'enlace Discord'],
    ['profundidadActual', 'profundidad/razonamiento']
  ];
  for (const [pat, desc] of checks) {
    if (html.includes(pat)) { ok(`index.html: ${desc}`); okCount++; }
    else { fail(`index.html: falta ${desc}`); failCount++; }
  }

  // 4. Verificar server.js
  const sj = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const srvChecks = [
    ['PROFUNDIDAD', 'PROFUNDIDAD config'],
    ['supportsThinking', 'thinking/reasoning params']
  ];
  for (const [pat, desc] of srvChecks) {
    if (sj.includes(pat)) { ok(`server.js: ${desc}`); okCount++; }
    else { fail(`server.js: falta ${desc}`); failCount++; }
  }

  return { ok: okCount, fail: failCount };
}

async function testModels() {
  let okCount = 0, failCount = 0;

  // 1. Validación mensaje vacío
  const r1 = await fetchAPI('deepseek-v4-flash', '', 10000);
  if (r1.status === 400) { ok(`mensaje vacío → 400`); okCount++; }
  else { fail(`mensaje vacío: ${r1.status}`); failCount++; }

  // 2. Validación modelo inválido
  const r2 = await fetchAPI('modelo-x', 'ok', 10000);
  if (r2.status === 400) { ok(`modelo inválido → 400`); okCount++; }
  else { fail(`modelo inválido: ${r2.status}`); failCount++; }

  // 3. Probar solo Flash (rápido, menos rate limit)
  const r3 = await fetchAPI('deepseek-v4-flash', 'Resp: ok', 30000);
  if (r3.status === 200 && r3.data?.choices?.[0]?.message?.content) { ok(`deepseek-v4-flash`); okCount++; }
  else {
    fail(`deepseek-v4-flash: ${r3.data?.error||r3.status}`);
    if (r3.status === 429) return { ok: okCount, fail: failCount, rateLimited: true };
  }

  return { ok: okCount, fail: failCount, rateLimited: false };
}

async function main() {
  log('╔════════════════════════════════════════════════╗');
  log('║  MemeCraft IA - AutoImprove Loop v3.0        ║');
  log('║  Mejora continua automática                   ║');
  log('╚════════════════════════════════════════════════╝');

  const serverOk = await asegurarServidor();
  if (!serverOk) { log('Abortando: servidor no disponible'); return; }

  let ronda = 0;
  let modelRonda = 0;
  let backoff = 0;
  while (true) {
    ronda++;

    // Code quality cada 30s
    const result = await testCodeQuality();

    // Model tests cada 120s (2 min), o más si hay backoff por rate limit
    if (backoff > 0) backoff--;
    if (backoff === 0 && (ronda % 4 === 0 || modelRonda === 0)) {
      modelRonda++;
      const mr = await testModels();
      if (mr.rateLimited) {
        fail('Rate limit detectado — backoff 8 rondas (~4 min)');
        backoff = 8;
      }
    }

    // Reporte cada 4 rondas
    if (ronda % 4 === 0) {
      const elapsed = Math.floor((Date.now() - START) / 1000);
      fs.writeFileSync(path.join(__dirname, 'autoimprove.log'),
        `MemeCraft IA - AutoImprove\n` +
        `Duración: ${elapsed}s · Rondas: ${ronda}\n` +
        `Último OK: ${result.ok} · FAIL: ${result.fail}\n` +
        `─'.repeat(40)\n${LOG.slice(-50).join('\n')}`
      );
    }

    // Estabilidad
    if (result.fail === 0 && ronda % 3 === 0) {
      log(`* Ronda ${ronda}: codigo ESTABLE`);
    }

    await new Promise(r => setTimeout(r, 30000));
  }
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
