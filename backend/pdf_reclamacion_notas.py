# -*- coding: utf-8 -*-
"""
pdf_reclamacion_notas.py
Justificante de una reclamación de nota (item 34): quien reclama, que nota,
motivo, resolucion (si la hay) y, como evidencia, los cambios registrados en
el historico de calificaciones (item 33) para ese alumno + esa nota.
"""
import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm


def _nombre_alumno(al_id, df_al):
    if df_al.empty or al_id not in df_al.get("ID", pd.Series(dtype=str)).values:
        return al_id
    al = df_al[df_al["ID"] == al_id].iloc[0]
    apellidos = str(al.get("Apellidos") or "").strip()
    nombre = str(al.get("Nombre") or "").strip()
    return f"{apellidos}, {nombre}".strip(", ") or al_id


def _fmt_fecha(iso_str):
    if not iso_str:
        return "-"
    try:
        return pd.to_datetime(iso_str).strftime("%d/%m/%Y %H:%M")
    except Exception:
        return str(iso_str)


def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = portrait(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()


def generar_pdf_reclamacion(info_modulo, al_id, df_al, reclamacion, evidencia):
    buffer = io.BytesIO()
    W, H = portrait(A4)
    left_m, right_m, top_m, bottom_m = 2.0 * cm, 1.0 * cm, 2.0 * cm, 1.5 * cm

    doc = BaseDocTemplate(buffer, pagesize=portrait(A4), leftMargin=left_m, rightMargin=right_m,
                           topMargin=top_m, bottomMargin=bottom_m)
    doc.cal_titulo = f"Justificante de reclamación de nota  ·  {info_modulo.get('modulo', 'Módulo')}"
    doc.cal_pie = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    frame = Frame(left_m, bottom_m, W - left_m - right_m, H - top_m - bottom_m, id="main")
    doc.addPageTemplates([PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)])

    styles = getSampleStyleSheet()
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=14, spaceAfter=8, spaceBefore=10)
    norm = ParagraphStyle("Nor", parent=styles["Normal"], fontSize=10, leading=14)
    sml = ParagraphStyle("Sm", parent=styles["Normal"], fontSize=9, leading=12)

    nombre = _nombre_alumno(al_id, df_al)
    elements = [Paragraph(nombre, ParagraphStyle("H1", parent=styles["Heading1"], fontSize=16))]

    datos = [
        [Paragraph("<b>Nota reclamada:</b>", sml), Paragraph(str(reclamacion.get("referencia", "-")), sml)],
        [Paragraph("<b>Fecha de la reclamación:</b>", sml), Paragraph(_fmt_fecha(reclamacion.get("fecha_reclamacion")), sml)],
        [Paragraph("<b>Estado:</b>", sml), Paragraph("Resuelta" if reclamacion.get("estado") == "resuelta" else "Pendiente", sml)],
    ]
    t = Table(datos, colWidths=[5 * cm, 12 * cm], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Motivo", h2))
    elements.append(Paragraph(reclamacion.get("motivo", "-"), norm))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("Resolución", h2))
    if reclamacion.get("estado") == "resuelta":
        elements.append(Paragraph(
            f"{reclamacion.get('resolucion', '-')}  (resuelta el {_fmt_fecha(reclamacion.get('fecha_resolucion'))})", norm
        ))
    else:
        elements.append(Paragraph("<i>Reclamación todavía pendiente de resolver.</i>", sml))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("Evidencia — histórico de cambios de esta nota", h2))
    if evidencia:
        data = [[Paragraph("<b>Fecha</b>", sml), Paragraph("<b>Anterior</b>", sml), Paragraph("<b>Nuevo</b>", sml)]]
        for h in evidencia:
            data.append([
                Paragraph(_fmt_fecha(h.get("fecha")), sml),
                Paragraph(str(h.get("valor_anterior", "-")), sml),
                Paragraph(str(h.get("valor_nuevo", "-")), sml),
            ])
        te = Table(data, colWidths=[6 * cm, 5.5 * cm, 5.5 * cm])
        te.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(te)
    else:
        elements.append(Paragraph("<i>Sin cambios registrados en el histórico para esta nota.</i>", sml))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generar_docx_reclamacion(info_modulo, al_id, df_al, reclamacion, evidencia):
    from docx_helpers import new_document, add_title, add_meta_line, add_section_heading, add_table, doc_to_bytes

    nombre = _nombre_alumno(al_id, df_al)
    doc = new_document(landscape=False)
    add_title(doc, nombre, info_modulo.get("modulo", "Módulo"))
    add_meta_line(doc, f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})")

    estado_txt = "Resuelta" if reclamacion.get("estado") == "resuelta" else "Pendiente"
    add_table(
        doc, ["Nota reclamada", "Fecha de la reclamación", "Estado"],
        [[str(reclamacion.get("referencia", "-")), _fmt_fecha(reclamacion.get("fecha_reclamacion")), estado_txt]],
        col_widths_cm=[6, 6, 5],
    )

    add_section_heading(doc, "Motivo")
    doc.add_paragraph(reclamacion.get("motivo", "-"))

    add_section_heading(doc, "Resolución")
    if reclamacion.get("estado") == "resuelta":
        doc.add_paragraph(
            f"{reclamacion.get('resolucion', '-')}  (resuelta el {_fmt_fecha(reclamacion.get('fecha_resolucion'))})"
        )
    else:
        doc.add_paragraph("Reclamación todavía pendiente de resolver.")

    add_section_heading(doc, "Evidencia — histórico de cambios de esta nota")
    if evidencia:
        add_table(
            doc, ["Fecha", "Anterior", "Nuevo"],
            [[_fmt_fecha(h.get("fecha")), str(h.get("valor_anterior", "-")), str(h.get("valor_nuevo", "-"))] for h in evidencia],
            col_widths_cm=[6, 5.5, 5.5],
        )
    else:
        doc.add_paragraph("Sin cambios registrados en el histórico para esta nota.")

    return doc_to_bytes(doc)
