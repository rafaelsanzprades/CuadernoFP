from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import pandas as pd
from database import get_db
from models import ModuleDocument, AttendanceRecord

from pydantic import BaseModel
from typing import Dict, Any, Optional

DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


class PdfRequest(BaseModel):
    module_data: Dict[str, Any]
    curso_data: Dict[str, Any]
    fecha_corte: Optional[str] = None
    # Campo libre para parámetros específicos de un tipo de documento
    # (periodo del acta, module_document_id, etc.) sin tener que ampliar
    # este modelo cada vez que se añade un generador.
    extra: Optional[Dict[str, Any]] = None


router = APIRouter(prefix="/api/pdf", tags=["PDF Generation"])


def _compute_attendance_summary(db: Session, module_document_id: Optional[str], al_id: str):
    """Resumen best-effort de asistencia para la Ficha individual. Devuelve
    None si no se aporta module_document_id o no hay registros: la
    asistencia vive en la tabla attendance_records, no en module_data/
    curso_data, así que solo está disponible si el frontend la indica."""
    if not module_document_id:
        return None
    try:
        records = db.query(AttendanceRecord).filter(
            AttendanceRecord.module_document_id == module_document_id,
            AttendanceRecord.student_id == al_id,
        ).all()
    except Exception:
        return None
    if not records:
        return None
    faltas = sum(1 for r in records if r.status == "falta")
    retrasos = sum(1 for r in records if r.status == "retraso")
    total = len(records)
    pct_faltas = (faltas / total * 100) if total else 0.0
    return {"faltas": faltas, "retrasos": retrasos, "pct_faltas": pct_faltas}


