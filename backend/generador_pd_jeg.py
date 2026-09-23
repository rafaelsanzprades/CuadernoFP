"""
Generador PD Detallada / JEG (V+) -- usa plantilla DOCX con docxtpl.

Plantilla: backend/templates/modelo_pd_fp+_tpl.docx
Estructura: 21 secciones (modelo JEG/CIFPA, grado D/E)

Uso:
    from generador_pd_jeg import generate
    generate(data, out_docx, out_pdf)
"""

import os
import re
from docxtpl import DocxTemplate
from helpers_catalogo import (
    build_ra_desc_map, build_ud_desc_map, build_ce_desc_map,
    resolve_ra_desc, resolve_ud_desc, resolve_ce_desc, resolve_recursos,
    resolve_feoe_dual,
)

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'templates', 'modelo_pd_jeg_tpl_final.docx')

# Textos genericos de respaldo: se usan solo si el campo correspondiente no
# tiene contenido en config_contexto (todavia sin UI propia en la app), para
# que la plantilla nunca muestre un hueco en blanco.
DEFAULT_EQUIPAMIENTO_TECNICO = "equipos informáticos, proyector y conexión a red del centro"
DEFAULT_RECURSOS_TECNOLOGICOS = "ordenadores con conexión a internet y acceso a la plataforma educativa del centro"
DEFAULT_SOFTWARE_HERRAMIENTAS = "el software específico del módulo, disponible en los equipos del aula/taller"
DEFAULT_MATERIAL_DIDACTICO = "apuntes, manuales de referencia y documentación técnica del sector"
DEFAULT_ESPACIOS_COMPLEMENTARIOS = "biblioteca y salón de actos del centro"
DEFAULT_TEXTO_CRITERIOS_CALIFICACION = (
    "el grado de consecución observado en las actividades de evaluación vinculadas a dicho CE, "
    "valorado mediante los instrumentos de evaluación establecidos"
)
DEFAULT_RECURSOS_PERSONALES_CONTINGENCIA = "el profesorado del departamento didáctico correspondiente"
DEFAULT_RECURSOS_MATERIALES_CONTINGENCIA = "los mismos recursos materiales habituales del módulo"
DEFAULT_RECURSOS_DOCUMENTALES_CONTINGENCIA = "los apuntes y la documentación técnica ya facilitados al alumnado"
DEFAULT_RECURSOS_DIGITALES_CONTINGENCIA = "la plataforma educativa y el aula virtual del centro"


def _ra_id_full(ra: dict) -> str:
    id_str = str(ra.get('id_ra', '')).strip().rstrip('.')
    prefix = "" if id_str.upper().startswith("RA") else "RA"
    return f"{prefix}{id_str}"


