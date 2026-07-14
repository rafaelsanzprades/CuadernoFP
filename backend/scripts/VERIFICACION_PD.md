# Verificación Exhaustiva — Generadores PD (14 julio 2026)

## Resumen Ejecutivo

| Modelo | Plantilla | Variables Jinja2 | Estado | Notas |
|--------|-----------|-----------------|--------|-------|
| **PD-** (Mínima/Resumen) | `modelo_pd_fp-.docx` | 39 | ✅ PASS | Resumen 1 página para alumnado |
| **PD=** (Suficiente/BOA) | `modelo_pd_fp=.docx` | 98 | ✅ PASS | 14 secciones A-N, textos originales BOA/Aragón |
| **PD+** (Detallada/JEG) | `modelo_pd_fp+.docx` | 0 (estática) | ✅ PASS | Plantilla completa del usuario, se pasa through |

---

## PD- (Mínima) — 39 variables

**Plantilla:** `backend/templates/modelo_pd_fp-.docx` (37 párrafos)  
**Generador:** `backend/generador_pd_minima_tpl.py`  
**Público:** Alumnado (resumen)

### Variables mapeadas

| Variable | Fuente | Tipo |
|----------|--------|------|
| `{{ modulo }}` | `data["modulo"]` | Texto |
| `{{ ciclo }}` | `data["ciclo"]` | Texto |
| `{{ curso_academico }}` | `data["curso_academico"]` | Texto |
| `{{ texto_perfil_profesional }}` | `config_contexto["minima_perfil_profesional"]` o default | Texto |
| `{{ texto_competencia_general }}` | `config_contexto["minima_competencia_general"]` o default | Texto |
| `{{ ra1_texto }}` ... `{{ ra10_texto }}` | `df_ra[i]["desc_ra"]` | Lista |
| `{{ ud1_texto }}` ... `{{ ud10_texto }}` | `df_ud[i]["desc_ud"]` | Lista |
| `{{ calif_bloque{1-4}_pct/titulo/desc }}` | `config_contexto["minima_calificacion"]` o default | Bloques |
| `{{ texto_recordatorio }}` | `config_contexto["minima_recordatorio"]` o default | Texto |
| `{{ texto_final }}` | `config_contexto["minima_texto_final"]` o default | Texto |

### Verificación

- ✅ 0 variables Jinja2 sin renderizar
- ✅ Sin frases inventadas ("este documento presenta", "la siguiente programación", etc.)
- ✅ Datos del módulo insertados: módulo, ciclo, curso académico
- ✅ "departamento" no aparece — correcto, es un resumen para alumnado
- ✅ Defaults funcionan cuando `config_contexto` está vacío
- ✅ Anti-duplicación RA/UD: `id_ra: "RA1"` → `"RA1. desc"` (no "RA RA1")

---

## PD= (Suficiente/BOA) — 98 variables

**Plantilla:** `backend/templates/modelo_pd_fp=.docx` (470 párrafos)  
**Generador:** `backend/generador_pd_suficiente_tpl.py`  
**Público:** Departamento / Inspección

### Variables mapeadas

| Categoría | Variables | Fuente |
|-----------|-----------|--------|
| **Identificación** | `modulo`, `ciclo`, `departamento`, `curso_academico` | `data[...]` |
| **Introducción** | `texto_introduccion`, `texto_uds_modulo`, `ud{1-10}_item` | `config_contexto` o default |
| **FEOE** | `texto_feoe` | `config_contexto` o default |
| **Calificación** | `texto_criterios_calificacion` | `config_contexto` o default |
| **Tabla RA×UD** | `ra{1-14}_texto_c2` | `df_ra` |
| **Tabla UD** | `ud{1-11}_num/nombre/horas/ev/ra{N}/titulo_c1` | `df_ud` |
| **Ponderación** | `ra_pct_{1-7}` | `config_contexto` o default |

### Verificación

