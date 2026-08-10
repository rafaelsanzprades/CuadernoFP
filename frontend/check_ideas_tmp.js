const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('[console] ' + msg.text()); });

  await page.goto('http://localhost:3000/archivos?tab=datos', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Recargar DEMO' }).first().click({ force: true });
  await page.waitForTimeout(2000);

  const pages = [
    ['http://localhost:3000/contexto?tab=entorno', 'contexto_entorno.png'],
    ['http://localhost:3000/instrumentos?tab=resumen', 'instrumentos_resumen.png'],
    ['http://localhost:3000/metodologia?tab=metodologia', 'metodologia_eqavet.png'],
  ];
  for (const [url, file] of pages) {
    errors.length = 0;
    await page.goto(url, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(1200);
    console.log(`--- ERRORS (${url}) ---`);
    console.log(errors.join('\n') || '(ninguno)');
    await page.screenshot({ path: `C:/Users/rafae/AppData/Local/Temp/claude/c--GD-rsp-APP-CuadernoFP/71943c21-32c0-4d04-bb04-ca4f7bb735ae/scratchpad/${file}` });
  }

  await browser.close();
})();
