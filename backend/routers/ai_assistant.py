import logging
from fastapi import APIRouter, UploadFile, Form, HTTPException, Body, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.pdf_extractor import extract_text_from_pdf
from services.llm_parser import parse_curriculum
from services.chatbot import get_chatbot_response
from schemas import ChatRequest

logger = logging.getLogger("cdd-pro.ai_assistant")

# El chat usa la clave de Gemini del servidor: límite estricto por IP para que no se
# pueda gastar la cuota desde fuera (el límite general es de 100 por minuto).
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

@router.post("/chat")
@limiter.limit("10/minute")
async def chat_endpoint(request: Request, chat: ChatRequest = Body(...)):
    try:
        messages = [msg.model_dump() for msg in chat.messages]
        reply = get_chatbot_response(messages)
        return {
            "status": "success",
            "reply": reply
        }
    except Exception as e:
        logger.error(f"Error en endpoint chat: {str(e)}")
        logger.exception("Error en la petición")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
