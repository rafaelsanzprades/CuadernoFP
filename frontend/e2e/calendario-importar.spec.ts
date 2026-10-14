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
