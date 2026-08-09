# -*- coding: utf-8 -*-
"""
pdf_boletin_grupal.py
PDF A4 vertical - resumen de calificaciones del grupo por trimestre.
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
    """Cabecera y pie - idéntico al Calendario académico."""
    canv.saveState()
    W, H = portrait(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()


def _compute_grupal_rows(trimestre: str, info_modulo: dict, df_al: pd.DataFrame,
                          df_eval: pd.DataFrame, df_act: pd.DataFrame):
    """Lógica pura (sin ReportLab) compartida por el PDF y el DOCX: pesos de
    instrumentos, actividades del trimestre y nota media ponderada por
    alumno. Devuelve (TIPO_MAP, TIPOS_ORDEN, filas) donde cada fila es
    {idx, alumnado, edad, repite, notas_por_tipo: [...], nota_media}."""
    p_teoria = info_modulo.get("criterio_conocimiento", 30)
    p_practica = info_modulo.get("criterio_procedimiento_practicas", 20)
    p_informes = info_modulo.get("criterio_procedimiento_ejercicios", 20)
    p_cuaderno = info_modulo.get("criterio_tareas", 30)

    TIPO_MAP = {
        "Teoria": ("Ex. Teoría", p_teoria),
        "Practica": ("Ex. Práctica", p_practica),
        "Informes": ("Informes", p_informes),
        "Tareas": ("Cuaderno", p_cuaderno),
    }
    TIPOS_ORDEN = ["Teoria", "Practica", "Informes", "Tareas"]

    acts_tri = pd.DataFrame()
    if not df_act.empty:
        tri_col = ("tri_act" if "tri_act" in df_act.columns else
                   "Trimestre" if "Trimestre" in df_act.columns else None)
        tipo_col = ("Tipo" if "Tipo" in df_act.columns else
                    "tipo" if "tipo" in df_act.columns else None)
        if tri_col and tipo_col:
            mask = (
                (df_act[tri_col] == trimestre) &
                df_act["id_act"].notna() &
                (df_act["id_act"].astype(str).str.strip() != "")
            )
            acts_tri = df_act[mask].copy().sort_values([tipo_col, "id_act"])
            if tipo_col != "Tipo":
                acts_tri = acts_tri.rename(columns={tipo_col: "Tipo"})

    actividades_por_tipo = {t: [] for t in TIPOS_ORDEN}
    if not acts_tri.empty:
        for t in TIPOS_ORDEN:
            actividades_por_tipo[t] = acts_tri[acts_tri["Tipo"] == t]["id_act"].tolist()

    cuaderno_col = f"{trimestre}_Cuaderno"
    if not df_eval.empty and cuaderno_col in df_eval.columns:
        if cuaderno_col not in actividades_por_tipo["Tareas"]:
            actividades_por_tipo["Tareas"].append(cuaderno_col)

    if not df_al.empty:
        df_al_act = df_al[df_al["Estado"] != "Baja"].copy() if "Estado" in df_al.columns else df_al.copy()
        df_al_sorted = df_al_act.sort_values("Apellidos").reset_index(drop=True)
    else:
        df_al_sorted = pd.DataFrame()

    filas = []
    for idx_lista, (_, al) in enumerate(df_al_sorted.iterrows(), start=1):
        al_id = al["ID"]
        if df_eval.empty:
            continue
        mask_ev = df_eval["ID"] == al_id
        if not mask_ev.any():
            continue
        idx_ev = df_eval[mask_ev].index[0]

        notas_por_tipo = []
        nota_media = 0.0
        suma_pesos_usados = 0
        for tipo in TIPOS_ORDEN:
            _, peso = TIPO_MAP[tipo]
            vals = []
            for act_id in actividades_por_tipo[tipo]:
                if act_id in df_eval.columns:
                    raw = df_eval.at[idx_ev, act_id]
                    if pd.notna(raw):
                        try:
                            vals.append(float(raw))
                        except (ValueError, TypeError):
                            pass
            avg = 0.0
            if vals:
                avg = sum(vals) / len(vals)
                nota_media += avg * (peso / 100.0)
                suma_pesos_usados += peso
            notas_por_tipo.append(avg)

        if suma_pesos_usados > 0:
            nota_media = nota_media * (100.0 / suma_pesos_usados)

        _edad = al.get("Edad", "")
        edad = str(int(_edad)) if pd.notna(_edad) and str(_edad) not in ("", "nan") else ""
        apells = str(al.get("Apellidos", ""))
        nombre = str(al.get("Nombre", ""))
        filas.append({
            "idx": idx_lista,
            "alumnado": f"{apells}, {nombre}" if nombre else apells,
            "edad": edad,
            "repite": "Sí" if al.get("Repite") else "No",
            "notas_por_tipo": notas_por_tipo,
            "nota_media": nota_media,
        })

    return TIPO_MAP, TIPOS_ORDEN, filas


def generar_pdf_boletin_grupal(
    trimestre: str,
    info_modulo: dict,
    df_al: pd.DataFrame,
    df_eval: pd.DataFrame,
    df_act: pd.DataFrame,
    fecha_corte: str = None
):
    buffer = io.BytesIO()
    W, H = portrait(A4)
    left_m   = 2.0 * cm
    right_m  = 1.0 * cm
    top_m    = 2.0 * cm
    bottom_m = 1.5 * cm

    doc = BaseDocTemplate(
        buffer,
        pagesize=portrait(A4),
        leftMargin=left_m, rightMargin=right_m,
        topMargin=top_m, bottomMargin=bottom_m,
    )

    nombre_modulo  = info_modulo.get("modulo", "Módulo")
    doc.cal_titulo = f"Boletín grupal {trimestre}  ·  {nombre_modulo}"
    
    pie_text = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    if fecha_corte:
        pie_text = f"Fecha de acta: {fecha_corte} | {pie_text}"
    doc.cal_pie = pie_text

    frame = Frame(
        left_m, bottom_m,
        W - left_m - right_m, H - top_m - bottom_m,
        id="main"
    )
    doc.addPageTemplates([
        PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)
    ])

    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    styles = getSampleStyleSheet()
    norm  = ParagraphStyle("Nor",  parent=styles["Normal"], fontSize=9, leading=11)
    normB = ParagraphStyle("NorB", parent=styles["Normal"], fontSize=9, leading=11,
                           fontName="Helvetica-Bold", alignment=TA_CENTER)
    sml   = ParagraphStyle("Sm",   parent=styles["Normal"], fontSize=8, leading=10, alignment=TA_CENTER)
    smlB  = ParagraphStyle("SmB",  parent=styles["Normal"], fontSize=8, leading=10,
                           fontName="Helvetica-Bold", alignment=TA_CENTER)
    smlB_left = ParagraphStyle("SmBL", parent=styles["Normal"], fontSize=8, leading=10,
                               fontName="Helvetica-Bold", alignment=TA_LEFT)

    TIPO_MAP, TIPOS_ORDEN, filas = _compute_grupal_rows(trimestre, info_modulo, df_al, df_eval, df_act)

    # ── Anchuras: tabla con anchos forzados a 18cm total ─────────────────────
    W_NUM    = 1.0 * cm               # Número de lista
    W_ALUMNADO = 5.0 * cm               # Apellidos, Nombre
    W_EDAD   = 1.0 * cm
    W_REP    = 1.0 * cm
    W_ACT    = 2.0 * cm               # x4 instrumentos
    W_NOTA   = 2.0 * cm

    col_widths = (
        [W_NUM, W_ALUMNADO, W_EDAD, W_REP]
        + [W_ACT] * len(TIPOS_ORDEN)
        + [W_NOTA]
    )

    # ── Fila de cabecera ──────────────────────────────────────────────────────
    row_header = [
        Paragraph("<b>Nº</b>",                smlB),
        Paragraph("<b>Apellidos, Nombre</b>", smlB_left),
        Paragraph("<b>Edad</b>",              smlB),
        Paragraph("<b>Rep.</b>",              smlB),
    ]
    for tipo in TIPOS_ORDEN:
        abrev, peso = TIPO_MAP[tipo]
        row_header.append(Paragraph(f"<b>{abrev}<br/>({peso}%)</b>", smlB))
        
    row_header.append(Paragraph(f"<b>Nota<br/>Media {trimestre}</b>", smlB))
    table_data = [row_header]

    # ── Filas de alumnado ──────────────────────────────────────────────────────
    for f in filas:
        row_acts = [Paragraph(f"{v:.1f}", sml) for v in f["notas_por_tipo"]]
        row = (
            [Paragraph(str(f["idx"]), sml),
             Paragraph(f["alumnado"], norm),
             Paragraph(f["edad"], sml), Paragraph(f["repite"], sml)]
            + row_acts
            + [Paragraph(f"<b>{f['nota_media']:.1f}</b>", normB)]
        )
        table_data.append(row)

    # ── Estilo unificado (Calendario académico) ───────────────────────────────
    ts = TableStyle([
        # Cabecera
        ("BACKGROUND",    (0, 0), (-1, 0), colors.white),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.black),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0), 9),
        ("LINEBELOW",     (0, 0), (-1, 0), 1.5, colors.HexColor("#222222")),
        # Cuerpo
        ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 1), (-1, -1), 9),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),  # Centrar todo por defecto
        ("ALIGN",         (1, 1), (1, -1),  "LEFT"),    # Alinear a la izquierda solo 'Apellidos, Nombre' (columna 1)
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("BOX",           (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING",   (0, 0), (-1, -1), 3),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 3),
    ])

    if len(table_data) <= 1:
        table_data.append(
            ["Sin datos para este trimestre."] + [""] * (len(col_widths) - 1)
        )

    tabla = Table(table_data, colWidths=col_widths, repeatRows=1)
    tabla.setStyle(ts)

    doc.build([tabla])
    buffer.seek(0)
    return buffer

def _compute_grupal_final_rows(info_modulo: dict, df_al: pd.DataFrame,
                                df_eval: pd.DataFrame, df_act: pd.DataFrame):
    """Lógica pura compartida por el PDF y el DOCX del boletín final: nota
    media ponderada de cada trimestre + nota final ordinaria por alumno.
    Devuelve (pond_1t, pond_2t, pond_3t, filas), fila =
    {idx, alumnado, edad, repite, notas_tri: {1T,2T,3T}, nota_final_ord}."""
    p_teoria = info_modulo.get("criterio_conocimiento", 30)
    p_practica = info_modulo.get("criterio_procedimiento_practicas", 20)
    p_informes = info_modulo.get("criterio_procedimiento_ejercicios", 20)
    p_cuaderno = info_modulo.get("criterio_tareas", 30)
    TIPO_MAP = {
        "Teoria": ("Ex. Teoría", p_teoria),
        "Practica": ("Ex. Práctica", p_practica),
        "Informes": ("Informes", p_informes),
        "Tareas": ("Cuaderno", p_cuaderno),
    }
    TIPOS_ORDEN = ["Teoria", "Practica", "Informes", "Tareas"]

    pond_1t = info_modulo.get("pond_1t", 30)
    pond_2t = info_modulo.get("pond_2t", 30)
    pond_3t = info_modulo.get("pond_3t", 40)
    total_pond = pond_1t + pond_2t + pond_3t
    if total_pond == 0:
        pond_1t, pond_2t, pond_3t = 33.33, 33.33, 33.34
        total_pond = 100.0

    acts_por_tri = {"1T": {}, "2T": {}, "3T": {}}
    for tri in ["1T", "2T", "3T"]:
        acts_tri = pd.DataFrame()
        if not df_act.empty:
            tri_col = ("tri_act" if "tri_act" in df_act.columns else "Trimestre" if "Trimestre" in df_act.columns else None)
            tipo_col = ("Tipo" if "Tipo" in df_act.columns else "tipo" if "tipo" in df_act.columns else None)
            if tri_col and tipo_col:
                mask = ((df_act[tri_col] == tri) & df_act["id_act"].notna() & (df_act["id_act"].astype(str).str.strip() != ""))
                acts_tri = df_act[mask].copy()
                if tipo_col != "Tipo":
                    acts_tri = acts_tri.rename(columns={tipo_col: "Tipo"})
        acts_por_tipo = {t: [] for t in TIPOS_ORDEN}
        if not acts_tri.empty:
            for t in TIPOS_ORDEN:
                acts_por_tipo[t] = acts_tri[acts_tri["Tipo"] == t]["id_act"].tolist()
        cuaderno_col = f"{tri}_Cuaderno"
        if not df_eval.empty and cuaderno_col in df_eval.columns:
            if cuaderno_col not in acts_por_tipo["Tareas"]:
                acts_por_tipo["Tareas"].append(cuaderno_col)
        acts_por_tri[tri] = acts_por_tipo

    if not df_al.empty:
        df_al_act = df_al[df_al["Estado"] != "Baja"].copy() if "Estado" in df_al.columns else df_al.copy()
        df_al_sorted = df_al_act.sort_values("Apellidos").reset_index(drop=True)
    else:
        df_al_sorted = pd.DataFrame()

    filas = []
    for idx_lista, (_, al) in enumerate(df_al_sorted.iterrows(), start=1):
        al_id = al["ID"]
        if df_eval.empty:
            continue
        mask_ev = df_eval["ID"] == al_id
        if not mask_ev.any():
            continue
        idx_ev = df_eval[mask_ev].index[0]

        notas_tri = {}
        for tri in ["1T", "2T", "3T"]:
            nota_tri = 0.0
            suma_pesos_tri = 0
            for tipo in TIPOS_ORDEN:
                _, peso = TIPO_MAP[tipo]
                vals = []
                for act_id in acts_por_tri[tri][tipo]:
                    if act_id in df_eval.columns:
                        raw = df_eval.at[idx_ev, act_id]
                        if pd.notna(raw):
                            try:
                                vals.append(float(raw))
                            except (ValueError, TypeError):
                                pass
                if vals:
                    avg = sum(vals) / len(vals)
                    nota_tri += avg * (peso / 100.0)
                    suma_pesos_tri += peso
            if suma_pesos_tri > 0:
                nota_tri = nota_tri * (100.0 / suma_pesos_tri)
            notas_tri[tri] = nota_tri

        _edad = al.get("Edad", "")
        edad = str(int(_edad)) if pd.notna(_edad) and str(_edad) not in ("", "nan") else ""
        apells = str(al.get("Apellidos", ""))
        nombre = str(al.get("Nombre", ""))
        nota_final_ord = (
            notas_tri["1T"] * (pond_1t / total_pond) +
            notas_tri["2T"] * (pond_2t / total_pond) +
            notas_tri["3T"] * (pond_3t / total_pond)
        )
        nota_final_extra = None
        if "Nota_Final_FE" in df_eval.columns:
            raw_fe = df_eval.at[idx_ev, "Nota_Final_FE"]
            if pd.notna(raw_fe):
                try:
                    nota_final_extra = float(raw_fe)
                except (ValueError, TypeError):
                    nota_final_extra = None
        filas.append({
            "idx": idx_lista,
            "alumnado": f"{apells}, {nombre}" if nombre else apells,
            "edad": edad,
            "repite": "Sí" if al.get("Repite") else "No",
            "notas_tri": notas_tri,
            "nota_final_ord": nota_final_ord,
            "nota_final_extra": nota_final_extra,
        })

    return pond_1t, pond_2t, pond_3t, filas


def generar_pdf_boletin_grupal_final(
    info_modulo: dict,
    df_al: pd.DataFrame,
    df_eval: pd.DataFrame,
    df_act: pd.DataFrame,
    fecha_corte: str = None
):
    buffer = io.BytesIO()
    W, H = portrait(A4)
    left_m   = 2.0 * cm
    right_m  = 1.0 * cm
    top_m    = 2.0 * cm
    bottom_m = 1.5 * cm

    doc = BaseDocTemplate(
        buffer,
        pagesize=portrait(A4),
        leftMargin=left_m, rightMargin=right_m,
        topMargin=top_m, bottomMargin=bottom_m,
    )

    nombre_modulo  = info_modulo.get("modulo", "Módulo")
    doc.cal_titulo = f"Boletín grupal Final  ·  {nombre_modulo}"
    
    pie_text = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    if fecha_corte:
        pie_text = f"Fecha de acta: {fecha_corte} | {pie_text}"
    doc.cal_pie = pie_text

    frame = Frame(left_m, bottom_m, W - left_m - right_m, H - top_m - bottom_m, id="main")
    doc.addPageTemplates([PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)])

    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    styles = getSampleStyleSheet()
    norm  = ParagraphStyle("Nor",  parent=styles["Normal"], fontSize=9, leading=11)
    normB = ParagraphStyle("NorB", parent=styles["Normal"], fontSize=9, leading=11, fontName="Helvetica-Bold", alignment=TA_CENTER)
    sml   = ParagraphStyle("Sm",   parent=styles["Normal"], fontSize=8, leading=10, alignment=TA_CENTER)
    smlB  = ParagraphStyle("SmB",  parent=styles["Normal"], fontSize=8, leading=10, fontName="Helvetica-Bold", alignment=TA_CENTER)
    smlB_left = ParagraphStyle("SmBL", parent=styles["Normal"], fontSize=8, leading=10, fontName="Helvetica-Bold", alignment=TA_LEFT)

    pond_1t, pond_2t, pond_3t, filas = _compute_grupal_final_rows(info_modulo, df_al, df_eval, df_act)

    # ── Anchuras: tabla con anchos forzados a 18cm total ─────────────────────
    W_NUM    = 1.0 * cm               
    W_ALUMNADO = 5.0 * cm               
    W_EDAD   = 1.0 * cm
    W_REP    = 1.0 * cm
    W_TRI    = 2.0 * cm               
    W_FINALO = 2.0 * cm
    W_FINALE = 2.0 * cm
    # 1 + 5 + 1 + 1 + 2x3 + 2x2 = 18.0 cm
    col_widths = [W_NUM, W_ALUMNADO, W_EDAD, W_REP, W_TRI, W_TRI, W_TRI, W_FINALO, W_FINALE]

    # ── Fila de cabecera
    row_header = [
        Paragraph("<b>Nº</b>",                smlB),
        Paragraph("<b>Apellidos, Nombre</b>", smlB_left),
        Paragraph("<b>Edad</b>",              smlB),
        Paragraph("<b>Rep.</b>",              smlB),
        Paragraph(f"<b>Media 1T<br/>({pond_1t}%)</b>", smlB),
        Paragraph(f"<b>Media 2T<br/>({pond_2t}%)</b>", smlB),
        Paragraph(f"<b>Media 3T<br/>({pond_3t}%)</b>", smlB),
        Paragraph("<b>Final<br/>Ord.</b>", smlB),
        Paragraph("<b>Final<br/>ExtraOrd.</b>", smlB),
    ]
    table_data = [row_header]

    # ── Filas de alumnado
    for f in filas:
        nt = f["notas_tri"]
        row = [
            Paragraph(str(f["idx"]), sml),
            Paragraph(f["alumnado"], norm),
            Paragraph(f["edad"], sml),
            Paragraph(f["repite"], sml),
            Paragraph(f"{nt['1T']:.1f}", sml),
            Paragraph(f"{nt['2T']:.1f}", sml),
            Paragraph(f"{nt['3T']:.1f}", sml),
            Paragraph(f"<b>{f['nota_final_ord']:.1f}</b>", normB),
            Paragraph(f"<b>{f['nota_final_extra']:.1f}</b>" if f["nota_final_extra"] is not None else "", sml),
        ]
        table_data.append(row)

    ts = TableStyle([
        # Cabecera
        ("BACKGROUND",    (0, 0), (-1, 0), colors.white),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.black),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0), 9),
        ("LINEBELOW",     (0, 0), (-1, 0), 1.5, colors.HexColor("#222222")),
        # Cuerpo
        ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 1), (-1, -1), 9),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),  
        ("ALIGN",         (1, 1), (1, -1),  "LEFT"),    
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("BOX",           (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING",   (0, 0), (-1, -1), 3),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 3),
    ])

    if len(table_data) <= 1:
        table_data.append(["Sin datos para el boletín final."] + [""] * (len(col_widths) - 1))

    tabla = Table(table_data, colWidths=col_widths, repeatRows=1)
    tabla.setStyle(ts)
    doc.build([tabla])
    buffer.seek(0)
    return buffer


def generar_docx_boletin_grupal(trimestre, info_modulo, df_al, df_eval, df_act, fecha_corte=None):
    from docx_helpers import new_document, add_title, add_meta_line, add_table, doc_to_bytes

    TIPO_MAP, TIPOS_ORDEN, filas = _compute_grupal_rows(trimestre, info_modulo, df_al, df_eval, df_act)

    doc = new_document(landscape=False)
    add_title(doc, f"Boletín grupal {trimestre}", info_modulo.get("modulo", "Módulo"))
    meta = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    if fecha_corte:
        meta = f"Fecha de acta: {fecha_corte} | {meta}"
    add_meta_line(doc, meta)

    headers = ["Nº", "Apellidos, Nombre", "Edad", "Rep."] + \
        [f"{TIPO_MAP[t][0]} ({TIPO_MAP[t][1]}%)" for t in TIPOS_ORDEN] + [f"Nota media {trimestre}"]
    rows = []
    for f in filas:
        rows.append([f["idx"], f["alumnado"], f["edad"], f["repite"]] +
                     [f"{v:.1f}" for v in f["notas_por_tipo"]] + [f"{f['nota_media']:.1f}"])
    if not rows:
        rows.append(["Sin datos para este trimestre."] + [""] * (len(headers) - 1))
    add_table(doc, headers, rows, col_widths_cm=[1, 5] + [1.5] * (len(headers) - 2))

    return doc_to_bytes(doc)


def generar_docx_boletin_grupal_final(info_modulo, df_al, df_eval, df_act, fecha_corte=None):
    from docx_helpers import new_document, add_title, add_meta_line, add_table, doc_to_bytes

    pond_1t, pond_2t, pond_3t, filas = _compute_grupal_final_rows(info_modulo, df_al, df_eval, df_act)

    doc = new_document(landscape=False)
    add_title(doc, "Boletín grupal Final", info_modulo.get("modulo", "Módulo"))
    meta = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"
    if fecha_corte:
        meta = f"Fecha de acta: {fecha_corte} | {meta}"
    add_meta_line(doc, meta)

    headers = ["Nº", "Apellidos, Nombre", "Edad", "Rep.",
               f"Media 1T ({pond_1t}%)", f"Media 2T ({pond_2t}%)", f"Media 3T ({pond_3t}%)",
               "Final Ord.", "Final ExtraOrd."]
    rows = []
    for f in filas:
        nt = f["notas_tri"]
        nota_extra_str = f"{f['nota_final_extra']:.1f}" if f["nota_final_extra"] is not None else ""
        rows.append([f["idx"], f["alumnado"], f["edad"], f["repite"],
                     f"{nt['1T']:.1f}", f"{nt['2T']:.1f}", f"{nt['3T']:.1f}",
                     f"{f['nota_final_ord']:.1f}", nota_extra_str])
    if not rows:
        rows.append(["Sin datos para el boletín final."] + [""] * (len(headers) - 1))
    add_table(doc, headers, rows, col_widths_cm=[1, 5] + [1.6] * (len(headers) - 2))

    return doc_to_bytes(doc)

