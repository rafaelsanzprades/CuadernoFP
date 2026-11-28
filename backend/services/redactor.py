import logging
import os
import threading
import time
from datetime import date

from google import genai
from google.genai import errors as gerr
from google.genai import types

logger = logging.getLogger("cdd-pro.redactor")

# Redacta un único párrafo para los botones «generar texto» (Contexto y Alumnado > rasgos del grupo) con la clave gratuita del servidor.
# No es un chat: sin historial, sin imágenes y con la instrucción de sistema fija; la respuesta se corta en un párrafo.
# «lite»: de sobra para un párrafo y con cuota en el nivel gratuito (gemini-flash-latest ya no la tiene para claves nuevas).
# Diagnóstico del 429 (registros de Cloud Run, 2026-11-03): el nivel gratuito limita a 20 peticiones al día POR MODELO y proyecto
# (GenerateRequestsPerDayPerProjectPerModel-FreeTier, límite 20), compartido por todos los docentes; no depende de la región.
# Por eso se prueba una lista de modelos en orden: cada uno tiene su propia cuota diaria. Se puede cambiar con AI_MODELOS (separados por comas).
MODELOS = [m.strip() for m in os.environ.get("AI_MODELOS", "gemini-flash-lite-latest,gemini-3.1-flash-lite,gemini-flash-latest").split(",") if m.strip()]
REINTENTOS_503 = (1, 2)  # esperas en segundos antes del 2.º y 3.º intento ante un 503
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


class LimiteGemini(Exception):
    """Todos los modelos han agotado su cuota (429)."""


class Saturado(Exception):
    """Gemini no responde por exceso de demanda (503) tras los reintentos."""


def _consumir() -> None:
    global _dia, _usados
    hoy = date.today()
    with _cerrojo:
        if _dia != hoy:
            _dia, _usados = hoy, 0
        if _usados >= TOPE_DIARIO:
            raise TopeDiario()
        _usados += 1


def _llamar(modelo_nombre: str, prompt: str) -> str:
    # Límite de tiempo (en milisegundos) y sin reintentos propios de la biblioteca: los reintentos ante 503 se hacen aquí, con esperas cortas.
    cliente = genai.Client(api_key=os.environ["GEMINI_API_KEY"], http_options=types.HttpOptions(timeout=TIEMPO_MAXIMO * 1000))
    respuesta = cliente.models.generate_content(
        model=modelo_nombre,
        contents=prompt,
        config=types.GenerateContentConfig(system_instruction=INSTRUCCION, max_output_tokens=MAX_TOKENS_RESPUESTA, temperature=0.4),
    )
    return respuesta.text


def generar_texto(prompt: str) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise SinClave()
    _consumir()
    hubo_429 = hubo_503 = False
    for nombre in MODELOS:
        for espera in (0, *REINTENTOS_503):
            if espera:
                time.sleep(espera)
            try:
                return _llamar(nombre, prompt)
            except gerr.ClientError as e:
                if e.code == 404:
                    logger.warning("Modelo %s no disponible para esta clave", nombre)
                    break
                if e.code != 429:
                    raise
                logger.warning("Gemini 429 (cuota agotada) con el modelo %s", nombre)
                hubo_429 = True
                break  # el 429 no se reintenta: se pasa al siguiente modelo
            except gerr.ServerError as e:
                if e.code != 503:
                    raise
                logger.warning("Gemini 503 (saturado) con el modelo %s", nombre)
                hubo_503 = True
    if hubo_503:
        raise Saturado()
    if hubo_429:
        raise LimiteGemini()
    raise RuntimeError("Ningún modelo de la lista pudo responder")
