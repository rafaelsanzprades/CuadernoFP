"""
Generador PD Mínima / Resumen (Vía A) — usa plantilla DOCX con docxtpl.

Plantilla: backend/templates/modelo_pd_fp-.docx
Destinatario: Alumnado (resumen de 1 página)

Uso:
    from generador_pd_minima_tpl import generate
    generate(data, out_docx, out_pdf)
"""

import os
from docxtpl import DocxTemplate
from helpers_catalogo import build_ra_desc_map, build_ud_desc_map, resolve_ra_desc, resolve_ud_desc

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'templates', 'modelo_pd_fp-.docx')


def _build_context(data: dict) -> dict:
    """
    Construye el contexto Jinja2 para la PD- (resumen alumnado).
    """
    modulo = data.get("modulo", "el módulo profesional")
    ciclo = data.get("ciclo", "el ciclo formativo")
    curso = data.get("curso_academico", "")
    df_ra = data.get("df_ra", [])
    df_ud = data.get("df_ud", [])
    config = data.get("config_contexto", {})

    # Construir mapas de descripciones desde catálogo
    ra_desc_map = build_ra_desc_map(data)
    ud_desc_map = build_ud_desc_map(data)

    context = {
        "modulo": modulo,
        "ciclo": ciclo,
        "curso_academico": curso,
    }

    # ── H1 1: Perfil profesional ───────────────────────────────────────
    texto_perfil = config.get("minima_perfil_profesional", "")
    if not texto_perfil:
        texto_perfil = (
            f"La formación de este módulo ({modulo}) contribuye a tu perfil profesional "
            f"proporcionándote las competencias necesarias para desarrollar tu actividad "
            f"en el ámbito del {ciclo}."
        )
    context["texto_perfil_profesional"] = texto_perfil

    # ── H1 2: Competencia general ──────────────────────────────────────
    texto_comp = config.get("minima_competencia_general", "")
    if not texto_comp:
        texto_comp = (
            f"La competencia general de este título te permitirá desempeñar las funciones "
            f"propias del perfil profesional asociado al {ciclo}, aplicando los conocimientos "
            f"y habilidades adquiridos en {modulo}."
        )
    context["texto_competencia_general"] = texto_comp

    # ── H1 3: Resultados de Aprendizaje (lista) ────────────────────────
    for i in range(1, 11):
        if i <= len(df_ra):
            ra = df_ra[i-1]
            id_str = str(ra.get('id_ra', ''))
            prefix = "" if id_str.upper().startswith("RA") else "RA"
            desc = resolve_ra_desc(ra, ra_desc_map)
            context[f"ra{i}_texto"] = f"{prefix}{id_str}. {desc}"
        else:
            context[f"ra{i}_texto"] = ""

    # ── H1 4: Contenidos / UDs (lista) ─────────────────────────────────
    for i in range(1, 11):
        if i <= len(df_ud):
            ud = df_ud[i-1]
            id_str = str(ud.get('id_ud', ''))
            prefix = "" if id_str.upper().startswith("UD") else "UD"
            desc = resolve_ud_desc(ud, ud_desc_map)
            context[f"ud{i}_texto"] = f"{prefix}{id_str}. {desc}"
        else:
            context[f"ud{i}_texto"] = ""

    # ── H1 5: Criterios de calificación ────────────────────────────────
    # Intentar obtener bloques de calificación del config
    calif = config.get("minima_calificacion", {})
    if isinstance(calif, dict) and calif:
        for b in range(1, 5):
            bloque = calif.get(f"bloque{b}", {})
            context[f"calif_bloque{b}_pct"] = bloque.get("pct", "")
            context[f"calif_bloque{b}_titulo"] = bloque.get("titulo", "")
            context[f"calif_bloque{b}_desc"] = bloque.get("desc", "")
    else:
        # Valores por defecto (ejemplo del generador original)
        defaults = [
            {"pct": "55%", "titulo": "Desarrollo de las prácticas en el Aula Taller.",
             "desc": "Rúbrica específica. Autoevaluación previa hasta tres intentos para mejorar la nota."},
            {"pct": "10%", "titulo": "Corrección del Cuaderno del Taller.",
             "desc": "Apuntes de clase, resumen de cada Unidad didáctica, informes de las prácticas y anotaciones."},
            {"pct": "5%", "titulo": "Preparación del examen teórico. Debate en grupo.",
             "desc": "Ronda de preguntas verbales, nivel de participación, resolución de dudas."},
            {"pct": "30%", "titulo": "Examen teórico escrito (con una calificación mínima de 5 para media).",
             "desc": "Se pregunta sobre cuestiones de aplicación sobre el contenido teórico.\n+ 1 punto adicional por actitud y comportamiento positivo."},
        ]
        for b in range(1, 5):
            d = defaults[b-1]
            context[f"calif_bloque{b}_pct"] = d["pct"]
            context[f"calif_bloque{b}_titulo"] = d["titulo"]
            context[f"calif_bloque{b}_desc"] = d["desc"]

    # ── H1 6: Recordad ─────────────────────────────────────────────────
    texto_recordatorio = config.get("minima_recordatorio", "")
    if not texto_recordatorio:
        texto_recordatorio = "Más del 15% de faltas de asistencia a clase implica la Pérdida del derecho a evaluación continua."
    context["texto_recordatorio"] = texto_recordatorio

    texto_final = config.get("minima_texto_final", "")
    if not texto_final:
        texto_final = "Tu situación es similar a la del resto del alumnado que ha obtenido su titulación. ¡ÁNIMO!"
    context["texto_final"] = texto_final

    return context


def generate(data: dict, out_docx: str, out_pdf: str = None):
    """
    Genera la PD- (resumen alumnado) usando la plantilla DOCX.
    """
    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError(
            f"No se encontró la plantilla en: {TEMPLATE_PATH}. "
            f"Ejecuta 'python scripts/preparar_plantilla_pd_minima.py' para generarla."
        )

    doc = DocxTemplate(TEMPLATE_PATH)
    context = _build_context(data)
    doc.render(context)
    doc.save(out_docx)