def _build_context(data: dict) -> dict:
    """
    Construye el contexto Jinja2 para la PD+ (Detallada/JEG).
    
    data: {
        "modulo": "Maquinas Electricas",
        "ciclo": "Tecnico IEA",
        "departamento": "Electricidad",
        "curso_academico": "2025/2026",
        "horas_totales": 167,
        "horas_semanales": 5,
        "regimen": "diurno",
        "grado": "D",
        "nivel": "2",
        "curso_ciclo": "primero",
        "df_ra": [...],
        "df_ud": [...],
        "config_contexto": {...},
        "info_fechas": {...}
    }
    """
    modulo = data.get("modulo", "el modulo profesional")
    ciclo = data.get("ciclo", "el ciclo formativo")
    departamento = data.get("departamento", "")
    curso = data.get("curso_academico", "2025/2026")
    horas_totales = data.get("horas_totales", "")
    horas_semanales = data.get("horas_semanales", "")
    regimen = data.get("regimen", "diurno")
    grado = data.get("grado", "D")
    nivel = data.get("nivel", "2")
    curso_ciclo = data.get("curso_ciclo", "primero")
    df_ra = data.get("df_ra", [])
    df_ud = data.get("df_ud", [])
    df_ce = data.get("df_ce", [])
    df_sgmt = data.get("df_sgmt", [])
    config = data.get("config_contexto", {})
    fechas = data.get("info_fechas", {})

    # Construir mapas de descripciones desde catálogo
    ra_desc_map = build_ra_desc_map(data)
    ud_desc_map = build_ud_desc_map(data)
    ce_desc_map = build_ce_desc_map(data)

    # Nombre del tipo de elemento: "módulo profesional" o "proyecto"
    tipo_elemento = "módulo profesional"
    if config.get("es_proyecto", False):
        tipo_elemento = "proyecto"

    # Curso como ordinal
    curso_ordinals = {"primero": "1.o", "segundo": "2.o", "tercero": "3.o"}
    curso_numero = curso_ordinals.get(curso_ciclo, "1.o")

    # --- Contexto base (variables de portada e identificacion) ---
    context = {
        # Portada
        "tipo_centro": config.get("tipo_centro", "Tipo de Centro Educativo"),
        "nombre_centro": config.get("nombre_centro", "Nombre del Centro"),
        "curso_academico": curso,
        "tipo_elemento": tipo_elemento,
        "modulo": modulo,
        "familia_profesional": config.get("familia_profesional", "Denominacion de la Familia Profesional"),
        # "Tipo de enseñanza" (tabla Identificación): sin fuente propia en la
        # app (no es un dato de catálogo ni tiene campo de UI) -- por defecto
        # se deriva de la modalidad (presencial/distancia/semipresencial),
        # que sí existe y ya se muestra correctamente en portada e
        # Identificación. Antes caía siempre en el texto de ejemplo de la
        # plantilla ("Tipo de ensenanza") porque config.tipo_ensenanza no lo
        # escribe ninguna pantalla.
        "tipo_ensennanza": config.get("tipo_ensenanza") or config.get("modalidad", "presencial").capitalize(),
        "denominacion_grado": config.get("denominacion_grado", ciclo),
        "titulacion": config.get("titulacion", ""),
        "grado": grado,
        "nivel": nivel,
        "curso_numero": curso_numero,
        "modalidad": config.get("modalidad", "presencial"),
        "codigo_grado": config.get("codigo_grado", ""),
        "modulo_codigo": data.get("info_modulo", {}).get("codigo", ""),
        "profesorado": data.get("profesorado", ""),

        # Datos comunes
        "ciclo": ciclo,
        "departamento": departamento,
        "horas": str(horas_totales),
        "horas_semanales": str(horas_semanales),
    }

    # --- Contextualizacion ---
    context.update({
        "nombre_centro": config.get("nombre_centro", data.get("centro", "")),
        "municipio": config.get("municipio", ""),
        "provincia": config.get("provincia", "Teruel"),
        "comunidad_autonoma": config.get("comunidad_autonoma", "Aragon"),
        "tipo_centro": config.get("tipo_centro", "publico"),
        "tamanno_poblacion": config.get("tamano_poblacion", ""),
        "num_alumnado": str(config.get("num_alumnado", "")),
        "oferta_formativa": config.get("oferta_formativa", "ciclos formativos"),
        "programas_innovacion": config.get("programas_innovacion", ""),
        "procedencia_alumnado": config.get("procedencia_alumnado", ""),
        "franja_edad": config.get("franja_edad", "18-25"),
        "nivel_madurez": config.get("nivel_madurez", "homogeneo"),
        "vias_acceso": config.get("vias_acceso", ""),
        "nivel_competencial": config.get("nivel_competencial", ""),
        "grado_implicacion": config.get("grado_implicacion", "medio"),
        "expectativas": config.get("expectativas", "insercion laboral"),
        "grado_autonomia": config.get("grado_autonomia", ""),
        "habitos_estudio": config.get("habitos_estudio", ""),
        "capacidad_trabajo_equipo": config.get("capacidad_trabajo_equipo", ""),
        # Contexto cultural y entorno (de config_contexto o defaults)
        "contexto_cultural": config.get("contexto_cultural",
            config.get("A2_contextualizacion", "")),
        "entorno_empresarial": config.get("entorno_empresarial",
            config.get("B3_vinculacion_empresa", "")),
        "sectores_productivos": config.get("sectores_productivos",
            data.get("familia", "")),
        "perfiles_profesionales": config.get("perfiles_profesionales", ""),
        "caracteristicas_alumnado_extra": config.get("caracteristicas_alumnado_extra",
            config.get("F1_diversidad", "")),
    })

    # --- Espacios y equipamiento (contextualizacion) ---
    espacios_list = data.get("recursos_espacios", [])
    if isinstance(espacios_list, list):
        context["espacios_recursos"] = ", ".join(espacios_list)
    else:
        context["espacios_recursos"] = str(espacios_list)

    context.update({
        "equipamiento_tecnico": config.get("equipamiento_tecnico") or DEFAULT_EQUIPAMIENTO_TECNICO,
        "recursos_tecnologicos": config.get("recursos_tecnologicos") or DEFAULT_RECURSOS_TECNOLOGICOS,
        "software_herramientas": config.get("software_herramientas") or DEFAULT_SOFTWARE_HERRAMIENTAS,
        "material_didactico": config.get("material_didactico") or DEFAULT_MATERIAL_DIDACTICO,
        "espacios_complementarios": config.get("espacios_complementarios") or DEFAULT_ESPACIOS_COMPLEMENTARIOS,
    })

    # --- Duracion y distribucion horaria ---
    context.update({
        "horas_fct": str(config.get("horas_fct", "")),
        "horas_empresa": str(config.get("horas_empresa", "")),
        "curso_escolar": curso,
        "semanas_totales": str(config.get("semanas_totales", "36")),
    })

    # --- ECP, CPE, OG (textos libres) ---
    context.update({
        "texto_ecp": config.get("texto_ecp", "Este modulo profesional no esta asociado a ningun estandar de competencia profesional."),
        "texto_cpe": config.get("texto_cpe", ""),
        "texto_og": config.get("texto_og", ""),
        # Estos 3 leen de config_contexto (ContextoTab, /contexto?tab=entorno) y no del "textos_pd_*"
        # homónimo: ese vive en un componente que nunca se monta en ninguna página (MetodologiaContextoTab,
        # eliminado), así que en la app real esos campos nunca se rellenan. config_contexto sí es
        # alcanzable y ya tiene UI funcionando con contenido real.
        "textos_pd_contexto_geografico": config.get("entorno_geografico", ""),
        "textos_pd_contexto_socioeconomico": config.get("entorno_socioeconomico", ""),
        # La plantilla titula esta sección "Contexto escolar" -> config_contexto.contexto_escolar
        "textos_pd_contexto_academico": config.get("contexto_escolar", ""),
        # Sin campo de origen real (no hay ninguna pestaña que recoja "marco normativo"); queda vacío a propósito.
        "textos_pd_procedimientos_normativos": data.get("textos_pd_procedimientos_normativos", ""),
        # La plantilla solo tiene un placeholder para todo "Plan de contingencia" -> combina profesorado +
        # alumnado + interrupción generalizada desde config_contexto (ContingenciaTab,
        # /metodologia?tab=contingencia), mismo motivo que arriba.
        "textos_pd_plan_contingencia": "\n\n".join(filter(None, [
            config.get("contingencia_profesor", ""),
            config.get("contingencia_alumnado", ""),
            config.get("contingencia_general", config.get("J3_contingencia", "")),
        ])),
        "textos_pd_bibliografia": data.get("textos_pd_bibliografia", ""),
        "textos_pd_publicidad": data.get("textos_pd_publicidad", ""),
    })

    # --- RA y CE (seccion "Resultados de aprendizaje (RA) y criterios de
    # evaluacion (CE)") -- mismo patron que list_c2 en generador_pd_suficiente_tpl.py
    # (PD=): se aplana en una unica lista de lineas, cada una su propio
    # parrafo via {%p for %}, en vez de fijar un maximo de 7 RA como hacia
    # el codigo anterior (que ademas nunca llegaba a la plantilla real: los
    # tags ra{i}_titulo/ra{i}_texto no existian en ningun sitio del docx).
    ce_by_ra: dict = {}
    for ce in df_ce:
        ce_by_ra.setdefault(str(ce.get("id_ra", "")), []).append(ce)

    # Catalogo oficial agrupado por RA (curriculo_data), respaldo posicional
    # cuando el df_ce local no trae descripcion -- igual que en PD=.
    catalog_ce_by_ra: dict = {}
    for ra_cat in (data.get("curriculo_data") or {}).get("ra") or []:
        rid_cat = str(ra_cat.get("id", "")).strip().rstrip(".")
        catalog_ce_by_ra[rid_cat] = ra_cat.get("ce") or []

    list_ra_ce = []
    for ra in df_ra:
        rid = str(ra.get("id_ra", ""))
        list_ra_ce.append(f"{_ra_id_full(ra)}. {resolve_ra_desc(ra, ra_desc_map)}")
        list_ra_ce.append("Criterios de evaluación:")

        ces_locales = ce_by_ra.get(rid, [])
        ces_catalogo = catalog_ce_by_ra.get(rid, [])
        mismo_recuento = len(ces_locales) == len(ces_catalogo) and len(ces_catalogo) > 0

        for i, ce in enumerate(ces_locales):
            desc = resolve_ce_desc(ce, ce_desc_map)
            if not desc and mismo_recuento:
                desc = ces_catalogo[i].get("descripcion", "")
            if desc:
                peso = ce.get("peso_ce")
                prefijo = f"({int(peso)}%) " if peso else ""
                list_ra_ce.append(f"{prefijo}{desc}")
    context["list_ra_ce"] = list_ra_ce

    # --- Contenidos (C) -- reutiliza la misma simplificacion que ya hace
    # PD= en su seccion C1 (Contenidos): cada UD representa su propio bloque
    # de contenido, no hay ningun desglose "BC1/BC2..." mas fino en ningun
    # sitio de la app.
    context["list_contenidos"] = [
        f"UD {i}. {resolve_ud_desc(ud, ud_desc_map)}" for i, ud in enumerate(df_ud, 1)
    ]

    # --- Tabla "Organizacion y distribucion temporal" (N | Titulo | RA | CE |
    # C | CPE | OG | Duracion (horas) | Temporizacion) -- se reconstruye con
    # filas dinamicas en generate() (mismo patron que _insertar_tabla_secuenciacion
    # de PD=), en vez de los 10 huecos fijos ud1_titulo..ud10_titulo que
    # traia la plantilla (nunca escalaban a mas ni a menos de 10 UD). CE/C/CPE/OG
    # quedan en blanco: no hay ningun dato de la app que los alimente.
    ev_map = {str(row.get("id_ud", "")): row.get("ev") for row in df_sgmt}
    # df_ud guarda el porcentaje de cada RA en la clave "pct_ra{n}" (n = solo
    # el numero, sin el prefijo "RA") -- no en una clave con el id completo
    # del RA como "RA1"/"RA1.", que es lo que _ra_id_full devuelve.
    ra_pairs = []
    for ra in df_ra:
        rid_full = _ra_id_full(ra)
        m = re.search(r"\d+", rid_full)
        if m:
            ra_pairs.append((rid_full, f"pct_ra{m.group()}"))
    context["tabla_organizacion_ud"] = {
        "filas": [
            {
                "num": str(i),
                "titulo": resolve_ud_desc(ud, ud_desc_map),
                "ra_cubiertos": ", ".join(rid for rid, pct_key in ra_pairs if ud.get(pct_key, 0)),
                "horas": str(ud.get('horas_ud', '')),
                "temporizacion": (
                    f"{ev_map.get(str(ud.get('id_ud', '')))}ª evaluación"
                    if ev_map.get(str(ud.get('id_ud', ''))) else ""
                ),
            }
            for i, ud in enumerate(df_ud, 1)
        ],
    }

    # --- Tabla "Relacion entre los elementos curriculares" (RA | CE | C |
    # CPE | OG): filas dinamicas, una por RA -- CPE/OG quedan en blanco (sin
    # fuente de datos real); C muestra las UD que cubren ese RA, reutilizando
    # el mismo mapa pct_ra{n} de la tabla de organizacion, invertido.
    pct_key_by_ra = dict(ra_pairs)
    context["tabla_relacion_curricular"] = [
        {
            "ra": f"{_ra_id_full(ra)}. {resolve_ra_desc(ra, ra_desc_map)}",
            "ce": ", ".join(
                str(ce.get("id_ce", "")).replace("CE", "")
                for ce in ce_by_ra.get(str(ra.get("id_ra", "")), [])
            ),
            "c": ", ".join(
                f"UD{i}" for i, ud in enumerate(df_ud, 1)
                if ud.get(pct_key_by_ra.get(_ra_id_full(ra), ""), 0)
            ),
        }
        for ra in df_ra
    ]

    # --- Tabla "Ponderacion de los resultados de aprendizaje y de los
    # criterios de evaluacion": una columna CE+% por cada RA real (no las 10
    # fijas de la plantilla) y tantas filas como el RA con mas CE tenga (no
    # las 11 letras a-k fijas). peso_ce/peso_ra son datos reales de df_ce/df_ra.
    context["tabla_ponderacion_ce"] = [
        {
            "id": _ra_id_full(ra),
            "peso_ra": ra.get("peso_ra"),
            "ces": [
                {
                    "letra": str(ce.get("id_ce", "")).split(".")[-1] if "." in str(ce.get("id_ce", "")) else "",
                    "pct": f"{int(ce.get('peso_ce'))}%" if ce.get("peso_ce") else "",
                }
                for ce in ce_by_ra.get(str(ra.get("id_ra", "")), [])
            ],
        }
        for ra in df_ra
    ]

    # --- Organizacion secuencial ---
    context["organizacion_secuencial"] = config.get("organizacion_secuencial", "secuencial")

    # --- FEOE ---
    # Ítem 47 (00 IDEAS.md, decisión Rafael 2026-09-22): estos 3 tags ya
    # existían en la plantilla pero leían de campos que ninguna pantalla de
    # la app llega a escribir nunca (config.regimen_feoe/num_ra_feoe/
    # organizacion_no_feoe, e is_dual a nivel de módulo -- resto de un
    # campo de BD eliminado, ver alembic 0222ab355bfd) -- siempre caían en
    # su valor por defecto. Se conectan aquí a datos reales: régimen desde
    # Calendario->Periodo FEOE (info_fechas.tipo_dual), nº de RA dualizados
    # desde is_dual del CE (resolve_feoe_dual, misma fuente de verdad que
    # usa generador_pd_suficiente_tpl.py), y el texto para el alumnado no
    # dualizado desde Plan FEOE (textos_pd_feoe_organizacion, con
    # texto_feoe_trabajos_alternativos como respaldo si ese está vacío).
    feoe = resolve_feoe_dual(data)
    context["regimen_feoe"] = fechas.get("tipo_dual") or config.get("regimen_feoe", "general")
    context["fecha_inicio_feoe"] = fechas.get("ini_feoe", "")
    context["fecha_fin_feoe"] = fechas.get("fin_feoe", "")
    context["num_ra_feoe"] = str(len(feoe["ra_ids_dual"]))
    context["num_total_ra"] = str(len(df_ra))
    context["organizacion_no_feoe"] = (
        data.get("textos_pd_feoe_organizacion")
        or config.get("texto_feoe_trabajos_alternativos", "")
        or config.get("organizacion_no_feoe", "")
    )

    # --- Metodologia ---
    met_list = data.get("metodologias_seleccionadas", [])
    if isinstance(met_list, list):
        context["metodologias_seleccionadas"] = ". ".join(met_list)
    else:
        context["metodologias_seleccionadas"] = str(met_list)
    context["texto_metodologia_libre"] = data.get("texto_metodologia_libre", "")
    context["tamanno_equipo"] = str(config.get("tamano_equipo", "4"))
    # Tipo de agrupamiento colaborativo
    context["tipo_colaborativo"] = config.get("tipo_colaborativo",
        ", ".join(met_list) if isinstance(met_list, list) else "")

    # --- Recursos didacticos (usados en los 3 escenarios de Plan de contingencia) ---
    context["recursos_personales"] = config.get("recursos_personales") or DEFAULT_RECURSOS_PERSONALES_CONTINGENCIA
    context["recursos_materiales"] = config.get("recursos_materiales") or DEFAULT_RECURSOS_MATERIALES_CONTINGENCIA
    context["recursos_digitales"] = config.get("recursos_digitales") or DEFAULT_RECURSOS_DIGITALES_CONTINGENCIA
    context["recursos_documentales"] = config.get("recursos_documentales") or DEFAULT_RECURSOS_DOCUMENTALES_CONTINGENCIA
    # textos_pd_bibliografia (mismo campo que ya usaba la plantilla más abajo,
    # ahora con input real en PlanesTab.tsx) es la fuente preferente frente al
    # huérfano G3_bibliografia, que ninguna pestaña ha escrito nunca.
    context["bibliografia"] = (
        config.get("bibliografia")
        or data.get("textos_pd_bibliografia")
        or config.get("G3_bibliografia", "")
    )
    # Recursos adicionales de la plantilla — recursos_espacios resuelto a
    # etiquetas legibles (antes se mostraban los ids codificados en crudo,
    # p.ej. "REC-EPI" en vez de "Equipos de protección individual (EPI)").
    context["otros_recursos"] = config.get("otros_recursos",
        ", ".join(resolve_recursos(data.get("recursos_espacios"))))
    context["recursos_multimedia"] = config.get("recursos_multimedia",
        config.get("G2_herramientas", ""))
    context["software_nombre"] = config.get("software_nombre",
        config.get("G2_herramientas", ""))
    context["plataforma_educativa"] = config.get("plataforma_educativa", "Moodle")
    context["ubicacion_recursos"] = config.get("ubicacion_recursos",
        config.get("G1_infraestructuras", ""))

    # --- Agrupamientos ---
    context["agrupamiento_individual"] = config.get("agrupamiento_individual", "")
    context["agrupamiento_gran_grupo"] = config.get("agrupamiento_gran_grupo", "")
    context["agrupamiento_parejas"] = config.get("agrupamiento_parejas", "")
    context["agrupamiento_equipo"] = config.get("agrupamiento_equipo", "")
    # Tipo de aula y equipos
    context["tipo_aula"] = config.get("tipo_aula",
        config.get("D3_agrupamientos", ""))
    context["tipo_equipos"] = config.get("tipo_equipos",
        config.get("G1_infraestructuras", ""))

    # --- Evaluacion ---
    inst_list = data.get("instrumentos_seleccionados", [])
    if isinstance(inst_list, list):
        context["instrumentos_seleccionados"] = ". ".join(inst_list)
    else:
        context["instrumentos_seleccionados"] = str(inst_list)
    context["tecnicas_evaluacion"] = config.get("tecnicas_evaluacion", "")
    context["actividades_evaluacion_inicial"] = config.get("actividades_evaluacion_inicial", "")
    context["medidas_evaluacion_inicial"] = config.get("medidas_evaluacion_inicial", "")
    context["num_evaluaciones_parciales"] = config.get("num_evaluaciones_parciales", "tres evaluaciones parciales, una al finalizar cada trimestre")
    # Variables de evaluacion adicionales
    context["medio_evaluacion"] = config.get("medio_evaluacion",
        ", ".join(inst_list) if isinstance(inst_list, list) else "")
    context["tipo_actividad"] = config.get("tipo_actividad",
        ", ".join(set(a.get("Tipo", "") for a in data.get("df_act", []) if a.get("Tipo"))) if data.get("df_act") else "")
    context["actividad_evaluacion"] = config.get("actividad_evaluacion",
        config.get("D2_actividades_ea", ""))
    context["actividad_temporizacion"] = config.get("actividad_temporizacion",
        "tres evaluaciones parciales, una al finalizar cada trimestre")

    # --- Calificacion ---
    context["ponderacion_ra"] = config.get("ponderacion_ra", "")
    context["calificacion_minima"] = config.get("calificacion_minima", "5")
    context["texto_criterios_calificacion"] = config.get("texto_criterios_calificacion") or DEFAULT_TEXTO_CRITERIOS_CALIFICACION

    # --- Recuperacion ---
    context["momentos_recuperacion"] = config.get("momentos_recuperacion", "")
    context["actividades_recuperacion"] = config.get("actividades_recuperacion", "")
    context["instrumentos_recuperacion"] = config.get("instrumentos_recuperacion", "")
    context["ambito_recuperacion"] = config.get("ambito_recuperacion",
        config.get("E5_recuperacion", ""))

    # --- Plan de recuperacion de pendientes ---
    context["fecha_inicio_plan_recuperacion"] = config.get("fecha_inicio_plan_recuperacion", "")
    context["fecha_fin_plan_recuperacion"] = config.get("fecha_fin_plan_recuperacion", "")
    context["fases_plan_recuperacion"] = config.get("fases_plan_recuperacion", "")
    context["actividades_eval_inicial_recuperacion"] = config.get("actividades_eval_inicial_recuperacion", "")
    context["actividades_plan_recuperacion"] = config.get("actividades_plan_recuperacion", "")
    context["desarrollo_plan_recuperacion"] = config.get("desarrollo_plan_recuperacion", "")
    context["recursos_plan_recuperacion"] = config.get("recursos_plan_recuperacion", "")
    context["entrega_actividades"] = config.get("entrega_actividades",
        "Plataforma digital del centro")
    context["evaluacion_formativa_sumativa"] = config.get("evaluacion_formativa_sumativa", "")
    context["resolucion_dudas"] = config.get("resolucion_dudas",
        "Tutorias presenciales y telemáticas")
    context["estado_desarrollo_plan"] = config.get("estado_desarrollo_plan", "")
    context["comunicacion_inicial_plan"] = config.get("comunicacion_inicial_plan",
        config.get("formato_comunicacion_inicial", "Presentacion del plan al inicio del curso"))
    context["comunicacion_desarrollo_plan"] = config.get("comunicacion_desarrollo_plan",
        config.get("formato_comunicacion_desarrollo", "Seguimiento trimestral"))
    context["comunicacion_final_plan"] = config.get("comunicacion_final_plan",
        "Comunicacion final de resultados al cierre del curso")
    context["medio_entrega"] = config.get("medio_entrega",
        "Plataforma digital del centro")

    # --- Inclusion ---
    inc_list = data.get("medidas_inclusion", [])
    if isinstance(inc_list, list):
        context["medidas_inclusion"] = ". ".join(inc_list)
    else:
        context["medidas_inclusion"] = str(inc_list)
    context["texto_inclusion_libre"] = data.get("texto_inclusion_libre", "")

    # --- Actividades complementarias ---
    act_list = data.get("actividades_complementarias", [])
    if isinstance(act_list, list) and len(act_list) > 0:
        act = act_list[0] if isinstance(act_list[0], dict) else {"titulo": str(act_list[0])}
        context["actividad1_titulo"] = act.get("titulo", "")
        context["actividad1_tipo"] = act.get("tipo", "complementaria")
        context["actividad1_ra"] = act.get("ra", "")
        context["actividad1_temporizacion"] = act.get("temporizacion", "")
        context["actividad1_entidad"] = act.get("entidad", "")
        # actividades_complementarias en la app real es solo una lista de
        # strings (checklist en InnovacionTab.tsx), no objetos con
        # "descripcion" -- sin este fallback, la descripcion sale siempre
        # vacia para todo el mundo real, mostrando solo el titulo.
        context["actividad1_descripcion"] = act.get("descripcion") or act.get("titulo", "")
        context["actividad1_evaluacion"] = act.get("evaluacion", "")
    else:
        context.update({
            "actividad1_titulo": "", "actividad1_tipo": "", "actividad1_ra": "",
            "actividad1_temporizacion": "", "actividad1_entidad": "",
            "actividad1_descripcion": "", "actividad1_evaluacion": "",
        })

    if isinstance(act_list, list) and len(act_list) > 1:
        act = act_list[1] if isinstance(act_list[1], dict) else {"titulo": str(act_list[1])}
        context["actividad2_titulo"] = act.get("titulo", "")
        context["actividad2_tipo"] = act.get("tipo", "complementaria")
        context["actividad2_ra"] = act.get("ra", "")
        context["actividad2_temporizacion"] = act.get("temporizacion", "")
        context["actividad2_entidad"] = act.get("entidad", "")
        context["actividad2_descripcion"] = act.get("descripcion") or act.get("titulo", "")
        context["actividad2_evaluacion"] = act.get("evaluacion", "")
    else:
        context.update({
            "actividad2_titulo": "", "actividad2_tipo": "", "actividad2_ra": "",
            "actividad2_temporizacion": "", "actividad2_entidad": "",
            "actividad2_descripcion": "", "actividad2_evaluacion": "",
        })

    # --- Plan de contingencia ---
    cont_list = data.get("medidas_contingencia", [])
    if isinstance(cont_list, list):
        context["medidas_contingencia"] = ". ".join(cont_list)
    else:
        context["medidas_contingencia"] = str(cont_list)
    context["texto_contingencia_libre"] = data.get("texto_contingencia_libre", "")
    context["actuaciones_contingencia"] = config.get("actuaciones_contingencia",
        config.get("J3_contingencia", data.get("texto_contingencia_libre", "")))

    # --- Aprendizaje colaborativo ---
    context["texto_aprendizaje_colaborativo"] = config.get("texto_aprendizaje_colaborativo", "")

    # --- Evaluacion informacion al alumnado ---
    context["texto_info_evaluacion"] = config.get("texto_info_evaluacion", "")

    # --- Comunicacion con familias ---
    context["formato_comunicacion"] = config.get("formato_comunicacion",
        "Correo electronico institucional, plataforma digital del centro")
    context["formato_comunicacion_inicial"] = config.get("formato_comunicacion_inicial",
        "Presentacion del plan de evaluacion al inicio del curso")
    context["formato_comunicacion_desarrollo"] = config.get("formato_comunicacion_desarrollo",
        "Comunicacion trimestral de resultados y seguimiento continuo")

    # --- Campo libre (para campos no mapeados) ---
    context["campo_libre"] = config.get("campo_libre", "")

    # --- Elementos transversales ---
    et_list = data.get("elementos_transversales", [])
    if isinstance(et_list, list):
        context["elementos_transversales"] = ". ".join(et_list)
    else:
        context["elementos_transversales"] = str(et_list)

    # --- Evaluacion de la programacion y propuestas de mejora (EQAVET/PDCA) ---
    # Item 37: moduleData.eqavet_evaluacion (rellenado en Inicio > Mejora, por
    # EqavetTab.tsx y PropuestasTab.tsx) no llegaba nunca a la plantilla porque
    # esta no tenia seccion para ello -- añadida como nueva seccion final tras
    # "Publicidad de la programacion didactica" en modelo_pd_jeg_tpl_final.docx.
    eqavet = data.get("eqavet_evaluacion") or {}
    for ind_id in ("ind1", "ind2", "ind3", "ind4", "ind5", "ind6", "ind7", "ind8"):
        context[f"eqavet_{ind_id}"] = str(eqavet.get(ind_id, ""))
    for categoria in ("planificacion", "desarrollo", "resultados"):
        context[f"eqavet_puntos_fuertes_{categoria}"] = eqavet.get(f"puntos_fuertes_{categoria}", "")
        context[f"eqavet_areas_mejora_{categoria}"] = eqavet.get(f"areas_mejora_{categoria}", "")

    return context


