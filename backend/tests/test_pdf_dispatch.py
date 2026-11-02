"""Regresión de pdf_dispatch.generar_documento con los datos de demo (frontend/public/demo).

pdf_dispatch es el módulo que también se ejecuta en el navegador (Pyodide), así que estos tests
protegen a la vez el backend y la generación local.
"""
import io
import json
import os
import zipfile

import pytest

from pdf_dispatch import DocError, generar_documento

DEMO = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "demo")
FPC = "202526 C 1A-GM 0237-ICTVE.fpc"
FPP = "202526 P 0237-ICTVE.fpp"


def _cargar(nombre):
    with open(os.path.join(DEMO, nombre), encoding="utf-8") as f:
        datos = json.load(f)
    return datos[0] if isinstance(datos, list) else datos


@pytest.fixture(scope="module")
def datos():
    curso, modulo = _cargar(FPC), _cargar(FPP)
    alumnos = curso.get("df_al") or []
    assert alumnos, "el curso de demo debería tener alumnado"
    return modulo, curso, alumnos[0]["id_alumno"] if "id_alumno" in alumnos[0] else next(iter(alumnos[0].values()))


def _al_id(curso):
    al = curso["df_al"][0]
    for k in ("ID", "id", "id_alumno", "al_id"):
        if k in al:
            return al[k]
    return next(iter(al.values()))


TIPOS_PDF = ["calendario", "seguimiento", "clases_ud", "planificacion", "matrices", "cobertura_ce",
             "grupal_1t", "grupal_2t", "grupal_3t", "grupal_final", "alumnado_ubicacion"]
TIPOS_ALUMNO = ["individual", "ficha_alumnado", "refuerzo_alumno", "plan_formacion"]


@pytest.mark.parametrize("tipo", TIPOS_PDF)
def test_pdf_sin_alumno(tipo):
    modulo, curso = _cargar(FPP), _cargar(FPC)
    contenido, mime, _ = generar_documento(tipo, modulo, curso, fecha_corte="2026-01-31")
    assert mime == "application/pdf" and contenido[:5] == b"%PDF-"


@pytest.mark.parametrize("tipo", TIPOS_ALUMNO)
def test_pdf_de_un_alumno(tipo):
    modulo, curso = _cargar(FPP), _cargar(FPC)
    contenido, mime, _ = generar_documento(tipo, modulo, curso, al_id=_al_id(curso))
    assert contenido[:5] == b"%PDF-"


@pytest.mark.parametrize("tipo", TIPOS_PDF + TIPOS_ALUMNO)
def test_docx_alternativo(tipo):
    modulo, curso = _cargar(FPP), _cargar(FPC)
    contenido, mime, cab = generar_documento(tipo, modulo, curso, fecha_corte="2026-01-31", al_id=_al_id(curso), file_format="docx")
    assert zipfile.is_zipfile(io.BytesIO(contenido))
    assert "docx" in cab["Content-Disposition"]


@pytest.mark.parametrize("tipo", ["programacion_minima_tpl", "programacion_suficiente_tpl", "programacion_jeg"])
def test_programaciones_sin_base_de_datos(tipo):
    modulo, curso = _cargar(FPP), _cargar(FPC)
    contenido, mime, cab = generar_documento(tipo, modulo, curso, file_format="docx")
    assert zipfile.is_zipfile(io.BytesIO(contenido))
    with zipfile.ZipFile(io.BytesIO(contenido)) as z:
        texto = z.read("word/document.xml").decode("utf-8")
    assert "{{" not in texto and "{%" not in texto


def test_ud_y_tarea():
    modulo, curso = _cargar(FPP), _cargar(FPC)
    ud = (modulo.get("df_ud") or [None])[0]
    if ud:
        contenido, mime, _ = generar_documento("ud", modulo, curso, item_id=ud["id_ud"])
        assert zipfile.is_zipfile(io.BytesIO(contenido))


def test_errores_de_peticion():
    modulo, curso = _cargar(FPP), _cargar(FPC)
    with pytest.raises(DocError) as e:
        generar_documento("no_existe", modulo, curso)
    assert e.value.status_code == 400
    with pytest.raises(DocError) as e:
        generar_documento("individual", modulo, curso)
    assert e.value.status_code == 400


