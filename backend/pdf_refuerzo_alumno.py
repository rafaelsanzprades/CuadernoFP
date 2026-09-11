# -*- coding: utf-8 -*-
"""
pdf_refuerzo_alumno.py
Plan de Trabajo Individual (item 23): CE pendientes de un alumno (Motor JEG,
via helpers_catalogo.calcular_notas_jeg), cruzados con su autoevaluacion
estructurada por CE (item 22, valor SI/DUDAS/NO + dificultades). Convive con
el texto libre de recuperacion ya existente en la app -- no lo sustituye.
"""
import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm

from helpers_catalogo import calcular_notas_jeg, DEFAULT_CONFIG_REDONDEO, filtrar_por_gev


def _nombre_alumno(al_id, df_al):
    if df_al.empty or al_id not in df_al.get("ID", pd.Series(dtype=str)).values:
        return al_id
    al = df_al[df_al["ID"] == al_id].iloc[0]
    apellidos = str(al.get("Apellidos") or "").strip()
    nombre = str(al.get("Nombre") or "").strip()
    return f"{apellidos}, {nombre}".strip(", ") or al_id


def _gev_alumno(al_id, df_al):
    if df_al.empty or al_id not in df_al.get("ID", pd.Series(dtype=str)).values:
        return None
    return df_al[df_al["ID"] == al_id].iloc[0].get("gev")


def _ce_pendientes(al_id, df_ra, df_ce, config_redondeo, df_autoevaluacion, df_calificaciones, df_indicadores, df_instr, alumno_gev=None):
    """Devuelve la lista de CE pendientes (nota None o < nota_aprobado) del
    alumno, cada uno con su autoevaluacion asociada si existe. Motor JEG,
    modo automático (Ítem 42 punto 6) -- ver helpers_catalogo.calcular_notas_jeg()."""
    resultado = calcular_notas_jeg(al_id, filtrar_por_gev(df_calificaciones, df_instr, alumno_gev), df_indicadores, df_instr, df_ce, df_ra, config_redondeo)
    notas_ce = resultado["notas_ce"]

    auto_by_ce = {a.get("ce_id"): a for a in df_autoevaluacion if a.get("alumno_id") == al_id}

    pendientes = []
    for ce in df_ce:
        ce_id = ce.get("id_ce")
        if not ce_id or ce_id not in notas_ce:
            continue
        nota = notas_ce[ce_id]
        if nota is not None and nota >= config_redondeo.get("nota_aprobado", 5.0):
            continue
        auto = auto_by_ce.get(ce_id)
        pendientes.append({
            "id_ce": ce_id,
            "desc_ce": ce.get("desc_ce") or ce.get("Descripción") or "",
            "nota": nota,
            "autoeval_valor": auto.get("valor") if auto else None,
            "autoeval_dificultades": auto.get("dificultades") if auto else None,
        })
    return pendientes


