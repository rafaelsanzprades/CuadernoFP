"""PD= (programación suficiente): campos que exige el art. 100.2 del Decreto 91/2024 de Aragón tras el Decreto 107/2025,
y la calificación mínima por RA para compensar (art. 99.4.g), que también aplica el motor de notas."""
import copy
import io
import json
import os
import re
import zipfile

from helpers_catalogo import calcular_notas_jeg
from pdf_dispatch import generar_documento

DEMO = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "demo")


def _cargar(nombre):
    with open(os.path.join(DEMO, nombre), encoding="utf-8") as f:
        d = json.load(f)
    return d[0] if isinstance(d, list) else d


def _texto(contenido: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(contenido)) as z:
        xml = z.read("word/document.xml").decode("utf-8")
    return re.sub(r"<[^>]+>", "", xml.replace("</w:p>", "\n"))


def _generar(cambios=None):
    modulo = copy.deepcopy(_cargar("202526 P 0237-ICTVE.fpp"))
    curso = _cargar("202526 C 1A-GM 0237-ICTVE.fpc")
    for ruta, valor in (cambios or {}).items():
        obj = modulo
        *camino, ultimo = ruta.split(".")
        for k in camino:
            obj = obj.setdefault(k, {})
        obj[ultimo] = valor
    contenido, _, _ = generar_documento("programacion_suficiente_tpl", modulo, curso)
    return _texto(contenido)


def test_las_cifras_ya_no_estan_escritas_a_fuego():
    t = _generar({"info_modulo.p_ev": 20})
    assert "superior al 85%" not in t
    assert "superior al 20%" in t


def test_calificacion_minima_por_ra_se_imprime_en_el_apartado_h():
    t = _generar({"config_redondeo": {"nota_aprobado": 5.0, "umbral_redondeo": 5.0, "max_compensables": 0, "nota_minima_ra": 4}})
    assert "Calificación mínima fijada en el Proyecto curricular: 4 sobre 10" in t
    assert "(se media a partir de un 4)" in t
    assert "[[ Indica aquí la calificación mínima" not in t


def test_sin_calificacion_minima_queda_una_marca_visible():
    t = _generar({"config_redondeo": {"nota_aprobado": 5.0, "umbral_redondeo": 5.0, "max_compensables": 0}})
    assert "[[ Indica aquí la calificación mínima" in t
    assert "se media a partir de" not in t


def test_introduccion_con_marco_normativo_y_entorno():
    t = _generar({"info_modulo.nivel": "Grado Superior", "config_contexto.entorno_geografico": "Zona industrial del Bajo Aragón.",
                  "config_contexto.entorno_socioeconomico": "Tejido de pymes del sector eléctrico."})
    assert "Marco normativo. Esta programación se ajusta a la Ley Orgánica 3/2022" in t
    assert "Decreto 107/2025" in t and "ECD/843/2024" in t and "ECD/842/2024" not in t
    assert "Entorno geográfico y sociocultural. Zona industrial del Bajo Aragón." in t
    assert "Entorno socioeconómico y productivo. Tejido de pymes del sector eléctrico." in t
    assert "ciclo formativo de grado superior" in t


def test_marco_normativo_propio_sustituye_al_de_aragon():
    t = _generar({"config_contexto.marco_normativo": "Solo estas normas de mi comunidad."})
    assert "Marco normativo. Solo estas normas de mi comunidad." in t
    assert "Decreto 107/2025" not in t


# ---- motor de notas: calificación mínima por RA para compensar
def _datos_motor():
    ras = [{"id_ra": "RA1", "peso_ra": 50}, {"id_ra": "RA2", "peso_ra": 50}, {"id_ra": "RA3", "peso_ra": 0}]
    ces = [{"id_ce": f"CE{i}", "id_ra": f"RA{i}", "peso_ce": 100} for i in (1, 2, 3)]
    inds = [{"id_indicador": f"I{i}", "id_ce": f"CE{i}", "peso": 1} for i in (1, 2, 3)]
    instr = [{"id_instrumento": "X", "peso_global": 1, "procedimiento": "ordinario"}]
    cals = [{"id_alumno": "A", "id_instrumento": "X", "id_indicador": "I1", "valor": 9},
            {"id_alumno": "A", "id_instrumento": "X", "id_indicador": "I2", "valor": 3.5}]
    return cals, inds, instr, ces, ras


def _nota(config):
    cals, inds, instr, ces, ras = _datos_motor()
    return calcular_notas_jeg("A", cals, inds, instr, ces, ras, config)["nota_final"]


def test_sin_minimo_por_ra_la_media_compensa():
    assert _nota({}) == 6.25
    assert _nota({"nota_minima_ra": None}) == 6.25


def test_un_ra_por_debajo_del_minimo_no_se_compensa():
    assert _nota({"nota_minima_ra": 4}) < 5          # RA2 = 3,5 < 4: el módulo queda suspenso
    assert _nota({"nota_minima_ra": 3}) == 6.25      # RA2 = 3,5 >= 3: se compensa con RA1


def test_dualizacion_sin_justificar_deja_una_marca_visible():
    t = _generar()
    assert "[[ Indica aquí los motivos por los que se dualizan" in t


def test_dualizacion_justificada_se_imprime():
    t = _generar({"config_contexto.texto_feoe_justificacion": "El sector exige práctica con equipos reales."})
    assert "Motivos por los que se dualizan: El sector exige práctica con equipos reales." in t
    assert "[[ Indica aquí los motivos por los que se dualizan" not in t


def test_cada_ud_lleva_sus_objetivos_generales_y_las_competencias():
    t = _generar()
    assert "UD 1. Objetivos generales: a), f)." in t
    assert "[[ Indica aquí las competencias profesionales" in t
    t = _generar({"config_contexto.cpe": "Competencia digital y trabajo en equipo."})
    assert "contribuye el módulo: Competencia digital y trabajo en equipo." in t


def test_la_infraestructura_de_contexto_llega_a_herramientas():
    t = _generar({"config_contexto.infraestructura": "Aula con 20 puestos y servidor propio."})
    assert "Aula con 20 puestos y servidor propio." in t


def test_pd_plus_cubre_los_ra_en_la_tabla_de_ud():
    modulo = _cargar("202526 P 0237-ICTVE.fpp")
    curso = _cargar("202526 C 1A-GM 0237-ICTVE.fpc")
    contenido, _, _ = generar_documento("programacion_jeg", modulo, curso)
    t = _texto(contenido)
    assert "Introducción a las ICT y normativa
RA1
22" in t