@router.post("")
def generate_pdf(type: str, request: PdfRequest, al_id: Optional[str] = None, item_id: Optional[str] = None,
                  file_format: Optional[str] = "pdf", db: Session = Depends(get_db)):
    print(f"--- GENERATE_PDF CALLED! type={type} al_id={al_id} item_id={item_id} format={file_format} ---")
    try:
        # Import PDF modules
        from pdf_calendario_academico import generar_pdf_calendario
        from pdf_seguimiento_diario import generar_pdf_seguimiento
        from pdf_planificacion import generar_pdf_planificacion
        from pdf_matrices import generar_pdf_matrices
        from pdf_boletin_grupal import generar_pdf_boletin_grupal, generar_pdf_boletin_grupal_final
        from pdf_boletin_individual import generar_pdf_boletin_individual
        from pdf_clases_ud import generar_pdf_clases_ud
        from pdf_alumnado_ubicacion import generar_pdf_alumnado_ubicacion
        from pdf_ficha_alumnado import generar_pdf_ficha_alumnado

        module_data = request.module_data
        curso_data = request.curso_data
        fecha_corte = request.fecha_corte
        extra = request.extra or {}

        # Helper to get df
        def get_df(data_dict, key):
            d = data_dict.get(key, [])
            return pd.DataFrame(d) if isinstance(d, list) else pd.DataFrame()

        info_modulo = module_data.get("info_modulo") or {}
        from datetime import datetime
        info_fechas_raw = curso_data.get("info_fechas") or {}
        info_fechas = {}
        for k, v in info_fechas_raw.items():
            if isinstance(v, str) and v.strip():
                try:
                    # Strip time parts if needed, fromisoformat handles standard ISO strings
                    info_fechas[k] = datetime.fromisoformat(v.replace("Z", "+00:00")[:10]).date()
                except Exception:
                    info_fechas[k] = v
            else:
                info_fechas[k] = v
        horario_raw = curso_data.get("horario") or {}
        horario = {k: int(v) if str(v).isdigit() else 0 for k, v in horario_raw.items()}
        planning_ledger = curso_data.get("planning_ledger") or {}
        calendar_notes = curso_data.get("calendar_notes") or {}
        df_sesiones = get_df(module_data, "df_sesiones")

        df_al = get_df(curso_data, "df_al")
        df_eval = get_df(curso_data, "df_eval")
        df_act = get_df(module_data, "df_act")
        df_ce = get_df(module_data, "df_ce")
        df_ra = get_df(module_data, "df_ra")
        df_feoe = get_df(curso_data, "df_feoe")
        df_ud = get_df(module_data, "df_ud")
        df_pr = get_df(module_data, "df_pr")
        plano_clase = curso_data.get("plano_clase") or {}
        escalas_evaluacion = module_data.get("escalas_evaluacion") or []
        config_redondeo = module_data.get("config_redondeo") or {}

        # ── Alternativa .docx para los generadores que hoy son solo PDF ────
        # (docx nativo con python-docx, no conversión docx2pdf: falla en
        # Linux/Cloud Run y ya se descartó como estrategia)
        if file_format == "docx":
            docx_bytes = None
            if type == "calendario":
                from pdf_calendario_academico import generar_docx_calendario
                docx_bytes = generar_docx_calendario(info_modulo, info_fechas, planning_ledger, calendar_notes)
            elif type == "seguimiento":
                from pdf_seguimiento_diario import generar_docx_seguimiento
                docx_bytes = generar_docx_seguimiento(info_modulo, info_fechas, horario, planning_ledger, calendar_notes, df_sesiones)
            elif type == "clases_ud":
                from pdf_clases_ud import generar_docx_clases_ud
                docx_bytes = generar_docx_clases_ud(info_modulo, df_ud, df_sesiones)
            elif type == "planificacion":
                from pdf_planificacion import generar_docx_planificacion
                df_sgmt = get_df(curso_data, "df_sgmt")
                daily_ledger = curso_data.get("daily_ledger", {})
                docx_bytes = generar_docx_planificacion(info_modulo, df_ud, df_sgmt, daily_ledger, horario, info_fechas, calendar_notes)
            elif type == "matrices":
                from pdf_matrices import generar_docx_matrices
                docx_bytes = generar_docx_matrices(info_modulo, df_ra, df_ud)
            elif type in ("grupal_1t", "grupal_2t", "grupal_3t"):
                from pdf_boletin_grupal import generar_docx_boletin_grupal
                tri = type.split("_")[1].upper()
                docx_bytes = generar_docx_boletin_grupal(tri, info_modulo, df_al, df_eval, df_act, fecha_corte, escalas_evaluacion)
            elif type == "grupal_final":
                from pdf_boletin_grupal import generar_docx_boletin_grupal_final
                docx_bytes = generar_docx_boletin_grupal_final(info_modulo, df_al, df_eval, df_act, fecha_corte, escalas_evaluacion)
            elif type == "individual":
                if not al_id: raise HTTPException(status_code=400, detail="al_id is required for individual document")
                from pdf_boletin_individual import generar_docx_boletin_individual
                docx_bytes = generar_docx_boletin_individual(info_modulo, al_id, df_al, df_eval, df_act, df_ce, df_ra,
                                                               df_feoe, info_fechas, planning_ledger, df_ud, df_pr,
                                                               escalas_evaluacion, config_redondeo)
            elif type == "alumnado_ubicacion":
                from pdf_alumnado_ubicacion import generar_docx_alumnado_ubicacion
                docx_bytes = generar_docx_alumnado_ubicacion(info_modulo, plano_clase, df_al)
            elif type == "ficha_alumnado":
                if not al_id: raise HTTPException(status_code=400, detail="al_id is required for ficha_alumnado")
                from pdf_ficha_alumnado import generar_docx_ficha_alumnado
                tutoria_entry = (curso_data.get("tutoria_ledger") or {}).get(al_id)
                attendance_summary = _compute_attendance_summary(db, extra.get("module_document_id"), al_id)
                docx_bytes = generar_docx_ficha_alumnado(info_modulo, al_id, df_al, tutoria_entry, attendance_summary)
            elif type == "reclamacion_notas":
                if not al_id or not item_id:
                    raise HTTPException(status_code=400, detail="al_id and item_id are required for reclamacion_notas")
                from pdf_reclamacion_notas import generar_docx_reclamacion
                reclamacion = next((r for r in (curso_data.get("df_reclamaciones") or []) if r.get("id") == item_id), None)
                if not reclamacion:
                    raise HTTPException(status_code=404, detail="Reclamación no encontrada")
                evidencia = [h for h in (curso_data.get("historial_calificaciones") or [])
                             if h.get("alumno_id") == al_id and h.get("campo") == reclamacion.get("referencia")]
                docx_bytes = generar_docx_reclamacion(info_modulo, al_id, df_al, reclamacion, evidencia)
            elif type == "refuerzo_alumno":
                if not al_id:
                    raise HTTPException(status_code=400, detail="al_id is required for refuerzo_alumno")
                from pdf_refuerzo_alumno import generar_docx_refuerzo
                docx_bytes = generar_docx_refuerzo(
                    info_modulo, al_id, df_al, df_eval.to_dict("records"), df_ra.to_dict("records"),
                    df_ce.to_dict("records"), df_act.to_dict("records"), config_redondeo,
                    curso_data.get("df_autoevaluacion") or []
                )

            if docx_bytes is not None:
                return Response(
                    content=docx_bytes, media_type=DOCX_MIME,
                    headers={"Content-Disposition": f'attachment; filename="{type}.docx"'},
                )
            # Si el tipo no tiene alternativa .docx (p.ej. "programacion_jeg", que
            # ya es .docx por defecto), seguimos hacia el despacho normal de abajo.

        buffer = None

        if type == "calendario":
            buffer = generar_pdf_calendario(info_modulo, info_fechas, planning_ledger, calendar_notes)
        elif type == "seguimiento":
            buffer = generar_pdf_seguimiento(info_modulo, info_fechas, horario, planning_ledger, calendar_notes, df_sesiones)
        elif type == "clases_ud":
            buffer = generar_pdf_clases_ud(info_modulo, df_ud, df_sesiones)
        elif type == "planificacion":
            df_sgmt = get_df(curso_data, "df_sgmt")
            daily_ledger = curso_data.get("daily_ledger", {})
            buffer = generar_pdf_planificacion(info_modulo, df_ud, df_sgmt, daily_ledger, horario, info_fechas, calendar_notes)
        elif type == "matrices":
            buffer = generar_pdf_matrices(info_modulo, df_ra, df_ud)
        elif type == "grupal_1t":
            buffer = generar_pdf_boletin_grupal("1T", info_modulo, df_al, df_eval, df_act, fecha_corte, escalas_evaluacion)
        elif type == "grupal_2t":
            buffer = generar_pdf_boletin_grupal("2T", info_modulo, df_al, df_eval, df_act, fecha_corte, escalas_evaluacion)
        elif type == "grupal_3t":
            buffer = generar_pdf_boletin_grupal("3T", info_modulo, df_al, df_eval, df_act, fecha_corte, escalas_evaluacion)
        elif type == "grupal_final":
            buffer = generar_pdf_boletin_grupal_final(info_modulo, df_al, df_eval, df_act, fecha_corte, escalas_evaluacion)
        elif type == "individual":
            if not al_id: raise HTTPException(status_code=400, detail="al_id is required for individual PDF")
            buffer = generar_pdf_boletin_individual(
                info_modulo=info_modulo, al_id=al_id, df_al=df_al, df_eval=df_eval,
                df_act=df_act, df_ce=df_ce, df_ra=df_ra, df_feoe=df_feoe,
                info_fechas=info_fechas, planning_ledger=planning_ledger,
                df_ud=df_ud, df_pr=df_pr, escalas_evaluacion=escalas_evaluacion,
                config_redondeo=config_redondeo
            )
        elif type == "alumnado_ubicacion":
            buffer = generar_pdf_alumnado_ubicacion(info_modulo, plano_clase, df_al)
        elif type == "ficha_alumnado":
            if not al_id: raise HTTPException(status_code=400, detail="al_id is required for ficha_alumnado")
            tutoria_entry = (curso_data.get("tutoria_ledger") or {}).get(al_id)
            attendance_summary = _compute_attendance_summary(db, extra.get("module_document_id"), al_id)
            buffer = generar_pdf_ficha_alumnado(info_modulo, al_id, df_al, tutoria_entry, attendance_summary)
        elif type == "reclamacion_notas":
            if not al_id or not item_id:
                raise HTTPException(status_code=400, detail="al_id and item_id are required for reclamacion_notas")
            from pdf_reclamacion_notas import generar_pdf_reclamacion
            reclamacion = next((r for r in (curso_data.get("df_reclamaciones") or []) if r.get("id") == item_id), None)
            if not reclamacion:
                raise HTTPException(status_code=404, detail="Reclamación no encontrada")
            evidencia = [h for h in (curso_data.get("historial_calificaciones") or [])
                         if h.get("alumno_id") == al_id and h.get("campo") == reclamacion.get("referencia")]
            buffer = generar_pdf_reclamacion(info_modulo, al_id, df_al, reclamacion, evidencia)
        elif type == "refuerzo_alumno":
            if not al_id:
                raise HTTPException(status_code=400, detail="al_id is required for refuerzo_alumno")
            from pdf_refuerzo_alumno import generar_pdf_refuerzo
            buffer = generar_pdf_refuerzo(
                info_modulo, al_id, df_al, df_eval.to_dict("records"), df_ra.to_dict("records"),
                df_ce.to_dict("records"), df_act.to_dict("records"), config_redondeo,
                curso_data.get("df_autoevaluacion") or []
            )
        elif type in ["programacion_suficiente_tpl", "programacion_minima_tpl", "programacion_jeg"]:
            if type == "programacion_minima_tpl":
                import generador_pd_minima_tpl as generador_pd
            elif type == "programacion_suficiente_tpl":
                import generador_pd_suficiente_tpl as generador_pd
            else:
                import generador_pd_jeg as generador_pd
            import tempfile
            import os
            import zipfile
            from io import BytesIO

            info_mod = module_data.get("info_modulo") or {}
            info_cur = curso_data.get("info_curso") or {}
            # Derivar campos que los generadores necesitan y que pueden no estar
            # explícitos en info_modulo (el DEMO usa nombres distintos)
            departamento = info_mod.get("departamento") or info_mod.get("familia", "Departamento")
            horas_semanales = info_mod.get("horas_semanales") or info_mod.get("h_sem", 5)
            regimen = info_mod.get("regimen", "diurno")
            # "Grado" del PD+ (JEG) es el rango LO 3/2022 (A-E), ya seleccionable
            # en /normativa?tab=legislacion (TabGrados.tsx, grado_formativo) —
            # distinto del "GM"/"GS" que se usa en otras partes de la app.
            grado = module_data.get("grado_formativo") or "D"
            nivel = info_mod.get("nivel", "Grado Medio")
            curso_ciclo = info_mod.get("curso_ciclo") or info_mod.get("curso", "1º")
            # Nombre del módulo: puede venir como "modulo" o "nombre"
            modulo_nombre = info_mod.get("modulo") or info_mod.get("nombre", "Módulo Profesional")
            # Curso académico: de info_curso o derivado de info_fechas
            curso_academico = info_cur.get("curso_academico", "")
            if not curso_academico:
                fechas = curso_data.get("info_fechas") or {}
                ini = fechas.get("ini_curso", "")
                if ini and len(ini) >= 4:
                    y1 = ini[:4]
                    y2 = str(int(y1) + 1)
                    curso_academico = f"{y1}/{y2}"
                else:
                    curso_academico = "2025/2026"

            # curriculo_data (texto oficial de RA/CE) casi nunca viaja en el .fpc
            # local — se resuelve aquí contra el catálogo BOA/BOE por código de
            # módulo, como último recurso, para que RA/UD/CE que no traigan
            # desc_ra/desc_ud/desc_ce en los dataframes locales igualmente
            # aparezcan en las PD (helpers_catalogo.build_ra_desc_map / _ce_desc_map).
            curriculo_data = curso_data.get("curriculo_data") or {}
            if not curriculo_data.get("ra"):
                from helpers_catalogo import fetch_curriculo_from_db
                curriculo_data = fetch_curriculo_from_db(info_mod.get("codigo", ""), db) or curriculo_data

            # Bloque "Grado" del PD+ (familia profesional, código,
            # denominación y titulación del título): resuelto 100% desde el
            # catálogo oficial (Degree/ProfessionalFamily) por código de
            # módulo — sin input manual, no hay ningún campo de UI hoy para
            # esto y el catálogo ya tiene el dato. Si el módulo no está en el
            # catálogo (título no oficial), se mantiene el placeholder de
            # siempre.
            from helpers_catalogo import resolve_grado_info
            grado_info = resolve_grado_info(info_mod.get("codigo", ""), db)
            config_contexto_pd = dict(curso_data.get("config_contexto") or {})
            config_contexto_pd.update({k: v for k, v in grado_info.items() if v})

            data_pd = {
                "departamento": departamento,
                "ciclo": info_mod.get("titulo_fp") or info_mod.get("ciclo", "Ciclo Formativo"),
                "modulo": modulo_nombre,
                "curso_academico": curso_academico,
                "horas_totales": info_mod.get("horas") or info_mod.get("horas_totales", 0),
                "horas_semanales": horas_semanales,
                "regimen": regimen,
                "grado": grado,
                "nivel": nivel,
                "curso_ciclo": curso_ciclo,
                "centro": info_mod.get("centro", ""),
                "profesorado": info_mod.get("profesorado", ""),
                "familia": info_mod.get("familia", ""),
                "df_ra": module_data.get("df_ra") or [],
                "df_ud": module_data.get("df_ud") or [],
                "df_act": module_data.get("df_act") or [],
                "df_ce": module_data.get("df_ce") or [],
                "df_sgmt": curso_data.get("df_sgmt") or [],
                "df_sesiones": module_data.get("df_sesiones") or [],
                "df_dua": module_data.get("df_dua") or [],
                "df_contingencia": module_data.get("df_contingencia") or [],
                "df_ace": module_data.get("df_ace") or module_data.get("actividades_complementarias") or [],
                "config_contexto": config_contexto_pd,
                "config_aula": module_data.get("config_aula") or curso_data.get("config_aula") or {},
                "config_redondeo": curso_data.get("config_redondeo") or {"nota_aprobado": 5.0, "umbral_redondeo": 4.5},
                "info_modulo": info_mod,
                "curriculo_data": curriculo_data,
                "is_dual": module_data.get("is_dual", False),
                "metodologias_seleccionadas": module_data.get("metodologias_seleccionadas", []),
                "instrumentos_seleccionados": module_data.get("instrumentos_seleccionados", []),
                "medidas_inclusion": module_data.get("medidas_inclusion", []),
                "medidas_contingencia": module_data.get("medidas_contingencia", []),
                "recursos_espacios": module_data.get("recursos_espacios", []),
                "actividades_complementarias": module_data.get("actividades_complementarias") or module_data.get("df_ace") or [],
                "elementos_transversales": module_data.get("elementos_transversales", []),
                "texto_contextualizacion_libre": module_data.get("texto_contextualizacion_libre", ""),
                "texto_metodologia_libre": module_data.get("texto_metodologia_libre", ""),
                "texto_inclusion_libre": module_data.get("texto_inclusion_libre", ""),
                "texto_contingencia_libre": module_data.get("texto_contingencia_libre", ""),
                "info_fechas": curso_data.get("info_fechas") or {},
                # Solo curso_data: generatePlanning() en planningGenerator.ts (la
                # previsión de /agenda?tab=planificacion que esta tabla replica)
                # lee únicamente cursoData.horario, sin fallback a moduleData —
                # cualquier fallback aquí desincroniza la tabla del PD respecto a
                # lo que ve el profesorado en la app.
                "horario": curso_data.get("horario") or {},
                "calendar_notes": curso_data.get("calendar_notes") or {},
                "planning_ledger": curso_data.get("planning_ledger") or {},
                # Textos narrativos PD (16 campos, ver ALLOWED_PROGRAMACION_KEYS en fileManager.ts)
                "textos_pd_contexto_geografico": module_data.get("textos_pd_contexto_geografico", ""),
                "textos_pd_contexto_socioeconomico": module_data.get("textos_pd_contexto_socioeconomico", ""),
                "textos_pd_contexto_escolar": module_data.get("textos_pd_contexto_escolar", ""),
                "textos_pd_caracteristicas_alumnado": module_data.get("textos_pd_caracteristicas_alumnado", ""),
                "textos_pd_feoe_organizacion": module_data.get("textos_pd_feoe_organizacion", ""),
                "textos_pd_feoe_seguimiento": module_data.get("textos_pd_feoe_seguimiento", ""),
                "textos_pd_eval_informacion": module_data.get("textos_pd_eval_informacion", ""),
                "textos_pd_eval_perdida_continua": module_data.get("textos_pd_eval_perdida_continua", ""),
                "textos_pd_eval_recuperacion": module_data.get("textos_pd_eval_recuperacion", ""),
                "textos_pd_eval_pendientes": module_data.get("textos_pd_eval_pendientes", ""),
                "textos_pd_metodologia_labor_coordinada": module_data.get("textos_pd_metodologia_labor_coordinada", ""),
                "textos_pd_inclusion": module_data.get("textos_pd_inclusion", ""),
                "textos_pd_contingencia_profesor": module_data.get("textos_pd_contingencia_profesor", ""),
                "textos_pd_contingencia_alumnado": module_data.get("textos_pd_contingencia_alumnado", ""),
                "textos_pd_bibliografia": module_data.get("textos_pd_bibliografia", ""),
                "textos_pd_publicidad": module_data.get("textos_pd_publicidad", ""),
                "instrumentos_pct_trimestre": module_data.get("instrumentos_pct_trimestre") or [],
            }

            with tempfile.TemporaryDirectory() as tmpdir:
                if type == "programacion_jeg":
                    import datetime
                    now_str = datetime.datetime.now().strftime("%Y%m%d-%H%M")
                    fname = f"{now_str} PD JEG"
                else:
                    fname = f"PD_{data_pd['modulo'][:30].replace(' ', '_').replace('/', '-')}"

                out_docx = os.path.join(tmpdir, fname + ".docx")
                out_pdf = os.path.join(tmpdir, fname + ".pdf")

                # Generate DOCX
                generador_pd.generate(data_pd, out_docx, out_pdf)
                # Siempre devolvemos DOCX para programación, independientemente del formato solicitado
                with open(out_docx, "rb") as f:
                    docx_bytes = f.read()

                return Response(
                    content=docx_bytes,
                    media_type=DOCX_MIME,
                    headers={"Content-Disposition": f"attachment; filename=\"{fname}.docx\""}
                )
        elif type in ["ud", "tarea"]:
            import generador_ud_tarea
            import tempfile
            import os
            import zipfile
            from io import BytesIO

            if not item_id:
                raise HTTPException(status_code=400, detail="item_id is required for ud or tarea PDF")

            info_modulo = module_data.get("info_modulo") or {}
            with tempfile.TemporaryDirectory() as tmpdir:
                if type == "ud":
                    df_ud_list = module_data.get("df_ud") or []
                    target = next((u for u in df_ud_list if u.get("id_ud") == item_id), None)
                    if not target:
                        raise HTTPException(status_code=404, detail="UD not found")
                    fname = f"UD_{item_id}"
                    out_docx = os.path.join(tmpdir, fname + ".docx")
                    out_pdf = os.path.join(tmpdir, fname + ".pdf")
                    generador_ud_tarea.generate_ud(target, info_modulo, out_docx, out_pdf)
                else:
                    df_act_list = module_data.get("df_act") or []
                    target = next((t for t in df_act_list if t.get("ID") == item_id or t.get("id_act") == item_id), None)
                    if not target:
                        raise HTTPException(status_code=404, detail="Tarea not found")
                    fname = f"Tarea_{item_id}"
                    out_docx = os.path.join(tmpdir, fname + ".docx")
                    out_pdf = os.path.join(tmpdir, fname + ".pdf")
                    generador_ud_tarea.generate_tarea(target, info_modulo, out_docx, out_pdf)

                # Siempre devolvemos DOCX para ud y tarea, independientemente del formato solicitado
                with open(out_docx, "rb") as f:
                    docx_bytes = f.read()

                return Response(
                    content=docx_bytes,
                    media_type=DOCX_MIME
                )
        else:
            raise HTTPException(status_code=400, detail=f"Unknown PDF type: {type}")

        if not buffer:
            raise HTTPException(status_code=500, detail="Failed to generate PDF buffer")

        return Response(content=buffer.getvalue(), media_type="application/pdf")

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        with open("pdf_debug.log", "a", encoding="utf-8") as f:
            f.write(f"--- ERROR IN GENERATE_PDF! type={type} ---\n")
            traceback.print_exc(file=f)
        print(f"--- ERROR IN GENERATE_PDF! {str(e)} ---")
        raise HTTPException(status_code=500, detail=str(e))
