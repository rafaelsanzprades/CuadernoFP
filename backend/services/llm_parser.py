import json
import typing_extensions as typing
import google.generativeai as genai
from pydantic import BaseModel, Field

class ParseResult(BaseModel):
    resultados_aprendizaje: list[dict] = Field(description="Lista de Resultados de Aprendizaje (RAs)")
    criterios_evaluacion: list[dict] = Field(description="Lista de Criterios de Evaluación (CEs)")
    unidades_didacticas: list[dict] = Field(description="Lista de Unidades Didácticas (UDs)")

def parse_curriculum_with_gemini(text: str, api_key: str) -> dict:
    """
    Utiliza Google Gemini para extraer RAs, CEs y UDs del texto del currículo.
    Devuelve un diccionario con el formato esperado.
    """
    genai.configure(api_key=api_key)
    
    # Configuramos el modelo Gemini 1.5 Flash por su rapidez y bajo coste/capacidad
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = """
    Eres un experto en educación y Formación Profesional en España.
    Tu tarea es leer el siguiente documento de currículo o programación didáctica y extraer la estructura principal del módulo:
    1. Resultados de Aprendizaje (RAs): id_ra (ej. "RA1"), desc_ra (descripción breve), peso_ra (entero, ej 10 o 0 si no lo sabes).
    2. Criterios de Evaluación (CEs): id_ce (ej. "CE1.a"), id_ra (el RA al que pertenece, ej "RA1"), desc_ce (descripción).
    3. Unidades Didácticas (UDs): id_ud (ej. "UD1"), desc_ud (título de la unidad), horas_ud (horas estimadas, entero o 0).

    Analiza el texto y devuelve EXCLUSIVAMENTE un JSON con estas listas estructuradas.
    """
    
    # En Gemini podemos usar response_mime_type para asegurar un JSON
    response = model.generate_content(
        f"{prompt}\n\nTEXTO DEL DOCUMENTO:\n{text[:100000]}", # limitamos por seguridad aunque Gemini soporta mucho más
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
        )
    )
    
    try:
        data = json.loads(response.text)
        return data
    except Exception as e:
        raise ValueError(f"Error parseando la respuesta de Gemini: {str(e)}\nRespuesta: {response.text}")

def parse_curriculum_with_openai(text: str, api_key: str) -> dict:
    """
    Utiliza OpenAI (ChatGPT) para extraer la estructura. (Pendiente de implementar).
    """
    raise NotImplementedError("OpenAI parser no implementado todavía.")

def parse_curriculum(text: str, api_key: str, provider: str = "gemini") -> dict:
    if provider.lower() == "gemini":
        return parse_curriculum_with_gemini(text, api_key)
    elif provider.lower() == "openai":
        return parse_curriculum_with_openai(text, api_key)
    else:
        raise ValueError(f"Proveedor de IA no soportado: {provider}")
