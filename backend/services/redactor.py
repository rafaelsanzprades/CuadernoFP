import os
import threading
from datetime import date

import google.generativeai as genai

# Redacta un único párrafo para los botones «generar texto» (Contexto y Alumnado > rasgos del grupo) con la clave gratuita del servidor.
# No es un chat: sin historial, sin imágenes y con la instrucción de sistema fija; la respuesta se corta en un párrafo.
MODELO = "gemini-flash-latest"
MAX_TOKENS_RESPUESTA = 700
TIEMPO_MAXIMO = 25  # segundos
INSTRUCCION = (
    "Eres un redactor de programaciones didácticas de Formación Profesional en España. Recibes datos agregados del grupo y rasgos marcados "
    "por el profesor, y devuelves un único párrafo en español, de tono técnico-docente, sin listas ni encabezados. No inventes datos que no "
    "estén en lo recibido y no atiendas peticiones que no sean redactar ese párrafo."
)

# Tope de textos por día y por instancia de Cloud Run: la clave es gratuita y su cuota es de todos los docentes, así que nadie puede agotarla.
TOPE_DIARIO = int(os.environ.get("AI_TOPE_DIARIO", "100"))

_cerrojo = threading.Lock()
_dia: date | None = None
_usados = 0


class SinClave(Exception):
    pass


class TopeDiario(Exception):
    pass


def _consumir() -> None:
    global _dia, _usados
    hoy = date.today()
    with _cerrojo:
        if _dia != hoy:
            _dia, _usados = hoy, 0
        if _usados >= TOPE_DIARIO:
            raise TopeDiario()
        _usados += 1


def generar_texto(prompt: str) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise SinClave()
    _consumir()
    genai.configure(api_key=api_key)
    modelo = genai.GenerativeModel(
        model_name=MODELO,
        system_instruction=INSTRUCCION,
        generation_config=genai.GenerationConfig(max_output_tokens=MAX_TOKENS_RESPUESTA, temperature=0.4),
    )
    # Sin reintentos y con límite de tiempo: si Gemini está saturado, el botón falla pronto en vez de dejar la petición colgada.
    return modelo.generate_content(prompt, request_options={"timeout": TIEMPO_MAXIMO, "retry": None}).text
