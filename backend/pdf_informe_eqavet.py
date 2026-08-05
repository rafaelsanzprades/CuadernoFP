# -*- coding: utf-8 -*-
"""
pdf_informe_eqavet.py
PDF A4 vertical - Informe de autoevaluación EQAVET y propuestas de mejora
(PDCA), para la memoria final del módulo. Fuente de datos:
module_data.eqavet_evaluacion, tal y como lo escriben EqavetTab.tsx (ind1..ind8)
y PropuestasTab.tsx (puntos_fuertes_<cat> / areas_mejora_<cat> por cada
categoría: planificacion, desarrollo, resultados).
"""
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER

EQAVET_INDICATORS = [
    {"id": "ind1", "category": "Planificación", "label": "¿La programación se ha ajustado a las necesidades del sector productivo?"},
    {"id": "ind2", "category": "Planificación", "label": "¿Se han planificado adecuadamente las actividades de FP Dual?"},
    {"id": "ind3", "category": "Desarrollo", "label": "¿La metodología empleada ha fomentado el aprendizaje activo?"},
    {"id": "ind4", "category": "Desarrollo", "label": "¿Los recursos y espacios han sido suficientes y adecuados?"},
    {"id": "ind7", "category": "Desarrollo", "label": "¿Ha habido diferencia relevante entre lo planificado y lo realmente impartido?"},
    {"id": "ind8", "category": "Desarrollo", "label": "¿La programación ha facilitado la coordinación con el resto del equipo docente?"},
    {"id": "ind5", "category": "Resultados", "label": "¿El nivel de éxito escolar (aprobados) es satisfactorio?"},
    {"id": "ind6", "category": "Resultados", "label": "¿El alumnado ha mostrado satisfacción con el módulo?"},
]
SCORE_LABELS = {"1": "Mejorable", "2": "Suficiente", "3": "Bueno", "4": "Excelente"}
CATEGORIAS = ["Planificación", "Desarrollo", "Resultados"]
# Clave usada por PropuestasTab.tsx para cada categoría (puntos_fuertes_<clave> / areas_mejora_<clave>)
CATEGORIA_KEYS = {"Planificación": "planificacion", "Desarrollo": "desarrollo", "Resultados": "resultados"}


def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = portrait(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()


def generar_pdf_informe_eqavet(info_modulo: dict, eqavet_evaluacion: dict):
    buffer = io.BytesIO()
    W, H = portrait(A4)
    left_m, right_m, top_m, bottom_m = 2.0 * cm, 1.0 * cm, 2.0 * cm, 1.5 * cm

    doc = BaseDocTemplate(buffer, pagesize=portrait(A4), leftMargin=left_m, rightMargin=right_m,
                           topMargin=top_m, bottomMargin=bottom_m)
    doc.cal_titulo = f"Informe EQAVET  ·  {info_modulo.get('modulo', 'Módulo')}"
    doc.cal_pie = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    frame = Frame(left_m, bottom_m, W - left_m - right_m, H - top_m - bottom_m, id="main")
    doc.addPageTemplates([PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)])

    styles = getSampleStyleSheet()
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=14, spaceAfter=8, spaceBefore=10)
    h3 = ParagraphStyle("H3", parent=styles["Heading3"], fontSize=11, spaceAfter=4, fontName="Helvetica-Bold")
    norm = ParagraphStyle("Nor", parent=styles["Normal"], fontSize=9, leading=12, alignment=TA_LEFT)
    smlB = ParagraphStyle("SmB", parent=styles["Normal"], fontSize=9, leading=11, fontName="Helvetica-Bold", alignment=TA_CENTER)

    elements = [Paragraph("Indicadores de calidad (marco EQAVET)", h2)]

    for cat in CATEGORIAS:
        elements.append(Paragraph(cat, h3))
        rows = [[Paragraph("<b>Indicador</b>", smlB), Paragraph("<b>Valoración</b>", smlB)]]
        for ind in [i for i in EQAVET_INDICATORS if i["category"] == cat]:
            valor = eqavet_evaluacion.get(ind["id"])
            label = SCORE_LABELS.get(str(valor), "Sin valorar") if valor else "Sin valorar"
            rows.append([Paragraph(ind["label"], norm), Paragraph(label, smlB)])
        t = Table(rows, colWidths=[13 * cm, 4 * cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10))

    elements.append(Paragraph("Propuestas de mejora (PDCA)", h2))
    for cat in CATEGORIAS:
        key = CATEGORIA_KEYS[cat]
        elements.append(Paragraph(cat, h3))
        elements.append(Paragraph(
            f"<b>Puntos fuertes:</b> {eqavet_evaluacion.get(f'puntos_fuertes_{key}') or '<i>Sin cumplimentar.</i>'}", norm))
        elements.append(Paragraph(
            f"<b>Áreas de mejora:</b> {eqavet_evaluacion.get(f'areas_mejora_{key}') or '<i>Sin cumplimentar.</i>'}", norm))
        elements.append(Spacer(1, 8))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generar_docx_informe_eqavet(info_modulo: dict, eqavet_evaluacion: dict):
    from docx_helpers import new_document, add_title, add_meta_line, add_section_heading, add_table, doc_to_bytes

    doc = new_document(landscape=False)
    add_title(doc, "Informe EQAVET", info_modulo.get("modulo", "Módulo"))
    add_meta_line(doc, f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})")

    add_section_heading(doc, "Indicadores de calidad (marco EQAVET)")
    for cat in CATEGORIAS:
        doc.add_heading(cat, level=2)
        rows = []
        for ind in [i for i in EQAVET_INDICATORS if i["category"] == cat]:
            valor = eqavet_evaluacion.get(ind["id"])
            label = SCORE_LABELS.get(str(valor), "Sin valorar") if valor else "Sin valorar"
            rows.append([ind["label"], label])
        add_table(doc, ["Indicador", "Valoración"], rows, col_widths_cm=[15, 4])

    add_section_heading(doc, "Propuestas de mejora (PDCA)")
    for cat in CATEGORIAS:
        key = CATEGORIA_KEYS[cat]
        doc.add_heading(cat, level=2)
        doc.add_paragraph(f"Puntos fuertes: {eqavet_evaluacion.get(f'puntos_fuertes_{key}') or 'Sin cumplimentar.'}")
        doc.add_paragraph(f"Áreas de mejora: {eqavet_evaluacion.get(f'areas_mejora_{key}') or 'Sin cumplimentar.'}")

    return doc_to_bytes(doc)