def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = portrait(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()


def generar_pdf_refuerzo(info_modulo, al_id, df_al, df_eval, df_ra, df_ce, df_act, config_redondeo=None, df_autoevaluacion=None,
                          df_calificaciones=None, df_indicadores=None, df_instr=None):
    config_redondeo = config_redondeo or DEFAULT_CONFIG_REDONDEO
    df_autoevaluacion = df_autoevaluacion or []
    pendientes = _ce_pendientes(al_id, df_ra, df_ce, config_redondeo, df_autoevaluacion,
                                 df_calificaciones or [], df_indicadores or [], df_instr or [], _gev_alumno(al_id, df_al))

    buffer = io.BytesIO()
    W, H = portrait(A4)
    left_m, right_m, top_m, bottom_m = 2.0 * cm, 1.0 * cm, 2.0 * cm, 1.5 * cm

    doc = BaseDocTemplate(buffer, pagesize=portrait(A4), leftMargin=left_m, rightMargin=right_m,
                           topMargin=top_m, bottomMargin=bottom_m)
    doc.cal_titulo = f"Plan de Trabajo Individual  ·  {info_modulo.get('modulo', 'Módulo')}"
    doc.cal_pie = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    frame = Frame(left_m, bottom_m, W - left_m - right_m, H - top_m - bottom_m, id="main")
    doc.addPageTemplates([PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)])

    styles = getSampleStyleSheet()
    norm = ParagraphStyle("Nor", parent=styles["Normal"], fontSize=10, leading=14)
    sml = ParagraphStyle("Sm", parent=styles["Normal"], fontSize=9, leading=12)

    nombre = _nombre_alumno(al_id, df_al)
    elements = [Paragraph(nombre, ParagraphStyle("H1", parent=styles["Heading1"], fontSize=16))]

    if not pendientes:
        elements.append(Paragraph("Sin criterios de evaluación pendientes de refuerzo en este momento.", norm))
    else:
        data = [[Paragraph("<b>CE</b>", sml), Paragraph("<b>Descripción</b>", sml),
                 Paragraph("<b>Nota</b>", sml), Paragraph("<b>Autoevaluación</b>", sml),
                 Paragraph("<b>Dificultades declaradas</b>", sml)]]
        for p in pendientes:
            nota_txt = f"{p['nota']:.1f}" if p["nota"] is not None else "Sin evaluar"
            data.append([
                Paragraph(p["id_ce"], sml), Paragraph(p["desc_ce"], sml),
                Paragraph(nota_txt, sml), Paragraph(p["autoeval_valor"] or "-", sml),
                Paragraph(p["autoeval_dificultades"] or "-", sml),
            ])
        t = Table(data, colWidths=[1.8 * cm, 6.5 * cm, 2 * cm, 2.7 * cm, 4 * cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Medidas de refuerzo propuestas", ParagraphStyle("H2", parent=styles["Heading2"], fontSize=13)))
        elements.append(Paragraph("_" * 90, norm))
        elements.append(Spacer(1, 6))
        elements.append(Paragraph("_" * 90, norm))
        elements.append(Spacer(1, 6))
        elements.append(Paragraph("_" * 90, norm))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generar_docx_refuerzo(info_modulo, al_id, df_al, df_eval, df_ra, df_ce, df_act, config_redondeo=None, df_autoevaluacion=None,
                           df_calificaciones=None, df_indicadores=None, df_instr=None):
    from docx_helpers import new_document, add_title, add_meta_line, add_section_heading, add_table, doc_to_bytes

    config_redondeo = config_redondeo or DEFAULT_CONFIG_REDONDEO
    df_autoevaluacion = df_autoevaluacion or []
    pendientes = _ce_pendientes(al_id, df_ra, df_ce, config_redondeo, df_autoevaluacion,
                                 df_calificaciones or [], df_indicadores or [], df_instr or [], _gev_alumno(al_id, df_al))

    nombre = _nombre_alumno(al_id, df_al)
    doc = new_document(landscape=False)
    add_title(doc, nombre, info_modulo.get("modulo", "Módulo"))
    add_meta_line(doc, f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})")

    add_section_heading(doc, "Criterios de evaluación pendientes")
    if not pendientes:
        doc.add_paragraph("Sin criterios de evaluación pendientes de refuerzo en este momento.")
    else:
        add_table(
            doc, ["CE", "Descripción", "Nota", "Autoevaluación", "Dificultades declaradas"],
            [[
                p["id_ce"], p["desc_ce"],
                f"{p['nota']:.1f}" if p["nota"] is not None else "Sin evaluar",
                p["autoeval_valor"] or "-", p["autoeval_dificultades"] or "-",
            ] for p in pendientes],
            col_widths_cm=[1.8, 6, 2, 2.7, 4],
        )
        add_section_heading(doc, "Medidas de refuerzo propuestas")
        doc.add_paragraph("_" * 90)
        doc.add_paragraph("_" * 90)
        doc.add_paragraph("_" * 90)

    return doc_to_bytes(doc)
