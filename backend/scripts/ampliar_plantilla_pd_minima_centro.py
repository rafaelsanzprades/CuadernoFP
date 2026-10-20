"""
Añade a la cabecera de la plantilla PD- (modelo_pd_fp-.docx) una línea «Centro: {{ centro_linea }}» tras «Departamento / Área»
(2026-10-20): el centro, la localidad y la provincia que el docente escribe en Contexto › Identificación no llegaban a este documento.
Idempotente. Uso:   cd backend && python scripts/ampliar_plantilla_pd_minima_centro.py
"""
import copy
import os

from docx import Document
from docx.oxml.ns import qn

RUTA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates", "modelo_pd_fp-.docx")


def main():
    doc = Document(RUTA)
    for p in doc.paragraphs:
        if "Departamento / Área: {{ departamento_area }}" in p.text:
            if "centro_linea" in p.text:
                print("Sin cambios (ya estaba ampliada).")
                return
            run = p.runs[-1]._r
            br = copy.deepcopy(run.findall(qn("w:br"))[-1])
            t = copy.deepcopy(run.findall(qn("w:t"))[-1])
            t.text = "Centro: {{ centro_linea }}"
            run.append(br)
            run.append(t)
            doc.save(RUTA)
            print("Cambios:\n  - cabecera: línea «Centro: {{ centro_linea }}»")
            return
    raise SystemExit("No se encontró la cabecera de PD-")


if __name__ == "__main__":
    main()
