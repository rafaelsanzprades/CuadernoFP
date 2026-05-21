# -*- coding: utf-8 -*-
"""
pdf_matrices.py
PDF A4 apaisado — Matrices RA → UD (sin Criterios de Evaluación).
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
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = landscape(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()


def generar_pdf_matrices(
    info_modulo: dict,
    df_ra: pd.DataFrame,
    df_ud: pd.DataFrame,
):
    buffer = io.BytesIO()
    W, H = landscape(A4)
    left_m   = 2.0 * cm
    right_m  = 1.0 * cm
    top_m    = 2.0 * cm
    bottom_m = 1.5 * cm

    doc = BaseDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=left_m, rightMargin=right_m,
        topMargin=top_m, bottomMargin=bottom_m,
    )

    nombre_modulo = info_modulo.get("modulo", "Módulo")
    doc.cal_titulo = f"Matrices RA → UD  ·  {nombre_modulo}"
    doc.cal_pie    = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"

    frame = Frame(left_m, bottom_m, W - left_m - right_m, H - top_m - bottom_m, id="main")
    doc.addPageTemplates([PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)])

    styles = getSampleStyleSheet()
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=14, spaceAfter=8, textColor=colors.black, spaceBefore=4)
    norm = ParagraphStyle("Nor", parent=styles["Normal"], fontSize=9, leading=11, alignment=TA_CENTER)
    normB = ParagraphStyle("NorB", parent=styles["Normal"], fontSize=9, leading=11, fontName="Helvetica-Bold", alignment=TA_CENTER)
    norm_left = ParagraphStyle("NorL", parent=styles["Normal"], fontSize=9, leading=11, alignment=TA_LEFT)
    normB_left = ParagraphStyle("NorBL", parent=styles["Normal"], fontSize=9, leading=11, fontName="Helvetica-Bold", alignment=TA_LEFT)
    sml = ParagraphStyle("Sm", parent=styles["Normal"], fontSize=8, leading=9, alignment=TA_CENTER)
    smlB = ParagraphStyle("SmB", parent=styles["Normal"], fontSize=8, leading=9, fontName="Helvetica-Bold", alignment=TA_CENTER)
    sml_left = ParagraphStyle("SmL", parent=styles["Normal"], fontSize=8, leading=9, alignment=TA_LEFT)

    elements = []

    # ═══════════════════════════════════════════════════════════
    #  SECCIÓN 1: Resultados de Aprendizaje (RA)
    # ═══════════════════════════════════════════════════════════
    elements.append(Paragraph("Resultados de aprendizaje (RA)", h2))

    if not df_ra.empty:
        ra_header = [
            Paragraph("<b>ID-RA</b>", smlB),
            Paragraph("<b>% RA</b>", smlB),
            Paragraph("<b>FEOE</b>", smlB),
            Paragraph("<b>Descripción del Resultado de Aprendizaje</b>", smlB),
        ]

        ra_data = [ra_header]
        total_peso = 0
        for _, row in df_ra.iterrows():
            peso = row.get("peso_ra", 0)
            total_peso += peso
            is_dual = row.get("is_dual", False)
            ra_data.append([
                Paragraph(f"<b>{row.get('id_ra', '')}</b>", normB),
                Paragraph(f"{peso}", norm),
                Paragraph("✓" if is_dual else "", norm),
                Paragraph(str(row.get("desc_ra", "")), norm_left),
            ])

        # Fila de totales
        color_total = "#228B22" if total_peso == 100 else "#cc0000"
        ra_data.append([
            Paragraph("<b>TOTAL</b>", normB),
            Paragraph(f"<b><font color='{color_total}'>{total_peso}%</font></b>", normB),
            "",
            "",
        ])

        avail_w = W - left_m - right_m
        ra_col_widths = [2 * cm, 1.5 * cm, 1.5 * cm, avail_w - 5 * cm]

        ra_table = Table(ra_data, colWidths=ra_col_widths, repeatRows=1)
        ra_table.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("TEXTCOLOR",     (0, 0), (-1, 0), colors.black),
            ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
            ("LINEBELOW",     (0, 0), (-1, 0), 1.5, colors.HexColor("#222222")),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("BOX",           (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
            ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
            ("TOPPADDING",    (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING",   (0, 0), (-1, -1), 4),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
            # Total row
            ("BACKGROUND",    (0, -1), (-1, -1), colors.HexColor("#e8e8e8")),
            ("LINEABOVE",     (0, -1), (-1, -1), 1.5, colors.HexColor("#222222")),
        ]))
        elements.append(ra_table)
    else:
        elements.append(Paragraph("<i>No hay Resultados de Aprendizaje definidos.</i>", norm_left))

    elements.append(Spacer(1, 20))

    # ═══════════════════════════════════════════════════════════
    #  SECCIÓN 2: Unidades Didácticas × RA (tabla cruzada)
    # ═══════════════════════════════════════════════════════════
    elements.append(Paragraph("Unidades didácticas (UD) × Resultados de aprendizaje (RA)", h2))

    if not df_ud.empty and not df_ra.empty:
        ra_ids = df_ra["id_ra"].tolist() if "id_ra" in df_ra.columns else []

        # Header
        ud_header = [
            Paragraph("<b>ID-UD</b>", smlB),
            Paragraph("<b>Horas</b>", smlB),
            Paragraph("<b>Unidad Didáctica</b>", smlB),
        ]
        for ra_id in ra_ids:
            peso_ra = df_ra.loc[df_ra["id_ra"] == ra_id, "peso_ra"].values
            peso_str = f"{int(peso_ra[0])}%" if len(peso_ra) > 0 else ""
            ud_header.append(Paragraph(f"<b>{ra_id}</b><br/><font size='7'>({peso_str})</font>", smlB))

        ud_data = [ud_header]

        for _, row in df_ud.iterrows():
            ud_row = [
                Paragraph(f"<b>{row.get('id_ud', '')}</b>", normB),
                Paragraph(f"{int(row.get('horas_ud', 0))}", norm),
                Paragraph(str(row.get("desc_ud", "")), sml_left),
            ]
            for ra_id in ra_ids:
                val = row.get(ra_id, 0)
                if val and val > 0:
                    ud_row.append(Paragraph(f"<b>{int(val)}%</b>", normB))
                else:
                    ud_row.append("")
            ud_data.append(ud_row)

        # Total row
        total_horas = df_ud["horas_ud"].sum() if "horas_ud" in df_ud.columns else 0
        total_row = [
            Paragraph("<b>TOTAL</b>", normB),
            Paragraph(f"<b>{int(total_horas)}</b>", normB),
            "",
        ]
        for ra_id in ra_ids:
            col_sum = 0
            for _, row in df_ud.iterrows():
                col_sum += (row.get(ra_id, 0) or 0)
            color_sum = "#228B22" if col_sum == 100 else "#cc0000"
            total_row.append(Paragraph(f"<b><font color='{color_sum}'>{int(col_sum)}%</font></b>", normB))
        ud_data.append(total_row)

        # Column widths
        n_ra = len(ra_ids)
        fixed_w = 1.8 * cm + 1.3 * cm  # id_ud + horas
        avail_w = W - left_m - right_m
        desc_w = max(4 * cm, avail_w - fixed_w - n_ra * 1.6 * cm)
        ud_col_widths = [1.8 * cm, 1.3 * cm, desc_w] + [1.6 * cm] * n_ra

        ud_table = Table(ud_data, colWidths=ud_col_widths, repeatRows=1)

        ts_cmds = [
            ("BACKGROUND",    (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("TEXTCOLOR",     (0, 0), (-1, 0), colors.black),
            ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
            ("LINEBELOW",     (0, 0), (-1, 0), 1.5, colors.HexColor("#222222")),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("BOX",           (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
            ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
            ("TOPPADDING",    (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING",   (0, 0), (-1, -1), 3),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 3),
            # Total row
            ("BACKGROUND",    (0, -1), (-1, -1), colors.HexColor("#e8e8e8")),
            ("LINEABOVE",     (0, -1), (-1, -1), 1.5, colors.HexColor("#222222")),
        ]

        # Highlight RA columns with alternating backgrounds
        for i, _ in enumerate(ra_ids):
            col_idx = 3 + i
            if i % 2 == 0:
                ts_cmds.append(("BACKGROUND", (col_idx, 1), (col_idx, -2), colors.HexColor("#f8fae6")))
            else:
                ts_cmds.append(("BACKGROUND", (col_idx, 1), (col_idx, -2), colors.HexColor("#f0f4ff")))

        ud_table.setStyle(TableStyle(ts_cmds))
        elements.append(ud_table)
    else:
        elements.append(Paragraph("<i>No hay datos de Unidades Didácticas o RA definidos.</i>", norm_left))

    elements.append(Spacer(1, 20))

    # ═══════════════════════════════════════════════════════════
    #  SECCIÓN 3: Relación RA ↔ UD (resumen jerárquico)
    # ═══════════════════════════════════════════════════════════
    elements.append(Paragraph("Relación entre Resultados de aprendizaje y Unidades didácticas", h2))

    if not df_ra.empty and not df_ud.empty:
        ra_title = ParagraphStyle("RaTitle", parent=styles["Normal"], fontSize=11, leading=14, fontName="Helvetica-Bold", alignment=TA_LEFT, spaceBefore=10, spaceAfter=2)
        ud_item = ParagraphStyle("UdItem", parent=styles["Normal"], fontSize=9, leading=12, alignment=TA_LEFT, leftIndent=30, spaceAfter=1)
        ud_none = ParagraphStyle("UdNone", parent=styles["Normal"], fontSize=9, leading=12, alignment=TA_LEFT, leftIndent=30, textColor=colors.HexColor("#888888"), fontName="Helvetica-Oblique")

        for _, ra_row in df_ra.iterrows():
            ra_id = ra_row.get("id_ra", "")
            peso_ra = ra_row.get("peso_ra", 0)
            desc_ra = ra_row.get("desc_ra", "")

            elements.append(Paragraph(f"{ra_id} ({peso_ra}%). <font size='9' color='#555555'>{desc_ra}</font>", ra_title))

            # Find UDs linked to this RA
            has_uds = False
            for _, ud_row in df_ud.iterrows():
                val = ud_row.get(ra_id, 0)
                if val and val > 0:
                    has_uds = True
                    ud_id = ud_row.get("id_ud", "")
                    horas = int(ud_row.get("horas_ud", 0))
                    elements.append(Paragraph(f"→ {ud_id} ({horas}h) — {int(val)}%", ud_item))

            if not has_uds:
                elements.append(Paragraph("Sin UDs asignadas", ud_none))
    else:
        elements.append(Paragraph("<i>No hay datos para mostrar la relación RA ↔ UD.</i>", norm_left))

    doc.build(elements)
    buffer.seek(0)
    return buffer
