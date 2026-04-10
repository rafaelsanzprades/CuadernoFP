# -*- coding: utf-8 -*-
"""
pdf_boletin_grupal.py
PDF A4 vertical — resumen de calificaciones del grupo por trimestre.
Estilo unificado con el resto de informes (Calendario académico).
Columnas: Apellidos | Nombre | Edad | Rep. | [bloques por tipo] | Nota Media
"""
import io
import math
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate,
    Table, TableStyle, Paragraph,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm


def _draw_page_decorations(canv, doc):
    """Cabecera y pie — idéntico al Calendario académico."""
    canv.saveState()
    W, H = portrait(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()


def generar_pdf_boletin_grupal(
    trimestre: str,
    info_modulo: dict,
    df_al: pd.DataFrame,
    df_eval: pd.DataFrame,
    df_act: pd.DataFrame,
):
    buffer = io.BytesIO()
    W, H = portrait(A4)
    margin   = 1.0 * cm
    top_m    = 2.0 * cm
    bottom_m = 1.5 * cm

    doc = BaseDocTemplate(
        buffer,
        pagesize=portrait(A4),
        leftMargin=margin, rightMargin=margin,
        topMargin=top_m, bottomMargin=bottom_m,
    )

    nombre_modulo  = info_modulo.get("modulo", "Módulo")
    doc.cal_titulo = f"Boletín grupal {trimestre}  ·  {nombre_modulo}"
    doc.cal_pie    = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"

    frame = Frame(
        margin, bottom_m,
        W - 2 * margin, H - top_m - bottom_m,
        id="main"
    )
    doc.addPageTemplates([
        PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)
    ])

    styles = getSampleStyleSheet()
    norm  = ParagraphStyle("Nor",  parent=styles["Normal"], fontSize=8, leading=10)
    normB = ParagraphStyle("NorB", parent=styles["Normal"], fontSize=8, leading=10,
                           fontName="Helvetica-Bold")
    sml   = ParagraphStyle("Sm",   parent=styles["Normal"], fontSize=7, leading=9)
    smlB  = ParagraphStyle("SmB",  parent=styles["Normal"], fontSize=7, leading=9,
                           fontName="Helvetica-Bold")

    # ── Pesos de instrumentos ─────────────────────────────────────────────────
    p_teoria   = info_modulo.get("criterio_conocimiento",             30)
    p_practica = info_modulo.get("criterio_procedimiento_practicas",  20)
    p_informes = info_modulo.get("criterio_procedimiento_ejercicios", 20)
    p_cuaderno = info_modulo.get("criterio_tareas",                   30)

    TIPO_MAP = {
        "Teoría":   ("Ex. Teoría",   p_teoria),
        "Práctica": ("Ex. Práctica", p_practica),
        "Informes": ("Informes",     p_informes),
        "Tareas":   ("Cuaderno",     p_cuaderno),
    }
    TIPOS_ORDEN = ["Teoría", "Práctica", "Informes", "Tareas"]

    # ── Actividades del trimestre ─────────────────────────────────────────────
    acts_tri = pd.DataFrame()
    if not df_act.empty:
        tri_col  = ("tri_act"   if "tri_act"   in df_act.columns else
                    "Trimestre" if "Trimestre" in df_act.columns else None)
        tipo_col = ("Tipo"      if "Tipo"      in df_act.columns else
                    "tipo"      if "tipo"      in df_act.columns else None)
        if tri_col and tipo_col:
            mask = (
                (df_act[tri_col] == trimestre) &
                df_act["id_act"].notna() &
                (df_act["id_act"].astype(str).str.strip() != "")
            )
            acts_tri = df_act[mask].copy().sort_values([tipo_col, "id_act"])
            if tipo_col != "Tipo":
                acts_tri = acts_tri.rename(columns={tipo_col: "Tipo"})

    # col_acts: lista de instrumentos ordenados
    col_acts = []
    for tipo in TIPOS_ORDEN:
        if acts_tri.empty:
            break
        for _, row in acts_tri[acts_tri["Tipo"] == tipo].iterrows():
            abrev, peso = TIPO_MAP[tipo]
            col_acts.append({"tipo": tipo, "abrev": abrev, "peso": peso,
                             "id_act": row["id_act"]})

    # Spans por tipo
    tipo_spans = {}
    for c in col_acts:
        tipo_spans[c["tipo"]] = tipo_spans.get(c["tipo"], 0) + 1

    # ── Alumnado ──────────────────────────────────────────────────────────────
    if not df_al.empty:
        if "Estado" in df_al.columns:
            df_al_act = df_al[df_al["Estado"] != "Baja"].copy()
        else:
            df_al_act = df_al.copy()
        df_al_sorted = df_al_act.sort_values("Apellidos").reset_index(drop=True)
    else:
        df_al_sorted = pd.DataFrame()

    # ── Anchuras: tabla ocupa TODO el ancho disponible ───────────────────────
    TOTAL_W  = W - 2 * margin          # ancho disponible en puntos
    W_APELL  = 3.8 * cm
    W_NOMBRE = 2.8 * cm
    W_EDAD   = 0.9 * cm
    W_REP    = 0.8 * cm
    W_NOTA   = 1.4 * cm
    W_FIJOS  = W_APELL + W_NOMBRE + W_EDAD + W_REP + W_NOTA
    W_AVAIL  = TOTAL_W - W_FIJOS
    n_acts   = len(col_acts) or 1
    W_ACT    = W_AVAIL / n_acts        # reparto equitativo, sin límite artificial

    col_widths = (
        [W_APELL, W_NOMBRE, W_EDAD, W_REP]
        + [W_ACT] * len(col_acts)
        + [W_NOTA]
    )

    # ── Fila de cabecera ──────────────────────────────────────────────────────
    row_header = [
        Paragraph("<b>Apellidos</b>", smlB),
        Paragraph("<b>Nombre</b>",    smlB),
        Paragraph("<b>Edad</b>",      smlB),
        Paragraph("<b>Rep.</b>",      smlB),
    ]
    span_cmds = []
    col_offset = 4
    for tipo in TIPOS_ORDEN:
        cnt = tipo_spans.get(tipo, 0)
        if cnt == 0:
            continue
        abrev, peso = TIPO_MAP[tipo]
        row_header.append(Paragraph(f"<b>{abrev}<br/>({peso}%)</b>", smlB))
        for _ in range(cnt - 1):
            row_header.append("")
        if cnt > 1:
            span_cmds.append(("SPAN", (col_offset, 0), (col_offset + cnt - 1, 0)))
        col_offset += cnt
    row_header.append(Paragraph("<b>Nota\nMedia</b>", smlB))

    table_data = [row_header]

    # ── Filas de alumnos ──────────────────────────────────────────────────────
    for _, al in df_al_sorted.iterrows():
        al_id  = al["ID"]
        apells = str(al.get("Apellidos", ""))
        nombre = str(al.get("Nombre", ""))
        _edad  = al.get("Edad", "")
        edad   = str(int(_edad)) if pd.notna(_edad) and str(_edad) not in ("", "nan") else ""
        repite = "Sí" if al.get("Repite", False) else "No"

        if df_eval.empty:
            continue
        mask_ev = df_eval["ID"] == al_id
        if not mask_ev.any():
            continue
        idx_ev = df_eval[mask_ev].index[0]

        notas_tipo = {t: [] for t in TIPOS_ORDEN}
        row_acts   = []
        for c in col_acts:
            act_id = c["id_act"]
            nota   = 0.0
            if act_id in df_eval.columns:
                raw = df_eval.at[idx_ev, act_id]
                if pd.notna(raw):
                    try:
                        nota = float(raw)
                    except (ValueError, TypeError):
                        nota = 0.0
            notas_tipo[c["tipo"]].append(nota)
            row_acts.append(Paragraph(f"{nota:.1f}", sml))

        # Nota media ponderada
        nota_media       = 0.0
        suma_pesos_usados = 0
        for tipo in TIPOS_ORDEN:
            _, peso = TIPO_MAP[tipo]
            vals = notas_tipo[tipo]
            if vals:
                avg = sum(vals) / len(vals)
                nota_media       += avg * (peso / 100.0)
                suma_pesos_usados += peso
        if suma_pesos_usados > 0:
            nota_media = nota_media * (100.0 / suma_pesos_usados)

        row = (
            [Paragraph(apells, norm), Paragraph(nombre, norm),
             Paragraph(edad, sml),    Paragraph(repite, sml)]
            + row_acts
            + [Paragraph(f"<b>{nota_media:.1f}</b>", normB)]
        )
        table_data.append(row)

    # ── Estilo unificado (Calendario académico) ───────────────────────────────
    ts = TableStyle([
        # Cabecera
        ("BACKGROUND",    (0, 0), (-1, 0), colors.white),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.black),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0), 8),
        ("LINEBELOW",     (0, 0), (-1, 0), 1.5, colors.HexColor("#222222")),
        # Cuerpo
        ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 1), (-1, -1), 8),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("ALIGN",         (0, 1), (1, -1),  "LEFT"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("BOX",           (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING",   (0, 0), (-1, -1), 3),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 3),
    ])
    for cmd in span_cmds:
        ts.add(*cmd)

    if len(table_data) <= 1:
        table_data.append(
            ["Sin datos para este trimestre."] + [""] * (len(col_widths) - 1)
        )

    tabla = Table(table_data, colWidths=col_widths, repeatRows=1)
    tabla.setStyle(ts)

    doc.build([tabla])
    buffer.seek(0)
    return buffer
