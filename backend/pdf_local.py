"""Punto de entrada de la generación de documentos en el navegador (Pyodide).

El worker de frontend/public/generadores-worker.js llama a `generar_desde_json` con la
petición completa en un único JSON. Todo ocurre en el equipo del docente: los datos del
alumnado no se envían a ningún servidor.
"""
import json

from pdf_dispatch import DocError, generar_documento


def generar_desde_json(peticion_json: str) -> dict:
    """Devuelve {ok, mime, headers, data} o {ok: False, status, detail}."""
    try:
        p = json.loads(peticion_json)
        contenido, mime, cabeceras = generar_documento(
            p["type"],
            p.get("module_data") or {},
            p.get("curso_data") or {},
            fecha_corte=p.get("fecha_corte"),
            extra=p.get("extra"),
            al_id=p.get("al_id"),
            item_id=p.get("item_id"),
            file_format=p.get("file_format") or "pdf",
            curriculo_data=p.get("curriculo_data"),
            grado_info=p.get("grado_info"),
        )
        return {"ok": True, "mime": mime, "headers": cabeceras, "data": contenido}
    except DocError as e:
        return {"ok": False, "status": e.status_code, "detail": e.detail}
    except Exception as e:  # noqa: BLE001 - se informa del tipo, nunca del contenido (datos personales)
        return {"ok": False, "status": 500, "detail": f"Error al generar el documento ({e.__class__.__name__})"}
