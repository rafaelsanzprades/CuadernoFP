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
