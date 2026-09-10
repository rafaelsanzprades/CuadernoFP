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


# Escala oficial española (Insuficiente/Suficiente/Bien/Notable/Sobresaliente),
# idéntica a DEFAULT_ESCALAS_EVALUACION en frontend/src/components/features/modulo/DatosTab.tsx —
# se usa solo si el profesor no ha definido/editado su propia escala en esa pestaña.
DEFAULT_ESCALAS_EVALUACION = [
    {"id": "eev_in", "nombre": "Insuficiente (IN)", "coeficiente": 3},
    {"id": "eev_su", "nombre": "Suficiente (SU)", "coeficiente": 5},
    {"id": "eev_bi", "nombre": "Bien (BI)", "coeficiente": 6},
    {"id": "eev_nt", "nombre": "Notable (NT)", "coeficiente": 7.5},
    {"id": "eev_sb", "nombre": "Sobresaliente (SB)", "coeficiente": 9.5},
]


def resolve_escala_cualitativa(nota, escalas: list) -> str:
    """Convierte una nota numérica (0-10) a su etiqueta cualitativa más cercana.

    Cada escala tiene un "coeficiente" = valor central de su tramo (p. ej.
    Notable=7.5 cubre aprox. 7-8.5), no un umbral inferior — por eso se busca
    el coeficiente con menor distancia absoluta a la nota, no un lookup por
    rango. Devuelve "" si no hay nota o no hay escalas definidas.
    """
    if nota is None:
        return ""
    try:
        nota = float(nota)
    except (TypeError, ValueError):
        return ""
    escalas = escalas or DEFAULT_ESCALAS_EVALUACION
    if not escalas:
        return ""
    mejor = min(escalas, key=lambda e: abs(float(e.get("coeficiente", 0)) - nota))
    return str(mejor.get("nombre", ""))


# NivelFP (catálogo, LO 3/2022) -> rango de la plantilla PD+/JEG (campo
# "Titulación", ver ítem 16 de RF Ideas/00 IDEAS.md). La subdistinción
# Especialista/Máster de FP dentro de ESPECIALIZACION no está resuelta en el
# enum del catálogo — se deja "Especialista" para ese nivel.
NIVEL_FP_A_TITULACION = {
    "BASICA": "Técnico básico",
    "MEDIO": "Técnico",
    "SUPERIOR": "Técnico superior",
    "ESPECIALIZACION": "Especialista",
}


def resolve_grado_info(codigo_modulo: str, db) -> dict:
    """Resuelve familia profesional, código y denominación del título desde el
    catálogo oficial (Degree/ProfessionalFamily), a partir del código de
    módulo (p. ej. "0237"). Devuelve {} si el módulo no está en el catálogo
    (título no oficial o todavía no scrapeado) — el llamador debe mantener
    su propio valor por defecto en ese caso, no asumir que siempre hay dato.
    """
    if not codigo_modulo:
        return {}
    from models import Module

    module = db.query(Module).filter(Module.code == codigo_modulo).first()
    if not module or not module.degree:
        return {}

    degree = module.degree
    denominacion = degree.name or ""
    prefix = f"{degree.code} - "
    if degree.code and denominacion.startswith(prefix):
        denominacion = denominacion[len(prefix):]

    return {
        "familia_profesional": degree.family.name if degree.family else "",
        "codigo_grado": degree.code or "",
        "denominacion_grado": denominacion,
        "titulacion": NIVEL_FP_A_TITULACION.get(degree.level.name, "") if degree.level else "",
    }


DEFAULT_CONFIG_REDONDEO = {
    "nota_aprobado": 5.0,
    "umbral_redondeo": 5.0,
    "max_compensables": 0,
}


