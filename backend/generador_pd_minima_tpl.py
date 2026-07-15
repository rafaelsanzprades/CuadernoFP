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

    # --- H1 3: Resultados de Aprendizaje (lista) ────────────────────────
    list_ras = []
    for ra in df_ra:
        id_str = str(ra.get('id_ra', ''))
        prefix = "" if id_str.upper().startswith("RA") else "RA"
        desc = resolve_ra_desc(ra, ra_desc_map)
        list_ras.append(f"{prefix}{id_str}. {desc}")
    context["list_ras"] = list_ras

    # --- H1 4: Contenidos / UDs (lista) ─────────────────────────────────
    list_uds = []
    for ud in df_ud:
        id_str = str(ud.get('id_ud', ''))
        prefix = "" if id_str.upper().startswith("UD") else "UD"
        desc = resolve_ud_desc(ud, ud_desc_map)
        list_uds.append(f"{prefix}{id_str}. {desc}")
    context["list_uds"] = list_uds

    # --- H1 5: Criterios de calificación ---
    df_act = data.get("df_act", [])
    list_instrumentos = []
    if df_act:
        for act in df_act:
            if act.get("is_active", True) == False:
                continue
            pct = str(act.get("peso_act", "0"))
            if not pct.endswith("%"): pct += "%"
            titulo = act.get("Tipo", "")
            tri = act.get("tri_act", "")
            if tri:
                titulo += f" ({tri})"
            desc = act.get("desc_act", "")
            if not titulo and not desc:
                continue
            list_instrumentos.append({
                "pct": pct,
                "titulo": titulo,
                "desc": desc
            })
    
    if not list_instrumentos:
        # Fallback if no acts
        list_instrumentos = [
            {"pct": "55%", "titulo": "Desarrollo de las prácticas en el Aula Taller.", "desc": "Rúbrica específica."},
            {"pct": "10%", "titulo": "Corrección del Cuaderno del Taller.", "desc": "Apuntes de clase, resumen de cada Unidad didáctica, informes de las prácticas y anotaciones."},
            {"pct": "5%", "titulo": "Preparación del examen teórico. Debate en grupo.", "desc": "Ronda de preguntas verbales, nivel de participación, resolución de dudas."},
            {"pct": "30%", "titulo": "Examen teórico escrito.", "desc": "Se pregunta sobre cuestiones de aplicación sobre el contenido teórico."},
        ]
    context["list_instrumentos"] = list_instrumentos

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

    tpl = DocxTemplate(TEMPLATE_PATH)
    context = _build_context(data)
    tpl.render(context)
    
    # ── Insertar Tabla de Instrumentos ──────────────────────────────
    doc = tpl.docx
    from docx.shared import Cm, Pt, RGBColor
    
    for p in doc.paragraphs:
        if "[[TABLA_INSTRUMENTOS]]" in p.text:
            p.text = p.text.replace("[[TABLA_INSTRUMENTOS]]", "")
            
            # Crear la tabla dinámicamente
            list_inst = context.get("list_instrumentos", [])
            table = doc.add_table(rows=1 + len(list_inst), cols=3)
            table.style = 'Table Grid'
            
            table.columns[0].width = Cm(1.5)
            table.columns[1].width = Cm(3.5)
            table.columns[2].width = Cm(11.0)
            
            hdr_cells = table.rows[0].cells
            hdr_cells[0].text = "%"
            hdr_cells[1].text = "Tipo"
            hdr_cells[2].text = "Instrumento / Descripción"
            
            for cell in hdr_cells:
                for hp in cell.paragraphs:
                    for r in hp.runs:
                        r.bold = True
                        r.font.name = 'Arial'
                        r.font.size = Pt(9)
                        r.font.color.rgb = RGBColor(0, 0, 0)
                        
            for i, instr in enumerate(list_inst):
                row_cells = table.rows[i + 1].cells
                row_cells[0].text = instr.get("pct", "")
                row_cells[1].text = instr.get("titulo", "")
                row_cells[2].text = instr.get("desc", "")
                
                for cell in row_cells:
                    for cp in cell.paragraphs:
                        for r in cp.runs:
                            r.font.name = 'Arial'
                            r.font.size = Pt(9)
                            r.font.color.rgb = RGBColor(0, 0, 0)
                            
            # Mover la tabla para que quede después de este párrafo
            p._p.addnext(table._tbl)

    # ── Guardar DOCX (y PDF) ─────────────────────────────────────────
    tpl.save(out_docx)
