import { test, expect } from '@playwright/test';
import { abrirConDemo } from './helpers';

// Páginas del sidebar (src/config/navigation.ts): ruta y texto visible de su título.
const PAGINAS = [
  { href: '/catalogo', titulo: 'Catálogo' },
  { href: '/contexto', titulo: 'Contexto' },
  { href: '/curriculo', titulo: 'Currículo' },
  { href: '/metodologias', titulo: 'Metodologías' },
  { href: '/instrumentos', titulo: 'Instrumentos' },
  { href: '/calendario', titulo: 'Calendario' },
  { href: '/alumnado', titulo: 'Alumnado' },
  { href: '/calificaciones', titulo: 'Calificaciones' },
  { href: '/sesiones', titulo: 'Sesiones' },
  { href: '/cierre', titulo: 'Cierre' },
  { href: '/archivos', titulo: 'Archivos' },
];

test.describe('Navegación principal', () => {
  test('la raíz lleva a Inicio', async ({ page }) => {
    await abrirConDemo(page, '/');
    await expect(page).toHaveURL(/\/inicio/);
    await expect(page).toHaveTitle(/Cuaderno FP/);
  });

  for (const { href, titulo } of PAGINAS) {
    test(`navega a ${titulo} desde el sidebar`, async ({ page }) => {
      await abrirConDemo(page, '/inicio');
      await page.locator(`a[href^="${href}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(href));
      await expect(page.getByRole('heading', { name: titulo, exact: true }).first()).toBeVisible();
    });
  }

  test('las pestañas se enlazan por la URL (?tab=)', async ({ page }) => {
    await abrirConDemo(page, '/contexto?tab=entorno');
    await expect(page).toHaveURL(/tab=entorno/);
    await expect(page.getByRole('button', { name: 'Entorno' }).first()).toBeVisible();
  });
});
