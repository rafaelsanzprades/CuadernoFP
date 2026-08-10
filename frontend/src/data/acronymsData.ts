export type AcronymCategory = 
  | 'metodologia' 
  | 'inclusion' 
  | 'estructura_fp' 
  | 'normativa' 
  | 'boletines' 
  | 'codificacion' 
  | 'otros';

export interface AcronymItem {
  id: number | string;
  name: string;
  description: string;
  category: AcronymCategory;
}

export const CATEGORY_LABELS: Record<AcronymCategory, string> = {
  metodologia: "Metodología y aprendizaje",
  inclusion: "Atención a la diversidad e inclusión",
  estructura_fp: "Estructura de la Formación Profesional",
  normativa: "Normativa, evaluación y documentación de centro",
  boletines: "Boletines oficiales",
  codificacion: "Acrónimos de codificación de la APP",
  otros: "Contexto educativo y otros"
};

export const acronymsData: AcronymItem[] = [
  {
    "id": 0,
    "name": "AACC. Altas Capacidades",
    "description": "Estudiantes con habilidades sobresalientes que requieren atención personalizada",
    "category": "inclusion"
  },
  {
    "id": 1,
    "name": "ABP. Aprendizaje Basado en Proyectos",
    "description": "Metodología pedagógica activa a través de proyectos significativos",
    "category": "metodologia"
  },
  {
    "id": 2,
    "name": "ABR. Aprendizaje Basado en Retos",
    "description": "Enfoque didáctico centrado en resolver retos reales",
    "category": "metodologia"
  },
  {
    "id": 3,
    "name": "AC-ACT. Aspectos Clave Actitudinales",
    "description": "Clasificación de aspectos clave de actitud y soft-skills (ej. Trabajo en equipo)",
    "category": "codificacion"
  },
  {
    "id": 4,
    "name": "AC-NOR. Aspectos Clave de Normativa",
    "description": "Clasificación de aspectos clave de normativa y seguridad (ej. PRL, EPI)",
    "category": "codificacion"
  },
  {
    "id": 5,
    "name": "AC-PRO. Aspectos Clave Procedimentales",
    "description": "Clasificación de aspectos clave analíticos y procedimentales",
    "category": "codificacion"
  },
  {
    "id": 6,
    "name": "AC-TEC. Aspectos Clave Técnicos",
    "description": "Clasificación de aspectos clave técnicos y de ejecución",
    "category": "codificacion"
  },
  {
    "id": 7,
    "name": "AC. Ámbito Común",
    "description": "Competencias básicas en FPGB: Lengua, Matemáticas, Ciencias",
    "category": "estructura_fp"
  },
  {
    "id": 187,
    "name": "ACI / ACIS. Adaptación Curricular Individualizada",
    "description": "Modificación de los elementos prescriptivos del currículo para alumnado con necesidades específicas",
    "category": "inclusion"
  },
  {
    "id": 8,
    "name": "ACNEAE. Alumnado Con Necesidades Específicas de Apoyo Educativo",
    "description": "Estudiantes que requieren apoyo por dificultades, discapacidad o condición",
    "category": "inclusion"
  },
  {
    "id": 9,
    "name": "ACNEE. Alumnado Con Necesidades Educativas Especiales",
    "description": "Estudiantes con dificultades de aprendizaje que requieren adaptaciones",
    "category": "inclusion"
  },
  {
    "id": 10,
    "name": "Actitud Emprendedora",
    "description": "Capacidad de innovar, asumir riesgos y crear iniciativas",
    "category": "inclusion"
  },
  {
    "id": 11,
    "name": "ADG. Administración y Gestión",
    "description": "Familia profesional de Administración y Gestión",
    "category": "inclusion"
  },
  {
    "id": 12,
    "name": "Adicciones",
    "description": "Patologías por consumo de sustancias con impacto en el rendimiento",
    "category": "normativa"
  },
  {
    "id": 13,
    "name": "AFD. Actividades Físicas y Deportivas",
    "description": "Familia profesional de Actividades Físicas y Deportivas",
    "category": "estructura_fp"
  },
  {
    "id": 14,
    "name": "AGA. Agraria",
    "description": "Familia profesional de Agraria",
    "category": "estructura_fp"
  },
  {
    "id": 189,
    "name": "AL. Audición y Lenguaje",
    "description": "Especialista en las alteraciones del lenguaje y la comunicación",
    "category": "inclusion"
  },
  {
    "id": 15,
    "name": "AMPA. Asociación de Madres y Padres del Alumnado",
    "description": "Organización de familias para mejorar la educación",
    "category": "inclusion"
  },
  {
    "id": 16,
    "name": "Aprendizaje",
    "description": "Proceso de adquisición de conocimientos, habilidades y valores",
    "category": "metodologia"
  },
  {
    "id": 17,
    "name": "ARG. Artes Gráficas",
    "description": "Familia profesional de Artes Gráficas",
    "category": "estructura_fp"
  },
  {
    "id": 18,
    "name": "Artículo Científico",
    "description": "Publicación de investigación con revisión por pares",
    "category": "inclusion"
  },
  {
    "id": 19,
    "name": "AT. Ámbito Técnico",
    "description": "Competencias técnicas específicas del área profesional en FPGB",
    "category": "estructura_fp"
  },
  {
    "id": 20,
    "name": "Auditoría Creativa",
    "description": "Evaluación sistemática de la creatividad en procesos educativos",
    "category": "inclusion"
  },
  {
    "id": 21,
    "name": "BOA. Boletín Oficial de Aragón",
    "description": "Medio oficial de publicación normativa del Gobierno de Aragón",
    "category": "boletines"
  },
  {
    "id": 22,
    "name": "BOC. Boletín Oficial de Canarias",
    "description": "Medio oficial de publicación normativa del Gobierno de Canarias",
    "category": "boletines"
  },
  {
    "id": 23,
    "name": "BOC. Boletín Oficial de Cantabria",
    "description": "Medio oficial de publicación normativa del Gobierno de Cantabria",
    "category": "boletines"
  },
  {
    "id": 24,
    "name": "BOCCE. Boletín Oficial de la Ciudad de Ceuta",
    "description": "Medio oficial de publicación normativa del Gobierno de Ceuta",
    "category": "boletines"
  },
  {
    "id": 25,
    "name": "BOCM. Boletín Oficial de la Comunidad de Madrid",
    "description": "Medio oficial de publicación normativa del Gobierno de la Comunidad de Madrid",
    "category": "boletines"
  },
  {
    "id": 26,
    "name": "BOCYL. Boletín Oficial de Castilla y León",
    "description": "Medio oficial de publicación normativa del Gobierno de Castilla y León",
    "category": "boletines"
  },
  {
    "id": 27,
    "name": "BOE. Boletín Oficial del Estado",
    "description": "Medio oficial de publicación normativa del Gobierno de España",
    "category": "boletines"
  },
  {
    "id": 28,
    "name": "BOIB. Boletín Oficial de las Islas Baleares",
    "description": "Medio oficial de publicación normativa del Gobierno de las Islas Baleares",
    "category": "boletines"
  },
  {
    "id": 29,
    "name": "BOJA. Boletín Oficial de la Junta de Andalucía",
    "description": "Medio oficial de publicación normativa del Gobierno de Andalucía",
    "category": "boletines"
  },
  {
    "id": 30,
    "name": "BOME. Boletín Oficial de la Ciudad de Melilla",
    "description": "Medio oficial de publicación normativa del Gobierno de Melilla",
    "category": "boletines"
  },
  {
    "id": 31,
    "name": "BON. Boletín Oficial de Navarra",
    "description": "Medio oficial de publicación normativa del Gobierno de Navarra",
    "category": "boletines"
  },
  {
    "id": 32,
    "name": "BOPA. Boletín Oficial del Principado de Asturias",
    "description": "Medio oficial de publicación normativa del Gobierno del Principado de Asturias",
    "category": "boletines"
  },
  {
    "id": 33,
    "name": "BOPV. Boletín Oficial del País Vasco",
    "description": "Medio oficial de publicación normativa del Gobierno del País Vasco",
    "category": "boletines"
  },
  {
    "id": 34,
    "name": "BOR. Boletín Oficial de La Rioja",
    "description": "Medio oficial de publicación normativa del Gobierno de La Rioja",
    "category": "boletines"
  },
  {
    "id": 35,
    "name": "BORM. Boletín Oficial de la Región de Murcia",
    "description": "Medio oficial de publicación normativa del Gobierno de la Región de Murcia",
    "category": "boletines"
  },
  {
    "id": 36,
    "name": "Bullying",
    "description": "Acoso escolar sistemático entre estudiantes",
    "category": "otros"
  },
  {
    "id": 37,
    "name": "CA. Comunidades de Aprendizaje",
    "description": "Enfoque educativo colaborativo e inclusivo con participación de toda la comunidad",
    "category": "inclusion"
  },
  {
    "id": 38,
    "name": "Cannabis",
    "description": "Sustancia psicoactiva con impacto educativo y de salud",
    "category": "otros"
  },
  {
    "id": 39,
    "name": "Carta Tierra",
    "description": "Documento internacional de principios éticos para la sostenibilidad",
    "category": "inclusion"
  },
  {
    "id": 40,
    "name": "CC. Criterios de Calificación",
    "description": "Estándares y pautas para evaluar y asignar calificaciones",
    "category": "inclusion"
  },
  {
    "id": 41,
    "name": "CDD. Competencia Digital Docente",
    "description": "Certificación de competencia digital del profesorado (6 áreas, 6 niveles)",
    "category": "inclusion"
  },
  {
    "id": 42,
    "name": "CdE. Centros de Excelencia",
    "description": "Red de centros de FP que destacan por la innovación, investigación aplicada y el emprendimiento",
    "category": "inclusion"
  },
  {
    "id": 43,
    "name": "CDI. Competencia Digital Individual",
    "description": "Capacidad para usar eficazmente las TIC en diferentes contextos",
    "category": "inclusion"
  },
  {
    "id": 44,
    "name": "CE. Criterios de evaluación",
    "description": "Estándares para medir el progreso del alumnado en un área",
    "category": "inclusion"
  },
  {
    "id": 45,
    "name": "CEC. Consejo Escolar del Centro",
    "description": "Órgano colegiado de gestión con representación de toda la comunidad",
    "category": "inclusion"
  },
  {
    "id": 46,
    "name": "CEFP. Centro Específico de Formación Profesional",
    "description": "Centro especializado en formación técnica y práctica",
    "category": "inclusion"
  },
  {
    "id": 186,
    "name": "CEsp. Curso de Especialización",
    "description": "Formación especializada tras un ciclo de grado medio o superior (conocidos como Másteres de FP)",
    "category": "inclusion"
  },
  {
    "id": 47,
    "name": "CF. Ciclo Formativo",
    "description": "Programa educativo de formación profesional por grados",
    "category": "inclusion"
  },
  {
    "id": 48,
    "name": "CG. Competencia General",
    "description": "Habilidades, conocimientos y actitudes para el éxito en diversos contextos",
    "category": "normativa"
  },
  {
    "id": 49,
    "name": "CINE. Clasificación Internacional Normalizada de la Educación",
    "description": "Sistema UNESCO para comparar sistemas educativos mundiales",
    "category": "inclusion"
  },
  {
    "id": 50,
    "name": "CLIL. Content and Language Integrated Learning",
    "description": "Aprendizaje integrado de contenido y lengua extranjera",
    "category": "estructura_fp"
  },
  {
    "id": 51,
    "name": "CM. Contenidos del Módulo",
    "description": "Materias, temas y habilidades abordados en un módulo formativo",
    "category": "normativa"
  },
  {
    "id": 52,
    "name": "CMA. Calidad y Medio Ambiente",
    "description": "Formación en gestión de calidad y medio ambiente empresarial",
    "category": "inclusion"
  },
  {
    "id": 53,
    "name": "CNCP. Catálogo Nacional de Cualificaciones Profesionales",
    "description": "Instrumento que ordena las cualificaciones profesionales, base de los títulos de FP",
    "category": "inclusion"
  },
  {
    "id": 54,
    "name": "Coaching Educativo",
    "description": "Proceso de acompañamiento para potenciar el desarrollo del alumnado",
    "category": "otros"
  },
  {
    "id": 55,
    "name": "COM. Comercio y Marketing",
    "description": "Familia profesional de Comercio y Marketing",
    "category": "estructura_fp"
  },
  {
    "id": 56,
    "name": "Complementos",
    "description": "Contenidos adicionales que amplían el currículo básico",
    "category": "otros"
  },
  {
    "id": 57,
    "name": "Comunicación",
    "description": "Habilidad de transmitir y recibir información de forma efectiva",
    "category": "inclusion"
  },
  {
    "id": 58,
    "name": "CP. Contenido Práctico",
    "description": "Actividades para aplicar conocimientos en situaciones reales",
    "category": "inclusion"
  },
  {
    "id": 59,
    "name": "CPPS. Competencias Profesionales, Personales y Sociales",
    "description": "Conjunto de conocimientos, habilidades y actitudes para la vida",
    "category": "normativa"
  },
  {
    "id": 60,
    "name": "Creatividad",
    "description": "Capacidad de generar ideas originales y soluciones novedosas",
    "category": "inclusion"
  },
  {
    "id": 61,
    "name": "CT. Contenido Teórico",
    "description": "Transmisión de conceptos abstractos, teorías y principios",
    "category": "otros"
  },
  {
    "id": 62,
    "name": "Currículum",
    "description": "Planificación oficial de contenidos, objetivos y actividades educativas",
    "category": "inclusion"
  },
  {
    "id": 63,
    "name": "Desarrollo",
    "description": "Proceso de crecimiento y maduración personal a lo largo de la vida",
    "category": "inclusion"
  },
  {
    "id": 64,
    "name": "Desarrollo Sostenible",
    "description": "Progreso que satisface necesidades presentes sin comprometer el futuro *(ver ODS)*",
    "category": "otros"
  },
  {
    "id": 65,
    "name": "Dilemas",
    "description": "Situaciones problemáticas que requieren reflexión ética y toma de decisiones",
    "category": "inclusion"
  },
  {
    "id": 66,
    "name": "Discalculia",
    "description": "Dificultad específica en el aprendizaje del cálculo y las matemáticas",
    "category": "inclusion"
  },
  {
    "id": 190,
    "name": "DO. Departamento de Orientación",
    "description": "Órgano encargado de asesorar en la atención a la diversidad y orientación académica/profesional",
    "category": "inclusion"
  },
  {
    "id": 67,
    "name": "DOCM. Boletín Oficial de Castilla-La Mancha",
    "description": "Medio oficial de publicación normativa del Gobierno de Castilla-La Mancha",
    "category": "boletines"
  },
  {
    "id": 68,
    "name": "Documentación",
    "description": "Conjunto de documentos necesarios para la gestión educativa",
    "category": "inclusion"
  },
  {
    "id": 69,
    "name": "DOE. Boletín Oficial de Extremadura",
    "description": "Medio oficial de publicación normativa del Gobierno de Extremadura",
    "category": "boletines"
  },
  {
    "id": 70,
    "name": "DOG. Boletín Oficial de Galicia",
    "description": "Medio oficial de publicación normativa del Gobierno de Galicia",
    "category": "boletines"
  },
  {
    "id": 71,
    "name": "DOGC. Boletín Oficial de Cataluña",
    "description": "Medio oficial de publicación normativa del Gobierno de Cataluña",
    "category": "boletines"
  },
  {
    "id": 72,
    "name": "DOGV. Boletín Oficial de la Comunidad Valenciana",
    "description": "Medio oficial de publicación normativa del Gobierno de la Comunidad Valenciana",
    "category": "boletines"
  },
  {
    "id": 73,
    "name": "Drogas",
    "description": "Sustancias psicoactivas con impacto en la salud y el rendimiento",
    "category": "otros"
  },
  {
    "id": 184,
    "name": "DUA. Diseño Universal para el Aprendizaje",
    "description": "Enfoque educativo para crear entornos de aprendizaje accesibles para todos",
    "category": "inclusion"
  },
  {
    "id": 74,
    "name": "EC. Evaluación Continua",
    "description": "Seguimiento del progreso del alumnado a lo largo del tiempo",
    "category": "inclusion"
  },
  {
    "id": 75,
    "name": "EDI. Evaluación Diagnóstica – Inicial",
    "description": "Evaluación al inicio para conocer nivel de partida del alumnado",
    "category": "inclusion"
  },
  {
    "id": 76,
    "name": "Educación",
    "description": "Proceso de enseñanza-aprendizaje para el desarrollo integral",
    "category": "inclusion"
  },
  {
    "id": 77,
    "name": "Educación Sostenible",
    "description": "Formación orientada a la conciencia ambiental y la sostenibilidad",
    "category": "inclusion"
  },
  {
    "id": 79,
    "name": "EF. Evaluación Formativa",
    "description": "Evaluación continua centrada en retroalimentación y mejora",
    "category": "inclusion"
  },
  {
    "id": 80,
    "name": "ELE. Electricidad y Electrónica",
    "description": "Familia profesional de Electricidad y Electrónica",
    "category": "estructura_fp"
  },
  {
    "id": 81,
    "name": "Emocionales",
    "description": "Competencias relacionadas con la gestión y comprensión de emociones",
    "category": "inclusion"
  },
  {
    "id": 82,
    "name": "ENA. Energía y Agua",
    "description": "Familia profesional de Energía y Agua",
    "category": "estructura_fp"
  },
  {
    "id": 83,
    "name": "Enriquecimiento",
    "description": "Estrategias de ampliación para alumnado con altas capacidades",
    "category": "inclusion"
  },
  {
    "id": 84,
    "name": "Enseñanza",
    "description": "Proceso de transmisión de conocimientos y habilidades",
    "category": "otros"
  },
  {
    "id": 85,
    "name": "EOC. Edificación y Obra Civil",
    "description": "Familia profesional de Edificación y Obra Civil",
    "category": "inclusion"
  },
  {
    "id": 86,
    "name": "EPI. Equipos de Protección Individual",
    "description": "Elementos de seguridad para prevenir lesiones en el trabajo",
    "category": "inclusion"
  },
  {
    "id": 193,
    "name": "Erasmus+",
    "description": "Programa europeo de educación, formación, juventud y deporte para la movilidad y cooperación",
    "category": "inclusion"
  },
  {
    "id": 87,
    "name": "ES. Evaluación Sumativa",
    "description": "Evaluación al final del período para medir logros alcanzados",
    "category": "inclusion"
  },
  {
    "id": 88,
    "name": "ESO. Educación Secundaria Obligatoria",
    "description": "Etapa educativa obligatoria de 12 a 16 años",
    "category": "inclusion"
  },
  {
    "id": 89,
    "name": "Estrategias",
    "description": "Métodos y técnicas para optimizar el proceso de enseñanza-aprendizaje",
    "category": "metodologia"
  },
  {
    "id": 90,
    "name": "EV. Evaluación",
    "description": "Medición y valoración del proceso de aprendizaje",
    "category": "inclusion"
  },
  {
    "id": 91,
    "name": "Familia",
    "description": "Contexto primario de aprendizaje y desarrollo del estudiante",
    "category": "otros"
  },
  {
    "id": 92,
    "name": "FC. Flipped Classroom",
    "description": "Metodología de aula invertida: teoría en casa, práctica en clase",
    "category": "metodologia"
  },
  {
    "id": 93,
    "name": "FME. Fabricación Mecánica",
    "description": "Familia profesional de Fabricación Mecánica",
    "category": "inclusion"
  },
  {
    "id": 94,
    "name": "FOL. Formación y Orientación Laboral",
    "description": "Módulo sobre mundo laboral, derechos y orientación profesional",
    "category": "inclusion"
  },
  {
    "id": 95,
    "name": "FP Dual General",
    "description": "Modalidad de formación en régimen general (25% al 35% de duración en la empresa)",
    "category": "inclusion"
  },
  {
    "id": 96,
    "name": "FP Dual Intensiva",
    "description": "Modalidad de formación en régimen intensivo con contrato de formación (al menos un 35% en la empresa)",
    "category": "inclusion"
  },
  {
    "id": 97,
    "name": "FP. Formación Profesional",
    "description": "Sistema educativo de formación técnica y práctica",
    "category": "inclusion"
  },
  {
    "id": 98,
    "name": "FPGB. Formación Profesional de Grado Básico",
    "description": "Modalidad de FP de 2 años para acceso al mercado laboral básico",
    "category": "inclusion"
  },
  {
    "id": 99,
    "name": "FPGM. Formación Profesional de Grado Medio",
    "description": "FP intermedia (2-3 años) entre secundaria y grado superior",
    "category": "inclusion"
  },
  {
    "id": 100,
    "name": "FPGS. Formación Profesional de Grado Superior",
    "description": "FP avanzada (2 años) con acceso a educación universitaria",
    "category": "inclusion"
  },
  {
    "id": 192,
    "name": "FSE+. Fondo Social Europeo Plus",
    "description": "Fondo europeo que cofinancia múltiples proyectos, desdobles y recursos en FP",
    "category": "estructura_fp"
  },
  {
    "id": 101,
    "name": "Gamificación",
    "description": "Aplicación de mecánicas de juego en contextos educativos",
    "category": "inclusion"
  },
  {
    "id": 185,
    "name": "Grados A, B, C, D, E",
    "description": "Niveles del nuevo sistema de FP (Acreditación parcial, Certificado competencia, Certificado profesional, Ciclo Formativo, Curso de Especialización)",
    "category": "inclusion"
  },
  {
    "id": 102,
    "name": "Guía de Aprendizaje",
    "description": "Documento que orienta al alumnado en el proceso formativo",
    "category": "metodologia"
  },
  {
    "id": 103,
    "name": "Guía de Mapeo",
    "description": "Herramienta para visualizar relaciones entre contenidos y competencias",
    "category": "inclusion"
  },
  {
    "id": 104,
    "name": "Género",
    "description": "Perspectiva de igualdad y coeducación en el aula",
    "category": "inclusion"
  },
  {
    "id": 105,
    "name": "H. Horas",
    "description": "Unidad de medida del tiempo formativo",
    "category": "otros"
  },
  {
    "id": 106,
    "name": "Habilidades",
    "description": "Capacidades adquiridas mediante práctica y experiencia",
    "category": "inclusion"
  },
  {
    "id": 107,
    "name": "HOT. Hostelería y Turismo",
    "description": "Familia profesional de Hostelería y Turismo",
    "category": "estructura_fp"
  },
  {
    "id": 108,
    "name": "ICT. Infraestructuras Comunes de Telecomunicaciones",
    "description": "Normativa técnica para instalaciones de telecomunicaciones en edificios",
    "category": "inclusion"
  },
  {
    "id": 109,
    "name": "ID. Innovación Docente",
    "description": "Incorporación de nuevas ideas y enfoques en la enseñanza",
    "category": "inclusion"
  },
  {
    "id": 110,
    "name": "IED. Innovación Educativa",
    "description": "Introducción de nuevos métodos, herramientas y tecnologías educativas",
    "category": "inclusion"
  },
  {
    "id": 111,
    "name": "IEM. Inteligencia Emocional",
    "description": "Habilidad para reconocer, comprender y gestionar emociones",
    "category": "otros"
  },
  {
    "id": 112,
    "name": "IES. Instituto de Educación Secundaria",
    "description": "Centro público de ESO, Bachillerato y FP",
    "category": "inclusion"
  },
  {
    "id": 113,
    "name": "IEV. Instrumentos de evaluación",
    "description": "Herramientas para medir el aprendizaje y progreso del alumnado",
    "category": "inclusion"
  },
  {
    "id": 114,
    "name": "IEX. Industrias Extractivas",
    "description": "Familia profesional de Industrias Extractivas",
    "category": "estructura_fp"
  },
  {
    "id": 115,
    "name": "IFC. Informática y Comunicaciones",
    "description": "Familia profesional de Informática y Comunicaciones",
    "category": "inclusion"
  },
  {
    "id": 116,
    "name": "IMA. Instalación y Mantenimiento",
    "description": "Familia profesional de Instalación y Mantenimiento",
    "category": "inclusion"
  },
  {
    "id": 117,
    "name": "IMP. Imagen Personal",
    "description": "Familia profesional de Imagen Personal",
    "category": "estructura_fp"
  },
  {
    "id": 118,
    "name": "Implementación",
    "description": "Puesta en marcha de programas, metodologías o recursos educativos",
    "category": "inclusion"
  },
  {
    "id": 119,
    "name": "IMS. Imagen y Sonido",
    "description": "Familia profesional de Imagen y Sonido",
    "category": "estructura_fp"
  },
  {
    "id": 120,
    "name": "INA. Industrias Alimentarias",
    "description": "Familia profesional de Industrias Alimentarias",
    "category": "estructura_fp"
  },
  {
    "id": 121,
    "name": "INCUAL. Instituto Nacional de las Cualificaciones",
    "description": "Organismo responsable de definir, elaborar y mantener actualizado el CNCP",
    "category": "inclusion"
  },
  {
    "id": 122,
    "name": "Iniciativa",
    "description": "Capacidad de proponer y emprender acciones de forma autónoma",
    "category": "inclusion"
  },
  {
    "id": 123,
    "name": "Internet",
    "description": "Red global de comunicación como recurso educativo",
    "category": "inclusion"
  },
  {
    "id": 124,
    "name": "Intolerancia",
    "description": "Rechazo hacia la diversidad; prevención y sensibilización",
    "category": "inclusion"
  },
  {
    "id": 125,
    "name": "Investigación",
    "description": "Proceso sistemático de búsqueda de conocimiento nuevo",
    "category": "inclusion"
  },
  {
    "id": 126,
    "name": "Juegos",
    "description": "Recursos lúdicos como herramienta de aprendizaje",
    "category": "metodologia"
  },
  {
    "id": 127,
    "name": "Legislación",
    "description": "Marco normativo que regula el sistema educativo",
    "category": "inclusion"
  },
  {
    "id": 128,
    "name": "Legislación Básica",
    "description": "Normativa fundamental de referencia para la educación",
    "category": "inclusion"
  },
  {
    "id": 129,
    "name": "Lenguaje",
    "description": "Sistema de comunicación verbal y no verbal",
    "category": "inclusion"
  },
  {
    "id": 183,
    "name": "LOMLOE. Ley Orgánica de Modificación de la LOE",
    "description": "Ley educativa actual básica a nivel no universitario (2020)",
    "category": "inclusion"
  },
  {
    "id": 130,
    "name": "MA. Metodologías Activas",
    "description": "Enfoques pedagógicos centrados en la participación activa del alumnado",
    "category": "inclusion"
  },
  {
    "id": 131,
    "name": "Maltrato Intrafamiliar",
    "description": "Violencia en el entorno familiar con impacto en el rendimiento escolar",
    "category": "otros"
  },
  {
    "id": 132,
    "name": "MAM. Madera, Mueble y Corcho",
    "description": "Familia profesional de Madera, Mueble y Corcho",
    "category": "estructura_fp"
  },
  {
    "id": 133,
    "name": "MC. Mapas Conceptuales",
    "description": "Herramientas visuales para organizar y representar relaciones entre conceptos",
    "category": "inclusion"
  },
  {
    "id": 134,
    "name": "Mediación Escolar",
    "description": "Resolución de conflictos en el centro mediante diálogo y negociación",
    "category": "inclusion"
  },
  {
    "id": 135,
    "name": "Medidas de Atención a la Diversidad del Alumnado",
    "description": "Estrategias y adaptaciones para atender las necesidades individuales",
    "category": "inclusion"
  },
  {
    "id": 136,
    "name": "No Sexista",
    "description": "Enfoque educativo que elimina estereotipos de género",
    "category": "otros"
  },
  {
    "id": 137,
    "name": "ODS. Objetivos de Desarrollo Sostenible",
    "description": "17 objetivos ONU para erradicar la pobreza y proteger el planeta",
    "category": "otros"
  },
  {
    "id": 138,
    "name": "OG. Objetivo General",
    "description": "Declaración amplia del propósito educativo a alcanzar",
    "category": "inclusion"
  },
  {
    "id": 139,
    "name": "PAD. Plan de Atención a la Diversidad",
    "description": "Documento para atender necesidades específicas del alumnado diverso",
    "category": "inclusion"
  },
  {
    "id": 140,
    "name": "PAT. Plan de Acción Tutorial",
    "description": "Instrumento de atención personalizada y tutorial",
    "category": "normativa"
  },
  {
    "id": 141,
    "name": "PCC. Proyecto Curricular del Centro",
    "description": "Documento de objetivos, contenidos y estrategias pedagógicas del centro",
    "category": "normativa"
  },
  {
    "id": 142,
    "name": "PD. Programación Didáctica",
    "description": "Plan detallado de objetivos, contenidos, actividades y evaluación",
    "category": "inclusion"
  },
  {
    "id": 143,
    "name": "PEAC. Procedimiento de Evaluación y Acreditación de Competencias",
    "description": "Proceso oficial para reconocer y acreditar la experiencia laboral de los trabajadores",
    "category": "inclusion"
  },
  {
    "id": 144,
    "name": "PEC. Proyecto Educativo de Centro",
    "description": "Documento estratégico de identidad y misión del centro",
    "category": "normativa"
  },
  {
    "id": 145,
    "name": "Personalidad",
    "description": "Desarrollo de la identidad, valores y rasgos personales",
    "category": "otros"
  },
  {
    "id": 146,
    "name": "PGA. Plan General Anual",
    "description": "Documento de líneas generales y objetivos anuales del centro",
    "category": "normativa"
  },
  {
    "id": 147,
    "name": "PI. Proyecto Intermodular",
    "description": "Metodología de proyecto conjunto que agrupa contenidos y resultados de aprendizaje de diferentes módulos",
    "category": "metodologia"
  },
  {
    "id": 148,
    "name": "Plurilingüe",
    "description": "Enfoque educativo que promueve el uso de varias lenguas",
    "category": "otros"
  },
  {
    "id": 149,
    "name": "Prevención",
    "description": "Estrategias para anticipar y evitar riesgos y problemas",
    "category": "otros"
  },
  {
    "id": 150,
    "name": "PRL. Prevención de Riesgos Laborales",
    "description": "Técnicas y medidas para garantizar seguridad y salud laboral",
    "category": "otros"
  },
  {
    "id": 151,
    "name": "Procesos",
    "description": "Actividades y experiencias del entorno educativo para el aprendizaje",
    "category": "otros"
  },
  {
    "id": 188,
    "name": "PT. Pedagogía Terapéutica",
    "description": "Especialista que atiende al alumnado con necesidades educativas especiales",
    "category": "inclusion"
  },
  {
    "id": 152,
    "name": "QUI. Química",
    "description": "Familia profesional de Química",
    "category": "estructura_fp"
  },
  {
    "id": 153,
    "name": "RA. Resultados de aprendizaje",
    "description": "Descripción de lo que el alumnado será capaz de hacer al finalizar",
    "category": "metodologia"
  },
  {
    "id": 154,
    "name": "RD. Real Decreto",
    "description": "Norma con rango de ley emitida por el poder ejecutivo",
    "category": "normativa"
  },
  {
    "id": 155,
    "name": "REBT. Reglamento Electrotécnico de Baja Tensión",
    "description": "Normativa técnica para instalaciones eléctricas ≤1000V CA",
    "category": "inclusion"
  },
  {
    "id": 156,
    "name": "REC-DID. Recursos Didácticos",
    "description": "Clasificación de recursos didácticos e informáticos (ej. Diapositivas, PCs)",
    "category": "codificacion"
  },
  {
    "id": 157,
    "name": "REC-DOC. Recursos de Documentación",
    "description": "Clasificación de documentación (ej. Manuales, Reglamentación)",
    "category": "codificacion"
  },
  {
    "id": 158,
    "name": "REC-TAL. Recursos de Taller",
    "description": "Clasificación de materiales de taller o laboratorio (ej. Herramientas, Maquetas)",
    "category": "codificacion"
  },
  {
    "id": 159,
    "name": "Resiliencia",
    "description": "Capacidad de adaptarse y recuperarse ante situaciones adversas",
    "category": "inclusion"
  },
  {
    "id": 160,
    "name": "Resumen",
    "description": "Síntesis de contenidos clave como recurso de estudio",
    "category": "otros"
  },
  {
    "id": 161,
    "name": "Riesgos",
    "description": "Factores de peligro identificados y evaluados en el entorno educativo",
    "category": "otros"
  },
  {
    "id": 162,
    "name": "Robótica",
    "description": "Uso de robots como herramienta educativa STEM",
    "category": "otros"
  },
  {
    "id": 163,
    "name": "RRI. Reglamento de Régimen Interno",
    "description": "Documento legal del funcionamiento interno de un centro educativo",
    "category": "normativa"
  },
  {
    "id": 191,
    "name": "Rúbrica",
    "description": "Instrumento de evaluación basado en una escala cuantitativa/cualitativa y criterios preestablecidos",
    "category": "inclusion"
  },
  {
    "id": 164,
    "name": "SA. Situaciones de Aprendizaje",
    "description": "Escenarios que el alumnado debe resolver aplicando conocimientos, clave en el nuevo currículo metodológico",
    "category": "inclusion"
  },
  {
    "id": 165,
    "name": "SAN. Sanidad",
    "description": "Familia profesional de Sanidad",
    "category": "estructura_fp"
  },
  {
    "id": 166,
    "name": "SEA. Seguridad y Medio Ambiente",
    "description": "Familia profesional de Seguridad y Medio Ambiente",
    "category": "estructura_fp"
  },
  {
    "id": 167,
    "name": "Sociedad",
    "description": "Contexto social que influye en valores y aprendizaje del alumnado",
    "category": "otros"
  },
  {
    "id": 168,
    "name": "SSC. Servicios Socioculturales y a la Comunidad",
    "description": "Familia profesional de Servicios Socioculturales y a la Comunidad",
    "category": "estructura_fp"
  },
  {
    "id": 169,
    "name": "TCP. Textil, Confección y Piel",
    "description": "Familia profesional de Textil, Confección y Piel",
    "category": "estructura_fp"
  },
  {
    "id": 170,
    "name": "TDAH. Trastorno de Déficit de Atención e Hiperactividad",
    "description": "Trastorno neuropsiquiátrico que afecta atención, impulsividad e hiperactividad",
    "category": "inclusion"
  },
  {
    "id": 171,
    "name": "TEA. Trastorno del Espectro del Autismo",
    "description": "Trastorno del neurodesarrollo que afecta comunicación e interacción social",
    "category": "inclusion"
  },
  {
    "id": 172,
    "name": "Tecnología",
    "description": "Aplicación de conocimientos científicos con fines prácticos",
    "category": "inclusion"
  },
  {
    "id": 173,
    "name": "TIC. Tecnologías de la Información y la Comunicación",
    "description": "Herramientas tecnológicas para crear, procesar y transmitir información",
    "category": "inclusion"
  },
  {
    "id": 174,
    "name": "TMV. Transporte y Mantenimiento de Vehículos",
    "description": "Familia profesional de Transporte y Mantenimiento de Vehículos",
    "category": "estructura_fp"
  },
  {
    "id": 175,
    "name": "Transversal",
    "description": "Contenidos que atraviesan varias materias y áreas del currículo",
    "category": "otros"
  },
  {
    "id": 176,
    "name": "Tutoría",
    "description": "Acción tutorial de acompañamiento y orientación del alumnado",
    "category": "inclusion"
  },
  {
    "id": 177,
    "name": "UC. Unidad de Competencia",
    "description": "Agregado mínimo de competencias profesionales, susceptible de reconocimiento y acreditación parcial",
    "category": "inclusion"
  },
  {
    "id": 178,
    "name": "UD. Unidad didáctica",
    "description": "Estructura pedagógica para organizar contenidos de forma secuencial",
    "category": "metodologia"
  },
  {
    "id": 179,
    "name": "UT. Unidad de trabajo",
    "description": "Conjunto de actividades para desarrollar competencias en FP",
    "category": "estructura_fp"
  },
  {
    "id": 180,
    "name": "Valores",
    "description": "Principios éticos y morales que guían la conducta personal y social",
    "category": "otros"
  },
  {
    "id": 181,
    "name": "Vida",
    "description": "Concepto transversal de educación para la vida y el bienestar",
    "category": "inclusion"
  },
  {
    "id": 182,
    "name": "Violencia",
    "description": "Comportamientos agresivos con impacto en el entorno educativo",
    "category": "otros"
  },
  {
    "id": 194,
    "name": "FEOE. Formación en Empresa u Organismo Equiparado",
    "description": "Periodo formativo del alumnado en una empresa o entidad equiparada (FP Dual)",
    "category": "estructura_fp"
  },
  {
    "id": 195,
    "name": "CIFPA. Centro de Innovación para la FP de Aragón",
    "description": "Organismo aragonés de referencia en formación e innovación del profesorado de FP",
    "category": "estructura_fp"
  },
  {
    "id": 196,
    "name": "EQAVET. European Quality Assurance in Vocational Education and Training",
    "description": "Marco europeo de garantía de la calidad para la Formación Profesional",
    "category": "normativa"
  },
  {
    "id": 197,
    "name": "CCAA. Comunidad(es) Autónoma(s)",
    "description": "División territorial de España con competencias educativas propias",
    "category": "otros"
  },
  {
    "id": 198,
    "name": "PdEvC. Pérdida del derecho a Evaluación Continua",
    "description": "Situación por exceso de faltas de asistencia que exige una prueba de evaluación alternativa",
    "category": "normativa"
  },
  {
    "id": 199,
    "name": "DigComp. Marco Europeo de Competencias Digitales para la Ciudadanía",
    "description": "Marco de la Comisión Europea con 21 competencias digitales en 5 áreas (información y datos, comunicación, creación de contenidos, seguridad, resolución de problemas), con niveles A1 a C2",
    "category": "normativa"
  },
  {
    "id": 200,
    "name": "DigCompEdu. Marco Europeo de Competencia Digital para Educadores",
    "description": "Marco de la Comisión Europea con 6 áreas de competencia digital docente (compromiso profesional, contenidos digitales, enseñanza y aprendizaje, evaluación y retroalimentación, empoderamiento del alumnado, desarrollo de la competencia digital del alumnado)",
    "category": "normativa"
  },
  {
    "id": 201,
    "name": "ETHAZI. Modelo de Aprendizaje Colaborativo basado en Retos del País Vasco",
    "description": "Metodología de Tknika (red de innovación de la FP vasca) estructurada en 11 pasos: plantear el reto, conectar, establecer parámetros, obtener información, generar alternativas, presentar propuestas, seleccionar, planificar, ejecutar, presentar resultados y reflexionar",
    "category": "metodologia"
  },
  {
    "id": 202,
    "name": "ACbR. Aprendizaje Colaborativo basado en Retos",
    "description": "Nombre genérico del enfoque metodológico que aplica el modelo Ethazi",
    "category": "metodologia"
  },
  {
    "id": 203,
    "name": "CEDEFOP. Centro Europeo para el Desarrollo de la Formación Profesional",
    "description": "Agencia de la Unión Europea especializada en FP; publica informes como Skills-OVATE y DigComp at Work",
    "category": "estructura_fp"
  },
  {
    "id": 204,
    "name": "ANPROFOL. Asociación Nacional de Profesorado de Formación y Orientación Laboral",
    "description": "Asociación profesional del colectivo docente de FOL en Formación Profesional",
    "category": "estructura_fp"
  },
  {
    "id": 205,
    "name": "IPE. Itinerario Personal para la Empleabilidad",
    "description": "Módulos transversales I y II de la nueva FP centrados en habilidades para la empleabilidad y el desarrollo personal y social",
    "category": "estructura_fp"
  },
  {
    "id": 206,
    "name": "FPE. Formación Profesional para el Empleo",
    "description": "Oferta formativa dirigida a personas trabajadoras (ocupadas y desempleadas), integrada en el nuevo Sistema Nacional de FP junto al Catálogo Nacional de Estándares de Competencias Profesionales",
    "category": "estructura_fp"
  },
  {
    "id": 207,
    "name": "REA. Recursos Educativos Abiertos",
    "description": "Materiales de enseñanza, aprendizaje e investigación de libre acceso y reutilización, área complementaria del marco DigCompEdu",
    "category": "otros"
  },
  {
    "id": 208,
    "name": "AGIL. Metodologías Ágiles",
    "description": "Enfoques como Design Thinking (empatizar, definir, idear, prototipar, testear), Lean Startup (PMV) y Scrum/Kanban aplicados al aula",
    "category": "metodologia"
  },
  {
    "id": 209,
    "name": "CONTR. Contrato de Aprendizaje (Learning Contract)",
    "description": "Acuerdo individual entre docente y estudiante que fija objetivos, estrategias/recursos, evidencias y criterios de evaluación",
    "category": "metodologia"
  },
  {
    "id": 210,
    "name": "DEBATE. Debates y Diálogo Educativo",
    "description": "Técnica didáctica basada en la confrontación argumentada de ideas para fomentar el pensamiento crítico y la comunicación",
    "category": "metodologia"
  },
  {
    "id": 211,
    "name": "PARES. Aprendizaje entre Pares (Peer Teaching)",
    "description": "Metodología en la que el alumnado enseña y aprende de sus propios compañeros",
    "category": "metodologia"
  },
  {
    "id": 212,
    "name": "ESTAC. Estaciones de Aprendizaje",
    "description": "Organización del aula en rincones o estaciones con actividades distintas y simultáneas por las que rota el alumnado",
    "category": "metodologia"
  }
];
