"""
Script one-shot (3ra pasada): conecta a datos reales de la app los apartados
D, E, E1, F, G, G1, I, K, L, M y enriquece N -- hasta ahora texto fijo
identico para cualquier modulo (y en varios casos con menciones especificas
del modulo real de origen -- "Departamento de Electronica", el ISBN de un
libro de texto concreto -- que quedarian mal en cualquier otro modulo/
departamento).

Reconstruido a partir de la investigacion de la sesion 2026-09-13: la app
YA TENIA campos reales para casi todos estos apartados (MetodologiaTab,
DiversidadTab, ProcedimientosTab, InnovacionTab, ContingenciaTab...), solo
que nunca se habian conectado al generador de PD= (`_build_context()` en
generador_pd_suficiente_tpl.py, ya actualizado en esta misma sesion).

Algoritmo por seccion (ver `_dinamizar_seccion`): cada apartado del modelo
BOA/Aragon empieza con 0-2 parrafos en CURSIVA que citan literalmente el
texto de la ley (que hay que conservar, es la definicion oficial del
apartado) seguidos del contenido real (que aqui esta escrito a mano para el
modulo 0237-ICTVE / Departamento de Electronica -- eso es lo que se
sustituye por un bucle Jinja dinamico).

Uso:
    cd backend
    python scripts/arreglar_plantilla_pd_suficiente_3.py

Resultado:
    Sobrescribe backend/templates/modelo_pd_fp=.docx
"""

import os

from docx import Document
from docx.oxml import OxmlElement
from docx.text.paragraph import Paragraph

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_PATH = os.path.join(BASE, "templates", "modelo_pd_fp=.docx")


def _set_paragraph_text(paragraph, text):
    if not paragraph.runs:
        paragraph.add_run(text)
        return
    paragraph.runs[0].text = text
    for extra in paragraph.runs[1:]:
        extra.text = ""


def _nuevo_parrafo_tras(paragraph, texto=""):
    new_p = OxmlElement('w:p')
    paragraph._p.addnext(new_p)
    nuevo = Paragraph(new_p, paragraph._parent)
    if texto:
        nuevo.add_run(texto)
    return nuevo


def _borrar_parrafos(paragraphs):
    for p in paragraphs:
        p._p.getparent().remove(p._p)


def _es_italica(paragraph):
    return any(r.italic for r in paragraph.runs if r.italic is not None)


def _dinamizar_seccion_por_indices(doc, idx_inicio_estatico, idx_fin_excl, list_var_name):
    """Variante robusta: recibe directamente el rango [idx_inicio_estatico,
    idx_fin_excl) de párrafos ESTÁTICOS a sustituir (ya excluyendo los
    párrafos en cursiva iniciales, calculados una sola vez al principio del
    script sobre el documento sin modificar), y los reemplaza por un bucle
    Jinja. Los índices de las secciones posteriores no se ven afectados
    porque se procesan de abajo hacia arriba (última sección primero)."""
    paras = doc.paragraphs
    ancla = paras[idx_inicio_estatico]
    _set_paragraph_text(ancla, "{%p for line in " + list_var_name + " %}")
    p2 = _nuevo_parrafo_tras(ancla, "{{ line }}")
    _nuevo_parrafo_tras(p2, "{%p endfor %}")
    _borrar_parrafos(paras[idx_inicio_estatico + 1:idx_fin_excl])


def _dinamizar_seccion_tag_simple(doc, idx_inicio_estatico, idx_fin_excl, tag_expr):
    """Como la anterior, pero sustituye por un único {{ tag }} en vez de un
    bucle (para campos de texto libre, no listas)."""
    paras = doc.paragraphs
    ancla = paras[idx_inicio_estatico]
    _set_paragraph_text(ancla, "{{ " + tag_expr + " }}")
    _borrar_parrafos(paras[idx_inicio_estatico + 1:idx_fin_excl])


