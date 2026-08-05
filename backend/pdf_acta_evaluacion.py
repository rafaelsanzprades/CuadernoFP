# -*- coding: utf-8 -*-
"""
pdf_acta_evaluacion.py
PDF A4 vertical - Acta de evaluación (1T/2T/3T/Final), documento firmable
para la junta de evaluación. Reutiliza el mismo cálculo de nota ponderada
que los boletines grupales (pdf_boletin_grupal.py) para no divergir.
"""
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER

from pdf_boletin_grupal import _compute_grupal_rows, _compute_grupal_final_rows


def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = portrait(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()


def _acta_rows(periodo, info_modulo, df_al, df_eval, df_act):
    """Devuelve [(idx, alumnado, nota_str)] usando el mismo cálculo que los
    boletines grupales, para el periodo indicado (1T/2T/3T/Final)."""
    if periodo == "Final":
        _, _, _, filas = _compute_grupal_final_rows(info_modulo, df_al, df_eval, df_act)
        return [(f["idx"], f["alumnado"], f"{f['nota_final_ord']:.1f}") for f in filas]
    trimestre = periodo if periodo.endswith("T") else f"{periodo}T"
    _, _, filas = _compute_grupal_rows(trimestre, info_modulo, df_al, df_eval, df_act)
    return [(f["idx"], f["alumnado"], f"{f['nota_media']:.1f}") for f in filas]


def generar_pdf_acta_evaluacion(periodo, info_modulo, df_al, df_eval, df_act, fecha_corte=None):
    buffer = io.BytesIO()
    W, H = portrait(A4)
    left_m, right_m, top_m, bottom_m = 2.0 * cm, 1.0 * cm, 2.0 * cm, 1.5 * cm

    doc = BaseDocTemplate(buffer, pagesize=portrait(A4), leftMargin=left_m, rightMargin=right_m,
                           topMargin=top_m, bottomMargin=bottom_m)
    doc.cal_titulo = f"Acta de evaluación {periodo}  ·  {info_modulo.get('modulo', 'Módulo')}"
    pie_text = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    if fecha_corte:
        pie_text = f"Fecha de acta: {fecha_corte} | {pie_text}"
    doc.cal_pie = pie_text
    frame = Frame(left_m, bottom_m, W - left_m - right_m, H - top_m - bottom_m, id="main")
    doc.addPageTemplates([PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)])

    styles = getSampleStyleSheet()
    norm = ParagraphStyle("Nor", parent=styles["Normal"], fontSize=9, leading=11)
    smlB = ParagraphStyle("SmB", parent=styles["Normal"], fontSize=9, leading=11, fontName="Helvetica-Bold", alignment=TA_CENTER)
    sml = ParagraphStyle("Sm", parent=styles["Normal"], fontSize=9, leading=11, alignment=TA_CENTER)

    rows = _acta_rows(periodo, info_modulo, df_al, df_eval, df_act)

    header = [Paragraph("<b>Nº</b>", smlB), Paragraph("<b>Apellidos, Nombre</b>", smlB),
              Paragraph(f"<b>Nota {periodo}</b>", smlB), Paragraph("<b>Observaciones</b>", smlB)]
    table_data = [header]
    for idx, alumnado, nota in rows:
        table_data.append([Paragraph(str(idx), sml), Paragraph(alumnado, norm), Paragraph(nota, smlB), Paragraph("", norm)])
    if len(table_data) <= 1:
        table_data.append(["Sin datos para este periodo.", "", "", ""])

    tabla = Table(table_data, colWidths=[1.2 * cm, 7 * cm, 2.5 * cm, 7.3 * cm], repeatRows=1)
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
        ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 1), (1, -1), "LEFT"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))

    elements = [tabla, Spacer(1, 40)]
    firma_style = ParagraphStyle("Firma", parent=styles["Normal"], fontSize=10, alignment=TA_CENTER)
    firma_tbl = Table([
        [Paragraph("_______________________________", firma_style), Paragraph("_______________________________", firma_style)],
        [Paragraph("Fdo.: El/la profesor/a del módulo", firma_style), Paragraph("Fdo.: Jefatura de Departamento", firma_style)],
    ], colWidths=[9 * cm, 9 * cm])
    elements.append(firma_tbl)

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generar_docx_acta_evaluacion(periodo, info_modulo, df_al, df_eval, df_act, fecha_corte=None):
    from docx_helpers import new_document, add_title, add_meta_line, add_table, doc_to_bytes

    doc = new_document(landscape=False)
    add_title(doc, f"Acta de evaluación {periodo}", info_modulo.get("modulo", "Módulo"))
    meta = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    if fecha_corte:
        meta = f"Fecha de acta: {fecha_corte} | {meta}"
    add_meta_line(doc, meta)

    rows = _acta_rows(periodo, info_modulo, df_al, df_eval, df_act)
    table_rows = [[idx, alumnado, nota, ""] for idx, alumnado, nota in rows]
    if not table_rows:
        table_rows.append(["Sin datos para este periodo.", "", "", ""])
    add_table(doc, ["Nº", "Apellidos, Nombre", f"Nota {periodo}", "Observaciones"], table_rows,
               col_widths_cm=[1.2, 7, 2.5, 7.3])

    doc.add_paragraph()
    doc.add_paragraph()
    firma = doc.add_table(rows=2, cols=2)
    firma.cell(0, 0).text = "_______________________________"
    firma.cell(0, 1).text = "_______________________________"
    firma.cell(1, 0).text = "Fdo.: El/la profesor/a del módulo"
    firma.cell(1, 1).text = "Fdo.: Jefatura de Departamento"

    return doc_to_bytes(doc)
