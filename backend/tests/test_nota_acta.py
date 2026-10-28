"""Nota del acta: entera de 1 a 10 con redondeo configurable, o con 1 decimal. Mismo criterio que notaActa() en
frontend/src/utils/calificaciones.ts (si cambia uno, cambia el otro)."""
import pytest

from helpers_catalogo import nota_acta, formato_nota_acta


def test_sin_evaluar():
    assert nota_acta(None) is None


@pytest.mark.parametrize("nota,esperada", [
    (4.99, 4),   # conservador: por debajo de 5 se trunca, nunca aprueba por redondeo
    (4.5, 4),
    (5.0, 5),
    (5.49, 5),
    (5.5, 6),    # desde 5, al entero más próximo (la mitad sube)
    (7.5, 8),
    (9.6, 10),
    (0.3, 1),    # nunca por debajo de 1
])
def test_conservador_es_el_modo_por_defecto(nota, esperada):
    assert nota_acta(nota) == esperada


@pytest.mark.parametrize("modo,nota,esperada", [
    ("cercano", 4.5, 5), ("cercano", 4.49, 4), ("cercano", 6.5, 7),
    ("abajo", 6.99, 6), ("abajo", 0.5, 1),
    ("arriba", 6.01, 7), ("arriba", 10.0, 10), ("arriba", 9.2, 10),
])
def test_modos_de_redondeo(modo, nota, esperada):
    assert nota_acta(nota, {"redondeo_acta": modo}) == esperada


def test_con_un_decimal():
    cfg = {"decimales_acta": 1}
    assert nota_acta(7.34, cfg) == 7.3
    assert nota_acta(7.35, cfg) == 7.3 or nota_acta(7.35, cfg) == 7.4  # 7.35 no es exacto en binario: lo decide toFixed igual que JS
    assert nota_acta(7.25, cfg) == 7.3   # la mitad exacta sube, como toFixed
    assert nota_acta(4.96, cfg) == 5.0


def test_nota_aprobado_distinta():
    assert nota_acta(5.4, {"nota_aprobado": 6.0}) == 5  # por debajo del aprobado configurado se trunca
    assert nota_acta(6.0, {"nota_aprobado": 6.0}) == 6


def test_formato():
    assert formato_nota_acta(7.0) == "7"
    assert formato_nota_acta(7.0, {"decimales_acta": 1}) == "7.0"
    assert formato_nota_acta(6.5) == "7"   # una nota de acta antigua con decimal se muestra entera
    assert formato_nota_acta(None) == ""


# ---- regla de superación (todos los RA / solo los imprescindibles); mismo cálculo que notaFinalPonderada en calificaciones.ts
def _nota_regla(config, imprescindible_ra2=False):
    from helpers_catalogo import calcular_notas_jeg
    ras = [{"id_ra": "RA1", "peso_ra": 50}, {"id_ra": "RA2", "peso_ra": 50, "imprescindible": imprescindible_ra2}]
    ces = [{"id_ce": f"CE{i}", "id_ra": f"RA{i}", "peso_ce": 100} for i in (1, 2)]
    inds = [{"id_indicador": f"I{i}", "id_ce": f"CE{i}", "peso": 1} for i in (1, 2)]
    instr = [{"id_instrumento": "X", "peso_global": 1, "procedimiento": "ordinario"}]
    cals = [{"id_alumno": "A", "id_instrumento": "X", "id_indicador": "I1", "valor": 9},
            {"id_alumno": "A", "id_instrumento": "X", "id_indicador": "I2", "valor": 3}]
    return calcular_notas_jeg("A", cals, inds, instr, ces, ras, config)["nota_final"]


def test_regla_media_compensa():
    assert _nota_regla({}) == 6.0
    assert _nota_regla({"regla_superacion": "media"}) == 6.0


def test_regla_todos_ra_suspende_con_un_ra_suspenso():
    assert _nota_regla({"regla_superacion": "todos_ra"}) < 5


def test_regla_imprescindibles_solo_exige_los_marcados():
    assert _nota_regla({"regla_superacion": "imprescindibles"}, imprescindible_ra2=False) == 6.0
    assert _nota_regla({"regla_superacion": "imprescindibles"}, imprescindible_ra2=True) < 5
