"""
Helpers para resolver descripciones de RA, CE y UD desde el catálogo curricular.

Cuando los DataFrames (df_ra, df_ud, df_ce) no traen descripciones (desc_ra, desc_ud),
se intenta resolver desde curriculo_data o desde info_modulo.codigo.
"""

import re


def _norm_id(raw: str) -> str:
    """Normaliza un id_ra/id_ce/id_ud quitando puntos y espacios."""
    return re.sub(r'[\s.]', '', str(raw)).upper()


def build_ra_desc_map(data: dict) -> dict:
    """
    Construye un mapa {id_ra_normalizado: descripcion} desde:
    1. df_ra[].desc_ra (si existe)
    2. curriculo_data.ra[] (si existe)
    3. info_modulo.ra_og_mapping (solo ids, sin desc)
    Devuelve dict vacío si no hay descripciones disponibles.
    """
    result = {}
    # 1. Desde df_ra
    for ra in (data.get("df_ra") or []):
        rid = str(ra.get("id_ra", ""))
        desc = ra.get("desc_ra") or ra.get("Descripción") or ra.get("descripcion") or ""
        if rid and desc:
            result[_norm_id(rid)] = desc

    # 2. Desde curriculo_data
    curriculo = data.get("curriculo_data") or {}
    for ra in (curriculo.get("ra") or []):
        rid = str(ra.get("id", "") or ra.get("id_ra", ""))
        desc = ra.get("descripcion") or ra.get("desc_ra") or ""
        if rid and desc and _norm_id(rid) not in result:
            result[_norm_id(rid)] = desc

    return result


def build_ud_desc_map(data: dict) -> dict:
    """
    Construye un mapa {id_ud_normalizado: descripcion} desde:
    1. df_ud[].desc_ud (si existe)
    2. curriculo_data.ud[] (si existe)
    """
    result = {}
    # 1. Desde df_ud
    for ud in (data.get("df_ud") or []):
        uid = str(ud.get("id_ud", ""))
        desc = ud.get("desc_ud") or ud.get("Descripción") or ud.get("descripcion") or ""
        if uid and desc:
            result[_norm_id(uid)] = desc

    # 2. Desde curriculo_data
    curriculo = data.get("curriculo_data") or {}
    for ud in (curriculo.get("ud") or []):
        uid = str(ud.get("id", "") or ud.get("id_ud", ""))
        desc = ud.get("descripcion") or ud.get("desc_ud") or ""
        if uid and desc and _norm_id(uid) not in result:
            result[_norm_id(uid)] = desc

    return result


def build_ce_desc_map(data: dict) -> dict:
    """
    Construye un mapa {id_ce_normalizado: descripcion} desde:
    1. df_ce[].desc_ce (si existe)
    2. curriculo_data (buscando en ra[].ce[])
    """
    result = {}
    # 1. Desde df_ce
    for ce in (data.get("df_ce") or []):
        cid = str(ce.get("id_ce", ""))
        desc = ce.get("desc_ce") or ce.get("Descripción") or ce.get("descripcion") or ""
        if cid and desc:
            result[_norm_id(cid)] = desc

    # 2. Desde curriculo_data
    curriculo = data.get("curriculo_data") or {}
    for ra in (curriculo.get("ra") or []):
        for ce in (ra.get("ce") or []):
            cid = str(ce.get("id", "") or ce.get("id_ce", ""))
            desc = ce.get("descripcion") or ce.get("desc_ce") or ""
            if cid and desc and _norm_id(cid) not in result:
                result[_norm_id(cid)] = desc

    return result


def resolve_ra_desc(ra: dict, desc_map: dict) -> str:
    """Obtiene la descripción de un RA, primero del dict, luego del mapa."""
    desc = ra.get("desc_ra") or ra.get("Descripción") or ra.get("descripcion") or ""
    if not desc:
        desc = desc_map.get(_norm_id(str(ra.get("id_ra", ""))), "")
    return desc


def resolve_ud_desc(ud: dict, desc_map: dict) -> str:
    """Obtiene la descripción de un UD, primero del dict, luego del mapa."""
    desc = ud.get("desc_ud") or ud.get("Descripción") or ud.get("descripcion") or ""
    if not desc:
        desc = desc_map.get(_norm_id(str(ud.get("id_ud", ""))), "")
    return desc


def resolve_ce_desc(ce: dict, desc_map: dict) -> str:
    """Obtiene la descripción de un CE, primero del dict, luego del mapa."""
    desc = ce.get("desc_ce") or ce.get("Descripción") or ce.get("descripcion") or ""
    if not desc:
        desc = desc_map.get(_norm_id(str(ce.get("id_ce", ""))), "")
    return desc


