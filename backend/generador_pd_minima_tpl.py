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
    curso_ciclo = data.get("curso_ciclo", "")
    nivel = data.get("nivel", "")
    codificado = " ".join(p for p in [curso_ciclo, nivel] if p)
    curso = data.get("curso_academico", "")
    if codificado:
        curso = f"{curso} [{codificado}]" if curso else f"[{codificado}]"
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

    # --- H1 3: Resultados de Aprendizaje (lista), con % y las UD que lo cubren ──
    list_ras = []
    for ra in df_ra:
        id_str = str(ra.get('id_ra', '')).strip().rstrip('.')
        prefix = "" if id_str.upper().startswith("RA") else "RA"
        ra_id_full = f"{prefix}{id_str}"
        desc = resolve_ra_desc(ra, ra_desc_map)
        try:
            peso = int(float(ra.get('peso_ra', 0) or 0))
        except (ValueError, TypeError):
            peso = 0

        # UDs relacionadas con este RA (misma info que la Matriz RA↔UD)
        uds_rel = []
        for ud in df_ud:
            try:
                val = float(ud.get(ra_id_full, 0) or 0)
            except (ValueError, TypeError):
                val = 0
            if val > 0:
                ud_id = str(ud.get('id_ud', '')).strip()
                horas = int(float(ud.get('horas_ud', 0) or 0))
                uds_rel.append(f"{ud_id} ({horas}h) - {int(val)}%")

        linea_ra = f"{ra_id_full}. ({peso}%) {desc}"
        if uds_rel:
            linea_ra += "\n" + ", ".join(uds_rel)
        list_ras.append(linea_ra)
    context["list_ras"] = list_ras

    # --- H1 4: Contenidos / UDs (lista), con horas ──────────────────────
    list_uds = []
    for ud in df_ud:
        id_str = str(ud.get('id_ud', '')).strip().rstrip('.')
        prefix = "" if id_str.upper().startswith("UD") else "UD"
        desc = resolve_ud_desc(ud, ud_desc_map)
        horas = int(float(ud.get('horas_ud', 0) or 0))
        list_uds.append(f"{prefix}{id_str}. ({horas}h) {desc}")
    context["list_uds"] = list_uds

    # --- % Ponderación por trimestres (para la nota final) ──────────────
    info_mod_pond = data.get("info_modulo") or {}
    context["pond_1t"] = info_mod_pond.get("pond_1t", 30)
    context["pond_2t"] = info_mod_pond.get("pond_2t", 30)
    context["pond_3t"] = info_mod_pond.get("pond_3t", 40)

    # --- H1 5: Criterios de calificación (% instrumentos por trimestre) ---
    instrumentos_pct = data.get("instrumentos_pct_trimestre") or []
    if not instrumentos_pct:
        # Misma semilla por defecto que el bloque "% Instrumentos de evaluación"
        # de Programación › Contexto › Identificación, para que PD- y la app
        # muestren siempre lo mismo mientras el profesor no lo edite.
        instrumentos_pct = [
            {"nombre": "Exámenes teóricos", "pct_1t": 30, "pct_2t": 20, "pct_3t": 10},
            {"nombre": "Exámenes prácticos", "pct_1t": 20, "pct_2t": 20, "pct_3t": 10},
            {"nombre": "Exposición y defensa proyecto", "pct_1t": 10, "pct_2t": 20, "pct_3t": 30},
            {"nombre": "Informes de ejercicios", "pct_1t": 20, "pct_2t": 30, "pct_3t": 40},
            {"nombre": "Cuaderno de tareas", "pct_1t": 20, "pct_2t": 10, "pct_3t": 10},
        ]
    list_instrumentos = [
        {
            "nombre": row.get("nombre", ""),
            "pct_1t": f"{row.get('pct_1t', 0)}%",
            "pct_2t": f"{row.get('pct_2t', 0)}%",
            "pct_3t": f"{row.get('pct_3t', 0)}%",
        }
        for row in instrumentos_pct
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
            table = doc.add_table(rows=1 + len(list_inst), cols=4)
            table.style = 'Table Grid'

            table.columns[0].width = Cm(8.0)
            table.columns[1].width = Cm(2.67)
            table.columns[2].width = Cm(2.67)
            table.columns[3].width = Cm(2.66)

            hdr_cells = table.rows[0].cells
            hdr_cells[0].text = "Instrumento"
            hdr_cells[1].text = "1er Trimestre"
            hdr_cells[2].text = "2º Trimestre"
            hdr_cells[3].text = "3er Trimestre"

            for cell in hdr_cells:
                for hp in cell.paragraphs:
                    for r in hp.runs:
                        r.bold = True
                        r.font.name = 'Arial'
                        r.font.size = Pt(9)
                        r.font.color.rgb = RGBColor(0, 0, 0)

            for i, instr in enumerate(list_inst):
                row_cells = table.rows[i + 1].cells
                row_cells[0].text = instr.get("nombre", "")
                row_cells[1].text = instr.get("pct_1t", "")
                row_cells[2].text = instr.get("pct_2t", "")
                row_cells[3].text = instr.get("pct_3t", "")

                for cell in row_cells:
                    for cp in cell.paragraphs:
                        for r in cp.runs:
                            r.font.name = 'Arial'
                            r.font.size = Pt(9)
                            r.font.color.rgb = RGBColor(0, 0, 0)
                            
            # Mover la tabla para que quede después de este párrafo
            p._p.addnext(table._tbl)

            # Ponderación de cada trimestre en la nota final, justo debajo
            pond_para = doc.add_paragraph()
            pond_run = pond_para.add_run(
                f"Ponderación de cada trimestre en la nota final: "
                f"1er trimestre {context['pond_1t']}% · 2º trimestre {context['pond_2t']}% · "
                f"3er trimestre {context['pond_3t']}%"
            )
            pond_run.bold = True
            pond_run.font.name = 'Arial'
            pond_run.font.size = Pt(9)
            pond_run.font.color.rgb = RGBColor(0, 0, 0)
            table._tbl.addnext(pond_para._p)

    # ── Guardar DOCX (y PDF) ─────────────────────────────────────────
    tpl.save(out_docx)