def _rellenar_tabla_organizacion_ud(doc, tabla_data: dict):
    """
    Ajusta a mano la tabla "N | Título | RA | CE | C | CPE | OG | Duración
    (horas) | Temporización" (sección "Organización y distribución temporal")
    para que tenga tantas filas como unidades didácticas tenga el módulo real,
    en vez del maximo fijo de 10 filas que trae la plantilla -- mismo motivo
    que _insertar_tabla_secuenciacion en PD=. Se localiza por su cabecera (no
    por posición: la plantilla tiene otras 11 tablas) y se conserva la fila 0
    (cabecera), sustituyendo por completo las filas de datos.
    """
    from docx.shared import Pt

    target = None
    for t in doc.tables:
        header = [c.text.strip() for c in t.rows[0].cells]
        if header[:2] == ["N", "Título"]:
            target = t
            break
    if target is None:
        return

    for row in list(target.rows[1:]):
        row._tr.getparent().remove(row._tr)

    for fila in tabla_data["filas"]:
        row_cells = target.add_row().cells
        row_cells[0].text = fila["num"]
        row_cells[1].text = fila["titulo"]
        row_cells[2].text = fila["ra_cubiertos"]
        row_cells[7].text = fila["horas"]
        row_cells[8].text = fila["temporizacion"]
        for cell in row_cells:
            for p in cell.paragraphs:
                for r in p.runs:
                    r.font.name = 'Arial'
                    r.font.size = Pt(9)