def main():
    doc = Document(TEMPLATE_PATH)
    paras = doc.paragraphs

    def idx_of(texto):
        for i, p in enumerate(paras):
            if p.text.strip() == texto:
                return i
        raise ValueError(f"No encontrado: {texto!r}")

    def primer_no_italico_desde(i):
        while i < len(paras) and _es_italica(paras[i]):
            i += 1
        return i

    # Calculamos TODOS los rangos ANTES de tocar el documento (los índices
    # son válidos porque el documento aún no se ha modificado), y luego los
    # aplicamos de abajo hacia arriba para que las inserciones/borrados de
    # una sección no desplacen los índices ya calculados de las siguientes.
    secciones = [
        ("D. PRINCIPIOS METODOLÓGICOS", "E. EVALUACIÓN INICIAL", "list_d"),
        ("E. EVALUACIÓN INICIAL", "E1. ATENCIÓN A LAS DIFERENCIAS INDIVIDUALES", None),  # tag simple, tratado aparte
        ("E1. ATENCIÓN A LAS DIFERENCIAS INDIVIDUALES", "F. PROCEDIMIENTOS E INSTRUMENTOS DE EVALUACIÓN", "list_e1"),
        ("F. PROCEDIMIENTOS E INSTRUMENTOS DE EVALUACIÓN", "G. ACTIVIDADES DE RECUPERACIÓN Y REFUERZO", None),  # tag simple
        ("G. ACTIVIDADES DE RECUPERACIÓN Y REFUERZO", "G1. PLAN DE RECUPERACIÓN", "list_g"),
        ("G1. PLAN DE RECUPERACIÓN", "H. RESULTADOS DE APRENDIZAJE", None),  # tag simple
        ("I. PLAN DE APLICACIÓN DE LOS DESDOBLES, EN SU CASO", "J. MATERIALES Y RECURSOS DIDÁCTICOS", None),  # tag simple
        ("K. ACTIVIDADES COMPLEMENTARIAS Y EXTRAESCOLARES", "L. MEDIDAS COMPLEMENTARIAS EN PROYECTOS O BILINGÜES, EN SU CASO", "list_k"),
        ("L. MEDIDAS COMPLEMENTARIAS EN PROYECTOS O BILINGÜES, EN SU CASO", "M. MECANISMOS DE SEGUIMIENTO Y VALORACIÓN", None),  # tag simple
        ("M. MECANISMOS DE SEGUIMIENTO Y VALORACIÓN", "N. PLAN DE CONTINGENCIA", "list_m"),
    ]
    tags_simples = {
        "E. EVALUACIÓN INICIAL": "texto_evaluacion_inicial",
        "F. PROCEDIMIENTOS E INSTRUMENTOS DE EVALUACIÓN": "texto_procedimientos_instrumentos",
        "G1. PLAN DE RECUPERACIÓN": "texto_plan_recuperacion",
        "I. PLAN DE APLICACIÓN DE LOS DESDOBLES, EN SU CASO": "texto_plan_desdobles",
        "L. MEDIDAS COMPLEMENTARIAS EN PROYECTOS O BILINGÜES, EN SU CASO": "texto_medidas_bilingue",
    }

    rangos = []  # (idx_inicio_estatico, idx_fin_excl, list_var_o_None, tag_o_None)
    for heading, next_heading, list_var in secciones:
        i0 = idx_of(heading)
        i1 = idx_of(next_heading)
        i_static = primer_no_italico_desde(i0 + 1)
        if i_static >= i1:
            i_static = i1 - 1  # sección toda cursiva: sustituimos el último párrafo
        tag = tags_simples.get(heading)
        rangos.append((i_static, i1, list_var, tag))

    # Bibliografía dentro de J (heading "Bibliografía" propio, no un
    # apartado con letra) -- calculado también antes de tocar el documento.
    i_biblio_heading = idx_of("Bibliografía")
    i_biblio_start = i_biblio_heading + 1
    i_biblio_end = idx_of("K. ACTIVIDADES COMPLEMENTARIAS Y EXTRAESCOLARES")
    rangos.append((i_biblio_start, i_biblio_end, None, "textos_pd_bibliografia"))

    # De abajo hacia arriba para no invalidar índices previos.
    rangos.sort(key=lambda r: r[0], reverse=True)
    for i_static, i_end, list_var, tag in rangos:
        if list_var:
            _dinamizar_seccion_por_indices(doc, i_static, i_end, list_var)
        else:
            _dinamizar_seccion_tag_simple(doc, i_static, i_end, tag)

    doc.save(TEMPLATE_PATH)
    print(f"[OK] Plantilla corregida y guardada en: {TEMPLATE_PATH}")


if __name__ == "__main__":
    main()
