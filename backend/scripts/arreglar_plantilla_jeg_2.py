# -*- coding: utf-8 -*-
"""
Segunda pasada sobre modelo_pd_jeg_tpl_final.docx (PD+/JEG): convierte las
secciones "Resultados de aprendizaje (RA) y criterios de evaluacion (CE)" y
"Contenidos (C)" -- que mostraban texto de ejemplo estatico fijo (RA 1.
Titulo del RA 1. / BC 1. Titulo del bloque de contenido 1...) -- en bucles
Jinja dinamicos, el mismo patron {%p for line in list_x %} / {{ line }} /
{%p endfor %} que ya usa generador_pd_suficiente_tpl.py (PD=) para su
seccion C2 (Criterios de evaluacion). Autorizado explicitamente por Rafael
(2026-09-13): "sigue... esto que dices... creo que lo tienes hecho en pd- y
deberia aprovecharse".

No toca la tabla "N | Titulo | RA | CE | C | CPE | OG | Duracion |
Temporizacion": esa se reconstruye en tiempo de render
(generador_pd_jeg.py::_rellenar_tabla_organizacion_ud), no aqui -- una tabla
no admite un numero de filas variable "precargado" como un parrafo.

Uso: .venv/Scripts/python.exe scripts/arreglar_plantilla_jeg_2.py
"""
import os
import docx

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "modelo_pd_jeg_tpl_final.docx")


def _set_paragraph_text(paragraph, texto):
    if not paragraph.runs:
        paragraph.add_run(texto)
        return
    paragraph.runs[0].text = texto
    for r in paragraph.runs[1:]:
        r.text = ""


def _borrar_parrafos(paragraphs):
    for p in paragraphs:
        p._p.getparent().remove(p._p)


def main():
    doc = docx.Document(TEMPLATE_PATH)
    paras = doc.paragraphs

    def idx_of(texto):
        for i, p in enumerate(paras):
            if p.text.strip() == texto:
                return i
        raise ValueError(f"No se encontro el parrafo: {texto!r}")

    # Se procesa primero la seccion con indice mas alto (Contenidos) para no
    # invalidar los indices de la seccion RA/CE, que va antes en el documento.
    ini_c = idx_of("BC 1.\tTítulo del bloque de contenido 1:")
    fin_c = idx_of("Relación entre los elementos curriculares")
    _set_paragraph_text(paras[ini_c], "{%p for line in list_contenidos %}")
    _set_paragraph_text(paras[ini_c + 1], "{{ line }}")
    _set_paragraph_text(paras[ini_c + 2], "{%p endfor %}")
    _borrar_parrafos(paras[ini_c + 3: fin_c])

    ini_ra = idx_of("RA 1.\tTítulo del RA 1.")
    fin_ra = idx_of("Contenidos (C)")
    _set_paragraph_text(paras[ini_ra], "{%p for line in list_ra_ce %}")
    _set_paragraph_text(paras[ini_ra + 1], "{{ line }}")
    _set_paragraph_text(paras[ini_ra + 2], "{%p endfor %}")
    _borrar_parrafos(paras[ini_ra + 3: fin_ra])

    doc.save(TEMPLATE_PATH)
    print("OK -- secciones RA/CE y Contenidos convertidas a bucles dinamicos.")


if __name__ == "__main__":
    main()
