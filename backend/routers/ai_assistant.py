from fastapi import APIRouter, UploadFile, Form, HTTPException
from services.pdf_extractor import extract_text_from_pdf
from services.llm_parser import parse_curriculum

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Assistant"]
)

@router.post("/parse-curriculum")
async def parse_curriculum_endpoint(
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
    except Exception as e:
        print(f"Error en AI parser: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
