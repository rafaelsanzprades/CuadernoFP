# -*- coding: utf-8 -*-
"""
Segundo pase de conversion a Jinja2 para la plantilla JEG (PD+).

preparar_plantilla_jeg_final.py reutiliza el mapeo de preparar_plantilla_pd_detallada.py,
que fue escrito contra el texto exacto de OTRO documento (modelo_pd_fp+.docx). Sobre
modelo_pd_jeg_tpl.docx deja sin convertir: la tabla de "Identificacion" (que en este
documento son celdas de texto plano sin corchetes, no el patron [[ ... ]]) y varios
patrones [[ ... ]] con una redaccion ligeramente distinta a la que el mapeo original
busca. Esto se detecto generando un documento real con datos de prueba y revisando que
quedaba sin sustituir en el texto renderizado -- no por lectura de codigo en aislado.

Lee:   backend/templates/modelo_pd_jeg_tpl_final.docx  (salida de preparar_plantilla_jeg_final.py)
Escribe: el mismo fichero, sobrescrito con las conversiones adicionales.

Casos:
1. Reemplazos simples de texto exacto (mismo mecanismo que el pase 1).
2. Dos parrafos con texto IDENTICO donde uno es la etiqueta de la celda y el otro el
   texto de ejemplo a sustituir (p.ej. "Curso academico" aparece dos veces seguidas:
   la etiqueta en negrita y, debajo, el propio texto de ejemplo). Un reemplazo global
   por texto convertiria tambien la etiqueta, dejando la celda sin titulo. Se resuelven
   por posicion: se cuenta la ocurrencia N-esima de ese texto exacto en todo el
   documento y solo se sustituye esa.
"""
import os
import sys
import zipfile
from lxml import etree

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.append(SCRIPT_DIR)
from preparar_plantilla_pd_detallada import get_full_text, replace_in_paragraph, W_NS

TEMPLATE = os.path.join(BACKEND_DIR, 'templates', 'modelo_pd_jeg_tpl_final.docx')

# --- 1. Reemplazos simples (texto exacto -> tag Jinja) ---------------------------------
SIMPLE_REPLACEMENTS = [
    # Tabla de Identificacion: celdas de texto plano (sin corchetes) con la descripcion
    # de lo que hay que rellenar -- confirmadas leyendo el XML de modelo_pd_jeg_tpl.docx.
    ('Tipo de centro educativo', '{{ tipo_centro }}'),
    ('Tipo abreviado y nombre del centro', '{{ nombre_centro }}'),
    ('Nombre de la Familia Profesional', '{{ familia_profesional }}'),
    ('Código del Grado D o E', '{{ codigo_grado }}'),
    ('Nombre del Grado D o E', '{{ denominacion_grado }}'),
    ('Código del módulo profesional o proyecto', '{{ modulo_codigo }}'),
    ('Nombre del módulo profesional o proyecto', '{{ modulo }}'),
    ('Duración curricular del módulo o proyecto en horas', '{{ horas }}'),
    ('Número de horas lectivas a la semana', '{{ horas_semanales }}'),
    ('Nombre y apellido del profesorado', '{{ profesorado }}'),

    # Patrones [[ ... ]] presentes en modelo_pd_jeg_tpl.docx con una redaccion distinta
    # a la que el mapeo del paso 1 (escrito para modelo_pd_fp+.docx) busca, y por eso no
    # se convirtieron.
    ('[[ Presencial | Semipresencial | Virtual ]]', '{{ modalidad }}'),
    (
        '[[ Ciclo formativo de grado básico | Ciclo formativo de grado medio | '
        'Ciclo Formativo de grado superior | Curso de especialización de grado medio | '
        'Curso de especialización de grado superior ]]',
        '{{ tipo_ensennanza }}',
    ),
    (
        '[[ lugar de residencia habitual | procedencia de diferentes localidades | '
        'concentración en el entorno próximo al centro | '
        'distribución en comarca/provincia/comunidad autónoma ]]',
        '{{ procedencia_alumnado }}',
    ),
    (
        '[[ tres evaluaciones parciales, una al finalizar cada trimestre | '
        'dos evaluaciones parciales, una por cuatrimestre ]]',
        '{{ num_evaluaciones_parciales }}',
    ),
]

# --- 2. Reemplazos posicionales: mismo texto exacto se repite, solo se toca la ---------
#        ocurrencia N-esima (0-indexada) en todo el documento.
POSITIONAL_REPLACEMENTS = [
    # "Curso académico" aparece 2 veces seguidas: la 1a es la etiqueta de la celda (se
    # deja intacta), la 2a es el texto de ejemplo a sustituir por el valor real.
    ('Curso académico', 1, '{{ curso_academico }}'),
    # "[[ Descripción de la actividad]]." aparece 2 veces (actividad 1 y actividad 2 de
    # "Actividades complementarias y extraescolares"); cada una debe ir a su propio campo.
    ('[[ Descripción de la actividad]].', 0, '{{ actividad1_descripcion }}.'),
    ('[[ Descripción de la actividad]].', 1, '{{ actividad2_descripcion }}.'),
]


def apply_simple(root):
    count = 0
    for para in root.iter(f'{{{W_NS}}}p'):
        text = get_full_text(para)
        if not text:
            continue
        for old, new in SIMPLE_REPLACEMENTS:
            if old in text:
                if replace_in_paragraph(para, old, new):
                    count += 1
                    text = get_full_text(para)
    return count


def apply_positional(root):
    count = 0
    occurrence_seen = {}
    for para in root.iter(f'{{{W_NS}}}p'):
        text = get_full_text(para)
        if not text:
            continue
        for old, target_idx, new in POSITIONAL_REPLACEMENTS:
            if text == old or text.strip() == old:
                seen = occurrence_seen.get(old, 0)
                if seen == target_idx:
                    if replace_in_paragraph(para, old, new):
                        count += 1
                occurrence_seen[old] = seen + 1
    return count


def main():
    with zipfile.ZipFile(TEMPLATE, 'r') as zin:
        items = {item.filename: (item, zin.read(item.filename)) for item in zin.infolist()}

    doc_item, doc_bytes = items['word/document.xml']
    root = etree.fromstring(doc_bytes)

    n_simple = apply_simple(root)
    n_positional = apply_positional(root)

    new_doc_bytes = etree.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)

    tmp_path = TEMPLATE + '.tmp'
    with zipfile.ZipFile(tmp_path, 'w', zipfile.ZIP_DEFLATED) as zout:
        for filename, (item, data) in items.items():
            if filename == 'word/document.xml':
                zout.writestr(item, new_doc_bytes)
            else:
                zout.writestr(item, data)

    os.replace(tmp_path, TEMPLATE)
    print(f"Pass 2: {n_simple} simple replacements, {n_positional} positional replacements applied to {TEMPLATE}")


if __name__ == '__main__':
    main()
