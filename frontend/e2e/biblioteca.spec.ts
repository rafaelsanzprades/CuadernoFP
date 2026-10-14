import { test, expect } from '@playwright/test';
import { abrirConDemo } from './helpers';

test.describe('Biblioteca de programaciones', () => {
  test('importa una programación sin datos del centro ni del profesorado', async ({ page }) => {
    await abrirConDemo(page, '/inicio?tab=datos');
    // la demo oculta la botonera de archivos: se pasa a datos reales y se acepta la confirmación de sustituir la programación abierta
    await page.getByRole('button', { name: /Reales|reales/ }).first().click();
    await page.getByRole('button', { name: 'Importar de la biblioteca' }).click();
    await expect(page.getByText('Rafael Sanz Prades').first()).toBeVisible();
    page.on('dialog', d => { d.accept(); });
    await page.getByRole('button', { name: 'Usar' }).click();
    await expect(page.getByText(/Programación importada/)).toBeVisible();
    // el contenido importado no trae ni centro ni profesorado
    const datos = await page.evaluate(async () => {
      const t = await fetch('/biblioteca/0237-ICTVE-aragon-202526.fpp').then(r => r.text());
      return ['Andalán', 'Zaragoza', 'Sanz'].filter(w => t.includes(w));
    });
    expect(datos).toEqual([]);
  });
});
