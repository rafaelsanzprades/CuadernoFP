from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import pandas as pd
from database import get_db
from models import ModuleDocument

from pydantic import BaseModel
from typing import Dict, Any, Optional

class PdfRequest(BaseModel):
    module_data: Dict[str, Any]
    curso_data: Dict[str, Any]
    fecha_corte: Optional[str] = None

router = APIRouter(prefix="/api/pdf", tags=["PDF Generation"])

@router.post("")
def generate_pdf(type: str, request: PdfRequest, al_id: Optional[str] = None, item_id: Optional[str] = None, file_format: Optional[str] = "pdf"):
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
        
        module_data = request.module_data
        curso_data = request.curso_data
        fecha_corte = request.fecha_corte
        
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
            buffer = generar_pdf_boletin_grupal("1T", info_modulo, df_al, df_eval, df_act, fecha_corte)
        elif type == "grupal_2t":
            buffer = generar_pdf_boletin_grupal("2T", info_modulo, df_al, df_eval, df_act, fecha_corte)
        elif type == "grupal_3t":
            buffer = generar_pdf_boletin_grupal("3T", info_modulo, df_al, df_eval, df_act, fecha_corte)
        elif type == "grupal_final":
            buffer = generar_pdf_boletin_grupal_final(info_modulo, df_al, df_eval, df_act, fecha_corte)
        elif type == "individual":
            if not al_id: raise HTTPException(status_code=400, detail="al_id is required for individual PDF")
            buffer = generar_pdf_boletin_individual(
                info_modulo=info_modulo, al_id=al_id, df_al=df_al, df_eval=df_eval,
                df_act=df_act, df_ce=df_ce, df_ra=df_ra, df_feoe=df_feoe,
                info_fechas=info_fechas, planning_ledger=planning_ledger,
                df_ud=df_ud, df_pr=df_pr
            )
        elif type == "plantilla_jeg":
            import os
            template_path = os.path.join(os.path.dirname(__file__), '..', 'templates', 'modelo_pd_fp+.docx')
            if not os.path.exists(template_path):
                raise HTTPException(status_code=404, detail="Plantilla no encontrada. Debes colocar 'modelo_pd_fp+.docx' en la carpeta templates.")
            with open(template_path, "rb") as f:
                docx_bytes = f.read()
            return Response(
                content=docx_bytes,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
        elif type in ["programacion_minima", "programacion_suficiente", "programacion_detallada", "programacion_suficiente_tpl", "programacion_minima_tpl", "programacion_jeg"]:
            if type == "programacion_minima":
                import generador_pd_minima as generador_pd
            elif type == "programacion_minima_tpl":
                import generador_pd_minima_tpl as generador_pd
            elif type == "programacion_suficiente":
                import generador_pd_suficiente as generador_pd
            elif type == "programacion_suficiente_tpl":
                import generador_pd_suficiente_tpl as generador_pd
            elif type == "programacion_jeg":
                import generador_pd_jeg as generador_pd
            else:
                import generador_pd_detallada as generador_pd
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
            grado = info_mod.get("grado", "GM")
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
            
            data_pd = {
                "departamento": departamento,
                "ciclo": info_mod.get("ciclo", "Ciclo Formativo"),
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
                "config_contexto": curso_data.get("config_contexto") or {},
                "config_aula": module_data.get("config_aula") or curso_data.get("config_aula") or {},
                "config_redondeo": curso_data.get("config_redondeo") or {"nota_aprobado": 5.0, "umbral_redondeo": 4.5},
                "info_modulo": info_mod,
                "curriculo_data": curso_data.get("curriculo_data") or {},
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
                "horario": module_data.get("horario") or curso_data.get("horario") or {},
                "calendar_notes": curso_data.get("calendar_notes") or {},
                "planning_ledger": curso_data.get("planning_ledger") or {},
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
                    media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
                    df_ud = module_data.get("df_ud") or []
                    target = next((u for u in df_ud if u.get("id_ud") == item_id), None)
                    if not target:
                        raise HTTPException(status_code=404, detail="UD not found")
                    fname = f"UD_{item_id}"
                    out_docx = os.path.join(tmpdir, fname + ".docx")
                    out_pdf = os.path.join(tmpdir, fname + ".pdf")
                    generador_ud_tarea.generate_ud(target, info_modulo, out_docx, out_pdf)
                else:
                    df_act = module_data.get("df_act") or []
                    target = next((t for t in df_act if t.get("ID") == item_id or t.get("id_act") == item_id), None)
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
                    media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                )
        else:
            raise HTTPException(status_code=400, detail=f"Unknown PDF type: {type}")
            
        if not buffer:
            raise HTTPException(status_code=500, detail="Failed to generate PDF buffer")
            
        return Response(content=buffer.getvalue(), media_type="application/pdf")
        
    except Exception as e:
        import traceback
        with open("pdf_debug.log", "a", encoding="utf-8") as f:
            f.write(f"--- ERROR IN GENERATE_PDF! type={type} ---\n")
            traceback.print_exc(file=f)
        print(f"--- ERROR IN GENERATE_PDF! {str(e)} ---")
        raise HTTPException(status_code=500, detail=str(e))

# Force reload
