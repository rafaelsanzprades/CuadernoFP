// Prueba de la app de escritorio ya compilada, por dentro: arranca src-tauri/target/release/app.exe con WEBVIEW2_USER_DATA_FOLDER aparte (no toca los datos del usuario) y
// WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222, y este script se conecta por CDP. No cubre los dialogos nativos de Windows (abrir/guardar).
// Uso: node frontend/scripts/prueba-escritorio.mjs   (con la app abierta como se indica; ver RF Ideas/00 IDEAS.md, CFP-11)
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(path.resolve('C:/GD-rsp/APP-CuadernoFP/frontend', 'package.json'));
const { chromium } = require('@playwright/test');
const SALIDA = (process.env.TEMP || '.').split(String.fromCharCode(92)).join('/') + '/';

const resultados = [];
const ok = (n, c, extra = '') => { resultados.push({ n, c, extra }); console.log((c ? 'OK   ' : 'FALLO') + ' ' + n + (extra ? ' · ' + extra : '')); };

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages()[0];
const errores = [];
page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => errores.push('pageerror ' + String(e).slice(0, 160)));
await page.waitForLoadState('load');
await page.waitForTimeout(4000);
const href0 = await page.evaluate(() => location.href);
ok('ventana de la app abierta', /tauri|localhost/.test(href0), href0);
const esTauri = await page.evaluate(() => !!(window.__TAURI_INTERNALS__ || window.__TAURI__));
ok('el frontend detecta Tauri', esTauri);

// Puerto del servidor interno (comando de Tauri) y /health
const puerto = await page.evaluate(async () => { try { return await window.__TAURI_INTERNALS__.invoke('get_backend_port'); } catch (e) { return 'ERR ' + e; } });
ok('get_backend_port devuelve un puerto', typeof puerto === 'number', String(puerto));
let base = null;
if (typeof puerto === 'number') {
  base = 'http://127.0.0.1:' + puerto;
  const h = await page.evaluate(async (b) => { try { const r = await fetch(b + '/health'); return r.status; } catch (e) { return 'ERR ' + e; } }, base);
  ok('servidor interno responde (CSP permite 127.0.0.1)', h === 200, String(h));
}

// Páginas y bloques nuevos
async function ir(ruta) {
  await page.evaluate((r) => { window.location.href = r; }, ruta);
  await page.waitForLoadState('load');
  await page.waitForTimeout(5000);
}
async function textos(sel) { return page.evaluate((s) => [...document.querySelectorAll(s)].map((e) => e.textContent.trim()), sel); }

await ir('/inicio?tab=bienvenida');
const h2s = await textos('h2');
ok('Bienvenida: tres bloques', ['Aplicación de escritorio', 'Comunidad en Telegram', 'Web con todos los contenidos'].every((x) => h2s.includes(x)), h2s.join(' | '));
const botones = await textos('main a, main button');
ok('Bienvenida: dentro de la app no se ofrece «Descargar para Windows»', !botones.some((b) => /Descargar para Windows/.test(b)));
await page.screenshot({ path: SALIDA + 'escritorio-bienvenida.png' });

async function nav(pagina, pestana) {
  await page.getByRole('navigation').getByRole('link', { name: pagina, exact: true }).first().click();
  await page.waitForTimeout(3500);
  if (pestana) { await page.locator('main button', { hasText: pestana }).first().click(); await page.waitForTimeout(1500); }
}
await nav('Instrumentos', 'Evaluación');
const h2i = await textos('h2');
ok('Instrumentos › Evaluación: catálogo y reglas', h2i.some((x) => /Catálogo de instrumentos/.test(x)) && h2i.some((x) => /Reglas de redondeo/.test(x)), h2i.join(' | '));
const botonesI = await textos('main button');
const tabsI = ['Resumen','Trimestres','Rúbricas','Modelo JEG','Evaluación','Procedimientos'].filter((x) => botonesI.includes(x));
ok('Instrumentos tiene 6 pestañas', tabsI.length === 6, tabsI.join(' | '));
await page.screenshot({ path: SALIDA + 'escritorio-instrumentos.png' });
await page.locator('main button', { hasText: 'Procedimientos' }).first().click(); await page.waitForTimeout(1500);
const h2p = await textos('h2');
ok('Instrumentos › Procedimientos carga sus bloques', h2p.some((x) => /Modelo de recuperación/.test(x)), h2p.join(' | '));

