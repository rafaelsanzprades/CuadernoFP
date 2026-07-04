# 📋 Changelog — Cuaderno FP

## [1.1.1] - 2026-06-18

### 🔧 Mejoras

#### Módulo (`/modulo`)
- **Selector de módulo automático**: Al cargar un módulo desde la BD, el selector se auto-configura con familia, título y módulo correctos
- **info_modulo desde catálogo**: Cuando `ModuleInfo` está vacío, se construye automáticamente desde las tablas `Module`, `Degree` y `ProfessionalFamily`
- **Merge de datos**: El frontend ahora hace merge de datos API con datos existentes (no sobreescribe datos DEMO)
- **Fix matching bidireccional**: El selector de módulo ahora compara nombres de título en ambas direcciones (`includes()` bidireccional) para resolver diferencias entre formato API (`ELE203 - Instalaciones...`) y DEMO (`Técnico en Instalaciones...`)

#### Entorno (`/entorno`)
- **Aviso RGPD full-width**: Eliminado `max-w-2xl mx-auto`, ahora ocupa todo el ancho disponible
- **Aviso RGPD siempre visible**: Se muestra en todas las tabs (antes solo en "datos")
- **Breadcrumb mejorado**: Muestra tab activa ("Gestor de archivos" / "Sincronización con Google Drive") en vez de "Datos DEMO/Reales"
- **Espaciado mejorado**: Mayor separación entre elementos (`mb-2`, `mt-2`, `space-y-8`, `leading-relaxed`)

#### Header
- **Breadcrumb `/entorno`**: Añadida ruta al breadcrumb del Header

### 📊 Build
- ✅ Build Next.js: 24 rutas, sin errores TypeScript
- ✅ Tests backend: 9/9 pasando

---

## [1.1.0] - 2026-06-18

### ✨ Nuevas Funcionalidades

#### Objetivos Generales (OG) del BOE
- **Scraping masivo de todofp.es**: 195 ciclos extraídos (67 GM + 94 GS + 34 GB)
- **Extracción del BOE**: OG del Artículo 9 para 117 de 141 grados (83%)
- **Scripts de automatización**:
  - `scrape_all_og.py`: Script maestro de scraping (todofp.es + BOE)
  - `insert_og_db.py`: Inserción masiva en la base de datos
  - `seed_ele304_boa.py` / `seed_ele304_og.py`: Datos para ELE304
- **Cobertura**: 117 grados con OG, 23 sin BOE (FPB), 1 no encontrado

#### Visualización de OG
- **Catálogo**: OG mostrados en detalle de cada ciclo formativo
- **Matrices curriculares**: OG integrados en la vista de matrices
- **Progreso académico**: OG incluidos en el seguimiento de alumnos
- **Boletines**: OG añadidos a los informes de evaluación
- **Análisis individual**: OG en el análisis de cada alumno

### 🔧 Mejoras Técnicas
- **Base de datos actualizada**: `boa_articles` con `article_9_og` para 117 grados
- **Backend**: Endpoint `/api/catalogs/degrees` devuelve OG
- **Frontend**: Componentes actualizados para mostrar OG
- **Build Next.js**: ✅ 24 rutas, sin errores TypeScript

### 📊 Estadísticas
- **195 ciclos** extraídos de todofp.es
- **180 ciclos** matcheados con la BD
- **153 OG** insertados en la BD
- **117/141 grados** (83%) con OG

---

## [1.0.1] - 2026-06-15

### ✨ Nuevas Funcionalidades

#### Modo DEMO vs Datos Reales
- **Datos DEMO**: Inmutables, sin opción de "Guardar" ni "Sincronizar"
- **Datos Reales**: Opción "Abrir" (.fpp/.fpc), "Guardar" local y "Sincronizar" con Google Drive
- **Tab "Nube" oculto en modo DEMO**: Solo visible en modo datos reales

## [1.0.0] - 2026-06-14

### ✨ Nuevas Funcionalidades

#### Tests E2E con Playwright
- **18 tests** en 4 archivos de test
- **3 navegadores:** Chromium, Firefox, WebKit
- **54 tests totales** (18 × 3 navegadores)
- Scripts de ejecución: `test:e2e`, `test:e2e:ui`, `test:e2e:report`
- Documentación completa en `frontend/TESTS.md`

#### Accesibilidad
- ARIA labels en componentes Header (sidebar toggle, search, undo/redo)
- Navegación por teclado con tabIndex en controles principales
- Tests de accesibilidad en E2E (títulos, imágenes, ARIA, teclado)

#### Gestión de Base de Datos
- Migración Alembic para normalizar `is_dual` de VARCHAR a Boolean
- Pool de conexiones SQLAlchemy configurado (StaticPool para SQLite, QueuePool para PostgreSQL)
- Utilidades de transacciones (`with_transaction`, `safe_query`)

### 🐛 Correcciones
- Normalización de campo `is_dual` en modelo `LearningOutcomeItem`
- Corrección de tipos en esquemas Pydantic

### 📚 Documentación
- Documentación de scripts de seed (12 scripts documentados)
- Documentación de endpoints API
- Tests unitarios backend (9 tests, todos pasando)
- Guía de tests E2E en `frontend/TESTS.md`

### 🔧 Mejoras Técnicas
- Build Next.js sin errores TypeScript
- 24 rutas frontend funcionales
- 9 tests backend pasando
- Configuración Playwright optimizada

---

## [0.9.0] - 2026-06-13

### ✨ Nuevas Funcionalidades
- Navegación estructurada en General, Programación y Curso
- Generador de PDFs avanzado (seguimiento, planificación, boletines)
- Seeder inteligente con datos demo coherentes
- Persistencia local en IndexedDB con sincronización en la nube

### 📚 Documentación
- README.md actualizado con arquitectura y stack tecnológico
- Guía de instalación y desarrollo local

---

## [0.8.0] - 2026-06-12

### ✨ Nuevas Funcionalidades
- API REST con FastAPI
- Base de datos SQLite con SQLAlchemy
- Frontend Next.js con Tailwind CSS
- PWA con funcionalidad offline-first

---

**Formato:** [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)
**Versionado:** [Semantic Versioning](https://semver.org/lang/es/)
