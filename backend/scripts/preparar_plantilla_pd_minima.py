"""
Script one-shot: genera la plantilla DOCX para PD- (resumen alumnado).

Crea un DOCX con formato compacto (1 página) y marcadores Jinja2.

Uso:
    cd backend
    python scripts/preparar_plantilla_pd_minima.py

Resultado:
    backend/templates/modelo_pd_fp-.docx
"""

import os
import sys
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DST_DIR = os.path.join(BASE, "templates")
DST = os.path.join(DST_DIR, "modelo_pd_fp-.docx")


def main():
    os.makedirs(DST_DIR, exist_ok=True)
    doc = Document()

    # --- Ajustes globales para comprimir en 1 página ---
    for section in doc.sections:
        section.top_margin = Cm(1.0)
        section.bottom_margin = Cm(1.0)
        section.left_margin = Cm(1.5)
        section.right_margin = Cm(1.5)

    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Arial'
    style_normal.font.size = Pt(9)
    style_normal.paragraph_format.space_before = Pt(0)
    style_normal.paragraph_format.space_after = Pt(2)
    style_normal.paragraph_format.line_spacing = 1.0

    style_h1 = doc.styles['Heading 1']
    style_h1.font.name = 'Arial'
    style_h1.font.size = Pt(11)
    style_h1.paragraph_format.space_before = Pt(4)
    style_h1.paragraph_format.space_after = Pt(2)

    try:
        style_list = doc.styles['List Bullet']
        style_list.font.name = 'Arial'
        style_list.font.size = Pt(9)
        style_list.paragraph_format.space_before = Pt(0)
        style_list.paragraph_format.space_after = Pt(0)
    except KeyError:
        pass

    # --- Portada / Encabezado ---
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run("Resumen de la Programación didáctica para el alumnado")
    run.font.size = Pt(14)
    run.font.bold = True

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.add_run("{{ modulo }} — {{ ciclo }} — Curso {{ curso_academico }}")
    p_sub.paragraph_format.space_after = Pt(2)

    p_entradilla = doc.add_paragraph()
    p_entradilla.add_run("Seguro que tienes muchas preguntas, ¡genial!, en esta guía resumen se ha pretendido darles respuesta.").italic = True
    p_entradilla.paragraph_format.space_after = Pt(6)

    # --- H1 1: Perfil profesional ---
    doc.add_heading("¿Cómo contribuirá este módulo en mi Perfil profesional?", level=1)
    doc.add_paragraph("{{ texto_perfil_profesional }}")

    # --- H1 2: Competencia ---
    doc.add_heading("¿En qué seré competente?", level=1)
    doc.add_paragraph("{{ texto_competencia_general }}")

    # --- H1 3: Resultados de Aprendizaje ---
    doc.add_heading("¿Qué sabré hacer? Se le denomina: Resultados de Aprendizaje", level=1)
    # Lista dinámica de RAs — se renderiza con {% for %}
    # Para docxtpl en listas, usamos un párrafo por RA con Jinja
    # Pero docxtpl no soporta {% for %} dentro de párrafos de lista fácilmente.
    # Estrategia: generar N párrafos de lista fijos (máx 10 RAs)
    for i in range(1, 11):
        p = doc.add_paragraph(style='List Bullet')
        # Cada RA se muestra como "RA N. descripción"
        p.text = f"{{{{ ra{i}_texto }}}}"

    # --- H1 4: Contenidos (UDs) ---
    doc.add_heading("¿Qué aprenderé? Son los Contenidos mínimos", level=1)
    for i in range(1, 11):
        p = doc.add_paragraph(style='List Bullet')
        p.text = f"{{{{ ud{i}_texto }}}}"

    # --- H1 5: Criterios de calificación ---
    doc.add_heading("¿Cómo aprobaré el módulo? Criterios de evaluación y calificación del módulo", level=1)
    # Bloque 1
    p1 = doc.add_paragraph()
    p1.add_run("{{ calif_bloque1_pct }} {{ calif_bloque1_titulo }}\n").bold = True
    p1.add_run("{{ calif_bloque1_desc }}")

    # Bloque 2
    p2 = doc.add_paragraph()
    p2.add_run("{{ calif_bloque2_pct }} {{ calif_bloque2_titulo }}\n").bold = True
    p2.add_run("{{ calif_bloque2_desc }}")

    # Bloque 3
    p3 = doc.add_paragraph()
    p3.add_run("{{ calif_bloque3_pct }} {{ calif_bloque3_titulo }}\n").bold = True
    p3.add_run("{{ calif_bloque3_desc }}")

    # Bloque 4
    p4 = doc.add_paragraph()
    p4.add_run("{{ calif_bloque4_pct }} {{ calif_bloque4_titulo }}\n").bold = True
    p4.add_run("{{ calif_bloque4_desc }}")

    # --- H1 6: Recordad ---
    doc.add_heading("Recordad:", level=1)
    p_rec = doc.add_paragraph()
    p_rec.add_run("{{ texto_recordatorio }}").bold = True

    p_final = doc.add_paragraph("{{ texto_final }}")
    p_final.paragraph_format.space_before = Pt(6)

    # --- Guardar ---
    doc.save(DST)
    print(f"[OK] Plantilla guardada en: {DST}")

    # Verificar variables
    from docxtpl import DocxTemplate
    tpl = DocxTemplate(DST)
    vars = sorted(tpl.get_undeclared_template_variables())
    print(f"   Variables Jinja2: {len(vars)}")
    for v in vars:
        print(f"     {v}")


if __name__ == "__main__":
    main()