def _rellenar_tabla_relacion_curricular(doc, filas_data: list):
    """
    Igual que _rellenar_tabla_organizacion_ud pero para la tabla "RA | CE | C
    | CPE | OG" de la sección "Relación entre los elementos curriculares":
    misma columna (5) siempre, solo cambia el número de filas (una por RA
    real, no las 10 fijas de la plantilla). CPE/OG quedan en blanco.
    """
    from docx.shared import Pt

    target = None
    for t in doc.tables:
        header = [c.text.strip() for c in t.rows[0].cells]
        if header == ["RA", "CE", "C", "CPE", "OG"]:
            target = t
            break
    if target is None:
        return

    for row in list(target.rows[1:]):
        row._tr.getparent().remove(row._tr)

    for fila in filas_data:
        row_cells = target.add_row().cells
        row_cells[0].text = fila["ra"]
        row_cells[1].text = fila["ce"]
        row_cells[2].text = fila["c"]
        for cell in row_cells:
            for p in cell.paragraphs:
                for r in p.runs:
                    r.font.name = 'Arial'
                    r.font.size = Pt(9)


def _reconstruir_tabla_ponderacion_ce(doc, ra_list: list):
    """
    Reconstruye por completo la tabla "Ponderación de los resultados de
    aprendizaje y de los criterios de evaluación" (fila 0: "RA 1"/"RA 1"...
    fila 2: "CE"/"%" por cada RA, filas siguientes: letra de CE + peso_ce) --
    a diferencia de las otras dos tablas de esta sección, aquí también varía
    el número de COLUMNAS (un par CE/% por cada RA real, no las 10 fijas de
    la plantilla), así que no basta con añadir/quitar filas: se construye una
    tabla nueva desde cero y se sustituye la vieja en el mismo sitio del
    documento (mismo patrón que _insertar_tabla_secuenciacion en PD=).
    """
    from docx.shared import Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from helpers_pd_tablas import aplicar_bordes_rejilla

    old = None
    for t in doc.tables:
        c0 = t.rows[0].cells[0].text.strip() if t.rows and t.rows[0].cells else ""
        c2 = t.rows[2].cells[0].text.strip() if len(t.rows) > 2 and t.rows[2].cells else ""
        if c0.startswith("RA ") and c2 == "CE":
            old = t
            break
    if old is None:
        return

    n_ra = len(ra_list)
    if n_ra == 0:
        old._tbl.getparent().remove(old._tbl)
        return
    max_ce = max((len(ra["ces"]) for ra in ra_list), default=0)
    n_cols = n_ra * 2
    n_rows = 3 + max_ce  # fila RA + fila en blanco (igual que la plantilla original) + cabecera CE/% + filas de CE

    new_table = doc.add_table(rows=n_rows, cols=n_cols)
    aplicar_bordes_rejilla(new_table)

    def _fmt(cell, text, bold=False):
        cell.text = str(text)
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.bold = bold
                r.font.name = 'Arial'
                r.font.size = Pt(8)
                r.font.color.rgb = RGBColor(0, 0, 0)

    for j, ra in enumerate(ra_list):
        col0, col1 = 2 * j, 2 * j + 1
        _fmt(new_table.rows[0].cells[col0], ra["id"], bold=True)
        _fmt(new_table.rows[0].cells[col1], ra["id"], bold=True)
        # Fila 1 (en blanco en la plantilla original) se aprovecha para el
        # peso total del RA, único dato real disponible en ese nivel.
        _fmt(new_table.rows[1].cells[col1], f"{int(ra['peso_ra'])}%" if ra.get("peso_ra") else "", bold=True)
        _fmt(new_table.rows[2].cells[col0], "CE", bold=True)
        _fmt(new_table.rows[2].cells[col1], "%", bold=True)
        for i, ce in enumerate(ra["ces"]):
            _fmt(new_table.rows[3 + i].cells[col0], ce["letra"])
            _fmt(new_table.rows[3 + i].cells[col1], ce["pct"])
        for i in range(len(ra["ces"]), max_ce):
            _fmt(new_table.rows[3 + i].cells[col0], "")
            _fmt(new_table.rows[3 + i].cells[col1], "")

    old._tbl.addprevious(new_table._tbl)
    old._tbl.getparent().remove(old._tbl)


