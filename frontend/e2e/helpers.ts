import { Page, expect } from '@playwright/test';

// La primera visita carga los datos de demostración en el navegador (IndexedDB);
// sin esperar a que el sidebar muestre la programación, las páginas salen vacías.
export async function abrirConDemo(page: Page, ruta: string) {
  await page.goto('/inicio');
  await expect(page.getByRole('navigation', { name: 'Navegación principal' }).getByText('202526 P').first()).toBeVisible();
  if (ruta !== '/inicio') await page.goto(ruta);
}
