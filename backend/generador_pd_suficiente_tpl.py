"""
Generador PD Suficiente / BOA (Vía A) — usa plantilla DOCX con docxtpl.

Plantilla: backend/templates/modelo_pd_fp=.docx
Estructura: 14 secciones A-N (modelo BOA/Aragón)

Uso:
    from generador_pd_suficiente_tpl import generate
    generate(data, out_docx, out_pdf)
"""

import os
from docxtpl import DocxTemplate
from helpers_catalogo import build_ra_desc_map, build_ud_desc_map, resolve_ra_desc, resolve_ud_desc

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'templates', 'modelo_pd_fp=.docx')


def _build_context(data: dict) -> dict:
    """
    Construye el contexto Jinja2 para la PD= (Suficiente/BOA).
    
    data: {
        "modulo": "Maquinas Electricas",
        "ciclo": "Tecnico IEA",
        "departamento": "Electricidad",
        "curso_academico": "2025/2026",
        "horas_totales": 167,
        "horas_semanales": 5,
        "regimen": "diurno",
        "curso_ciclo": "primero",
        "df_ra": [...],
        "df_ud": [...],
        "config_contexto": {...}
    }
    """
    modulo = data.get("modulo", "el módulo profesional")
    ciclo = data.get("ciclo", "el ciclo formativo")
    departamento = data.get("departamento", "")
    curso = data.get("curso_academico", "")
    horas_totales = data.get("horas_totales", "")
    horas_semanales = data.get("horas_semanales", "")
    regimen = data.get("regimen", "diurno")
    curso_ciclo = data.get("curso_ciclo", "primero")
    df_ra = data.get("df_ra", [])
    df_ud = data.get("df_ud", [])
    config = data.get("config_contexto", {})

    # Construir mapas de descripciones desde catálogo
    ra_desc_map = build_ra_desc_map(data)
    ud_desc_map = build_ud_desc_map(data)

    context = {
        "modulo": modulo,
        "ciclo": ciclo,
        "departamento": departamento,
        "curso_academico": curso,
    }

    # ── SECCIÓN A: INTRODUCCIÓN ────────────────────────────────────────
    # Texto original: "Programación didáctica del módulo profesional [MODULO],
    # perteneciente al [CURSO] curso del ciclo formativo de grado [GRADO] [CICLO],
    # que se imparte en régimen [REGIMEN], con una duración de [HORAS] periodos
    # lectivos a lo largo del curso académico, a razón de [HORAS_SEM] períodos
    # lectivos semanales."
    texto_intro = config.get("texto_introduccion", "")
    if not texto_intro:
        texto_intro = (
            f"Programación didáctica del módulo profesional {modulo}, "
            f"perteneciente al {curso_ciclo} curso del ciclo formativo de grado "
            f"medio {ciclo}, que se imparte en régimen {regimen}, con una duración "
            f"de {horas_totales} periodos lectivos a lo largo del curso académico, "
            f"a razón de {horas_semanales} períodos lectivos semanales."
        )
    context["texto_introduccion"] = texto_intro

    # Texto "El módulo de [MODULO] comprende las siguientes unidades formativas:"
    texto_uds = config.get("texto_uds_modulo", "")
    if not texto_uds:
        texto_uds = f"El módulo de {modulo}, comprende las siguientes unidades formativas:"
    context["texto_uds_modulo"] = texto_uds

    # Lista de UDs (formato "UF0237_12 ...")
    # En el original son 2 UDs, pero puede haber más
    for i in range(1, 11):
        if i <= len(df_ud):
            ud = df_ud[i-1]
            id_str = str(ud.get('id_ud', ''))
            desc = resolve_ud_desc(ud, ud_desc_map)
            # Formatear como "UF0237_12 Descripción"
            context[f"ud{i}_item"] = f"UF{id_str} {desc}"
        else:
            context[f"ud{i}_item"] = ""

    # ── SECCIÓN B: FEOE ────────────────────────────────────────────────
    # Texto original: "No hay ningún RA dualizado."
    # O: "Los RA susceptibles de ser adquiridos en FEOE son: RA1, RA2..."
    texto_feoe = config.get("texto_feoe", "")
    if not texto_feoe:
        if df_ra:
            # Verificar si algún RA tiene horas FEOE
            ra_feoe = [ra for ra in df_ra if ra.get('horas_feoe', 0) > 0]
            if ra_feoe:
                ids = ", ".join([str(ra.get('id_ra', '')) for ra in ra_feoe])
                texto_feoe = f"Los RA susceptibles de ser adquiridos en FEOE son: {ids}."
            else:
                texto_feoe = "No hay ningún RA dualizado."
        else:
            texto_feoe = "No hay ningún RA dualizado."
    context["texto_feoe"] = texto_feoe

    # ── SECCIÓN C: SECUENCIACIÓN — Tabla RA×UD ─────────────────────────
    # Datos de la tabla: porcentajes de cada RA
    for i in range(1, 8):
        if i <= len(df_ra):
            ra = df_ra[i-1]
            context[f"ra_pct_{i}"] = str(ra.get('pct_ra', ''))
        else:
            context[f"ra_pct_{i}"] = ""

    # Datos de la tabla: filas de UDs
    for i in range(1, 11):
        if i <= len(df_ud):
            ud = df_ud[i-1]
            context[f"ud{i}_num"] = str(i)
            context[f"ud{i}_ev"] = str(ud.get('ev_ud', ''))
            context[f"ud{i}_nombre"] = resolve_ud_desc(ud, ud_desc_map)
            context[f"ud{i}_horas"] = str(ud.get('horas_ud', ''))
            # Porcentajes por RA
            for j in range(1, 8):
                context[f"ud{i}_ra{j}"] = str(ud.get(f'pct_ra{j}', ''))
        else:
            context[f"ud{i}_num"] = ""
            context[f"ud{i}_ev"] = ""
            context[f"ud{i}_nombre"] = ""
            context[f"ud{i}_horas"] = ""
            for j in range(1, 8):
                context[f"ud{i}_ra{j}"] = ""

    # ── SECCIÓN C1: CONTENIDOS — Títulos de UD ─────────────────────────
    for i in range(1, 11):
        if i <= len(df_ud):
            ud = df_ud[i-1]
            context[f"ud{i}_titulo_c1"] = resolve_ud_desc(ud, ud_desc_map)
        else:
            context[f"ud{i}_titulo_c1"] = ""

    # ── SECCIÓN C2: CRITERIOS DE EVALUACIÓN — Textos de RA ─────────────
    for i in range(1, 11):
        if i <= len(df_ra):
            ra = df_ra[i-1]
            context[f"ra{i}_texto_c2"] = resolve_ra_desc(ra, ra_desc_map)
        else:
            context[f"ra{i}_texto_c2"] = ""

    # ── SECCIÓN C3: CRITERIOS DE CALIFICACIÓN ──────────────────────────
    # Texto original: "30%. Conceptuales. 30%. Procedimentales. 40%. Actitudinales."
    # O configuración personalizada
    texto_calif = config.get("texto_criterios_calificacion", "")
    if not texto_calif:
        texto_calif = "30%. Conceptuales. 30%. Procedimentales. 40%. Actitudinales."
    context["texto_criterios_calificacion"] = texto_calif

    return context


def generate(data: dict, out_docx: str, out_pdf: str = None):
    """
    Genera la PD= (Suficiente/BOA) usando la plantilla DOCX.
    """
    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError(
            f"No se encontró la plantilla en: {TEMPLATE_PATH}. "
            f"Ejecuta 'python scripts/preparar_plantilla_pd_suficiente.py' para generarla."
        )

    doc = DocxTemplate(TEMPLATE_PATH)
    context = _build_context(data)
    doc.render(context)
    doc.save(out_docx)
