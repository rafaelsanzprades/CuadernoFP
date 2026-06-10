import os
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

def get_chatbot_response(messages: list[dict]) -> str:
    """
    Recibe un historial de mensajes y devuelve la respuesta del asistente.
    `messages` tiene el formato: [{"role": "user"|"model", "parts": "texto"}]
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "Lo siento, el asistente no está configurado. Falta la clave de API (GEMINI_API_KEY) en el servidor."

    genai.configure(api_key=api_key)

    # Inicializar el modelo con las instrucciones de sistema
    model = genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction=SYSTEM_INSTRUCTION
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
