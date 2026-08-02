# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Cuaderno FP: a local-first PWA for Spanish vocational-education (FP) teachers to manage their
"programación didáctica" (curriculum plan), daily class tracking, student roster, and grading.
Monorepo with two independent apps:

- `frontend/` — Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Zustand.
- `backend/` — FastAPI + SQLAlchemy + SQLite (or Postgres via `DATABASE_URL`), used for PDF
  generation, catalog data, AI assistant endpoints, and optional cloud sync/backup.

The frontend is designed to work fully offline without the backend: course data lives in the
browser (IndexedDB) and/or in files the user opens directly from disk. The backend is a secondary
service, not the source of truth for a session's working data.

## Commands

### Dev environment (Windows, PM2-based)
```bash
iniciar.bat     # starts backend (uvicorn --reload :8000) and frontend (next dev --turbo :3000) via PM2
detener.bat     # stops both
npx pm2 logs    # tail logs from both processes
```
Manual alternative (see `README.md`): `uvicorn main:app --reload --port 8000` in `backend/` (inside
its venv) and `npm run dev` in `frontend/`.

### Frontend (`frontend/`)
```bash
npm run dev             # next dev --turbo, http://localhost:3000
npm run build            # production build
npm run lint              # next lint
npx playwright test                          # full e2e suite (chromium+firefox+webkit, e2e/*.spec.ts)
npx playwright test e2e/navigation.spec.ts    # single file
npx playwright test -g "test name"            # single test by title
npm run test:e2e:ui                          # Playwright UI mode
```
`playwright.config.ts` auto-starts `npm run dev` as the test web server if one isn't already running
on :3000. There is no unit-test script — Playwright e2e is the only automated frontend test suite.

### Backend (`backend/`)
```bash
pytest                                  # full suite (tests/test_api.py, test_db.py, test_main.py)
pytest tests/test_api.py                # single file
pytest tests/test_api.py::test_name -v  # single test
alembic revision --autogenerate -m "..."  # new migration
alembic upgrade head                      # apply migrations
```
`tests/conftest.py` provides `app`/`client` fixtures (`TestClient(app)`), session-scoped. DB is
SQLite at `backend/cdd_pro.db` by default; `init_db.check_and_seed_db()` runs on app startup and
seeds demo data into an empty DB.

## Architecture

### The three file formats: `.fpg` / `.fpp` / `.fpc`
This is the core domain model — understand it before touching any page under `frontend/src/app`.
Each is a JSON document (optionally AES-encrypted with a user-set key via `crypto-js`) representing
one of three entities, and each maps to a distinct slice of app state:

- **`.fpg`** — Grupo (a class group, e.g. "1A-GM 0237-ICTVE").
- **`.fpp`** — Programación (the didactic plan for one módulo: RA/CE, UDs, evaluation instruments,
  methodology). State: `moduleData` (`moduleSlice`).
- **`.fpc`** — Curso (one group × module for one school year: roster, grades, daily tracking,
  seating plan). State: `cursoData` (`groupsSlice`).

All read/write/export logic for these lives in `frontend/src/services/fileManager.ts`. Export is
**whitelist-based**: `ALLOWED_PROGRAMACION_KEYS` / `ALLOWED_CURSO_KEYS` enumerate every field that
survives a save-to-disk. **A new `moduleData`/`cursoData` field is silently dropped on export/save
until it's added to the relevant whitelist array** — this is the most common way a new feature looks
like it works (state updates, UI reflects it) but the data vanishes after a reload from file.

`.fpc` files are inconsistent in shape in the wild (bare object vs. `[object]`); load sites
defensively unwrap with `Array.isArray(...) ? arr[0] : arr` — replicate that guard in any new loader.

### State: Zustand + IndexedDB, local-first
`frontend/src/store/useAppStore.ts` composes slices (`authSlice`, `uiSlice`, `moduleSlice`,
`groupsSlice`, `globalSlice`). Two middlewares wrap the store:
- `persist` — persists to IndexedDB via `idb-keyval` (not localStorage), key `cdd-store-cache-v3`.
  Bump the `version` there when changing state shape in a breaking way (there is no real migration,
  `migrate` just casts).
- `zundo` (`temporal`) — undo/redo, scoped only to `moduleData` / `cursoData` / `globalData`, 1s
  debounce, 20-step history. Use `useTemporalStore` to read undo/redo state.

`dataSource` (`'demo' | 'local'`) drives a lot of conditional UI (colors, banners): `'demo'` = no
real file open, sample data shown; `'local'` = a real `.fpg/.fpp/.fpc` is loaded from disk via the
File System Access API (`workspaceHandle`, excluded from persistence via `partialize`).

### Page pattern
Every `app/<section>/page.tsx` follows the same shape: `Sidebar` + `Header` + tab bar
(`Tabs`/`TabsList`/`TabsTrigger`) + `<TabInfoBox>` + conditionally-rendered tab component from
`components/features/<section>/`. Tab state is synced to the URL via `<TabSync activeTab
setActiveTab />` (`components/ui/TabSync.tsx`), which reads `?tab=` once on mount and rewrites the
URL (via `history.replaceState`, no navigation) on every tab change — this is why deep links like
`/contexto?tab=planes` work. Keep new pages/tabs on this pattern rather than inventing a new one.

