import os
import re
import base64
import google.generativeai as genai

# Configuración del modelo
# System instructions: Define el comportamiento del asistente
SYSTEM_INSTRUCTION = """
Eres el asistente virtual oficial de 'Cuaderno FP', una aplicación para profesores de Formación Profesional en España.
Tu objetivo es ayudar a los docentes con:
1. Dudas sobre la programación didáctica (Resultados de Aprendizaje, Criterios de Evaluación, Unidades Didácticas).
2. Dudas sobre el uso general de la aplicación Cuaderno FP.
3. Consultas sobre legislación educativa de FP y metodologías de evaluación.

Sé amable, conciso y profesional. Evita respuestas excesivamente largas. Usa formato Markdown cuando sea útil (negritas, listas).
"""

# ── Contexto de referencia: documentos oficiales de FP (backend/documentos/TodoFP) ──
# Se cargan una sola vez en memoria (no en cada petición) y se recupera un extracto
# relevante por palabras clave según la última pregunta del docente, para no
# saturar el prompt con los ~700 KB de texto completo de los 4 informes.
_TODOFP_DIR = os.path.join(os.path.dirname(__file__), "..", "documentos", "TodoFP")
_todofp_paragraphs: list[tuple[str, str]] | None = None  # (fuente, párrafo)


def _load_todofp_paragraphs() -> list[tuple[str, str]]:
    global _todofp_paragraphs
    if _todofp_paragraphs is not None:
        return _todofp_paragraphs
    paragraphs: list[tuple[str, str]] = []
    if os.path.isdir(_TODOFP_DIR):
        for fname in sorted(os.listdir(_TODOFP_DIR)):
            if not fname.endswith(".txt"):
                continue
            try:
                with open(os.path.join(_TODOFP_DIR, fname), "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
            except OSError:
                continue
            for para in re.split(r"\n\s*\n", text):
                para = para.strip()
                if len(para) >= 80:  # descarta títulos sueltos / ruido de OCR
                    paragraphs.append((fname, para))
    _todofp_paragraphs = paragraphs
    return paragraphs


def _get_relevant_todofp_context(query: str, max_chars: int = 3000) -> str:
    """Recuperación simple por solapamiento de palabras (sin embeddings ni
    dependencias nuevas) sobre los informes oficiales de FP/EQAVET/indicadores."""
    words = {w for w in re.findall(r"[a-záéíóúñü]{4,}", query.lower())}
    if not words:
        return ""
    scored = []
    for fname, para in _load_todofp_paragraphs():
        para_words = set(re.findall(r"[a-záéíóúñü]{4,}", para.lower()))
        score = len(words & para_words)
        if score > 0:
            scored.append((score, fname, para))
    if not scored:
        return ""
    scored.sort(key=lambda x: x[0], reverse=True)
    chunks, used = [], 0
    for _, fname, para in scored:
        if used + len(para) > max_chars:
            continue
        chunks.append(f"[{fname}]\n{para}")
        used += len(para)
        if used >= max_chars or len(chunks) >= 4:
            break
    if not chunks:
        return ""
    return "\n\nContexto de referencia (extractos de informes oficiales de FP, cítalos solo si son relevantes):\n" + "\n\n".join(chunks)

def get_chatbot_response(messages: list[dict]) -> str:
    """
    Recibe un historial de mensajes y devuelve la respuesta del asistente.
    `messages` tiene el formato: [{"role": "user"|"model", "parts": "texto"}]
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "Lo siento, el asistente no está configurado. Falta la clave de API (GEMINI_API_KEY) en el servidor."

    genai.configure(api_key=api_key)

    # Última pregunta del docente, para recuperar contexto relevante de los
    # informes oficiales de FP (si lo hay) y añadirlo solo a esta petición.
    last_user_text = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            parts = msg.get("parts")
            if isinstance(parts, str):
                last_user_text = parts
            elif isinstance(parts, list):
                last_user_text = " ".join(
                    p if isinstance(p, str) else p.get("text", "")
                    for p in parts if isinstance(p, (str, dict))
                )
            break

    system_instruction = SYSTEM_INSTRUCTION + _get_relevant_todofp_context(last_user_text)

    # Inicializar el modelo con las instrucciones de sistema
    model = genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction=system_instruction
    )

    # Asegurar que el inline_data se envía como bytes
    for msg in messages:
        if "parts" in msg and isinstance(msg["parts"], list):
            for part in msg["parts"]:
                if isinstance(part, dict) and "inline_data" in part:
                    data = part["inline_data"].get("data")
                    if isinstance(data, str):
                        part["inline_data"]["data"] = base64.b64decode(data)

    try:
        # Extraemos el último mensaje para usar chat.send_message() o enviamos todo al modelo
        # Si usamos generate_content podemos pasar el historial completo
        response = model.generate_content(messages)
        return response.text
    except Exception as e:
        print(f"Error en chatbot: {str(e)}")
        return f"Ha ocurrido un error de conexión con el servicio de Inteligencia Artificial: {str(e)}"
