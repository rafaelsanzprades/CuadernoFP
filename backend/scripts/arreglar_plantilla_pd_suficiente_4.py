"""
Script one-shot (4ª pasada) de la plantilla PD= (modelo_pd_fp=.docx), tras revisar la programación contra el Decreto 107/2025
de Aragón (que redactó de nuevo el art. 100.2 de la programación didáctica; ver RF Ideas/H-06 ...).

Hace tres cosas:
  1. Apartado C3: «asistencia superior al 85%» y «(se media a partir de un 4)» estaban escritos a fuego en el texto de la plantilla.
     Ahora salen de la programación: {{ p_ev }} (porcentaje de faltas que hace perder la evaluación continua) y
     {{ texto_media_minima }} (vacío si no hay calificación mínima por RA).
  2. Apartado A (letra a del art. 100.2): el único párrafo de contenido era {{ texto_introduccion }}. Pasa a un bucle
     {%p for x in list_intro %} que imprime la introducción, el marco normativo y los textos de Contexto > Entorno.
  3. Apartado H (letra h): tras la cita de la norma, un párrafo {{ texto_calificacion_minima }} con la calificación mínima por RA
     para compensar (campo nuevo de Programación > Módulo > Datos) o, si no está fijada, una marca [[ ]] para completarla.

Es idempotente: si la plantilla ya está arreglada no cambia nada.

Uso:
    cd backend
    python scripts/arreglar_plantilla_pd_suficiente_4.py

Resultado:
    Sobrescribe backend/templates/modelo_pd_fp=.docx
"""

import copy
import os

from docx import Document

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_PATH = os.path.join(BASE, "templates", "modelo_pd_fp=.docx")


def _poner_texto(parrafo, texto):
    """Deja todo el texto del párrafo en el primer run (conserva el formato del primero)."""
    if not parrafo.runs:
        parrafo.add_run(texto)
        return
    parrafo.runs[0].text = texto
    for extra in parrafo.runs[1:]:
        extra.text = ""


def _copia_tras(parrafo, texto, referencia=None):
    """Inserta tras `parrafo` una copia de `referencia` (por defecto, el propio párrafo) con otro texto."""
    origen = referencia if referencia is not None else parrafo
    nuevo_xml = copy.deepcopy(origen._p)
    parrafo._p.addnext(nuevo_xml)
    nuevo = type(parrafo)(nuevo_xml, parrafo._parent)
    _poner_texto(nuevo, texto)
    return nuevo


def main():
    doc = Document(TEMPLATE_PATH)
    cambios = []
    pars = list(doc.paragraphs)

    # 1. C3: cifras fijas
    for p in pars:
        if "superior al 85%" in p.text:
            _poner_texto(p, p.text.replace("85%", "{{ p_ev }}%"))
            cambios.append("C3: 85% -> {{ p_ev }}%")
        if "(se media a partir de un 4):" in p.text:
            _poner_texto(p, p.text.replace(" (se media a partir de un 4):", "{{ texto_media_minima }}:"))
            cambios.append("C3: (se media a partir de un 4) -> {{ texto_media_minima }}")

    # 2. A: introducción con marco normativo y entorno
    if not any("list_intro" in p.text for p in pars):
        for p in pars:
            if p.text.strip() == "{{ texto_introduccion }}":
                cuerpo = _copia_tras(p, "{{ x }}")
                _copia_tras(cuerpo, "{%p endfor %}")
                _poner_texto(p, "{%p for x in list_intro %}")
                cambios.append("A: {{ texto_introduccion }} -> bucle list_intro")
                break

    # 3. H: calificación mínima por RA
    if not any("texto_calificacion_minima" in p.text for p in pars):
        for i, p in enumerate(pars):
            if p.text.strip().startswith("Calificación mínima que se debe alcanzar en cada resultado de aprendizaje"):
                # párrafo de referencia: el siguiente (texto normal, no cursiva)
                referencia = pars[i + 1]
                _copia_tras(p, "{{ texto_calificacion_minima }}", referencia)
                cambios.append("H: párrafo {{ texto_calificacion_minima }}")
                break

    if cambios:
        doc.save(TEMPLATE_PATH)
    print("Cambios:" if cambios else "Sin cambios (ya estaba arreglada).")
    for c in cambios:
        print("  -", c)


if __name__ == "__main__":
    main()
