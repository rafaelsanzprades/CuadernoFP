# 🧪 Tests E2E — Cuaderno FP

## Descripción

Tests End-to-End implementados con **Playwright** para validar los flujos principales de la aplicación Cuaderno FP.

## Configuración

- **Framework:** Playwright
- **Navegadores:** Chromium, Firefox, WebKit
- **Puerto:** 3000 (servidor Next.js)
- **Timeout:** 30 segundos por test

## Archivos de Tests

| Archivo | Tests | Descripción |
|---------|-------|-------------|
| `e2e/navigation.spec.ts` | 5 | Navegación principal entre rutas |
| `e2e/pages.spec.ts` | 5 | Carga de páginas principales |
| `e2e/accessibility.spec.ts` | 4 | Accesibilidad básica (ARIA, teclado, imágenes) |
| `e2e/responsive.spec.ts` | 4 | Responsive design, error handling, búsqueda |

**Total:** 18 tests × 3 navegadores = **54 tests**

## Ejecución

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar con interfaz gráfica (Playwright UI)
npm run test:e2e:ui

# Ejecutar solo en Chromium
npm run test:e2e -- --project=chromium

# Ejecutar un archivo específico
npm run test:e2e -- e2e/navigation.spec.ts

# Ver reporte HTML
npm run test:e2e:report
```

## Tests Detallados

### 1. Navegación (`navigation.spec.ts`)

| # | Test | Descripción |
|---|------|-------------|
| 1 | Navegar a Inicio | Verifica carga de `/inicio` |
| 2 | Navegar a Agenda | Verifica carga de `/agenda` |
| 3 | Navegar a Alumnado | Verifica carga de `/alumnado` |
| 4 | Navegar a Calendario | Verifica carga de `/calendario` |
| 5 | Navegar a Catálogo | Verifica carga de `/catalogo` |

### 2. Páginas (`pages.spec.ts`)

| # | Test | Descripción |
|---|------|-------------|
| 1 | Página de inicio carga | Verifica título y contenido |
| 2 | Página de agenda carga | Verifica elementos de agenda |
| 3 | Página de alumnado carga | Verifica lista de alumnos |
| 4 | Página de calendario carga | Verifica calendario académico |
| 5 | Página de catálogo carga | Verifica catálogo de ciclos |

### 3. Accesibilidad (`accessibility.spec.ts`)

| # | Test | Descripción |
|---|------|-------------|
| 1 | Títulos en orden correcto | Verifica jerarquía h1→h2→h3 |
| 2 | Imágenes con alt text | Verifica atributo alt en imágenes |
| 3 | Navegación por teclado | Verifica tabIndex y focus visible |
| 4 | ARIA labels en botones | Verifica aria-label en botones principales |

### 4. Responsive (`responsive.spec.ts`)

| # | Test | Descripción |
|---|------|-------------|
| 1 | Desktop layout | Verifica layout en 1280×720 |
| 2 | Tablet layout | Verifica layout en 768×1024 |
| 3 | Mobile layout | Verifica layout en 375×667 |
| 4 | Manejo de errores | Verifica página 404 |

## Dependencias

```json
{
  "devDependencies": {
    "@playwright/test": "^1.52.0"
  }
}
```

## Instalación de Navegadores

```bash
npx playwright install
```

## Reporte

El reporte HTML se genera en `frontend/playwright-report/` después de ejecutar los tests.

```bash
npm run test:e2e:report
```

## CI/CD

Los tests se pueden ejecutar en CI con:

```bash
npx playwright test --project=chromium
```

## Notas

- Los tests requieren que el servidor Next.js esté corriendo en `http://localhost:3000`
- Playwright gestiona automáticamente el inicio del servidor gracias a `webServer` en `playwright.config.ts`
- Los tests son independientes y pueden ejecutarse en cualquier orden
- Cada test tiene un timeout de 30 segundos para manejar tiempos de carga

---

**Última actualización:** 14 junio 2026