def generate(data: dict, out_docx: str, out_pdf: str = None):
    """
    Genera la PD+ (Detallada/JEG) usando la plantilla DOCX Jinja2.
    """
    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError(
            f"No se encontro la plantilla en: {TEMPLATE_PATH}. "
            f"Ejecuta 'python scripts/preparar_plantilla_pd_detallada.py' para generarla."
        )

    tpl = DocxTemplate(TEMPLATE_PATH)
    context = _build_context(data)
    # autoescape=True: docxtpl renderiza el propio XML del docx como plantilla
    # Jinja2 -- sin esto, un '<' o '&' suelto en texto libre del profesor
    # (desc_ra, textos narrativos...) se inserta tal cual en el XML y puede
    # dejar el documento mal formado (Word pide "reparar" el archivo al
    # abrirlo, o se pierde contenido en silencio). Con autoescape, Jinja2
    # escapa esos caracteres antes de insertarlos, sin tocar el dato guardado.
    tpl.render(context, autoescape=True)

    doc = tpl.docx
    _rellenar_tabla_organizacion_ud(doc, context["tabla_organizacion_ud"])
    _rellenar_tabla_relacion_curricular(doc, context["tabla_relacion_curricular"])
    _reconstruir_tabla_ponderacion_ce(doc, context["tabla_ponderacion_ce"])

    tpl.save(out_docx)
