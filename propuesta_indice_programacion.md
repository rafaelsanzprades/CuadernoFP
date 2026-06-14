# Propuesta de Índice para Programación Didáctica (Generador DOCX)

Manteniendo los bloques principales (A, B, C...) y ampliándolos a niveles (A1, A2...) para encajar con un estándar completo de programación (como el documento *00 ProgDidacFPB-IED-RSP-COMPLETO.pdf*), nutriéndolo con los datos que ya disponemos en la APP.

---

## A. INTRODUCCIÓN Y CONTEXTUALIZACIÓN
*(Se nutre de los metadatos del módulo y ciclo)*
- **A1. Justificación de la programación:** Base normativa, Leyes de Educación y Reales Decretos aplicables al título.
- **A2. Contextualización:** Perfil profesional del título, entorno socioeconómico y características generales del centro.
- **A3. Ubicación del módulo en el ciclo formativo:** Datos básicos (*Módulo, Ciclo, Curso académico, Departamento* y *Horas totales* de `info_modulo`).

## B. RESULTADOS DE APRENDIZAJE Y FCT/FEOE
*(Se nutre de la tabla de RA y sus flags de Dual)*
- **B1. Resultados de Aprendizaje del Módulo:** Listado completo oficial de los RA (`df_ra`).
- **B2. RAs susceptibles de ser adquiridos en FEOE:** Subconjunto de RA aplicables a FP Dual/Prácticas (`df_ra` filtrando `is_dual == true`).
- **B3. Vinculación con la Empresa Colaboradora:** Orientaciones sobre las actividades a realizar en la empresa.

## C. ORGANIZACIÓN, SECUENCIACIÓN Y TEMPORALIZACIÓN
*(Se nutre de UDs, Calendario, Horario y Planificación Mensual)*
- **C1. Unidades Didácticas (Contenidos):** Listado y descripción de las Unidades Didácticas con sus horas asignadas (`df_ud`).
- **C2. Secuenciación y distribución trimestral:** Tabla de UDs distribuidas por trimestres y meses (`df_sgmt`).
- **C3. Calendario académico y carga horaria:** Fechas de inicio/fin de evaluaciones, festivos y horario semanal aplicable (`info_fechas` y `horario`).

## D. METODOLOGÍA DIDÁCTICA Y AGRUPAMIENTOS
*(Texto procedimental enriquecido)*
- **D1. Principios metodológicos generales:** Aprendizaje basado en proyectos, trabajo colaborativo, etc.
- **D2. Actividades de enseñanza-aprendizaje:** Relación de metodologías tipo (teoría, taller, prácticas simuladas).
- **D3. Agrupamientos y Plan de Desdobles:** Organización del grupo, indicando si existen desdobles por prevención de riesgos o ratios de taller.

## E. PROCEDIMIENTOS, CRITERIOS E INSTRUMENTOS DE EVALUACIÓN
*(Es el bloque más potente de la APP. Se nutre de la Matriz de Evaluación)*
- **E1. Evaluación Inicial:** Diagnóstico previo del alumnado.
- **E2. Criterios de Evaluación:** Relación detallada de CEs vinculados a cada RA (`df_ce` agrupado por `df_ra`).
- **E3. Procedimientos e Instrumentos de Evaluación:** Las prácticas, tareas y pruebas configuradas (`df_act` / `df_pr` y su peso).
- **E4. Criterios de Calificación y Ponderación:** Los pesos % de los CE para aprobar el módulo, nota mínima requerida y configuración del umbral de redondeo al alza (`config_redondeo`).
- **E5. Actividades de Recuperación y Refuerzo:** Sistema de recuperación para evaluaciones y convocatorias extraordinarias.

## F. ATENCIÓN A LAS DIFERENCIAS INDIVIDUALES
*(Texto fijo adaptable)*
- **F1. Atención a la diversidad:** Medidas de inclusión.
- **F2. Adaptaciones curriculares:** Procedimiento para aplicar adaptaciones no significativas o acceso al currículo.

## G. MATERIALES Y RECURSOS DIDÁCTICOS
*(Texto fijo/variable)*
- **G1. Infraestructuras y Equipamientos:** Taller, aula, laboratorio.
- **G2. Herramientas TIC y plataformas:** Moodle, software simulador, Classroom.
- **G3. Bibliografía y recursos para el alumnado:** Textos de consulta y webs.

## H. ACTIVIDADES COMPLEMENTARIAS Y EXTRAESCOLARES
*(Texto fijo/variable)*
- **H1. Propuestas del departamento:** Relación de visitas técnicas, charlas de empresas o salidas vinculadas a los RA del módulo.

## I. ELEMENTOS TRANSVERSALES Y PROYECTOS ESPECÍFICOS
*(Texto fijo)*
- **I1. Elementos transversales:** Prevención de riesgos laborales, igualdad, sostenibilidad.
- **I2. Proyectos de innovación o bilingüismo:** Aplicación de metodologías especiales si procede.

## J. SEGUIMIENTO Y EVALUACIÓN DE LA PROGRAMACIÓN DIDÁCTICA
*(Texto fijo + Plan de contingencia)*
- **J1. Mecanismos de seguimiento docente:** Reuniones de departamento, revisión de la programación.
- **J2. Indicadores de logro:** Grado de cumplimiento del calendario y UDs (Diario de seguimiento `daily_ledger`).
- **J3. Plan de Contingencia:** Procedimiento de actuación ante ausencias o clases a distancia.
