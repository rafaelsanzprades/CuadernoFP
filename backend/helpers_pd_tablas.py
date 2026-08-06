"""
Helpers de tablas python-docx compartidos entre generadores de PD (PD- y PD=).

Construir la tabla directamente con python-docx (en vez de una tabla estática
en la plantilla docxtpl) es lo que permite que tenga tantas filas como haga
falta y que el ancho de columna se controle de forma fiable — ver el propio
comentario de insertar_tabla_instrumentos sobre el bug de table.columns[i].width.
"""

from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def aplicar_bordes_rejilla(table):
    """Aplica bordes de cuadrícula a `table` a mano (equivalente al estilo
    'Table Grid') en vez de asignar table.style — no todas las plantillas
    tienen ese estilo activado (la del BOA no lo trae), así que confiar en
    el nombre de estilo rompe con KeyError en cuanto cambia la plantilla."""
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement('w:tblBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        el = OxmlElement(f'w:{edge}')
        el.set(qn('w:val'), 'single')
        el.set(qn('w:sz'), '4')
        el.set(qn('w:space'), '0')
        el.set(qn('w:color'), '000000')
        borders.append(el)
    tbl_pr.append(borders)


def insertar_tabla_instrumentos(doc, paragraph, list_instrumentos, pond_1t, pond_2t, pond_3t):
    """
    Inserta, justo después de `paragraph`, la tabla "Instrumento | 1er/2º/3er
    Tri." (9+3+3+3cm, columnas 2-4 centradas) y elimina `paragraph` (se asume
    que solo contenía el marcador de posición, ya vacío en este punto) para
    que no quede una línea en blanco antes de la tabla.
    """
    table = doc.add_table(rows=1 + len(list_instrumentos), cols=4)
    aplicar_bordes_rejilla(table)

    # 18 cm de ancho total = 21 cm (A4) - 2 cm izq. - 1 cm der.
    col_widths = [Cm(9.0), Cm(3.0), Cm(3.0), Cm(3.0)]
    for i, w in enumerate(col_widths):
        table.columns[i].width = w
    # table.columns[i].width por sí solo no basta: Word respeta el ancho de
    # cada celda (tcW) por encima del gridCol de la tabla, así que hay que
    # fijarlo también celda a celda, en todas las filas.
    for row in table.rows:
        for i, w in enumerate(col_widths):
            row.cells[i].width = w

    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = "Instrumento"
    hdr_cells[1].text = f"1er Tri. ({pond_1t}%)"
    hdr_cells[2].text = f"2º Tri. ({pond_2t}%)"
    hdr_cells[3].text = f"3er Tri. ({pond_3t}%)"

    for i, cell in enumerate(hdr_cells):
        for hp in cell.paragraphs:
            if i > 0:
                hp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in hp.runs:
                r.bold = True
                r.font.name = 'Arial'
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(0, 0, 0)

    for i, instr in enumerate(list_instrumentos):
        row_cells = table.rows[i + 1].cells
        row_cells[0].text = instr.get("nombre", "")
        row_cells[1].text = instr.get("pct_1t", "")
        row_cells[2].text = instr.get("pct_2t", "")
        row_cells[3].text = instr.get("pct_3t", "")

        for j, cell in enumerate(row_cells):
            for cp in cell.paragraphs:
                if j > 0:
                    cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for r in cp.runs:
                    r.font.name = 'Arial'
                    r.font.size = Pt(9)
                    r.font.color.rgb = RGBColor(0, 0, 0)

    paragraph._p.addnext(table._tbl)
    paragraph._p.getparent().remove(paragraph._p)
    return table
