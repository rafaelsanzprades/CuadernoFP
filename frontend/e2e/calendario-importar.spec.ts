import { test, expect } from '@playwright/test';
import { abrirConDemo } from './helpers';

test.describe('Calendario oficial', () => {
  test('importa festivos y vacaciones de Aragón al curso', async ({ page }) => {
    await abrirConDemo(page, '/calendario?tab=eventos');
    await page.getByRole('button', { name: 'Importar calendario oficial' }).click();
    await expect(page.getByText('Fuente:').first()).toBeVisible();
    await page.getByRole('button', { name: 'Importar', exact: true }).click();
    await expect(page.getByText(/Calendario importado: \d+ días añadidos/)).toBeVisible();
  });
});

test.describe('Calendario oficial: otras comunidades', () => {
  test('permite elegir el calendario de Galicia e importarlo', async ({ page }) => {
    await abrirConDemo(page, '/calendario?tab=eventos');
    await page.getByRole('button', { name: 'Importar calendario oficial' }).click();
    const lista = page.locator('select').first();
    await expect(lista.locator('option')).toHaveCount(25);   // «—» + 24 calendarios (Andalucía tiene uno por provincia)
    await lista.selectOption({ label: '202627 Calendario - Galicia' });
    await expect(page.getByText('Orde do 4 de xuño de 2026').first()).toBeVisible();
    await page.getByRole('button', { name: 'Importar', exact: true }).click();
    await expect(page.getByText(/Calendario importado: \d+ días añadidos/)).toBeVisible();
  });
});