### Backend structure
`main.py` wires `routers/{modules,catalogs,pdf,documents,attendance,ai_assistant}.py`; business logic
lives in `services/` (`module_service.py` is the read/write layer for module & curso documents,
`backup_service.py` runs a periodic backup task from `lifespan`). PDF generation is a family of
top-level `pdf_*.py` / `generador_pd_*.py` scripts using ReportLab and docx templates
(`templates/`, `documentos/`). Rate limiting via `slowapi` (100/min default, per-route overrides).

`Repite`/`Edad` (student), `is_dual` (RA), and `peso_ra`/`peso_ce` (RA/CE weights) are real
`bool`/`int`/`bool`/`int` end-to-end — SQLAlchemy column, Pydantic schema, TS type, and demo
`.fpc`/`.fpp` fixtures all agree, and there is deliberately **no** loose/dual-type coercion layer
anywhere (the app has no external users yet, so there's no legacy data to stay compatible with —
don't reintroduce a "handle both formats" helper for these; fix the schema/data at the source instead,
the way `backend/alembic/versions/a1f3c7b9e2d4_*.py` and `b7e2d5f1a9c3_*.py` did).

### PD (programación didáctica) generation — 3 tiers
Three docx-template generators, internally called **pd-** (`generador_pd_minima_tpl.py`, template
`modelo_pd_fp-.docx`), **pd=** (`generador_pd_suficiente_tpl.py`, `modelo_pd_fp=.docx`, the official
BOA Aragón format), and **pd+** (`generador_pd_jeg.py`, `modelo_pd_jeg_tpl_final.docx`, CIFPA/JEG
model) — wired from `routers/pdf.py` (`type in ["programacion_minima_tpl", "programacion_suficiente_tpl",
"programacion_jeg", ...]`, note the imports are function-local, not module-level, so a module-level
grep for the generator name won't find the call site). All three use `docxtpl` (Jinja2-in-docx).
`routers/pdf.py` builds one shared `data_pd` dict passed to whichever generator is picked — if you add
a new `moduleData`/`cursoData` field that a generator needs, it must be added to that dict, not just to
the generator's own `_build_context()`, or it'll always read as empty.

**`modelo_pd_jeg_tpl_final.docx` is built in two passes**, both in `backend/scripts/`:
`preparar_plantilla_jeg_final.py` (reuses the ~80-entry text-replacement mapping from
`preparar_plantilla_pd_detallada.py`, written against a *different* source document so a lot of it
silently no-ops on this one) followed by `preparar_plantilla_jeg_pass2.py` (a JEG-specific mapping
that fixes what pass 1 misses — the "Identificación" header table uses plain unbracketed placeholder
text, not `[[ ... ]]`, so it needed exact-text matches instead; a couple of fields also needed
positional/occurrence-indexed replacement because the exact same text appears twice in the document —
once as the cell label, once as the value placeholder — and a blind global replace would wipe the
label too). If you regenerate the template, run **both** scripts in order. Two known fields
(`Titulación`, the qualification's short code like "IFC201") still have no template mapping at all —
there's no app field to source them from yet. To audit any docxtpl template: unzip it (`.docx` is a
zip), read `word/document.xml`, **strip XML tags before regexing for `{{ }}`** — Word splits text
across multiple `<w:t>` runs on formatting/autocorrect boundaries, so searching the raw tag-laden XML
gives false negatives. Better still, render it with real data and grep the *output* for leftover
single-line `[[ ... ]]`/`{{ ... }}` — multi-line `[[ ... ]]` blocks are intentionally left for the
teacher to hand-edit (documented in the template's own "Instrucciones de uso" section), only
single-line ones with a real corresponding data field are bugs. Full trace in
`docs/sesion-2026-08-02.md` §14–15.

`generador_pd_suficiente_tpl.py` (pd=) already ships as a complete, correctly-tagged docxtpl template
(no prep script needed) — confirmed by rendering it with real data and finding zero unrendered tags.
Its 4 free-text fields (`texto_introduccion`, `texto_uds_modulo`, `texto_feoe`,
`texto_criterios_calificacion`, all under `moduleData.config_contexto`) now have UI inputs in
`ContextoTab.tsx`; leaving them blank still falls back to the auto-generated defaults.

To inspect what a `.docx` template actually expects: unzip it (`.docx` is a zip), read
`word/document.xml`, **strip XML tags before regexing for `{{ }}`** — Word splits text across multiple
`<w:t>` runs on formatting/autocorrect boundaries, so searching the raw tag-laden XML gives false
negatives (this bit twice in the same investigation session before the tag-strip step was added).

## Conventions

- **Spanish UI text is Sentence case, never Title Case**: "Configuración de instrumentos" not
  "Configuración De Instrumentos" (repo-wide rule, `.agents/AGENTS.md`).
- **Typography is 4 tiers only**, aliased in `frontend/src/app/globals.css`: `.text-heading` (2xl),
  `.text-subheading` (lg), `.text-body` (sm), `.text-caption` (xs). Use these classes, not raw
  `text-xs/sm/lg/2xl` Tailwind utilities — they're pure `@apply` aliases kept as the single place to
  adjust the scale later.
- `frontend/AGENTS.md` flags that the installed Next.js version has breaking changes vs. training
  data — check `node_modules/next/dist/docs/` before relying on remembered Next.js APIs/conventions.
