import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import SessionLocal
from models import Degree

def seed():
    db = SessionLocal()
    degree = db.query(Degree).filter(Degree.code == "ELE304").first()
    if not degree:
        print("Degree ELE304 not found!")
        return

    # Get existing boa_articles or start fresh
    boa = degree.boa_articles or {}
    
    # Add article_9 with OGs
    boa["article_9"] = "Los objetivos generales de este ciclo formativo son los siguientes:"
    boa["article_9_og"] = [
        {"id": "a", "desc": "Elaborar informes y documentación técnica, reconociendo esquemas y consultando catálogos y las prescripciones reglamentarias, para desarrollar proyectos de instalaciones y sistemas de telecomunicaciones."},
        {"id": "b", "desc": "Reconocer sistemas de telecomunicaciones, aplicando leyes y teoremas para calcular sus parámetros."},
        {"id": "c", "desc": "Definir unidades de obra y sus características técnicas, interpretando planos y esquemas, para elaborar el presupuesto."},
        {"id": "d", "desc": "Definir la estructura, equipos y conexionado general de las instalaciones y sistemas de telecomunicaciones, partiendo de los cálculos y utilizando catálogos comerciales, para configurar instalaciones."},
        {"id": "e", "desc": "Dibujar los planos de trazado general y esquemas eléctricos y electrónicos, utilizando programas informáticos de diseño asistido, para configurar instalaciones y sistemas de telecomunicaciones."},
        {"id": "f", "desc": "Aplicar técnicas de control de almacén, utilizando programas informáticos, para gestionar el suministro."},
        {"id": "g", "desc": "Definir las fases y actividades del desarrollo de la instalación según documentación técnica pertinente, especificando los recursos necesarios, para planificar el montaje."},
        {"id": "h", "desc": "Replantear la instalación, teniendo en cuenta los planos y esquemas y las posibles condiciones de la instalación, para realizar el lanzamiento."},
        {"id": "i", "desc": "Identificar los recursos humanos y materiales, dando respuesta a las necesidades del montaje, para realizar su lanzamiento."},
        {"id": "j", "desc": "Aplicar técnicas de gestión y montaje en sistemas de telecomunicaciones, interpretando anteproyectos e utilizando instrumentos y herramientas adecuadas, para supervisar el montaje."},
        {"id": "k", "desc": "Definir procedimientos, operaciones y secuencias de intervención en instalaciones de telecomunicaciones, analizando información técnica de equipos y recursos, para planificar el mantenimiento."},
        {"id": "l", "desc": "Aplicar técnicas de mantenimiento en sistemas e instalaciones de telecomunicaciones, utilizando los instrumentos y herramientas apropiados, para ejecutar los procesos de mantenimiento."},
        {"id": "m", "desc": "Ejecutar pruebas de funcionamiento, ajustando equipos y elementos, para poner en servicio las instalaciones."},
        {"id": "n", "desc": "Definir los medios de protección personal y de las instalaciones, identificando los riesgos y factores de riesgo del montaje, mantenimiento y uso de las instalaciones, para elaborar el estudio básico de seguridad y salud."},
        {"id": "ñ", "desc": "Reconocer la normativa de gestión de calidad y de residuos aplicada a las instalaciones de telecomunicaciones y eléctricas, para supervisar el cumplimiento de la normativa."},
        {"id": "o", "desc": "Preparar los informes técnicos, certificados de instalación y manuales de instrucciones y mantenimiento, siguiendo los procedimientos y formatos oficiales para elaborar la documentación técnica y administrativa."},
        {"id": "p", "desc": "Analizar y utilizar los recursos y oportunidades de aprendizaje relacionadas con la evolución científica, tecnológica y organizativa del sector y las tecnologías de la información y la comunicación, para mantener el espíritu de actualización y adaptarse a nuevas situaciones laborales y personales."},
        {"id": "q", "desc": "Desarrollar la creatividad y el espíritu de innovación para responder a los retos que se presentan en los procesos y en la organización del trabajo y de la vida personal."},
        {"id": "r", "desc": "Tomar decisiones de forma fundamentada, analizando las variables implicadas, integrando saberes de distinto ámbito y aceptando los riesgos y la posibilidad de equivocación en las mismas, para afrontar y resolver distintas situaciones, problemas o contingencias."},
        {"id": "s", "desc": "Desarrollar técnicas de liderazgo, motivación, supervisión y comunicación en contextos de trabajo en grupo, para facilitar la organización y coordinación de equipos de trabajo."},
        {"id": "t", "desc": "Aplicar estrategias y técnicas de comunicación, adaptándose a los contenidos que se van a transmitir, a la finalidad y a las características de los receptores, para asegurar la eficacia en los procesos de comunicación."},
        {"id": "u", "desc": "Evaluar situaciones de prevención de riesgos laborales y de protección ambiental, proponiendo y aplicando medidas de prevención personales y colectivas, de acuerdo con la normativa aplicable en los procesos del trabajo, para garantizar entornos seguros."},
        {"id": "v", "desc": "Identificar y proponer las acciones profesionales necesarias, para dar respuesta a la accesibilidad universal y al «diseño para todos»."},
        {"id": "w", "desc": "Identificar y aplicar parámetros de calidad en los trabajos y actividades realizados en el proceso de aprendizaje, para valorar la cultura de la evaluación y de la calidad y ser capaces de supervisar y mejorar los procedimientos de gestión de calidad."},
        {"id": "x", "desc": "Utilizar procedimientos relacionados con la cultura emprendedora, empresarial y de iniciativa profesional, para realizar la gestión básica de una pequeña empresa o emprender un trabajo."},
        {"id": "y", "desc": "Reconocer sus derechos y deberes como agente activo en la sociedad, teniendo en cuenta el marco legal que regula las condiciones sociales y laborales, para participar como ciudadano democrático."}
    ]
    
    degree.boa_articles = boa
    db.commit()
    db.close()
    print(f"Seeded BOA articles for ELE304 (with article_9 OG - 25 objectives)")

if __name__ == "__main__":
    seed()
