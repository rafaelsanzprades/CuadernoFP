"""
Script one-shot (5ª pasada) de la plantilla PD= (modelo_pd_fp=.docx): letra c) del art. 100.2 del Decreto 91/2024
(tras el Decreto 107/2025). Tras la tabla de secuenciación (apartado C) añade un bucle {%p for x in list_og_ud %}
con los objetivos generales de cada UD y las competencias del módulo.

Idempotente.  Uso:  cd backend && python scripts/arreglar_plantilla_pd_suficiente_5.py
"""

import os

from docx import Document

from arreglar_plantilla_pd_suficiente_4 import _copia_tras, _poner_texto

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_PATH = os.path.join(BASE, "templates", "modelo_pd_fp=.docx")


def main():
    doc = Document(TEMPLATE_PATH)
    pars = list(doc.paragraphs)
    if any("list_og_ud" in p.text for p in pars):
        print("Sin cambios (ya estaba arreglada).")
        return
    for i, p in enumerate(pars):
        if p.text.strip().startswith("Esta tabla relaciona cada una de las Unidades Didácticas"):
            fin = _copia_tras(p, "{%p endfor %}")
            cuerpo = _copia_tras(p, "{{ x }}")
            ini = _copia_tras(p, "{%p for x in list_og_ud %}")
            del fin, cuerpo, ini
            doc.save(TEMPLATE_PATH)
            print("Cambios:\n  - C: bucle list_og_ud tras la tabla de secuenciación")
            return
    raise SystemExit("No se encontró el párrafo de referencia")


if __name__ == "__main__":
    main()
