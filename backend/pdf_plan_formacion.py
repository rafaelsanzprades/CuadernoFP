# -*- coding: utf-8 -*-
"""
pdf_plan_formacion.py
Plan de formación individual en empresa (PDF A4 vertical y .docx): datos del alumno/a y de la empresa, RA y criterios que se
desarrollan en ella con las actividades previstas para cada RA, y firmas. Los datos del plan se guardan en la fila del alumno/a de
df_feoe (campo `plan`: empresa, tutor_empresa, tutor_docente, inicio, fin, horas, actividades por RA); los RA y CE salen de los
criterios designados para la empresa (is_dual, Currículo › Relación RA ← CE). Todo se genera en el equipo del docente.
"""
import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from pdf_helpers import esc

TEXTO_EVALUACION = (
    "La persona tutora de la empresa valora cada resultado de aprendizaje desarrollado en ella como «superado» o «no superado», "
    "con la motivación correspondiente si no se supera, y aporta una valoración cualitativa. El profesorado tutor del centro "
    "integra esa valoración en la evaluación del módulo."
)


def _texto(v, defecto=""):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return defecto
    s = str(v).strip()
    return defecto if s == "" or s.lower() == "nan" else s


def _datos_plan(info_modulo, al_id, df_al, df_feoe, df_ra, df_ce):
    """Reúne todo lo que muestra el documento; lo comparten el PDF y el .docx."""
    nombre = al_id
    if not df_al.empty and "ID" in df_al.columns and al_id in df_al["ID"].values:
        al = df_al[df_al["ID"] == al_id].iloc[0]
        nombre = f"{_texto(al.get('Apellidos'))}, {_texto(al.get('Nombre'))}".strip(", ") or al_id

    plan = {}
    if not df_feoe.empty and "ID" in df_feoe.columns and al_id in df_feoe["ID"].values:
        fila = df_feoe[df_feoe["ID"] == al_id].iloc[0].to_dict()
        plan = fila.get("plan") if isinstance(fila.get("plan"), dict) else {}
    actividades = plan.get("actividades") if isinstance(plan.get("actividades"), dict) else {}

    ces = df_ce.to_dict("records") if not df_ce.empty else []
    ras = df_ra.to_dict("records") if not df_ra.empty else []
    desc_ra = {r.get("id_ra"): _texto(r.get("desc_ra")) for r in ras}
    orden_ra = [r.get("id_ra") for r in ras]
    designados = [c for c in ces if c.get("is_dual") is True]
    ids_ra = sorted({c.get("id_ra") for c in designados}, key=lambda x: orden_ra.index(x) if x in orden_ra else 999)

    bloques = []
    for id_ra in ids_ra:
        bloques.append({
            "id_ra": id_ra,
            "desc_ra": desc_ra.get(id_ra, ""),
            "ces": [f"{c.get('id_ce')} — {_texto(c.get('desc_ce'))}" for c in designados if c.get("id_ra") == id_ra],
            "actividades": _texto(actividades.get(id_ra)),
        })

    return {
        "alumno": nombre,
        "nif": al_id,
        "filas_datos": [
            ("Centro", _texto(info_modulo.get("centro"), "—")),
            ("Módulo", _texto(info_modulo.get("modulo"), "—")),
            ("Alumno/a", nombre),
            ("Empresa", _texto(plan.get("empresa"), "—")),
            ("Tutor/a de la empresa", _texto(plan.get("tutor_empresa"), "—")),
            ("Tutor/a del centro", _texto(plan.get("tutor_docente") or info_modulo.get("profesorado"), "—")),
            ("Periodo", " a ".join(x for x in (_texto(plan.get("inicio")), _texto(plan.get("fin"))) if x) or "—"),
            ("Horas", _texto(plan.get("horas"), "—")),
        ],
        "bloques": bloques,
    }


