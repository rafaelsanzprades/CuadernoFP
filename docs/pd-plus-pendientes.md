# Pendientes de alineación PD+ (JEG) — 2026-08-07

Rafael está ajustando los tres formatos de PD (PD- → PD= → PD+) en el mismo sentido: primero
PD-, después PD= (esta sesión), y cuando eso quede cerrado, revisar qué de lo aprendido/creado
se puede reutilizar en PD+ (`generador_pd_jeg.py`, plantilla `modelo_pd_jeg_tpl_final.docx`).

**Recordatorio importante**: el FORMATO de PD+ está validado por el Jefe de Servicio de FP y NO
se debe tocar estructuralmente sin confirmación explícita — esto son solo apuntes de qué
correspondencias existen, no un plan aprobado para ejecutar.

## 1. Mismos bugs de nombre de campo que tenía PD= antes de esta sesión

`generador_pd_jeg.py` (sección "RA y CE (tablas)" / "UD (unidades didacticas)") tiene exactamente
los mismos bugs que arreglamos en `generador_pd_suficiente_tpl.py`:

- `ud.get(f'pct_ra{j}', '')` — el campo real es `RA{j}` (ej. `ud.get('RA1', 0)`), no `pct_ra{j}`.
- `ud.get('ev_ud', '')` — no existe ese campo en ningún sitio; el dato real ahora sale de
  `df_sgmt[].ev`, calculado en `frontend/src/utils/planningGenerator.ts` y ya expuesto en
  Planificación mensual (`/agenda?tab=planificacion`). PD= ya lo consume vía `ev_map` en
  `generador_pd_suficiente_tpl.py::_build_context`.
- `for i in range(1, 11)` en el bucle de UD — con 11 UD reales (como en el módulo demo 0237-ICTVE)
  se queda corta la UD11, igual que le pasaba a PD=.

## 2. Campos config_contexto huérfanos (G1/G2/G3) con los que JEG hace fallback

`generador_pd_jeg.py` usa `config.get("G1_infraestructuras", "")`, `config.get("G2_herramientas_tic", "")`
y `config.get("G3_bibliografia", "")` como último fallback de `ubicacion_recursos`, `tipo_equipos`
y `bibliografia` — pero ninguna pestaña de la app escribe nunca esas claves G1/G2/G3 (solo existen
hardcodeadas en fixtures de demo antiguos). Es decir, esos campos de JEG llevan tiempo sin fuente
de datos real.

Esta sesión se crearon dos piezas que podrían sustituir a G1/G2/G3 en JEG:

- **`recursos_espacios`** (`ModuleData`, array de strings): catálogo codificado en
  `frontend/src/data/herramientasRecursos.ts` (~38 recursos/herramientas por categoría,
  editable en `/contexto` → Evaluación y recursos) + entradas de texto libre añadidas por el
  profesorado. Se resuelve a etiqueta legible con el diccionario espejo `RECURSOS_LABELS` en
  `backend/generador_pd_suficiente_tpl.py` (si se reutiliza en JEG, hay que mover ese diccionario
  a un sitio compartido en vez de duplicarlo una tercera vez).
- **`textos_pd_metodologia_labor_coordinada`** (ya existía en el esquema/whitelist, sin UI ni
  generador que lo leyera hasta ahora): campo de texto libre para "coordinación con otros
  módulos y su profesorado", con input nuevo en `PlanesTab.tsx` → sección "Coordinación docente".
  PD= ya lo usa en la sección N (Plan de contingencia).
- `textos_pd_bibliografia` (uno de los 16 campos "textos narrativos PD" del
  `ALLOWED_PROGRAMACION_KEYS`) tampoco tiene UI de edición todavía — sería el candidato natural
  para sustituir el fallback `G3_bibliografia` en JEG, pero antes hace falta darle un input en
  algún tab (no se ha hecho esta sesión, PD= no tenía ninguna anotación "RF" sobre bibliografía
  específica del texto libre, solo sobre "Herramientas").

## 3. Catálogo oficial de CE (Criterios de Evaluación) ahora resoluble server-side

Se añadió `helpers_catalogo.fetch_curriculo_from_db(codigo_modulo, db)`, que consulta las tablas
`Module` / `LearningOutcome` / `EvaluationCriterion` del catálogo oficial BOA/BOE y se usa en
`routers/pdf.py` como último recurso para rellenar `curriculo_data` cuando `df_ra`/`df_ud`/`df_ce`
no traen descripción — beneficia a los tres generadores por igual, ya que `curriculo_data` es una
de las claves del `data_pd` compartido.

Sin embargo, `generador_pd_jeg.py` no importa `build_ce_desc_map`/`resolve_ce_desc` de
`helpers_catalogo.py` (solo usa los de RA/UD) — su plantilla no tiene ninguna sección de CE por RA
como la C2 de PD=, así que de momento no hay nada que cablear ahí salvo que se decida añadir esa
sección al PD+ (lo cual sería tocar el formato validado, no hacer sin confirmación).

## 4. Listas de RA/UD con slots numerados fijos (mismo patrón que tenía PD=)

`generador_pd_jeg.py` usa `context[f"ra{i}_titulo"]`/`context[f"ud{i}_titulo"]` con
`range(1, 8)`/`range(1, 11)`, igual que tenía PD= antes de esta sesión. Si la plantilla JEG
también tiene placeholders de tabla con columnas de RA fijas (no confirmado, no se ha inspeccionado
la plantilla JEG en esta sesión), el mismo patrón de tabla dinámica construida con python-docx que
se usó en PD= (`generador_pd_suficiente_tpl.py::_insertar_tabla_secuenciacion`,
`backend/helpers_pd_tablas.py`) podría aplicarse — pero de nuevo, cualquier cambio de estructura de
tabla en la plantilla JEG requiere confirmación explícita primero.
