# -*- coding: utf-8 -*-
"""
pdf_ficha_alumnado.py
PDF A4 vertical - Ficha individual de alumnado: datos de matrícula + tutoría
+ (si se aporta) resumen de asistencia. Pensada para llevar a una reunión de
orientación sin tener que exportar todo el boletín de notas.

tutoria_entry admite las DOS formas reales que existen hoy en la app para
cursoData.tutoria_ledger[al_id]:
  - lista de actuaciones (TutoriaTab.tsx): [{fecha, canal, ambito, tema, acuerdos}, ...]
  - objeto plano de datos de vulnerabilidad/intake (demo .fpc): {"SEXO": "H", ...}
"""
import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER


def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = portrait(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()


def _ficha_alumno(al_id, df_al):
    if df_al.empty or al_id not in df_al.get("ID", pd.Series(dtype=str)).values:
        return None
    al = df_al[df_al["ID"] == al_id].iloc[0]

    def g(k, default="-"):
        v = al.get(k)
        if v is None or (isinstance(v, float) and pd.isna(v)) or str(v).strip() == "" or str(v).lower() == "nan":
            return default
        return str(v)

    return {
        "apellidos": g("Apellidos", ""), "nombre": g("Nombre", ""),
        "edad": g("Edad"), "repite": "Sí" if al.get("Repite") else "No",
        "estado": g("Estado"), "email": g("email", g("Email")), "telefono": g("Movil", g("Teléfono")),
        "comentarios": g("Comentarios", g("Observaciones")),
    }


def _tutoria_rows(tutoria_entry):
    """Devuelve (modo, filas) — modo es 'actuaciones' | 'intake' | 'vacio'."""
    if isinstance(tutoria_entry, list) and tutoria_entry:
        rows = [(e.get("fecha", ""), e.get("canal", ""), e.get("ambito", ""), e.get("tema", ""), e.get("acuerdos", ""))
                for e in tutoria_entry]
        return "actuaciones", rows
    if isinstance(tutoria_entry, dict) and tutoria_entry:
        rows = [(k, str(v)) for k, v in tutoria_entry.items() if str(v).strip() not in ("", "nan")]
        return "intake", rows
    return "vacio", []


def generar_pdf_ficha_alumnado(info_modulo, al_id, df_al, tutoria_entry=None, attendance_summary=None):
    buffer = io.BytesIO()
    W, H = portrait(A4)
    left_m, right_m, top_m, bottom_m = 2.0 * cm, 1.0 * cm, 2.0 * cm, 1.5 * cm

    doc = BaseDocTemplate(buffer, pagesize=portrait(A4), leftMargin=left_m, rightMargin=right_m,
                           topMargin=top_m, bottomMargin=bottom_m)
    doc.cal_titulo = f"Ficha individual  ·  {info_modulo.get('modulo', 'Módulo')}"
    doc.cal_pie = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    frame = Frame(left_m, bottom_m, W - left_m - right_m, H - top_m - bottom_m, id="main")
    doc.addPageTemplates([PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)])

    styles = getSampleStyleSheet()
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=14, spaceAfter=8, spaceBefore=10)
    norm = ParagraphStyle("Nor", parent=styles["Normal"], fontSize=9, leading=12)
    sml = ParagraphStyle("Sm", parent=styles["Normal"], fontSize=8, leading=10)
    smlB = ParagraphStyle("SmB", parent=styles["Normal"], fontSize=8, leading=10, fontName="Helvetica-Bold", alignment=TA_CENTER)

    ficha = _ficha_alumno(al_id, df_al)
    elements = []
    if not ficha:
        elements.append(Paragraph("Estudiante no encontrado.", norm))
        doc.build(elements)
        buffer.seek(0)
        return buffer

    elements.append(Paragraph(f"{ficha['apellidos']}, {ficha['nombre']}", ParagraphStyle("H1", parent=styles["Heading1"], fontSize=16)))
    ficha_data = [
        [Paragraph("<b>NIF/NIE:</b>", sml), Paragraph(al_id, sml), Paragraph("<b>Edad:</b>", sml), Paragraph(ficha["edad"], sml)],
        [Paragraph("<b>Repite:</b>", sml), Paragraph(ficha["repite"], sml), Paragraph("<b>Estado:</b>", sml), Paragraph(ficha["estado"], sml)],
        [Paragraph("<b>Email:</b>", sml), Paragraph(ficha["email"], sml), Paragraph("<b>Teléfono:</b>", sml), Paragraph(ficha["telefono"], sml)],
        [Paragraph("<b>Observaciones:</b>", sml), Paragraph(ficha["comentarios"], sml), "", ""],
    ]
    t_ficha = Table(ficha_data, colWidths=[3.5 * cm, 5.5 * cm, 3.5 * cm, 5.5 * cm], hAlign="LEFT")
    t_ficha.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_ficha)
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Tutoría", h2))
    modo, filas = _tutoria_rows(tutoria_entry)
    if modo == "actuaciones":
        data = [[Paragraph("<b>Fecha</b>", smlB), Paragraph("<b>Canal</b>", smlB), Paragraph("<b>Ámbito</b>", smlB),
                 Paragraph("<b>Tema</b>", smlB), Paragraph("<b>Acuerdos</b>", smlB)]]
        for fecha, canal, ambito, tema, acuerdos in filas:
            data.append([Paragraph(fecha, sml), Paragraph(canal, sml), Paragraph(ambito, sml),
                         Paragraph(tema, sml), Paragraph(acuerdos, sml)])
        t = Table(data, colWidths=[2.2 * cm, 2.8 * cm, 2.8 * cm, 4.2 * cm, 6 * cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(t)
    elif modo == "intake":
        data = [[Paragraph(k, sml), Paragraph(v, sml)] for k, v in filas]
        t = Table(data, colWidths=[7 * cm, 11 * cm])
        t.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
            ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(t)
    else:
        elements.append(Paragraph("<i>Sin registros de tutoría.</i>", sml))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Asistencia", h2))
    if attendance_summary:
        s = attendance_summary
        elements.append(Paragraph(
            f"Faltas: <b>{s.get('faltas', 0)}</b>  |  Retrasos: <b>{s.get('retrasos', 0)}</b>  |  "
            f"% faltas sobre horas lectivas: <b>{s.get('pct_faltas', 0):.1f}%</b>", norm
        ))
    else:
        elements.append(Paragraph("<i>Datos de asistencia no incluidos en este informe.</i>", sml))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generar_docx_ficha_alumnado(info_modulo, al_id, df_al, tutoria_entry=None, attendance_summary=None):
    from docx_helpers import new_document, add_title, add_meta_line, add_section_heading, add_table, doc_to_bytes

    ficha = _ficha_alumno(al_id, df_al)
    doc = new_document(landscape=False)
    if not ficha:
        add_title(doc, "Ficha individual", info_modulo.get("modulo", "Módulo"))
        doc.add_paragraph("Estudiante no encontrado.")
        return doc_to_bytes(doc)

    add_title(doc, f"{ficha['apellidos']}, {ficha['nombre']}", info_modulo.get("modulo", "Módulo"))
    add_meta_line(doc, f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})")

    add_table(doc, ["NIF/NIE", "Edad", "Repite", "Estado"], [[al_id, ficha["edad"], ficha["repite"], ficha["estado"]]],
               col_widths_cm=[4, 3, 3, 4])
    add_table(doc, ["Email", "Teléfono", "Observaciones"], [[ficha["email"], ficha["telefono"], ficha["comentarios"]]],
               col_widths_cm=[5, 4, 9])

    add_section_heading(doc, "Tutoría")
    modo, filas = _tutoria_rows(tutoria_entry)
    if modo == "actuaciones":
        add_table(doc, ["Fecha", "Canal", "Ámbito", "Tema", "Acuerdos"], [list(f) for f in filas],
                   col_widths_cm=[2.2, 2.8, 2.8, 4.2, 6])
    elif modo == "intake":
        add_table(doc, ["Campo", "Valor"], [list(f) for f in filas], col_widths_cm=[7, 11])
    else:
        doc.add_paragraph("Sin registros de tutoría.")

    add_section_heading(doc, "Asistencia")
    if attendance_summary:
        s = attendance_summary
        doc.add_paragraph(
            f"Faltas: {s.get('faltas', 0)}  |  Retrasos: {s.get('retrasos', 0)}  |  "
            f"% faltas sobre horas lectivas: {s.get('pct_faltas', 0):.1f}%"
        )
    else:
        doc.add_paragraph("Datos de asistencia no incluidos en este informe.")

    return doc_to_bytes(doc)
