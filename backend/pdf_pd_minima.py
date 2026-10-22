"""PD- (resumen para el alumnado) en PDF, con el mismo contenido y diseño que el .docx de generador_pd_minima_tpl.

Se dibuja con ReportLab (Helvetica = Arial en PDF) para poder verlo en el visor de la app sin Word ni LibreOffice.
El texto sale de generador_pd_minima_tpl._build_context, así que ambos formatos no pueden diverger.
"""
import io
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import BaseDocTemplate, Frame, NextPageTemplate, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle

from generador_pd_minima_tpl import _build_context

R, B, I = "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"
GRIS = colors.HexColor("#F0F0F0")

_BASE = ParagraphStyle("base", fontName=R, fontSize=9, leading=11.5, spaceAfter=2)
_TITULO = ParagraphStyle("titulo", parent=_BASE, fontName=B, fontSize=12, leading=15, alignment=TA_CENTER)
_CABECERA = ParagraphStyle("cab", parent=_BASE, alignment=TA_CENTER, spaceAfter=12)
_H1 = ParagraphStyle("h1", parent=_BASE, fontName=B, fontSize=9, leading=11.5, spaceBefore=6, spaceAfter=2)
_TEXTO = ParagraphStyle("txt", parent=_BASE, leftIndent=0.5 * cm)
_RA = ParagraphStyle("ra", parent=_BASE, leftIndent=0.5 * cm)
_REL = ParagraphStyle("rel", parent=_BASE, fontName=I, leftIndent=1.0 * cm)
_H_PLAN = ParagraphStyle("hplan", parent=_BASE, fontName=B, fontSize=12, leading=15, spaceAfter=6)


def _p(texto, estilo):
    return Paragraph(escape(str(texto)).replace("\n", "<br/>"), estilo)


def _linea_con_etiqueta(texto, estilo):
    """«RA1. (60%) descripción» / «UD01. (22h) nombre» con la etiqueta en negrita."""
    m = re.match(r"^((?:RA|UD)\d+\.(?: \([^)]*\))?)(.*)$", texto, re.S)
    if not m:
        return _p(texto, estilo)
    return Paragraph(f"<b>{escape(m.group(1))}</b>{escape(m.group(2))}", estilo)


def _tabla_instrumentos(ctx):
    filas = [["Instrumentos", f"1er Tri. ({ctx['pond_1t']}%)", f"2º Tri. ({ctx['pond_2t']}%)", f"3er Tri. ({ctx['pond_3t']}%)"]]
    for f in ctx["list_instrumentos"]:
        filas.append([f["nombre"], f["pct_1t"], f["pct_2t"], f["pct_3t"]])
    t = Table(filas, colWidths=[5.5 * cm, 4 * cm, 4 * cm, 4 * cm])
    t.setStyle(TableStyle([
        ("FONT", (0, 0), (-1, 0), B, 9), ("FONT", (0, 1), (-1, -1), R, 9),
        ("BACKGROUND", (0, 0), (-1, 0), GRIS), ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def _tabla_planificacion(data, ancho):
    from planning_generator import generate_planning, MESES_DISPLAY as meses

    filas = generate_planning(data.get("df_ud") or [], data.get("info_fechas") or {}, data.get("horario") or {}, data.get("calendar_notes") or {})
    desc = {str(u.get("id_ud", "")): u.get("desc_ud", "") for u in data.get("df_ud") or []}

    def etiqueta(f):
        uid = str(f.get("id_ud", ""))
        if uid == "Sin docencia":
            return uid
        d = f.get("desc_ud") or desc.get(uid, "")
        return f"{uid}. {d}" if d else uid

    def entero(v):
        v = v or 0
        return str(int(v)) if float(v).is_integer() else str(v)

    celda_ud = ParagraphStyle("cu", fontName=B, fontSize=10, leading=11.5)
    datos = [["Tri.", "UD. Unidad didáctica", "Prev."] + list(meses)]
    for f in filas:
        ev = f.get("ev")
        fila = [f"{ev}ª" if ev else "", Paragraph(escape(etiqueta(f)), celda_ud), entero(f.get("horas_ud")) if f.get("horas_ud") else ""]
        for m in meses:
            prv = int(f.get(f"{m}_Prv", 0) or 0)
            fila.append(str(prv) if prv else "")
        datos.append(fila)
    anchos = [1.2 * cm, 10 * cm, 1.6 * cm] + [1.2 * cm] * len(meses)
    t = Table(datos, colWidths=anchos, repeatRows=1)
    t.setStyle(TableStyle([
        ("FONT", (0, 0), (-1, 0), B, 12), ("FONT", (0, 1), (0, -1), B, 12), ("FONT", (2, 1), (2, -1), B, 12), ("FONT", (3, 1), (-1, -1), R, 12),
        ("BACKGROUND", (0, 0), (-1, 0), GRIS), ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"), ("ALIGN", (1, 0), (1, 0), "LEFT"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def generar_pdf(data: dict) -> bytes:
    ctx = _build_context(data)
    buf = io.BytesIO()
    doc = BaseDocTemplate(buf, pagesize=letter, title="Resumen de la Programación didáctica para el alumnado")
    ver = letter
    hor = landscape(letter)
    doc.addPageTemplates([
        PageTemplate("vertical", frames=[Frame(2 * cm, 1 * cm, ver[0] - 3 * cm, ver[1] - 2 * cm, id="v", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], pagesize=ver),
        PageTemplate("apaisada", frames=[Frame(1.5 * cm, 1.5 * cm, hor[0] - 3 * cm, hor[1] - 3 * cm, id="h", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], pagesize=hor),
    ])

    s = [_p("Resumen de la Programación didáctica para el alumnado", _TITULO), Spacer(1, 4)]
    cab = (f"<b>Módulo:</b> {escape(ctx['modulo'])}<br/>"
           f"<b>Título:</b> {escape(ctx['ciclo'])}. <b>Grupo:</b> {escape(ctx['grupo'])}. <b>Curso:</b> {escape(ctx['curso_academico'])}<br/>"
           f"<b>Centro:</b> {escape(ctx['centro_linea'])}. <b>Departamento:</b> {escape(ctx['departamento_area'])}")
    s.append(Paragraph(cab, _CABECERA))

    s += [_p("¿En qué seré competente?", _H1), _p(ctx["texto_competencia_general"], _TEXTO)]
    s.append(_p("¿Qué sabré hacer? Se le denomina: Resultados de Aprendizaje", _H1))
    for linea in ctx["list_ras"]:
        s.append(_p(linea, _REL) if re.match(r"^UD\d+\s*\(", linea.strip()) else _linea_con_etiqueta(linea, _RA))
    s.append(_p("¿Qué aprenderé? Son los Contenidos mínimos", _H1))
    for linea in ctx["list_uds"]:
        s.append(_linea_con_etiqueta(linea, _RA))
    s.append(_p("¿Cómo aprobaré el módulo? Criterios de evaluación y calificación del módulo", _H1))
    s += [_tabla_instrumentos(ctx), Spacer(1, 8)]
    s += [_p("Recordad:", _H1), _p(ctx["texto_recordatorio"], _TEXTO)]

    s += [NextPageTemplate("apaisada"), PageBreak(), _p("Previsión de planificación mensual", _H_PLAN),
          _tabla_planificacion(data, hor[0] - 3 * cm)]
    doc.build(s)
    return buf.getvalue()
