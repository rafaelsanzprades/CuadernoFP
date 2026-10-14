import { test, expect } from '@playwright/test';
import { abrirConDemo } from './helpers';

test.describe('Páginas principales', () => {
  test('catálogo muestra el selector de familia profesional', async ({ page }) => {
    await abrirConDemo(page, '/catalogo');
    await expect(page.locator('main').getByText(/familia|ciclo|formativo/i).first()).toBeVisible();
  });

  test('calendario carga correctamente', async ({ page }) => {
    await abrirConDemo(page, '/calendario');
    await expect(page.getByRole('heading', { name: 'Calendario' })).toBeVisible();
  });

  test('alumnado carga correctamente', async ({ page }) => {
    await abrirConDemo(page, '/alumnado');
    await expect(page.getByRole('heading', { name: 'Alumnado' })).toBeVisible();
  });

  test('currículo carga correctamente', async ({ page }) => {
    await abrirConDemo(page, '/curriculo');
    await expect(page.getByRole('heading', { name: 'Currículo' })).toBeVisible();
  });

  test('sesiones carga correctamente', async ({ page }) => {
    await abrirConDemo(page, '/sesiones');
    await expect(page.getByRole('heading', { name: 'Sesiones' })).toBeVisible();
  });
});
