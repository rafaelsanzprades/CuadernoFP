# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navegación principal >> navega al alumnado
- Location: e2e\navigation.spec.ts:27:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/alumnado/
Received string:  "http://localhost:3000/inicio"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    8 × unexpected value "http://localhost:3000/inicio"

```

```yaml
- complementary:
  - link "Cuaderno FP":
    - /url: /inicio
    - heading "Cuaderno FP" [level=1]
  - text: 15:33 h
  - button
  - navigation "Navegación principal":
    - link "Agenda 2 de mayo de 2026":
      - /url: /agenda
    - link "Catálogo":
      - /url: /catalogo
    - link "Documentos":
      - /url: /documentos
    - link "Descargas":
      - /url: /descargas
    - link "Ayuda":
      - /url: /ayuda
    - text: Programación
    - link "Módulo didáctico":
      - /url: /modulo
    - link "Matrices OG→RA→CE→UD":
      - /url: /matrices
    - link "Instrumentos de evaluación":
      - /url: /instrumentos
    - link "Programación de aula":
      - /url: /programacion
    - text: Curso
    - link "Calendario académico":
      - /url: /calendario
    - link "Alumnado y tutoría":
      - /url: /alumnado
    - link "Seguimiento diario":
      - /url: /seguimiento
    - link "Progreso académico":
      - /url: /progreso
  - paragraph: © 2026 Rafael Sanz Prades
  - link "Legal":
    - /url: /legal
- navigation:
  - link "Entorno Datos DEMO":
    - /url: /entorno
  - text: Solo Lectura 0237 - Infra. comunes de teleco en viviendas y edificios 1º Instalaciones de Telecomunicaciones (26)
  - searchbox "Buscar en la aplicación"
  - button "Deshacer"
  - button "Rehacer" [disabled]
  - button "Cambiar tema"
- main:
  - heading "Bienvenido al Cuaderno FP" [level=1]
  - paragraph: Accede rápidamente a todas las herramientas para la gestión de tus módulos, alumnado y evaluación.
  - heading [level=2]
  - link "Catálogo Catálogo oficial de Ciclos Formativos. Grados Básico, Medio y Superior.":
    - /url: /catalogo
    - heading "Catálogo" [level=3]
    - paragraph: Catálogo oficial de Ciclos Formativos. Grados Básico, Medio y Superior.
  - link "Documentos Explorador de archivos oficiales, legislación y otros documentos.":
    - /url: /documentos
    - heading "Documentos" [level=3]
    - paragraph: Explorador de archivos oficiales, legislación y otros documentos.
  - link "Descargas Generación de reportes y boletines en PDF.":
    - /url: /descargas
    - heading "Descargas" [level=3]
    - paragraph: Generación de reportes y boletines en PDF.
  - 'link "Ayuda Panel de salud: verifica la coherencia y completitud de todos los datos del cuaderno."':
    - /url: /ayuda
    - heading "Ayuda" [level=3]
    - paragraph: "Panel de salud: verifica la coherencia y completitud de todos los datos del cuaderno."
  - heading "Programación" [level=2]
  - paragraph: Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.
  - link "Módulo didáctico Configuración básica del módulo didáctico, contexto, metodología y recursos.":
    - /url: /modulo
    - heading "Módulo didáctico" [level=3]
    - paragraph: Configuración básica del módulo didáctico, contexto, metodología y recursos.
  - link "Matrices OG→RA→CE→UD Relación y ponderación entre los RA, CE y las diferentes UD del módulo.":
    - /url: /matrices
    - heading "Matrices OG→RA→CE→UD" [level=3]
    - paragraph: Relación y ponderación entre los RA, CE y las diferentes UD del módulo.
  - link "Instrumentos de evaluación Definición y ponderación de las herramientas y métodos de evaluación.":
    - /url: /instrumentos
    - heading "Instrumentos de evaluación" [level=3]
    - paragraph: Definición y ponderación de las herramientas y métodos de evaluación.
  - link "Programación de aula Secuenciación temporal de las unidades didácticas y diseño de tareas competenciales.":
    - /url: /programacion
    - heading "Programación de aula" [level=3]
    - paragraph: Secuenciación temporal de las unidades didácticas y diseño de tareas competenciales.
  - heading "Curso" [level=2]
  - paragraph: Herramientas de seguimiento para el aula viva. Establece el calendario, administra el listado de alumnado, anota el progreso diario y evalúa.
  - link "Calendario académico Fechas generales, trimestres, horario semanal, festivos y eventos relevantes del curso.":
    - /url: /calendario
    - heading "Calendario académico" [level=3]
    - paragraph: Fechas generales, trimestres, horario semanal, festivos y eventos relevantes del curso.
  - link "Alumnado y tutoría Gestión oficial de estudiantes, ficha individual de orientación, asignación FEOE y matriz de tutoría.":
    - /url: /alumnado
    - heading "Alumnado y tutoría" [level=3]
    - paragraph: Gestión oficial de estudiantes, ficha individual de orientación, asignación FEOE y matriz de tutoría.
  - link "Seguimiento diario Registro detallado del desarrollo diario de las clases y contingencias.":
    - /url: /seguimiento
    - heading "Seguimiento diario" [level=3]
    - paragraph: Registro detallado del desarrollo diario de las clases y contingencias.
  - link "Progreso académico Panel integrado de calificaciones numéricas, evaluación por resultados de aprendizaje (RA) y analíticas.":
    - /url: /progreso
    - heading "Progreso académico" [level=3]
    - paragraph: Panel integrado de calificaciones numéricas, evaluación por resultados de aprendizaje (RA) y analíticas.
- button
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Navegación principal', () => {
  4  |   test('carga la página de inicio', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await expect(page).toHaveTitle(/Gestión Docente|FP|Cuaderno/);
  7  |   });
  8  | 
  9  |   test('navega al catálogo', async ({ page }) => {
  10 |     await page.goto('/');
  11 |     await page.click('a[href="/catalogo"]');
  12 |     await expect(page).toHaveURL(/\/catalogo/);
  13 |   });
  14 | 
  15 |   test('navega al módulo didáctico', async ({ page }) => {
  16 |     await page.goto('/');
  17 |     await page.click('a[href="/modulo"]');
  18 |     await expect(page).toHaveURL(/\/modulo/);
  19 |   });
  20 | 
  21 |   test('navega al calendario', async ({ page }) => {
  22 |     await page.goto('/');
  23 |     await page.click('a[href="/calendario"]');
  24 |     await expect(page).toHaveURL(/\/calendario/);
  25 |   });
  26 | 
  27 |   test('navega al alumnado', async ({ page }) => {
  28 |     await page.goto('/');
  29 |     await page.click('a[href="/alumnado"]');
> 30 |     await expect(page).toHaveURL(/\/alumnado/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  31 |   });
  32 | });
  33 | 
```