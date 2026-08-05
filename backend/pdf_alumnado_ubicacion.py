# -*- coding: utf-8 -*-
"""
pdf_alumnado_ubicacion.py
PDF A4 apaisado - Plano de aula (ubicación del alumnado por pupitre).
Replica el mismo lenguaje visual que PlanoClaseTab.tsx: fila 0 = fondo de
clase, última fila = frente de clase, con la Mesa del Profesorado / Pizarra
al pie, delante de la última fila.
"""
import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate,
    Table, TableStyle, Paragraph, Spacer
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT


def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = landscape(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()


def generar_pdf_alumnado_ubicacion(
    info_modulo: dict,
    plano_clase: dict,
    df_al: pd.DataFrame,
):
    buffer = io.BytesIO()
    W, H = landscape(A4)
    left_m = 2.0 * cm
    right_m = 1.0 * cm
    top_m = 2.0 * cm
    bottom_m = 1.5 * cm

    doc = BaseDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=left_m, rightMargin=right_m,
        topMargin=top_m, bottomMargin=bottom_m,
    )

    nombre_modulo = info_modulo.get("modulo", "Módulo")
    doc.cal_titulo = f"Plano de aula  ·  {nombre_modulo}"
    doc.cal_pie = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"

    frame = Frame(left_m, bottom_m, W - left_m - right_m, H - top_m - bottom_m, id="main")
    doc.addPageTemplates([PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)])

    styles = getSampleStyleSheet()
    label = ParagraphStyle("Label", parent=styles["Normal"], fontSize=9, fontName="Helvetica-Bold",
                            textColor=colors.HexColor("#777777"), alignment=TA_LEFT)
    seat_coord = ParagraphStyle("SeatCoord", parent=styles["Normal"], fontSize=7, fontName="Helvetica",
                                 textColor=colors.HexColor("#999999"), alignment=TA_CENTER)
    seat_name = ParagraphStyle("SeatName", parent=styles["Normal"], fontSize=10, fontName="Helvetica-Bold",
                                textColor=colors.black, alignment=TA_CENTER, leading=12)
    seat_empty = ParagraphStyle("SeatEmpty", parent=styles["Normal"], fontSize=8, fontName="Helvetica-Oblique",
                                 textColor=colors.HexColor("#aaaaaa"), alignment=TA_CENTER)
    desk_style = ParagraphStyle("Desk", parent=styles["Normal"], fontSize=11, fontName="Helvetica-Bold",
                                 textColor=colors.HexColor("#333333"), alignment=TA_CENTER)

    elements = [Paragraph("Fondo de clase ↑", label), Spacer(1, 8)]

    rows = int(plano_clase.get("rows", 0) or 0)
    cols = int(plano_clase.get("cols", 0) or 0)
    seats = plano_clase.get("seats", {}) or {}

    if not rows or not cols:
        elements.append(Paragraph(
            "<i>No hay un plano de aula configurado todavía (Curso › Alumnado › Plano de clase).</i>",
            seat_empty,
        ))
        doc.build(elements)
        buffer.seek(0)
        return buffer

    id_to_name = {}
    if not df_al.empty and "ID" in df_al.columns:
        for _, r in df_al.iterrows():
            id_to_name[r.get("ID", "")] = f"{r.get('Apellidos', '')}, {r.get('Nombre', '')}"

    avail_w = W - left_m - right_m
    avail_h = H - top_m - bottom_m - 2.5 * cm  # deja hueco para etiquetas + mesa
    col_w = avail_w / cols
    row_h = min(2.4 * cm, avail_h / max(rows, 1))

    grid_data = []
    for r in range(rows):
        row_cells = []
        for c in range(cols):
            al_id = seats.get(f"{r}_{c}", "")
            nombre = id_to_name.get(al_id, "")
            if al_id and nombre:
                cell = [Paragraph(f"F{r + 1}-C{c + 1}", seat_coord), Paragraph(nombre, seat_name)]
            else:
                cell = [Paragraph(f"F{r + 1}-C{c + 1}", seat_coord), Paragraph("-- Libre --", seat_empty)]
            row_cells.append(cell)
        grid_data.append(row_cells)

    # Cada celda es en realidad una mini-tabla (coord + nombre) para poder
    # centrar verticalmente ambas líneas dentro del pupitre.
    grid_table_data = []
    for row_cells in grid_data:
        table_row = []
        for coord_p, name_p in row_cells:
            inner = Table([[coord_p], [name_p]], colWidths=[col_w - 0.2 * cm])
            inner.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]))
            table_row.append(inner)
        grid_table_data.append(table_row)

    grid = Table(grid_table_data, colWidths=[col_w] * cols, rowHeights=[row_h] * rows)
    grid.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
        ("GRID", (0, 0), (-1, -1), 0.75, colors.HexColor("#999999")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fbfbfb")),
    ]))
    elements.append(grid)
    elements.append(Spacer(1, 10))

    # Mesa del profesorado / pizarra — banda a todo el ancho, delante de la
    # última fila (frente de clase), igual que en pantalla.
    desk = Table([[Paragraph("Mesa del Profesorado / Pizarra", desk_style)]], colWidths=[avail_w])
    desk.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#555555")),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eeeeee")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(desk)
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("Frente de clase / Pizarra ↓", label))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generar_docx_alumnado_ubicacion(info_modulo, plano_clase, df_al):
    """Versión .docx editable: una tabla con la misma disposición de filas/
    columnas que el plano de aula, más la banda de Mesa del Profesorado."""
    from docx_helpers import new_document, add_title, add_meta_line, add_section_heading, add_table, doc_to_bytes

    doc = new_document(landscape=True)
    add_title(doc, "Plano de aula", info_modulo.get("modulo", "Módulo"))
    add_meta_line(doc, f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})")

    rows = int(plano_clase.get("rows", 0) or 0)
    cols = int(plano_clase.get("cols", 0) or 0)
    seats = plano_clase.get("seats", {}) or {}

    if not rows or not cols:
        doc.add_paragraph("No hay un plano de aula configurado todavía (Curso › Alumnado › Plano de clase).")
        return doc_to_bytes(doc)

    id_to_name = {}
    if not df_al.empty and "ID" in df_al.columns:
        for _, r in df_al.iterrows():
            id_to_name[r.get("ID", "")] = f"{r.get('Apellidos', '')}, {r.get('Nombre', '')}"

    add_section_heading(doc, "Fondo de clase ↑")
    table_rows = []
    for r in range(rows):
        fila = []
        for c in range(cols):
            al_id = seats.get(f"{r}_{c}", "")
            nombre = id_to_name.get(al_id, "")
            fila.append(f"F{r + 1}-C{c + 1}\n{nombre}" if (al_id and nombre) else f"F{r + 1}-C{c + 1}\n-- Libre --")
        table_rows.append(fila)
    add_table(doc, [f"C{c + 1}" for c in range(cols)], table_rows, col_widths_cm=[24 / cols] * cols)

    doc.add_paragraph()
    doc.add_paragraph("Mesa del Profesorado / Pizarra").alignment = 1
    doc.add_paragraph("Frente de clase / Pizarra ↓")

    return doc_to_bytes(doc)
