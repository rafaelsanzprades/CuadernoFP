import logging
import os
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from database import get_db
from pdf_dispatch import generar_documento, DocError

from pydantic import BaseModel
from typing import Dict, Any, Optional

logger = logging.getLogger("cdd-pro.pdf")

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


@router.post("")
def generate_pdf(type: str, request: PdfRequest, al_id: Optional[str] = None, item_id: Optional[str] = None,
                  file_format: Optional[str] = "pdf", db: Session = Depends(get_db)):
    """Capa HTTP fina: la lógica vive en pdf_dispatch.py (que también se ejecuta en el
    navegador con Pyodide). No se registran datos personales (ni al_id ni curso_data).

    Este endpoint recibe datos del alumnado, así que solo se sirve en el servidor interno de
    la aplicación de escritorio (127.0.0.1), que activa CUADERNOFP_PDF_LOCAL. En un servidor
    público está cerrado: la web genera los documentos en el propio navegador."""
    if os.environ.get("CUADERNOFP_PDF_LOCAL") != "1":
        raise HTTPException(status_code=410, detail="La generación de documentos se hace en el equipo del docente; este servidor no la ofrece.")
    logger.info(f"generate_pdf called: type={type} format={file_format}")
    try:
        contenido, mime, cabeceras = generar_documento(
            type, request.module_data, request.curso_data, fecha_corte=request.fecha_corte,
            extra=request.extra, al_id=al_id, item_id=item_id, file_format=file_format, db=db,
        )
        return Response(content=contenido, media_type=mime, headers=cabeceras)
    except DocError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_pdf (type={type}): {e.__class__.__name__}")
        raise HTTPException(status_code=500, detail="Error al generar el documento")