def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = portrait(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()


def generar_pdf_plan_formacion(info_modulo, al_id, df_al, df_feoe, df_ra, df_ce):
    datos = _datos_plan(info_modulo, al_id, df_al, df_feoe, df_ra, df_ce)
    buffer = io.BytesIO()
    W, H = portrait(A4)
    left_m, right_m, top_m, bottom_m = 2.0 * cm, 1.0 * cm, 2.0 * cm, 1.5 * cm
    doc = BaseDocTemplate(buffer, pagesize=portrait(A4), leftMargin=left_m, rightMargin=right_m, topMargin=top_m, bottomMargin=bottom_m)
    doc.cal_titulo = f"Plan de formación individual  ·  {info_modulo.get('modulo', 'Módulo')}"
    doc.cal_pie = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    frame = Frame(left_m, bottom_m, W - left_m - right_m, H - top_m - bottom_m, id="main")
    doc.addPageTemplates([PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)])

    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=16)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=13, spaceBefore=12, spaceAfter=6)
    norm = ParagraphStyle("Nor", parent=styles["Normal"], fontSize=10, leading=14)
    sml = ParagraphStyle("Sm", parent=styles["Normal"], fontSize=9, leading=12)

    elements = [Paragraph(esc(datos["alumno"]), h1), Paragraph("Plan de formación individual en empresa", norm), Spacer(1, 8)]

    t_datos = Table([[Paragraph(f"<b>{esc(k)}</b>", sml), Paragraph(esc(v), sml)] for k, v in datos["filas_datos"]], colWidths=[4.5 * cm, 13.5 * cm])
    t_datos.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f0f0f0")), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_datos)

    elements.append(Paragraph("Resultados de aprendizaje que se desarrollan en la empresa", h2))
    if not datos["bloques"]:
        elements.append(Paragraph("<i>Ningún criterio de evaluación está designado para la empresa (Currículo › Relación RA ← CE).</i>", sml))
    else:
        filas = [[Paragraph("<b>RA y criterios</b>", sml), Paragraph("<b>Actividades previstas en la empresa</b>", sml)]]
        for b in datos["bloques"]:
            ces = "<br/>".join(esc(c) for c in b["ces"])
            izq = f"<b>{esc(b['id_ra'])}</b>. {esc(b['desc_ra'])}<br/><font size='8'>{ces}</font>"
            filas.append([Paragraph(izq, sml), Paragraph(esc(b["actividades"]) or "<i>Por concretar</i>", sml)])
        t_ra = Table(filas, colWidths=[9.5 * cm, 8.5 * cm])
        t_ra.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")), ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")), ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_ra)

    elements.append(Paragraph("Seguimiento y evaluación", h2))
    elements.append(Paragraph(esc(TEXTO_EVALUACION), norm))
    elements.append(Spacer(1, 40))
    firmas = Table([[Paragraph("Tutor/a de la empresa", sml), Paragraph("Tutor/a del centro", sml), Paragraph("Alumno/a", sml)],
                    ["", "", ""]], colWidths=[6 * cm, 6 * cm, 6 * cm], rowHeights=[None, 1.6 * cm])
    firmas.setStyle(TableStyle([("LINEABOVE", (0, 1), (-1, 1), 0.5, colors.HexColor("#222222")), ("ALIGN", (0, 0), (-1, 0), "CENTER")]))
    elements.append(firmas)

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generar_docx_plan_formacion(info_modulo, al_id, df_al, df_feoe, df_ra, df_ce):
    from docx_helpers import new_document, add_title, add_meta_line, add_section_heading, add_table, doc_to_bytes

    datos = _datos_plan(info_modulo, al_id, df_al, df_feoe, df_ra, df_ce)
    doc = new_document(landscape=False)
    add_title(doc, datos["alumno"], "Plan de formación individual en empresa")
    add_meta_line(doc, f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})")
    add_table(doc, ["Dato", "Valor"], [[k, v] for k, v in datos["filas_datos"]], col_widths_cm=[5, 13])

    add_section_heading(doc, "Resultados de aprendizaje que se desarrollan en la empresa")
    if not datos["bloques"]:
        doc.add_paragraph("Ningún criterio de evaluación está designado para la empresa (Currículo › Relación RA ← CE).")
    else:
        add_table(doc, ["RA y criterios", "Actividades previstas en la empresa"],
                  [[f"{b['id_ra']}. {b['desc_ra']}\n" + "\n".join(b["ces"]), b["actividades"] or "Por concretar"] for b in datos["bloques"]],
                  col_widths_cm=[9.5, 8.5])

    add_section_heading(doc, "Seguimiento y evaluación")
    doc.add_paragraph(TEXTO_EVALUACION)
    add_table(doc, ["Tutor/a de la empresa", "Tutor/a del centro", "Alumno/a"], [["\n\n\n", "\n\n\n", "\n\n\n"]], col_widths_cm=[6, 6, 6])
    return doc_to_bytes(doc)