def test_endpoint_http_sigue_funcionando(client):
    """El sidecar de escritorio sigue sirviendo /api/pdf igual que antes."""
    modulo, curso = _cargar(FPP), _cargar(FPC)
    r = client.post("/api/pdf?type=matrices", json={"module_data": modulo, "curso_data": curso})
    assert r.status_code == 200 and r.content[:5] == b"%PDF-"
    r = client.post("/api/pdf?type=no_existe", json={"module_data": modulo, "curso_data": curso})
    assert r.status_code == 400


def test_contexto_del_catalogo_para_programaciones(client):
    r = client.get("/api/catalog/pd-context/0237")
    assert r.status_code == 200
    datos = r.json()["data"]
    assert set(datos) == {"curriculo_data", "grado_info"}


def test_endpoint_cerrado_fuera_del_servidor_interno(client, monkeypatch):
    """En un servidor público /api/pdf no acepta datos: la web genera los documentos en el navegador."""
    monkeypatch.delenv("CUADERNOFP_PDF_LOCAL", raising=False)
    modulo, curso = _cargar(FPP), _cargar(FPC)
    r = client.post("/api/pdf?type=matrices", json={"module_data": modulo, "curso_data": curso})
    assert r.status_code == 410
    assert "%PDF" not in r.text


def test_pd_minima_en_pdf():
    modulo, curso = _cargar(FPP), _cargar(FPC)
    contenido, mime, _ = generar_documento("programacion_minima_tpl", modulo, curso, file_format="pdf")
    assert mime == "application/pdf" and contenido.startswith(b"%PDF")


def test_plan_formacion_recoge_los_datos_del_plan():
    modulo, curso = _cargar(FPP), _cargar(FPC)
    al = _al_id(curso)
    for ce in modulo["df_ce"][:1]:
        ce["is_dual"] = True
    ra_id = modulo["df_ce"][0]["id_ra"]
    curso["df_feoe"] = [{"ID": al, "plan": {"empresa": "Empresa Prueba SL", "tutor_empresa": "Ana Tutora", "horas": 360,
                                              "actividades": {ra_id: "Montaje de equipos de red"}}}]
    contenido, _, _ = generar_documento("plan_formacion", modulo, curso, al_id=al, file_format="docx")
    with zipfile.ZipFile(io.BytesIO(contenido)) as z:
        texto = z.read("word/document.xml").decode("utf-8")
    assert "Empresa Prueba SL" in texto and "Ana Tutora" in texto and "Montaje de equipos de red" in texto


def test_sigla_estado_segun_perfil():
    from pdf_boletin_grupal import sigla_estado
    assert sigla_estado("NP", None) == "NP"
    assert sigla_estado("NP", {"perfil_comunidad": "aragon"}) == "NE"
    assert sigla_estado("FEP", {"perfil_comunidad": "andalucia"}) == "PFEOE"
    assert sigla_estado("FEP", {"perfil_comunidad": "asturias"}) == "PFE"
    assert sigla_estado("RC", {"perfil_comunidad": "aragon"}) == "RC"
    assert sigla_estado("FEP", {}) == "FE pend."


@pytest.mark.parametrize("perfil,estado,sigla", [("andalucia", "FEP", "PFEOE"), ("asturias", "FEP", "PFE"), ("aragon", "NP", "NE"), ("", "FEP", "FE pend.")])
def test_boletin_grupal_final_usa_la_sigla_del_perfil(perfil, estado, sigla):
    import re
    modulo, curso = _cargar(FPP), _cargar(FPC)
    modulo.setdefault("config_redondeo", {})["perfil_comunidad"] = perfil
    ev = curso["df_eval"]
    al = _al_id(curso)
    fila = next(r for r in ev if r.get("ID") == al)
    fila["Estado_Acta"] = estado
    contenido, _, _ = generar_documento("grupal_final", modulo, curso, fecha_corte="2026-01-31", file_format="docx")
    xml = zipfile.ZipFile(io.BytesIO(contenido)).read("word/document.xml").decode("utf-8")
    texto = re.sub(r"<[^>]+>", "|", xml)
    assert f"|{sigla}|" in texto