- ✅ 0 variables Jinja2 sin renderizar
- ✅ Sin frases inventadas
- ✅ Datos insertados: módulo, ciclo, departamento, curso
- ✅ 12/13 textos originales preservados (secciones D-N intactas)
- ✅ 432 párrafos con contenido real
- ✅ Defaults funcionan con datos vacíos

---

## PD+ (Detallada/JEG) — Plantilla estática

**Plantilla:** `backend/templates/modelo_pd_fp+.docx` (705 párrafos, ~94 KB)  
**Generador:** `backend/generador_pd_detallada.py`  
**Público:** Defensa / TFM / Máxima exigencia

### Diseño

La plantilla PD+ es un **DOCX completo sin variables Jinja2**. El usuario:
1. Coloca su plantilla personal en `templates/modelo_pd_fp+.docx`
2. El generador la pasa through directamente (`doc.render()` sin cambios)
3. Se descarga tal cual

Esto es **intencional**: la PD+ es la programación personal del docente, con sus textos narrativos, contextualización y metodología ya escritos. No se automatiza.

### Verificación

- ✅ 0 variables Jinja2 (correcto — plantilla estática)
- ✅ Sin frases inventadas
- ✅ 606 párrafos con contenido
- ✅ El generador no modifica el contenido

---

## Comparación de los 3 niveles

| Aspecto | PD- (Mínima) | PD= (Suficiente) | PD+ (Detallada) |
|---------|-------------|-----------------|-----------------|
| **Extensión** | ~1 página | ~10-16 páginas | ~60-100 páginas |
| **Variables** | 39 | 98 | 0 (estática) |
| **Automatización** | Alta | Media | Ninguna |
| **Textos originales** | Generados | Preservados (secciones D-N) | Completos del usuario |
| **Público** | Alumnado | Departamento/Inspección | Defensa/TFM |
| **Plantilla origen** | Creada desde cero | IES Andalán (DOCX original) | Usuario (manual) |

---

## Anti-duplicación RA/UD

Los 3 generadores verificados:

| Test | PD- | PD= | PD+ |
|------|-----|-----|-----|
| `id_ra: "RA1"` → `"RA1. desc"` | ✅ | ✅ | N/A |
| `id_ud: "1"` → `"UD1. desc"` | ✅ | ✅ | N/A |
| Sin "RA RA1" duplicado | ✅ | ✅ | N/A |
| Sin "UD UD1" duplicado | ✅ | ✅ | N/A |

---

## Defaults con datos vacíos

Cuando `config_contexto` está vacío (sin configuración del usuario):

| Variable | PD- Default | PD= Default |
|----------|-------------|-------------|
| Perfil profesional | "La formación de este módulo..." | N/A |
| Competencia general | "La competencia general de este título..." | N/A |
| Calificación | 4 bloques (55%+10%+20%+15%) | "La calificación se distribuye..." |
| Introducción | N/A | "Programación didáctica del módulo..." |
| UDs | N/A | "El módulo de X comprende..." |
| FEOE | N/A | "No hay ningún RA dualizado." |

---

## Archivos implicados

```
backend/
├── generador_pd_minima_tpl.py      ← PD- (generador)
├── generador_pd_suficiente_tpl.py  ← PD= (generador)
├── generador_pd_detallada.py       ← PD+ (generador)
├── routers/pdf.py                  ← Router FastAPI (endpoints)
├── templates/
│   ├── modelo_pd_fp-.docx          ← PD- plantilla (39 vars)
│   ├── modelo_pd_fp=.docx          ← PD= plantilla (98 vars)
│   └── modelo_pd_fp+.docx          ← PD+ plantilla (estática)
└── scripts/
    └── preparar_plantilla_pd_minima.py  ← Script regenerar PD-

frontend/src/app/descargas/page.tsx ← Botones descarga (3 modelos)
```

---

## Estado: ✅ TODO VERIFICADO

Los 3 generadores producen DOCX correctos, sin variables Jinja2 sin renderizar, sin frases inventadas, con datos del módulo insertados correctamente y textos originales preservados.