def calcular_notas_jeg(al_id: str, df_calificaciones: list, df_indicadores: list, df_instr: list,
                        df_ce: list, df_ra: list, config: dict = None) -> dict:
    """Motor de calificación JEG (Instrumento -> Indicador -> CE -> RA -> Módulo), el único motor de la app.

    Puerto línea a línea de calcularNotasJEG() en
    frontend/src/utils/calificaciones.ts — sincronización manual, no hay
    código compartido entre frontend y backend. Modelo de Javier Edo Gual
    (JEG), con 3 vías: ordinario (pondera vía CE, con el peso de cada
    Indicador dentro de su CE), y recuperación/extraordinaria (Indicador
    directo al RA, sin pasar por peso_ce — la recuperación sustituye a la
    ordinaria en los RA donde el alumno tiene calificación de recuperación;
    EvFE es una hoja aparte que nunca se mezcla con la ordinaria). Un CE sin
    ninguna calificación se excluye del denominador ponderado de su RA, en
    vez de contar como 0 — se representa como `None` ("sin evaluar").
    """
    config = {**DEFAULT_CONFIG_REDONDEO, **(config or {})}

    def redondear(n_ra):
        if config["umbral_redondeo"] <= n_ra < config["nota_aprobado"]:
            return config["nota_aprobado"]
        return n_ra

    def nota_final_ponderada(notas_ra, peso_ra):
        suma, peso_usado = 0.0, 0.0
        for r_id, n_ra in notas_ra.items():
            if n_ra is None:
                continue
            suma += n_ra * peso_ra.get(r_id, 0)
            peso_usado += peso_ra.get(r_id, 0)
        return redondear(suma / peso_usado) if peso_usado > 0 else None

    instr_by_id = {i["id_instrumento"]: i for i in df_instr if i.get("id_instrumento")}
    cal_alumno = [c for c in df_calificaciones if c.get("id_alumno") == al_id and c.get("valor") is not None]

    def por_procedimiento(proc):
        return [c for c in cal_alumno
                if (instr_by_id.get(c.get("id_instrumento"), {}).get("procedimiento") or "ordinario") == proc]

    ce_of_indicador, peso_indicador = {}, {}
    for ind in df_indicadores:
        if not ind.get("id_indicador"):
            continue
        ce_of_indicador[ind["id_indicador"]] = ind.get("id_ce")
        peso_indicador[ind["id_indicador"]] = ind["peso"] if ind.get("peso") is not None else 1

    ra_of_ce, peso_ce = {}, {}
    for ce in df_ce:
        if not ce.get("id_ce"):
            continue
        ra_of_ce[ce["id_ce"]] = ce.get("id_ra")
        peso_ce[ce["id_ce"]] = float(ce.get("peso_ce") or 0)

    peso_ra = {ra["id_ra"]: float(ra.get("peso_ra") or 0) for ra in df_ra if ra.get("id_ra")}
    all_ra_ids = set(peso_ra.keys()) | set(ra_of_ce.values())

    def notas_indicador_de(cals):
        por_indicador: dict = {}
        for c in cals:
            instr = instr_by_id.get(c.get("id_instrumento")) or {}
            raw = c.get("nota_calculada") if isinstance(c.get("nota_calculada"), (int, float)) else c.get("valor")
            try:
                valor = float(raw)
            except (TypeError, ValueError):
                continue
            if valor != valor:  # NaN
                continue
            peso = instr.get("peso_global")
            peso = peso if peso is not None else 1
            por_indicador.setdefault(c.get("id_indicador"), []).append((valor, peso))
        out = {}
        for ind in df_indicadores:
            id_ind = ind.get("id_indicador")
            if not id_ind:
                continue
            entries = por_indicador.get(id_ind)
            if not entries:
                out[id_ind] = None
                continue
            peso_total = sum(p for _, p in entries)
            out[id_ind] = (sum(v * p for v, p in entries) / peso_total) if peso_total > 0 \
                else (sum(v for v, _ in entries) / len(entries))
        return out

    # Vía ordinaria: Indicador -> CE (con peso_indicador) -> RA (con peso_ce)
    notas_indicador = notas_indicador_de(por_procedimiento("ordinario"))

    suma_ponderada_ce, peso_usado_ce = {}, {}
    for id_indicador, n_ind in notas_indicador.items():
        if n_ind is None:
            continue
        ce_id = ce_of_indicador.get(id_indicador)
        if not ce_id:
            continue
        peso = peso_indicador.get(id_indicador, 0)
        suma_ponderada_ce[ce_id] = suma_ponderada_ce.get(ce_id, 0) + n_ind * peso
        peso_usado_ce[ce_id] = peso_usado_ce.get(ce_id, 0) + peso

    notas_ce = {}
    for ce in df_ce:
        id_ce = ce.get("id_ce")
        if not id_ce:
            continue
        peso_usado = peso_usado_ce.get(id_ce, 0)
        notas_ce[id_ce] = (suma_ponderada_ce[id_ce] / peso_usado) if peso_usado > 0 else None

    suma_ponderada_ra_ord, peso_usado_ra_ord = {}, {}
    failed_ces_by_ra = {}
    for ce_id, n_ce in notas_ce.items():
        if n_ce is None:
            continue
        r_id = ra_of_ce.get(ce_id)
        if not r_id:
            continue
        suma_ponderada_ra_ord[r_id] = suma_ponderada_ra_ord.get(r_id, 0) + n_ce * peso_ce[ce_id]
        peso_usado_ra_ord[r_id] = peso_usado_ra_ord.get(r_id, 0) + peso_ce[ce_id]
        if n_ce < config["nota_aprobado"]:
            failed_ces_by_ra[r_id] = failed_ces_by_ra.get(r_id, 0) + 1

    # Tope de compensables (Decisión B de Motor A, trasladado -- Ítem 42 punto
    # 6): solo aplica a la vía ordinaria, recuperación/extraordinaria saltan el
    # CE y no tienen nada que "compensar".
    notas_ra_ordinario = {}
    ra_tope_activo = {}
    for r_id in all_ra_ids:
        peso_usado = peso_usado_ra_ord.get(r_id, 0)
        if peso_usado <= 0:
            notas_ra_ordinario[r_id] = None
            ra_tope_activo[r_id] = False
            continue
        n_ra = redondear(suma_ponderada_ra_ord[r_id] / peso_usado)
        tope_activo = failed_ces_by_ra.get(r_id, 0) > config["max_compensables"] and n_ra >= config["nota_aprobado"]
        if tope_activo:
            n_ra = config["nota_aprobado"] - 0.1
        notas_ra_ordinario[r_id] = n_ra
        ra_tope_activo[r_id] = tope_activo

    # Recuperación / extraordinaria: Indicador -> RA DIRECTO, sin pasar por peso_ce.
    def notas_ra_directas(cals):
        notas_ind = notas_indicador_de(cals)
        suma, peso_usado = {}, {}
        for id_indicador, n_ind in notas_ind.items():
            if n_ind is None:
                continue
            ce_id = ce_of_indicador.get(id_indicador)
            r_id = ra_of_ce.get(ce_id) if ce_id else None
            if not r_id:
                continue
            peso = peso_indicador.get(id_indicador, 0)
            suma[r_id] = suma.get(r_id, 0) + n_ind * peso
            peso_usado[r_id] = peso_usado.get(r_id, 0) + peso
        out = {}
        for r_id in all_ra_ids:
            pu = peso_usado.get(r_id, 0)
            out[r_id] = redondear(suma[r_id] / pu) if pu > 0 else None
        return out

    notas_ra_recuperacion = notas_ra_directas(por_procedimiento("recuperacion"))
    notas_ra = {}
    for r_id in all_ra_ids:
        notas_ra[r_id] = notas_ra_recuperacion[r_id] if notas_ra_recuperacion[r_id] is not None \
            else notas_ra_ordinario[r_id]
    nota_final = nota_final_ponderada(notas_ra, peso_ra)

    notas_ra_evfe = notas_ra_directas(por_procedimiento("extraordinaria"))
    notas_ra_extraordinaria = {}
    for r_id in all_ra_ids:
        notas_ra_extraordinaria[r_id] = notas_ra_evfe[r_id] if notas_ra_evfe[r_id] is not None else notas_ra[r_id]
    nota_final_extraordinaria = nota_final_ponderada(notas_ra_extraordinaria, peso_ra)

    return {
        "notas_indicador": notas_indicador,
        "notas_ce": notas_ce,
        "notas_ra_ordinario": notas_ra_ordinario,
        "notas_ra": notas_ra,
        "nota_final": nota_final,
        "notas_ra_extraordinaria": notas_ra_extraordinaria,
        "nota_final_extraordinaria": nota_final_extraordinaria,
        "ra_tope_activo": ra_tope_activo,
    }


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