# Espejo en Python del catálogo de frontend/src/data/herramientasRecursos.ts,
# para resolver los ids codificados que el profesorado marca en "Instrumentos
# y recursos" a su etiqueta legible en el documento. Compartido entre
# generadores de PD (PD=, PD+) — si se añade un recurso nuevo al catálogo del
# frontend, hay que añadirlo aquí también.
RECURSOS_LABELS = {
    "REC-AULA": "Aula técnica / polivalente",
    "REC-TALLER": "Taller específico",
    "REC-LAB": "Laboratorio",
    "REC-INFO": "Aula de informática",
    "REC-ALMACEN": "Almacén / pañol de herramientas",
    "REC-EXTERIOR": "Espacio exterior / patio de prácticas",
    "REC-PIZARRA": "Pizarra y proyector / pantalla",
    "REC-PDI": "Pizarra digital interactiva (PDI)",
    "REC-ORDENADORES": "Ordenadores e impresora",
    "REC-TABLETS": "Tablets / dispositivos móviles",
    "REC-MOBILIARIO": "Mobiliario adaptable (mesas de trabajo en grupo)",
    "REC-SOFT-OFIMATICA": "Software ofimático (procesador, hoja de cálculo, presentaciones)",
    "REC-SOFT-ESPECIFICO": "Software específico del módulo / sector",
    "REC-EVA": "Entorno Virtual de Aprendizaje (Aules / Moodle / Classroom)",
    "REC-CLASSROOM": "Google Classroom / Google Workspace for Education",
    "REC-TEAMS": "Microsoft Teams para Educación / Microsoft 365 Educación",
    "REC-FORMS": "Formularios y cuestionarios online (Forms, Kahoot, Quizizz)",
    "REC-CAD": "Software de diseño asistido por ordenador (CAD/CAM)",
    "REC-SIMULADOR": "Software de simulación / entorno virtual de prácticas",
    "REC-GESTION-TALLER": "Software de gestión y control de taller",
    "REC-REPOSITORIO": "Repositorio documental compartido (Drive / OneDrive)",
    "REC-MANUALES": "Manuales técnicos y libros de texto",
    "REC-NORMATIVA": "Normativa técnica y reglamentos del sector",
    "REC-FICHAS-TECNICAS": "Fichas técnicas y catálogos de fabricantes",
    "REC-APUNTES": "Apuntes y material elaborado por el profesorado",
    "REC-VIDEOTECA": "Videoteca / recursos audiovisuales técnicos",
    "REC-HERR-MANUALES": "Herramientas manuales",
    "REC-HERR-ELECTRICAS": "Herramientas eléctricas / motorizadas",
    "REC-INSTR-MEDIDA": "Instrumentos y equipos de medida",
    "REC-MAQUINARIA": "Maquinaria y equipos específicos del sector",
    "REC-CONSUMIBLES": "Materiales consumibles y fungibles de prácticas",
    "REC-MAQUETAS": "Maquetas y bancos de prácticas / simulación de instalaciones",
    "REC-EPI": "Equipos de protección individual (EPI)",
    "REC-EPC": "Equipos de protección colectiva",
    "REC-SENALIZACION": "Señalización de seguridad del taller",
    "REC-BOTIQUIN": "Botiquín y material de primeros auxilios",
    "REC-EMAIL": "Correo electrónico institucional",
    "REC-APP-COMUNICACION": "App de comunicación con familias/alumnado (Séneca, Educamos, etc.)",
}


def resolve_recursos(recursos_espacios: list) -> list:
    """Resuelve una lista de recursos_espacios (ids del catálogo o texto libre
    añadido por el profesorado) a sus etiquetas legibles."""
    return [RECURSOS_LABELS.get(r, r) for r in (recursos_espacios or [])]


def fetch_curriculo_from_db(codigo_modulo: str, db) -> dict:
    """
    Consulta el catálogo oficial (tablas Module/LearningOutcome/EvaluationCriterion)
    por código de módulo y lo devuelve en el mismo formato que build_ra_desc_map /
    build_ce_desc_map esperan de curriculo_data ({"ra": [{"id","descripcion","ce":[...]}]})
    — el mismo formato que ya sirve GET /api/catalog/module/{module_code}
    (backend/routers/catalogs.py). Se usa como último recurso cuando df_ra/df_ud/df_ce
    no traen descripción y el frontend tampoco envió curriculo_data ya resuelto.
    """
    if not codigo_modulo:
        return {}
    from models import Module, LearningOutcome, EvaluationCriterion

    module = db.query(Module).filter(Module.code == codigo_modulo).first()
    if not module:
        return {}

    ras = (
        db.query(LearningOutcome)
        .filter(LearningOutcome.module_id == module.id)
        .order_by(LearningOutcome.ra_number)
        .all()
    )
    ra_data = []
    for ra in ras:
        ces = db.query(EvaluationCriterion).filter(EvaluationCriterion.learning_outcome_id == ra.id).all()
        ce_data = [{"id": ce.ce_code, "descripcion": ce.description} for ce in ces]
        ra_data.append({"id": f"RA{ra.ra_number}.", "descripcion": ra.description, "ce": ce_data})

    return {"ra": ra_data}
