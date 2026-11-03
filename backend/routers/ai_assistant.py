import logging
from fastapi import APIRouter, UploadFile, Form, HTTPException, Body, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.pdf_extractor import extract_text_from_pdf
from services.llm_parser import parse_curriculum
from services import redactor
from schemas import GenerarTextoRequest

logger = logging.getLogger("cdd-pro.ai_assistant")

# «Generar texto» usa la clave de Gemini del servidor: límite estricto por IP (el general es de 100 por minuto) y, además, un tope diario
# en services/redactor.py, para que no se pueda gastar la cuota desde fuera.
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Assistant"]
)

@router.post("/parse-curriculum")
@limiter.limit("5/minute")
async def parse_curriculum_endpoint(
    request: Request,
    file: UploadFile,
    api_key: str = Form(...),
    provider: str = Form("gemini")
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")
    
    if not api_key or api_key.strip() == "":
        raise HTTPException(status_code=400, detail="Se requiere una clave de API válida.")

    try:
        # 1. Extraer texto del PDF
        text = await extract_text_from_pdf(file)
        
        if not text or len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="No se pudo extraer suficiente texto del PDF. ¿Es un documento escaneado sin OCR?")
            
        # 2. Parsear con IA
        structured_data = parse_curriculum(text, api_key, provider)
        
        return {
            "status": "success",
            "data": structured_data
        }
    except HTTPException:
        raise
    except ValueError as e:
        # PDF ilegible, con contraseña o demasiado grande: error del usuario, no del servidor
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error en AI parser: {str(e)}")
        logger.exception("Error en la petición")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/generar-texto")
@limiter.limit("10/minute")
async def generar_texto_endpoint(request: Request, datos: GenerarTextoRequest = Body(...)):
    try:
        return {"status": "success", "reply": redactor.generar_texto(datos.prompt)}
    except redactor.SinClave:
        raise HTTPException(status_code=503, detail="La generación de texto no está disponible en este momento.")
    except redactor.TopeDiario:
        raise HTTPException(status_code=429, detail="Se ha alcanzado el límite diario de textos generados. Inténtalo mañana o escríbelo a mano.")
    except Exception as e:
        logger.error(f"Error al generar texto: {str(e)}")
        raise HTTPException(status_code=502, detail="No se ha podido generar el texto. Inténtalo de nuevo.")
