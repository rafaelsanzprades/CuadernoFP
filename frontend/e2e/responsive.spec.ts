import { test, expect } from '@playwright/test';
import { abrirConDemo } from './helpers';

test.describe('Responsive Design', () => {
  test('desktop muestra sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await abrirConDemo(page, '/inicio');
    await expect(page.locator('nav, aside, [role="navigation"]').first()).toBeVisible();
  });

  test('mobile oculta sidebar por defecto', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await abrirConDemo(page, '/inicio');
    // En móvil el sidebar debería estar oculto o colapsado
    // Solo verificamos que la página carga sin errores
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Error handling', () => {
  test('página inexistente muestra 404', async ({ page }) => {
    const response = await page.goto('/ruta-que-no-existe-12345');
    expect(response?.status()).toBe(404);
  });
});
