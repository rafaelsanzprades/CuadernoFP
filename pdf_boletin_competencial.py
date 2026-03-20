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
    # Título central
    canv.setFont("Helvetica-Bold", 14)
    canv.setFillColor(colors.HexColor("#222222"))
    canv.drawCentredString(W / 2, H - 2 * cm, f"Boletín competencial. {doc.nombre_modulo}")
    
    # Pie
    canv.setFont("Helvetica", 9)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawRightString(W - 1.5 * cm, 1 * cm, doc.pie_texto)
    # Página
    canv.drawString(1.5 * cm, 1 * cm, f"Página {doc.page}")
    canv.restoreState()

def generar_pdf_boletin(info_modulo, info_fechas, df_al, df_eval, df_ra, df_ud, df_pr, planning_ledger):
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
            ra_id = str(ra_row["ID"])
            ra_info[ra_id] = {
                "pond": float(pd.to_numeric(ra_row["% Pond"], errors="coerce")) if not pd.isna(ra_row["% Pond"]) else 0.0,
                "desc": str(ra_row.get("Descripción", ""))
            }
            tris_found = []
            if ra_id in df_ud.columns:
                for _, ud_row in df_ud.iterrows():
                    if ud_row.get(ra_id, False):
                        uid = str(ud_row["ID"])
                        for t_key in ["1T", "2T", "3T"]:
                            if uid in uds_por_tri[t_key] and t_key not in tris_found:
                                tris_found.append(t_key)
                                
            ra_to_tri[ra_id] = {
                "tris": tris_found if tris_found else ["1T", "2T", "3T"]
            }

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
        
        # Bloque 2. CALIFICACIÓN NUMÉRICA
        elements.append(Paragraph("Evaluación Numérica", h2_style))
        
        e_data = [["Trimestre", "Teoría", "Práctica", "P./Tareas", "Cuaderno", "Nota Trimestral"]]
        for t_pfx, t_name in [("1T", "1T"), ("2T", "2T"), ("3T", "3T")]:
            teo = float(df_eval.at[idx, f"{t_pfx}_Teoria"]) if not pd.isna(df_eval.at[idx, f"{t_pfx}_Teoria"]) else 0.0
            pra = float(df_eval.at[idx, f"{t_pfx}_Practica"]) if not pd.isna(df_eval.at[idx, f"{t_pfx}_Practica"]) else 0.0
            inf = float(df_eval.at[idx, f"{t_pfx}_Informes"]) if not pd.isna(df_eval.at[idx, f"{t_pfx}_Informes"]) else 0.0
            cua = float(df_eval.at[idx, f"{t_pfx}_Cuaderno"]) if not pd.isna(df_eval.at[idx, f"{t_pfx}_Cuaderno"]) else 0.0
            nota_t = float(df_eval.at[idx, f"{t_pfx}_Nota"]) if not pd.isna(df_eval.at[idx, f"{t_pfx}_Nota"]) else 0.0
            
            e_data.append([t_name, f"{teo:.1f}", f"{pra:.1f}", f"{inf:.1f}", f"{cua:.1f}", f"{nota_t:.2f}"])
            
        nota_final = float(df_eval.at[idx, "Nota_Final"]) if not pd.isna(df_eval.at[idx, "Nota_Final"]) else 0.0
        n_int, sigad_cod, sigad_txt, sigad_col = get_sigad_info(nota_final)
        
        e_data.append(["FINAL", "-", "-", "-", "-", f"{nota_final:.2f}"])
        
        te = Table(e_data, colWidths=[3*cm, 2.5*cm, 2.5*cm, 2.5*cm, 2.5*cm, 3.5*cm], hAlign='LEFT')
        te.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#333333")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('ALIGN', (0,0), (0,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#dddddd")),
            ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#f4f4f4")),
        ]))
        elements.append(te)
        
        elements.append(Spacer(1, 5))
        sigad_p = Paragraph(f"<b>Equivalencia oficial SIGAD:</b> <font color='{sigad_col.hexval()}'><b>{n_int} - {sigad_cod} ({sigad_txt})</b></font>", norm_style)
        elements.append(sigad_p)
        
        elements.append(Spacer(1, 15))
        
        # Bloque 3. PROGRESO PORCENTUAL (RAs)
        elements.append(Paragraph("Progreso Porcentual de Resultados de Aprendizaje", h2_style))
        
        pct_global_cumplido = 0.0
        suma_pond_ra = 0.0
        
        n1 = float(df_eval.at[idx, "1T_Nota"]) if not pd.isna(df_eval.at[idx, "1T_Nota"]) else 0.0
        n2 = float(df_eval.at[idx, "2T_Nota"]) if not pd.isna(df_eval.at[idx, "2T_Nota"]) else 0.0
        n3 = float(df_eval.at[idx, "3T_Nota"]) if not pd.isna(df_eval.at[idx, "3T_Nota"]) else 0.0
        notas_student = {"1T": n1, "2T": n2, "3T": n3}
        
        ra_data = [["RA", "Descripción", "Nota RA", "Progreso"]]
        
        for ra_id, info in ra_info.items():
            tris = ra_to_tri[ra_id]["tris"]
            avg_nota_ra = sum(notas_student[t] for t in tris) / len(tris) if tris else nota_final
            
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
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#333333")),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('ALIGN', (1,1), (1,-1), 'LEFT'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 8),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#dddddd")),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('TOPPADDING', (0,0), (-1,-1), 4),
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
