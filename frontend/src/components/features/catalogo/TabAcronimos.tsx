import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/ui/Card";
import { BookOpen } from "lucide-react";

const acronimosMarkdown = `
# Acrónimos — Glosario de Formación Profesional

> 77 entradas + 5 añadidas. Fuente: catálogo de etiquetas CATEDU/FP.
> Columnas: **Nombre** · **Descripción corta** · **Slug**

---

## ABC

| Nombre | Descripción corta | Slug |
|--------|-------------------|------|
| AACC: Altas Capacidades | Estudiantes con habilidades sobresalientes que requieren atención personalizada | \`aacc-altas-capacidades\` |
| ABP: Aprendizaje Basado en Proyectos | Metodología pedagógica activa a través de proyectos significativos | \`abp-aprendizaje-basado-en-proyectos\` |
| ABR: Aprendizaje Basado en Retos | Enfoque didáctico centrado en resolver retos reales | \`abr-aprendizaje-basado-en-retos\` |
| AC: Ámbito Común | Competencias básicas en FPGB: Lengua, Matemáticas, Ciencias | \`ac-ambito-comun\` |
| ACNEAE: Alumnado Con Necesidades Específicas de Apoyo Educativo | Estudiantes que requieren apoyo por dificultades, discapacidad o condición | \`acneae-alumnado-con-necesidades-especificas-de-apoyo-educativo\` |
| ACNEE: Alumnado Con Necesidades Educativas Especiales | Estudiantes con dificultades de aprendizaje que requieren adaptaciones | \`acnee-alumnado-con-necesidades-educativas-especiales\` |
| AMPA: Asociación de Madres y Padres del Alumnado | Organización de familias para mejorar la educación | \`ampa-asociacion-de-madres-y-padres-del-alumnado\` |
| AT: Ámbito Técnico | Competencias técnicas específicas del área profesional en FPGB | \`at-ambito-tecnico\` |
| BOA: Boletín Oficial de Aragón | Medio oficial de publicación normativa del Gobierno de Aragón | \`boa-boletin-oficial-de-aragon\` |
| BOE: Boletín Oficial del Estado | Medio oficial de publicación normativa del Gobierno de España | \`boe-boletin-oficial-del-estado\` |
| CA: Comunidades de Aprendizaje | Enfoque educativo colaborativo e inclusivo con participación de toda la comunidad | \`ca-comunidades-de-aprendizaje\` |
| CC: Criterios de Calificación | Estándares y pautas para evaluar y asignar calificaciones | \`cc-criterios-de-calificacion\` |
| CDD: Competencia Digital Docente | Certificación de competencia digital del profesorado (6 áreas, 6 niveles) | \`cdd-competencia-digital-docente\` |
| CDI: Competencia Digital Individual | Capacidad para usar eficazmente las TIC en diferentes contextos | \`cdi-competencia-digital-individual\` |
| CE: Criterios de Evaluación | Estándares para medir el progreso del alumnado en un área | \`ce-criterios-de-evaluacion\` |
| CEC: Consejo Escolar del Centro | Órgano colegiado de gestión con representación de toda la comunidad | \`cec-consejo-escolar-del-centro\` |
| CEFP: Centro Específico de Formación Profesional | Centro especializado en formación técnica y práctica | \`cefp-centro-especifico-de-formacion-profesional\` |
| CF: Ciclo Formativo | Programa educativo de formación profesional por grados | \`cf-ciclo-formativo\` |
| CG: Competencia General | Habilidades, conocimientos y actitudes para el éxito en diversos contextos | \`cg-competencia-general\` |
| CINE: Clasificación Internacional Normalizada de la Educación | Sistema UNESCO para comparar sistemas educativos mundiales | \`cine-clasificacion-internacional-normalizada-de-la-educacion\` |
| CLIL: Content and Language Integrated Learning | Aprendizaje integrado de contenido y lengua extranjera | \`clil-content-and-language-integrated-learning\` |
| CM: Contenidos del Módulo | Materias, temas y habilidades abordados en un módulo formativo | \`cm-contenidos-del-modulo\` |
| CMA: Calidad y Medio Ambiente | Formación en gestión de calidad y medio ambiente empresarial | \`cma-calidad-y-medio-ambiente\` |
| CP: Contenido Práctico | Actividades para aplicar conocimientos en situaciones reales | \`cp-contenido-practico\` |
| CPPS: Competencias Profesionales, Personales y Sociales | Conjunto de conocimientos, habilidades y actitudes para la vida | \`cpps-competencias-profesionales-personales-y-sociales\` |
| CT: Contenido Teórico | Transmisión de conceptos abstractos, teorías y principios | \`ct-contenido-teorico\` |
| | | |
| Aprendizaje | Proceso de adquisición de conocimientos, habilidades y valores | \`aprendizaje\` |
| Adicciones | Patologías por consumo de sustancias con impacto en el rendimiento | \`adicciones\` |
| Actitud Emprendedora | Capacidad de innovar, asumir riesgos y crear iniciativas | \`actitud-emprendedora\` |
| Artículo Científico | Publicación de investigación con revisión por pares | \`articulo-cientifico\` |
| Auditoría Creativa | Evaluación sistemática de la creatividad en procesos educativos | \`auditoria-creativa\` |
| Bullying | Acoso escolar sistemático entre estudiantes | \`bullying\` |
| Cannabis | Sustancia psicoactiva con impacto educativo y de salud | \`cannabis\` |
| Carta Tierra | Documento internacional de principios éticos para la sostenibilidad | \`carta-tierra\` |
| Coaching Educativo | Proceso de acompañamiento para potenciar el desarrollo del alumnado | \`coaching-educativo\` |
| Complementos | Contenidos adicionales que amplían el currículo básico | \`complementos\` |
| Comunicación | Habilidad de transmitir y recibir información de forma efectiva | \`comunicacion\` |
| Currículum | Planificación oficial de contenidos, objetivos y actividades educativas | \`curriculo\` |
| Creatividad | Capacidad de generar ideas originales y soluciones novedosas | \`creatividad\` |

---

## DEF

| Nombre | Descripción corta | Slug |
|--------|-------------------|------|
| EC: Evaluación Continua | Seguimiento del progreso del alumnado a lo largo del tiempo | \`ec-evaluacion-continua\` |
| EDI: Evaluación Diagnóstica – Inicial | Evaluación al inicio para conocer nivel de partida del alumnado | \`edi-evaluacion-diagnostica-inicial\` |
| EducAragón: Educación del Gobierno de Aragón | Portal educativo del Gobierno de Aragón | \`educaragon\` |
| EE: Electricidad y Electrónica | Familia profesional de instalaciones y sistemas eléctricos | \`ee-electricidad-y-electronica\` |
| EF: Evaluación Formativa | Evaluación continua centrada en retroalimentación y mejora | \`ef-evaluacion-formativa\` |
| EPI: Equipos de Protección Individual | Elementos de seguridad para prevenir lesiones en el trabajo | \`epi-equipos-de-proteccion-individual\` |
| ES: Evaluación Sumativa | Evaluación al final del período para medir logros alcanzados | \`es-evaluacion-sumativa\` |
| ESO: Educación Secundaria Obligatoria | Etapa educativa obligatoria de 12 a 16 años | \`eso-educacion-secundaria-obligatoria\` |
| EV: Evaluación | Medición y valoración del proceso de aprendizaje | \`ev-evaluacion\` |
| FC: Flipped Classroom | Metodología de aula invertida: teoría en casa, práctica en clase | \`fc-flipped-classroom\` |
| FCT: Formación en Centros de Trabajo | Prácticas profesionales en entorno laboral real | \`fct-formacion-en-centros-de-trabajo\` |
| FOL: Formación y Orientación Laboral | Módulo sobre mundo laboral, derechos y orientación profesional | \`fol-formacion-y-orientacion-laboral\` |
| FP: Formación Profesional | Sistema educativo de formación técnica y práctica | \`fp-formacion-profesional\` |
| FPGB: Formación Profesional de Grado Básico | Modalidad de FP de 2 años para acceso al mercado laboral básico | \`fpgb-formacion-profesional-de-grado-basico\` |
| FPGM: Formación Profesional de Grado Medio | FP intermedia (2-3 años) entre secundaria y grado superior | \`fpgm-formacion-profesional-de-grado-medio\` |
| FPGS: Formación Profesional de Grado Superior | FP avanzada (2 años) con acceso a educación universitaria | \`fpgs-formacion-profesional-de-grado-superior\` |
| | | |
| Desarrollo | Proceso de crecimiento y maduración personal a lo largo de la vida | \`desarrollo\` |
| Desarrollo Sostenible | Progreso que satisface necesidades presentes sin comprometer el futuro *(ver ODS)* | \`desarrollo-sostenible\` |
| Dilemas | Situaciones problemáticas que requieren reflexión ética y toma de decisiones | \`dilemas\` |
| Discalculia | Dificultad específica en el aprendizaje del cálculo y las matemáticas | \`discalculia\` |
| Documentación | Conjunto de documentos necesarios para la gestión educativa | \`documentacion\` |
| Drogas | Sustancias psicoactivas con impacto en la salud y el rendimiento | \`drogas\` |
| Educación | Proceso de enseñanza-aprendizaje para el desarrollo integral | \`educacion\` |
| Educación Sostenible | Formación orientada a la conciencia ambiental y la sostenibilidad | \`educacion-sostenible\` |
| Emocionales | Competencias relacionadas con la gestión y comprensión de emociones | \`emocionales\` |
| Enriquecimiento | Estrategias de ampliación para alumnado con altas capacidades | \`enriquecimiento\` |
| Enseñanza | Proceso de transmisión de conocimientos y habilidades | \`ensenanza\` |
| Estrategias | Métodos y técnicas para optimizar el proceso de enseñanza-aprendizaje | \`estrategias\` |
| Familia | Contexto primario de aprendizaje y desarrollo del estudiante | \`familia\` |

---

## GHI

| Nombre | Descripción corta | Slug |
|--------|-------------------|------|
| H: Horas | Unidad de medida del tiempo formativo | \`horas\` |
| ICT: Infraestructuras Comunes de Telecomunicaciones | Normativa técnica para instalaciones de telecomunicaciones en edificios | \`ict-infraestructuras-comunes-de-telecomunicaciones\` |
| ID: Innovación Docente | Incorporación de nuevas ideas y enfoques en la enseñanza | \`id-innovacion-docente\` |
| IED: Innovación Educativa | Introducción de nuevos métodos, herramientas y tecnologías educativas | \`ied-innovacion-educativa\` |
| IEM: Inteligencia Emocional | Habilidad para reconocer, comprender y gestionar emociones | \`iem-inteligencia-emocional\` |
| IES: Instituto de Educación Secundaria | Centro público de ESO, Bachillerato y FP | \`ies-instituto-de-educacion-secundaria\` |
| IEV: Instrumentos de Evaluación | Herramientas para medir el aprendizaje y progreso del alumnado | \`iev-instrumentos-de-evaluacion\` |
| | | |
| Gamificación | Aplicación de mecánicas de juego en contextos educativos | \`gamificacion\` |
| Género | Perspectiva de igualdad y coeducación en el aula | \`genero\` |
| Guía de Aprendizaje | Documento que orienta al alumnado en el proceso formativo | \`guia-de-aprendizaje\` |
| Guía de Mapeo | Herramienta para visualizar relaciones entre contenidos y competencias | \`guia-de-mapeo\` |
| Habilidades | Capacidades adquiridas mediante práctica y experiencia | \`habilidades\` |
| Implementación | Puesta en marcha de programas, metodologías o recursos educativos | \`implementacion\` |
| Investigación | Proceso sistemático de búsqueda de conocimiento nuevo | \`investigacion\` |
| Iniciativa | Capacidad de proponer y emprender acciones de forma autónoma | \`iniciativa\` |
| Intolerancia | Rechazo hacia la diversidad; prevención y sensibilización | \`intolerancia\` |
| Internet | Red global de comunicación como recurso educativo | \`internet\` |

---

## JKL

| Nombre | Descripción corta | Slug |
|--------|-------------------|------|
| LOE: Ley Orgánica de Educación | Norma esencial del sistema educativo español (2006) | \`loe-ley-organica-de-educacion\` |
| LOGSE: Ley Orgánica de Ordenación General del Sistema Educativo de España | Ley de 1990 que estableció las bases del sistema educativo (sustituida en 2013) | \`logse-ley-organica-de-ordenacion-general-del-sistema-educativo-de-espana\` |
| LOMCE: Ley Orgánica para la Mejora de la Calidad Educativa | Ley de 2013 de organización del sistema educativo español | \`lomce-ley-organica-para-la-mejora-de-la-calidad-educativa\` |
| | | |
| Juegos | Recursos lúdicos como herramienta de aprendizaje | \`juegos\` |
| Legislación | Marco normativo que regula el sistema educativo | \`legislacion\` |
| Legislación Básica | Normativa fundamental de referencia para la educación | \`legislacion-basica\` |
| Lenguaje | Sistema de comunicación verbal y no verbal | \`lenguaje\` |

---

## MNÑ

| Nombre | Descripción corta | Slug |
|--------|-------------------|------|
| MA: Metodologías Activas | Enfoques pedagógicos centrados en la participación activa del alumnado | \`ma-metodologias-activas\` |
| MC: Mapas Conceptuales | Herramientas visuales para organizar y representar relaciones entre conceptos | \`mc-mapas-conceptuales\` |
| | | |
| Maltrato Intrafamiliar | Violencia en el entorno familiar con impacto en el rendimiento escolar | \`maltrato-intrafamiliar\` |
| Mediación Escolar | Resolución de conflictos en el centro mediante diálogo y negociación | \`mediacion-escolar\` |
| Medidas de Atención a la Diversidad del Alumnado | Estrategias y adaptaciones para atender las necesidades individuales | \`medidas-atencion-diversidad\` |
| No Sexista | Enfoque educativo que elimina estereotipos de género | \`no-sexista\` |

---

## OPQ

| Nombre | Descripción corta | Slug |
|--------|-------------------|------|
| OG: Objetivo General | Declaración amplia del propósito educativo a alcanzar | \`og-objetivo-general\` |
| ODS: Objetivos de Desarrollo Sostenible | 17 objetivos ONU para erradicar la pobreza y proteger el planeta | \`ods-objetivos-de-desarrollo-sostenible\` |
| PAD: Plan de Atención a la Diversidad | Documento para atender necesidades específicas del alumnado diverso | \`pad-plan-de-atencion-a-la-diversidad\` |
| PAT: Plan de Acción Tutorial | Instrumento de atención personalizada y tutorial | \`pat-plan-de-accion-tutorial\` |
| PCC: Proyecto Curricular del Centro | Documento de objetivos, contenidos y estrategias pedagógicas del centro | \`pcc-proyecto-curricular-del-centro\` |
| PD: Programación Didáctica | Plan detallado de objetivos, contenidos, actividades y evaluación | \`pd-programacion-didactica\` |
| PEC: Proyecto Educativo de Centro | Documento estratégico de identidad y misión del centro | \`pec-proyecto-educativo-de-centro\` |
| PGA: Plan General Anual | Documento de líneas generales y objetivos anuales del centro | \`pga-plan-general-anual\` |
| PRL: Prevención de Riesgos Laborales | Técnicas y medidas para garantizar seguridad y salud laboral | \`prl-prevencion-de-riesgos-laborales\` |
| | | |
| Personalidad | Desarrollo de la identidad, valores y rasgos personales | \`personalidad\` |
| Plurilingüe | Enfoque educativo que promueve el uso de varias lenguas | \`plurilingue\` |
| Prevención | Estrategias para anticipar y evitar riesgos y problemas | \`prevencion\` |
| Procesos | Actividades y experiencias del entorno educativo para el aprendizaje | \`procesos\` |

---

## RST

| Nombre | Descripción corta | Slug |
|--------|-------------------|------|
| RA: Resultados de Aprendizaje | Descripción de lo que el alumnado será capaz de hacer al finalizar | \`ra-resultados-de-aprendizaje\` |
| RD: Real Decreto | Norma con rango de ley emitida por el poder ejecutivo | \`rd-real-decreto\` |
| REBT: Reglamento Electrotécnico de Baja Tensión | Normativa técnica para instalaciones eléctricas ≤1000V CA | \`rebt-reglamento-electrotecnico-de-baja-tension\` |
| RRI: Reglamento de Régimen Interno | Documento legal del funcionamiento interno de un centro educativo | \`rri-reglamento-de-regimen-interno\` |
| TDAH: Trastorno de Déficit de Atención e Hiperactividad | Trastorno neuropsiquiátrico que afecta atención, impulsividad e hiperactividad | \`tdah-trastorno-de-deficit-de-atencion-e-hiperactividad\` |
| TEA: Trastorno del Espectro del Autismo | Trastorno del neurodesarrollo que afecta comunicación e interacción social | \`tea-trastorno-del-espectro-del-autismo\` |
| TIC: Tecnologías de la Información y la Comunicación | Herramientas tecnológicas para crear, procesar y transmitir información | \`tic-tecnologias-de-la-informacion-y-la-comunicacion\` |
| | | |
| Resiliencia | Capacidad de adaptarse y recuperarse ante situaciones adversas | \`resiliencia\` |
| Resumen | Síntesis de contenidos clave como recurso de estudio | \`resumen\` |
| Riesgos | Factores de peligro identificados y evaluados en el entorno educativo | \`riesgos\` |
| Robótica | Uso de robots como herramienta educativa STEM | \`robotica\` |
| Sociedad | Contexto social que influye en valores y aprendizaje del alumnado | \`sociedad\` |
| Tecnología | Aplicación de conocimientos científicos con fines prácticos | \`tecnologia\` |
| Transversal | Contenidos que atraviesan varias materias y áreas del currículo | \`transversal\` |
| Tutoría | Acción tutorial de acompañamiento y orientación del alumnado | \`tutoria\` |

---

## UVW – XYZ

| Nombre | Descripción corta | Slug |
|--------|-------------------|------|
| UD: Unidad Didáctica | Estructura pedagógica para organizar contenidos de forma secuencial | \`ud-unidad-didactica\` |
| UT: Unidad de Trabajo | Conjunto de actividades para desarrollar competencias en FP | \`ut-unidad-de-trabajo\` |
| | | |
| Valores | Principios éticos y morales que guían la conducta personal y social | \`valores\` |
| Violencia | Comportamientos agresivos con impacto en el entorno educativo | \`violencia\` |
| Vida | Concepto transversal de educación para la vida y el bienestar | \`vida\` |
`;

export function TabAcronimos() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold text-foreground">Acrónimos y glosario</h2>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none 
          prose-headings:text-foreground prose-headings:font-bold 
          prose-p:text-muted prose-a:text-accent hover:prose-a:text-accent/80
          prose-table:w-full prose-table:border-collapse prose-table:border-[var(--glass-border)]
          prose-th:border-[var(--glass-border)] prose-th:bg-foreground/5 prose-th:p-2 prose-th:text-left
          prose-td:border-[var(--glass-border)] prose-td:p-2 prose-td:text-muted prose-td:break-words
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {acronimosMarkdown}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
}
