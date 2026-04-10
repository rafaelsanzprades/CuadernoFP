import io
import pandas as pd
from datetime import timedelta
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus.flowables import Flowable

def get_sigad_info(nota):
    n = round(nota)
    if nota < 5:   return n, "IN", "Insuficiente",  colors.HexColor("#e74c3c")
    elif nota < 6: return n, "SU", "Suficiente",    colors.HexColor("#e67e22")
    elif nota < 7: return n, "BI", "Bien",          colors.HexColor("#3498db")
    elif nota < 9: return n, "NT", "Notable",       colors.HexColor("#2ecc71")
    else:          return n, "SB", "Sobresaliente", colors.HexColor("#1abc9c")

def get_progress_color(prop):
    if prop >= 100: return colors.HexColor("#198754")
    elif prop >= 80: return colors.HexColor("#0d6efd")
    elif prop >= 50: return colors.HexColor("#ffc107")
    else: return colors.HexColor("#dc3545")

class ProgressBar(Flowable):
    def __init__(self, width, height, percent, color):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.percent = percent
        self.color = color

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(colors.HexColor("#dddddd"))
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        
        fill_w = min(self.width, (self.percent / 100.0) * self.width)
        self.canv.setFillColor(self.color)
        if fill_w > 0:
            self.canv.rect(0, 0, fill_w, self.height, fill=1, stroke=0)
        
        self.canv.setFillColor(colors.white)
        self.canv.setFont("Helvetica-Bold", 8)
        self.canv.drawRightString(self.width - 2, 2, f"{int(self.percent)}%")
        self.canv.restoreState()

def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = portrait(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, f"Boletín competencial. {doc.nombre_modulo}")
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.pie_texto)
    canv.restoreState()

