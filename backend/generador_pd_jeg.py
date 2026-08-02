"""
Generador PD Detallada / JEG (V+) -- usa plantilla DOCX con docxtpl.

Plantilla: backend/templates/modelo_pd_fp+_tpl.docx
Estructura: 21 secciones (modelo JEG/CIFPA, grado D/E)

Uso:
    from generador_pd_detallada import generate
    generate(data, out_docx, out_pdf)
"""

import os
from docxtpl import DocxTemplate
from helpers_catalogo import build_ra_desc_map, build_ud_desc_map, resolve_ra_desc, resolve_ud_desc

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'templates', 'modelo_pd_jeg_tpl_final.docx')


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
    config = data.get("config_contexto", {})
    fechas = data.get("info_fechas", {})

    # Construir mapas de descripciones desde catálogo
    ra_desc_map = build_ra_desc_map(data)
    ud_desc_map = build_ud_desc_map(data)

    # Nombre del tipo de elemento: "modulo profesional" o "proyecto"
    tipo_elemento = "modulo profesional"
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
        "tipo_ensennanza": config.get("tipo_ensenanza", "Tipo de ensenanza"),
        "denominacion_grado": config.get("denominacion_grado", ciclo),
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
        "equipamiento_tecnico": config.get("equipamiento_tecnico", ""),
        "recursos_tecnologicos": config.get("recursos_tecnologicos", ""),
        "software_herramientas": config.get("software_herramientas", ""),
        "material_didactico": config.get("material_didactico", ""),
        "espacios_complementarios": config.get("espacios_complementarios", ""),
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
        # alumnado desde config_contexto (ContingenciaTab, /metodologia?tab=contingencia), mismo motivo que arriba.
        "textos_pd_plan_contingencia": "\n\n".join(filter(None, [
            config.get("contingencia_profesor", ""),
            config.get("contingencia_alumnado", ""),
        ])),
        "textos_pd_bibliografia": data.get("textos_pd_bibliografia", ""),
        "textos_pd_publicidad": data.get("textos_pd_publicidad", ""),
    })

    # --- RA y CE (tablas) ---
    # df_ra: lista de dicts con {id_ra, desc_ra, pct_ra, ce: [{id_ce, desc_ce}]}
    for i in range(1, 8):
        if i <= len(df_ra):
            ra = df_ra[i-1]
            desc = resolve_ra_desc(ra, ra_desc_map)
            context[f"ra{i}_titulo"] = desc
            context[f"ra{i}_texto"] = desc
        else:
            context[f"ra{i}_titulo"] = ""
            context[f"ra{i}_texto"] = ""

    # --- UD (unidades didacticas) ---
    for i in range(1, 11):
        if i <= len(df_ud):
            ud = df_ud[i-1]
            desc = resolve_ud_desc(ud, ud_desc_map)
            context[f"ud{i}_titulo"] = desc
            context[f"ud{i}_nombre"] = desc
            context[f"ud{i}_num"] = str(i)
            context[f"ud{i}_horas"] = str(ud.get('horas_ud', ''))
            context[f"ud{i}_ev"] = str(ud.get('ev_ud', ''))
            # Porcentajes por RA
            for j in range(1, 8):
                context[f"ud{i}_ra{j}"] = str(ud.get(f'pct_ra{j}', ''))
        else:
            context[f"ud{i}_titulo"] = ""
            context[f"ud{i}_nombre"] = ""
            context[f"ud{i}_num"] = ""
            context[f"ud{i}_horas"] = ""
            context[f"ud{i}_ev"] = ""
            for j in range(1, 8):
                context[f"ud{i}_ra{j}"] = ""

    # --- Organizacion secuencial ---
    context["organizacion_secuencial"] = config.get("organizacion_secuencial", "secuencial")

    # --- FEOE ---
    is_dual = data.get("is_dual", False)
    context["regimen_feoe"] = config.get("regimen_feoe", "general")
    context["fecha_inicio_feoe"] = fechas.get("fecha_inicio_feoe", "")
    context["fecha_fin_feoe"] = fechas.get("fecha_fin_feoe", "")
    context["num_ra_feoe"] = str(config.get("num_ra_feoe", 0))
    context["num_total_ra"] = str(len(df_ra))
    context["organizacion_no_feoe"] = config.get("organizacion_no_feoe", "")

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

    # --- Recursos didacticos ---
    context["recursos_personales"] = config.get("recursos_personales", "")
    context["recursos_materiales"] = config.get("recursos_materiales", "")
    context["recursos_digitales"] = config.get("recursos_digitales", "")
    context["recursos_documentales"] = config.get("recursos_documentales", "")
    context["bibliografia"] = config.get("bibliografia",
        config.get("G3_bibliografia", ""))
    # Recursos adicionales de la plantilla
    context["otros_recursos"] = config.get("otros_recursos",
        ", ".join(data.get("recursos_espacios", [])) if data.get("recursos_espacios") else "")
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
        context["instrumentos_seleccionadas"] = str(inst_list)
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
    context["texto_criterios_calificacion"] = config.get("texto_criterios_calificacion", "")

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
        context["actividad1_descripcion"] = act.get("descripcion", "")
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
        context["actividad2_descripcion"] = act.get("descripcion", "")
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

    return context


def generate(data: dict, out_docx: str, out_pdf: str = None):
    """
    Genera la PD+ (Detallada/JEG) usando la plantilla DOCX Jinja2.
    """
    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError(
            f"No se encontro la plantilla en: {TEMPLATE_PATH}. "
            f"Ejecuta 'python scripts/preparar_plantilla_pd_detallada.py' para generarla."
        )

    doc = DocxTemplate(TEMPLATE_PATH)
    context = _build_context(data)
    doc.render(context)
    doc.save(out_docx)
