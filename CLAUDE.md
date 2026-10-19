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
  Bump the `version` there when changing state shape in a breaking way (there is no real migration;
  `migrate` just casts, apart from dropping `encryptionKey` in v4).
- **Encryption is optional and the key is memory-only.** `encryptionKey` is excluded from `partialize`
  and must never be persisted. What persists is `cifradoActivo` (this workspace saves encrypted) and
  `verificadorClave` (a fixed text encrypted with the key, to check a retyped key). All file reads/writes
  go through `services/cifradoEspacio.ts` (`serializarParaGuardar` / `leerFichero`): if encryption is on
  and the key is missing it asks via `PedirClaveModal` and **never writes plaintext by accident**;
  the same text is what goes to Google Drive. Format `CFP2.` + base64 (PBKDF2-SHA256 600k + AES-256-GCM,
  `services/cifrado.ts`); no support for the old CryptoJS format. The web version's IndexedDB working
  copy of `moduleData`/`cursoData` is deliberately NOT encrypted (documented for teachers in the Manual
  1.4.4 / 14.2.4 on rafaelsanzprades.es — keep both in sync when this changes). OneDrive can sign in but
  nothing uploads to it yet; only Google Drive syncs.
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

### Document generation runs on the teacher's machine — never send student data to the server
`.fpc`/`.fpp` data (names, grades, attendance, ACNEAE notes) must never reach a server we run. Every
PDF/.docx therefore goes through `frontend/src/services/generarDocumento.ts` (`fetchDocumento`), a
drop-in for the old `fetch(.../api/pdf?...)`. In the browser it runs the real backend generators with
**Pyodide** (Python in WebAssembly) inside a Worker (`frontend/public/generadores-worker.js`); under
Tauri it keeps calling the local sidecar on 127.0.0.1. The generation logic lives in
`backend/pdf_dispatch.py` (`generar_documento`, no FastAPI/SQLAlchemy imports — keep it that way, it is
what Pyodide imports); `routers/pdf.py` is a thin HTTP wrapper and `pdf_local.py` is the browser entry
point. `POST /api/pdf` answers 410 unless `CUADERNOFP_PDF_LOCAL=1`, which only `run_sidecar.py` (the
desktop app's internal server) and `tests/conftest.py` set: on a public server it must stay closed. Programaciones need the official RA/CE text and title data: the browser asks
`GET /api/catalog/pd-context/{module_code}` (module code only) and passes the result in.
`frontend/scripts/preparar-generadores.mjs` (hooks `predev`/`prebuild`, and an explicit step in
`firebase-deploy.yml` because that workflow runs `next build` directly) downloads Pyodide + wheels and
copies the backend generator files into `public/pyodide` and `public/generadores` (gitignored, ~30 MB,
excluded from the PWA precache and cached on first use). **Adding a generator module to `backend/`
means checking the `FICHERO_BACKEND` regex in that script**, and `backend/tests/test_pdf_dispatch.py`
covers every document type. Don't add a new `fetch` of `curso_data`/`module_data` to the API. The floating AI chat was removed on
purpose (free text can carry student names; teachers should use their own AI tool). `/api/ai/chat` remains
only for the "generate text" buttons (Contexto, Alumnado > rasgos del grupo), which send checked traits
and aggregate statistics, never names; PDF curriculum import uses the teacher's own API key. Keep it that way.

### Desktop (Tauri) security
`src-tauri/tauri.conf.json` has a real CSP (it was `null`); keep `connect-src` limited to the sidecar
(`http://127.0.0.1:*`), Google/Microsoft auth and Cloud Run (catalogs, reachable before the sidecar port is
resolved). Filesystem access has **no** `**` scope: the user's open/save/folder dialogs grant paths and
`tauri-plugin-persisted-scope` remembers them between sessions (recent files). If a file opened earlier
stops opening, re-pick it. `shell:allow-execute` is scoped to the backend sidecar only.
`scripts/build-tauri.mjs` strips `pyodide`/`generadores` from `out/` (browser-only, ~30 MB).

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
single-line ones with a real corresponding data field are bugs. Full trace of this specific
JEG-template investigation lives in the local, gitignored `RF Ideas/00 IDEAS.md` (2026-08-02 entry)
— not committed, so it won't be present on a fresh clone or after a machine reset.

`generador_pd_suficiente_tpl.py` (pd=) ships as a correctly-tagged docxtpl template (zero unrendered tags when
rendered with real data). Four passes of one-shot fixes live in `backend/scripts/arreglar_plantilla_pd_suficiente*.py`
(the 4th, after reviewing against Decreto 107/2025, removed the hard-coded «85%» / «se media a partir de un 4», made
the introduction a `list_intro` loop with marco normativo + Contexto > Entorno texts, and added the apartado H
`texto_calificacion_minima`); it is idempotent and overwrites `templates/modelo_pd_fp=.docx`.
Its 5 free-text fields (`texto_introduccion`, `marco_normativo`, `texto_uds_modulo`, `texto_feoe`,
`texto_criterios_calificacion`, all under `moduleData.config_contexto`) have UI inputs in `ContextoTab.tsx`;
leaving them blank falls back to the auto-generated defaults (marco normativo: Aragón's norms).
`config_redondeo.nota_minima_ra` (Contexto > Evaluación) is the per-RA minimum to compensate that Aragón requires
(3–5, art. 99.4.g / 100.2.h): the grade engine applies it (TS `notaFinalPonderada` and Python `calcular_notas_jeg`,
keep both in sync) and pd= prints it; if empty, pd= leaves a visible `[[ ]]` mark instead of omitting it.

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