def generar_pdf_boletin(info_modulo, info_fechas, df_al, df_eval, df_ra, df_ud, df_pr, planning_ledger, df_ce=None, df_act=None, df_feoe=None):
    buffer = io.BytesIO()
    W, H = portrait(A4)
    margin = 1.5 * cm
    top_margin = 2.5 * cm
    bottom_margin = 1.5 * cm

    doc = BaseDocTemplate(
        buffer, pagesize=portrait(A4),
        rightMargin=margin, leftMargin=margin,
        topMargin=top_margin, bottomMargin=bottom_margin,
    )

    doc.nombre_modulo = info_modulo.get("modulo", "Módulo")
    doc.pie_texto = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"

    frame = Frame(margin, bottom_margin, W - 2*margin, H - top_margin - bottom_margin, id='main')
    template = PageTemplate(id='bol', frames=[frame], onPage=_draw_page_decorations)
    doc.addPageTemplates([template])

    styles = getSampleStyleSheet()
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], spaceAfter=10, textColor=colors.HexColor("#333333"))
    norm_style = ParagraphStyle('Nor', parent=styles['Normal'], fontSize=9, leading=11)
    
    # Cálculos globales
    uds_por_tri = {"1T": set(), "2T": set(), "3T": set()}
    for tri, m_key in [("1t", "1T"), ("2t", "2T"), ("3t", "3T")]:
        ini_t = info_fechas.get(f"ini_{tri}")
        fin_t = info_fechas.get(f"fin_{tri}")
        if ini_t and fin_t:
            curr = ini_t
            while curr <= fin_t:
                d_str = curr.strftime("%d/%m/%Y")
                for ud in planning_ledger.get(d_str, []):
                    uds_por_tri[m_key].add(ud)
                curr += timedelta(days=1)
                
    ra_to_tri = {}
    ra_info = {}
    if not df_ra.empty:
        for _, ra_row in df_ra.iterrows():
            ra_id = str(ra_row["id_ra"])
            ra_info[ra_id] = {
                "pond": float(pd.to_numeric(ra_row["peso_ra"], errors="coerce")) if not pd.isna(ra_row["peso_ra"]) else 0.0,
                "desc": str(ra_row.get("Descripción", ""))
            }
            tris_found = []
            if ra_id in df_ud.columns:
                for _, ud_row in df_ud.iterrows():
                    if ud_row.get(ra_id, False):
                        uid = str(ud_row["id_ud"])
                        for t_key in ["1T", "2T", "3T"]:
                            if uid in uds_por_tri[t_key] and t_key not in tris_found:
                                tris_found.append(t_key)
                                
            ra_to_tri[ra_id] = {
                "tris": tris_found if tris_found else ["1T", "2T", "3T"]
            }

    peso_ce = {}
    ra_of_ce = {}
    df_ce_clean = pd.DataFrame()
    if df_ce is not None and not df_ce.empty:
        df_ce_clean = df_ce.dropna(subset=["id_ce"])
        df_ce_clean = df_ce_clean[df_ce_clean["id_ce"].str.strip() != ""]
        for _, ce_row in df_ce_clean.iterrows():
            ce_id = str(ce_row["id_ce"])
            r_id = str(ce_row.get("RA", ""))
            if pd.notna(ce_id) and pd.notna(r_id) and ce_id != "nan" and r_id != "nan":
                peso_ce[ce_id] = pd.to_numeric(ce_row["peso_ce"], errors="coerce") if pd.notna(ce_row["peso_ce"]) else 0.0
                ra_of_ce[ce_id] = r_id

    df_evaluable = df_al[df_al.get("Estado", "") != "Baja"] if not df_al.empty else pd.DataFrame()
    df_al_sorted = df_evaluable.sort_values("Apellidos").reset_index(drop=True) if not df_al.empty else pd.DataFrame()

    elements = []
    
    for idx_al, al in df_al_sorted.iterrows():
        al_id = al["ID"]
        apellidos = str(al.get("Apellidos", ""))
        nombre = str(al.get("Nombre", ""))
        
        mask = df_eval["ID"] == al_id if not df_eval.empty else pd.Series([False])
        if not mask.any(): continue
        
        idx = df_eval[mask].index[0]
        
        # Bloque 1. FICHA DEL ALUMNO
        elements.append(Paragraph(f"{apellidos}, {nombre}", ParagraphStyle('Tit', fontSize=16, fontName='Helvetica-Bold', textColor=colors.black, spaceAfter=8)))
        
        f_data = []
        for col in df_al.columns:
            if col not in ["ID", "Nombre", "Apellidos", "Estado"]:
                val = str(al.get(col, ""))
                if val and val != "nan" and val.strip():
                    f_data.append([Paragraph(f"<b>{col}:</b>", norm_style), Paragraph(val, norm_style)])
                    
        if f_data:
            # Dividir en algo tipo grid a dos columnas de pares si hay muchos
            t_ficha = Table(f_data, colWidths=[4.0*cm, 10*cm], hAlign='LEFT')
            t_ficha.setStyle(TableStyle([
                ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('TOPPADDING', (0,0), (-1,-1), 2),
            ]))
            elements.append(t_ficha)
        
        elements.append(Spacer(1, 15))
        
        # Cálculo de notas CE y RA para este alumno
        new_vals = {}
        if df_act is not None and not df_act.empty:
            for _, act in df_act.iterrows():
                act_id = str(act["id_act"])
                if act_id in df_eval.columns:
                    val = float(df_eval.at[idx, act_id]) if pd.notna(df_eval.at[idx, act_id]) else 0.0
                    new_vals[act_id] = val

        notas_ce = {}
        for ce_id in peso_ce.keys():
            act_vals = []
            if df_act is not None and not df_act.empty:
                for _, act in df_act.iterrows():
                    if ce_id in act.index and act[ce_id] == True:
                        act_id = str(act["id_act"])
                        if act_id in new_vals:
                            act_vals.append(new_vals[act_id])
            if act_vals:
                notas_ce[ce_id] = sum(act_vals) / len(act_vals)
            else:
                notas_ce[ce_id] = 0.0
        
        notas_ra = {}
        for ce_id, n_ce in notas_ce.items():
            r = ra_of_ce.get(ce_id)
            if r:
                if r not in notas_ra: notas_ra[r] = 0.0
                notas_ra[r] += n_ce * (peso_ce[ce_id] / 100.0)

        # --- FEOE SCORE INTEGRATION ---
        if not df_ra.empty and "Dualizado" in df_ra.columns:
            for r_id in notas_ra.keys():
                ra_row = df_ra[df_ra["id_ra"] == r_id]
                if not ra_row.empty and ra_row.iloc[0].get("Dualizado", False):
                    emp_grade = 0.0
                    if df_feoe is not None and not df_feoe.empty and r_id in df_feoe.columns:
                        fe_row = df_feoe[df_feoe["ID"] == al_id]
                        if not fe_row.empty:
                            emp_grade = float(fe_row.iloc[0][r_id])
                            
                    if emp_grade >= 1:
                        conv = {1: 3.0, 2: 5.0, 3: 7.5, 4: 10.0}
                        nota_empresa = conv.get(int(emp_grade), 0.0)
                        notas_ra[r_id] = (notas_ra[r_id] + nota_empresa) / 2.0

        # Bloque 2. CALIFICACIÓN COMPETENCIAL
        elements.append(Paragraph("Evaluación Competencial por Criterios (CE)", h2_style))
        
        if notas_ce:
            e_data = [["RA", "Criterio Evaluación", "Peso RA", "Nota Calculada"]]
            # sorted by RA then CE
            for ce_id in sorted(notas_ce.keys(), key=lambda x: (ra_of_ce.get(x, ""), x)):
                r = ra_of_ce.get(ce_id, "")
                p = peso_ce.get(ce_id, 0.0)
                n_c = notas_ce[ce_id]
                e_data.append([r, ce_id, f"{p:.0f}%", f"{n_c:.2f}"])
            
            te = Table(e_data, colWidths=[2.5*cm, 5.5*cm, 2.5*cm, 3.5*cm], hAlign='LEFT')
            te.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, 0), colors.white),
                ('TEXTCOLOR',     (0, 0), (-1, 0), colors.black),
                ('ALIGN',         (0, 0), (-1,-1), 'CENTER'),
                ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME',      (0, 1), (-1,-1), 'Helvetica'),
                ('FONTSIZE',      (0, 0), (-1,-1), 9),
                ('LINEBELOW',     (0, 0), (-1, 0), 1.5, colors.HexColor("#222222")),
                ('BOX',           (0, 0), (-1,-1), 1.5, colors.HexColor("#222222")),
                ('GRID',          (0, 0), (-1,-1), 0.5, colors.HexColor("#bbbbbb")),
            ]))
            elements.append(te)
        else:
            elements.append(Paragraph("No hay Criterios de Evaluación definidos o calificados.", norm_style))
            
        nota_final = float(df_eval.at[idx, "Nota_Final"]) if not pd.isna(df_eval.at[idx, "Nota_Final"]) else 0.0
        n_int, sigad_cod, sigad_txt, sigad_col = get_sigad_info(nota_final)
        
        elements.append(Spacer(1, 10))
        sigad_p = Paragraph(f"<b>Nota Final Módulo (oficial SIGAD):</b> <font color='{sigad_col.hexval()}'><b>{n_int} - {sigad_cod} ({sigad_txt})</b></font>", norm_style)
        elements.append(sigad_p)
        
        elements.append(Spacer(1, 15))
        
        # Bloque 3. PROGRESO PORCENTUAL (RAs)
        elements.append(Paragraph("Progreso Porcentual de Resultados de Aprendizaje", h2_style))
        
        pct_global_cumplido = 0.0
        suma_pond_ra = 0.0
        
        ra_data = [["RA", "Descripción", "Nota RA", "Progreso"]]
        
        for ra_id, info in ra_info.items():
            avg_nota_ra = notas_ra.get(ra_id, 0.0)
            
            prop = min(100.0, max(0.0, (avg_nota_ra / 5.0) * 100.0) if avg_nota_ra >= 5.0 else (avg_nota_ra/5.0)*100.0)
            obtenido_peso = info["pond"] * (prop / 100.0)
            
            pct_global_cumplido += obtenido_peso
            suma_pond_ra += info["pond"]
            
            p_desc = Paragraph(info["desc"], ParagraphStyle('small', fontSize=8, leading=9))
            
            bar = ProgressBar(3.5*cm, 12, prop, get_progress_color(prop))
            
            ra_data.append([
                Paragraph(f"<b>{ra_id}</b><br/>{info['pond']:.0f}%", ParagraphStyle('c', alignment=1, fontSize=8)),
                p_desc,
                f"{avg_nota_ra:.1f}",
                bar
            ])
            
        if ra_info:
            tra = Table(ra_data, colWidths=[2.0*cm, 9.5*cm, 2.0*cm, 4.0*cm], hAlign='LEFT')
            tra.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, 0), colors.white),
                ('TEXTCOLOR',     (0, 0), (-1, 0), colors.black),
                ('ALIGN',         (0, 0), (-1,-1), 'CENTER'),
                ('VALIGN',        (0, 0), (-1,-1), 'MIDDLE'),
                ('ALIGN',         (1, 1), (1, -1), 'LEFT'),
                ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME',      (0, 1), (-1,-1), 'Helvetica'),
                ('FONTSIZE',      (0, 0), (-1,-1), 8),
                ('LINEBELOW',     (0, 0), (-1, 0), 1.5, colors.HexColor("#222222")),
                ('BOX',           (0, 0), (-1,-1), 1.5, colors.HexColor("#222222")),
                ('GRID',          (0, 0), (-1,-1), 0.5, colors.HexColor("#bbbbbb")),
                ('BOTTOMPADDING', (0, 0), (-1,-1), 4),
                ('TOPPADDING',    (0, 0), (-1,-1), 4),
            ]))
            elements.append(tra)
            
            elements.append(Spacer(1, 10))
            color_glob = get_progress_color(pct_global_cumplido)
            p_glob = Paragraph(f"<b>PROGRESO GLOBAL DEL MÓDULO:</b> <font color='{color_glob.hexval()}'>{pct_global_cumplido:.1f}%</font> (de {suma_pond_ra:.0f}%)", ParagraphStyle('B', fontSize=12))
            elements.append(p_glob)
        else:
            elements.append(Paragraph("No hay Resultados de Aprendizaje definidos.", norm_style))
            
        elements.append(PageBreak())
        
    if not elements:
        elements.append(Paragraph("Sin alumnos o datos para generar.", norm_style))
        
    doc.build(elements)
    buffer.seek(0)
    return buffer