await nav('Contexto', 'Alumnado');
const h2a = await textos('h2');
ok('Contexto › Alumnado: rasgos rápidos', h2a.includes('Rasgos rápidos del alumnado'), h2a.join(' | '));
const botonesC = await textos('main button');
const tabsC = ['Identificación','Entorno','Alumnado','Evaluación','Procedimientos'].filter((x) => botonesC.includes(x));
ok('Contexto tiene solo 3 pestañas (Identificación, Entorno, Alumnado)', tabsC.length === 3 && !tabsC.includes('Evaluación'), tabsC.join(' | '));

await nav('Metodologías', 'Atención a la diversidad');
const h2d = await textos('h2');
ok('Metodologías › Diversidad en dos partes', /Adaptaciones no significativas/.test(h2d[0] || '') && /^Inclusión/.test(h2d[1] || ''), h2d.slice(0, 2).join(' | '));

// CFP-12: recargar (F5) estando en una página interior no debe dejar «Cargando…» para siempre
await nav('Instrumentos');
await page.reload();
await page.waitForLoadState('load');
await page.waitForTimeout(9000);
const tras = await page.evaluate(() => ({ url: location.pathname + location.search, texto: document.body.innerText }));
ok('F5 en Instrumentos no se queda en «Cargando…»', !/^\s*Saltar al contenido principal\s*Cargando\.{3}\s*$/.test(tras.texto) && /Instrumentos|No hay programación cargada/.test(tras.texto), tras.url + ' · ' + tras.texto.slice(0, 80).split(String.fromCharCode(10)).join(' '));
await ir('/inicio?tab=bienvenida');
await page.waitForTimeout(3000);
await nav('Ayuda');
const cuerpo = await page.evaluate(() => document.body.innerText);
ok('Ayuda › Guía carga', /Contexto|Instrumentos/.test(cuerpo));

// Generación de documentos con el servidor interno y los datos de demostración
if (base) {
  const out = await page.evaluate(async (b) => {
    const cargar = async (n) => { const r = await fetch('/demo/' + encodeURIComponent(n)); const j = await r.json(); return Array.isArray(j) ? j[0] : j; };
    const modulo = await cargar('202526 P 0237-ICTVE.fpp'); const curso = await cargar('202526 C 1A-GM 0237-ICTVE.fpc');
    const res = {};
    for (const [tipo, fmt] of [['programacion_minima_tpl', 'docx'], ['programacion_minima_tpl', 'pdf'], ['programacion_suficiente_tpl', 'docx'], ['programacion_jeg', 'docx'], ['calendario', 'pdf'], ['grupal_final', 'pdf']]) {
      try {
        const r = await fetch(`${b}/api/pdf?type=${tipo}&file_format=${fmt}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module_data: modulo, curso_data: curso }) });
        const buf = await r.arrayBuffer();
        res[tipo + '.' + fmt] = r.status + ' ' + buf.byteLength;
      } catch (e) { res[tipo + '.' + fmt] = 'ERR ' + e; }
    }
    return res;
  }, base);
  for (const [k, v] of Object.entries(out)) ok('documento ' + k + ' (servidor interno, desde la ventana)', /^200 \d{4,}/.test(v), v);
}

const reales = errores.filter((e) => !/ERR_CONNECTION_REFUSED|favicon|Failed to load resource/.test(e));
ok('sin errores de JavaScript en consola', reales.length === 0, reales.slice(0, 3).join(' || '));
console.log('\nRESUMEN', resultados.filter((r) => r.c).length + '/' + resultados.length);
await browser.close();
