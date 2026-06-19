# 💡 Ideas de Mejora para la APP Gestión Docente FP

> Basado en el **Sistema Estatal de Indicadores de Evaluación y Calidad de la FP** (junio 2025),
> el **Marco Común de Garantía de Evaluación y Calidad** (junio 2025),
> el **Informe Estado del Sistema de FP** (marzo 2025)
> y la web [todofp.es/evaluacion-calidad](https://todofp.es/evaluacion-calidad/datos-y-evaluacion-del-sistema.html)

---

## 📋 Resumen Ejecutivo

La APP Gestión Docente FP está bien posicionada como herramienta de gestión del día a día del profesorado. Sin embargo, los nuevos documentos del Ministerio abren oportunidades significativas para convertirla en una plataforma más completa que no solo gestione, sino que también **evalúe, analice y mejore** la calidad de la formación profesional.

Las mejoras propuestas se organizan en **5 niveles de prioridad**:

| Prioridad | Descripción | Impacto |
|-----------|-------------|---------|
| 🔴 **P0 — Ya deberías tenerlo** | Funcionalidades alineadas con la normativa vigente que el docente necesita sí o sí | Alto |
| 🟠 **P1 — Alto impacto** | Funcionalidades que aprovechan los 34 indicadores del Sistema Estatal | Alto |
| 🟡 **P2 — Diferenciador** | Lo que te separa de otras herramientas | Medio |
| 🟢 **P3 — Futuro** | Funcionalidades alineadas con la transformación digital del sistema | Medio |
| 🔵 **P4 — Visión estratégica** | Funcionalidades que convierten la APP en ecosistema | Largo plazo |

---

## 🔴 P0 — Funcionalidades Básicas Alineadas con la Normativa

### 1. Gestión de los 5 Grados Formativos (A, B, C, D, E)

**Fuente**: Sistema Estatal, Eje 2 — Oferta de enseñanzas

La Ley 3/2022 estructura la FP en 5 grados. Actualmente la APP solo gestiona Grado D (ciclos formativos).

| Grado | Descripción | Actual | Propuesta |
|-------|-------------|--------|-----------|
| **A** | Acreditación parcial de competencia | ❌ | Módulo de acreditación parcial |
| **B** | Certificado de competencia | ❌ | Módulo de certificados |
| **C** | Certificado profesional | ❌ | Módulo de certificados profesionales |
| **D** | Ciclos formativos (GM/GS) | ✅ | Completar con dual |
| **E** | Cursos de especialización | ❌ | Módulo de especialización |

**Acción concreta**: Añadir selector de grado en `/modulo` y adaptar la programación didáctica al grado seleccionado.

### 2. Formación Dual — Régimen General e Intensivo

**Fuente**: Sistema Estatal, Eje 3 — Empresas y organismos equiparados

La Ley 3/2022 establece la **dual obligatoria** en grados C y D. La APP debe gestionar:

- **Régimen General**: 25-35% en empresa, 10-20% RA en empresa, sin contrato
- **Régimen Intensivo**: 35-50% en empresa, >30% RA, con contrato de formación

**Acción concreta**:
- Añadir campo `modalidad_dual` (general/intensivo) en la configuración del módulo
- Crear sección `/feoe` (prácticas en empresa) con:
  - Datos de la empresa acogedora
  - Tutor empresa + Tutor centro
  - Calendario de alternancia
  - Seguimiento de RA en empresa
  - Evaluación conjunta centro-empresa

### 3. Seguimiento de Tasa de Abandono

**Fuente**: Sistema Estatal, Indicador 1.5

> *"Porcentaje de alumnado matriculado en Grado D que abandona la formación en los dos meses posteriores al inicio"*

**Acción concreta**:
- En `/seguimiento`, añadir alerta temprana de abandono
- Marcar alumnos con <3 asistencias en las primeras 2 semanas
- Dashboard con tasa de abandono por módulo y curso
- Exportar datos para la jefatura de departamento

### 4. Itinerario Formativo Vertical (Grados A→E)

**Fuente**: Sistema Estatal, Indicador 1.4

> *"Porcentaje de alumnado matriculado en Grado X que posee alguna titulación de Grado X-1"*

El nuevo sistema permite un **continuo ascendente**: FP Básica → Grado Medio → Grado Superior → Cursos de especialización.

**Acción concreta**:
- En `/alumnado`, mostrar el itinerario formativo completo del alumno
- Registrar títulos previos y itinerario seguido
- Calcular tasa de promoción entre grados

---

## 🟠 P1 — Aprovechar los 34 Indicadores del Sistema Estatal

### 5. Dashboard de Indicadores por Módulo

**Fuente**: Sistema Estatal, 12 ejes × 34 indicadores

Crear un panel de control que muestre los indicadores que el docente puede medir directamente:

| Indicador | Fuente en la APP | Cómo medirlo |
|-----------|-------------------|--------------|
| 1.5 Tasa de abandono | `/seguimiento` | Alumnos que abandonan en primeros 2 meses |
| 1.6 Tasa de promoción | `/progreso` | % alumnos que promocionan de curso |
| 2.3 Alumnado por grupo | `/modulo` | Ratio alumnos/grupo |
| 4.3 Índice formación docente | `/profesorado` | Cursos de formación permanente |
| 6.1 Tasa afiliación graduados | External API (SEPE) | Conectar con datos de inserción |

**Acción concreta**: Crear ruta `/indicadores` con gráficos interactivos por familia profesional, nivel de competencia y centro.

### 6. Análisis de Rendimiento Académico por Variables

**Fuente**: Sistema Estatal, Eje 1 — Variables de estudio

Los indicadores se desagregan por: sexo, edad, nacionalidad, familia profesional, nivel de competencia, titularidad de centro, modalidad de impartición.

**Acción concreta**:
- En `/progreso`, añadir filtros avanzados:
  - Por sexo
  - Por edad
  - Por nacionalidad
  - Por modalidad (presencial/semipresencial/virtual)
- Gráficos de rendimiento por grupo demográfico
- Detección de brechas de rendimiento

### 7. Conexión con Datos de Inserción Laboral

**Fuente**: Sistema Estatal, Eje 6 — Inserción profesional

> *"Tasa de afiliación media de personas graduadas en Formación Profesional"*

**Acción concreta**:
- Crear módulo `/insercion` que muestre:
  - Tasa de inserción de titulados del centro (si hay datos del SEPE)
  - Distribución por rama de actividad
  - Tamaño de empresa
  - Régimen de afiliación (cuenta ajena/propia)
- Si no hay API pública, permitir importación manual de datos del SEPE/INE

### 8. Evaluación de la Calidad del Centro (Marco EQAVET)

**Fuente**: Marco Común de Garantía — Ciclo de mejora continua

El Marco EQAVET establece un ciclo: **Planificación → Implementación → Evaluación → Revisión**

**Acción concreta**:
- Crear módulo `/calidad` con:
  - **Planificación**: Objetivos de calidad del curso
  - **Implementación**: Registro de acciones formativas
  - **Evaluación**: Autoevaluación del centro con rúbricas
  - **Revisión**: Plan de mejora con acciones correctivas
- Rúbricas predefinidas basadas en los 5 principios EQAVET:
  1. Pertinencia
  2. Eficacia
  3. Eficiencia
  4. Impacto social
  5. Sostenibilidad

---

## 🟡 P2 — Funcionalidades Diferenciadoras

### 9. Gestión de Personal Formador No Docente

**Fuente**: Sistema Estatal, Eje 4 — Indicador 4.2

> *"Número de personas no docentes de apoyo al Sistema de Formación Profesional"*

La Ley 3/2022 incorpora nuevas figuras:
- Personas expertas de sectores productivos
- Personas trabajadoras expertas / sénior de empresa
- Personas prospectoras de empresas
- Personal de apoyo especializado (personas con discapacidad)

**Acción concreta**:
- En `/profesorado`, añadir sección "Colaboradores externos"
- Registrar convenios con empresas para formadores
- Gestionar estancias formativas en empresa

### 10. Gestión de Acreditación de Competencias

**Fuente**: Sistema Estatal, Eje 8 — 7 indicadores

El procedimiento de acreditación tiene fases:
1. Solicitud
2. Asesoramiento
3. Evaluación
4. Acreditación
5. Reconocimiento de competencias acreditadas

**Acción concreta**:
- Crear módulo `/acreditacion` para centros que participen en el procedimiento
- Gestionar personas asesoras y evaluadoras
- Registrar estándares de competencia acreditados
- Calcular ratio de estándares por persona

### 11. Internacionalización — Programas de Movilidad

**Fuente**: Sistema Estatal, Eje 12 — 3 indicadores

> *"Número de movilidades de estudiantes por familia profesional, sexo y edad"*

**Acción concreta**:
- Crear módulo `/internacionalizacion`:
  - Programas Erasmus+ activos
  - Alumnos en movilidad
  - Profesorado en estancias internacionales
  - Centros asociados en el extranjero
- Integrar con la plataforma Erasmus+ si hay API

### 12. Orientación Profesional Integrada

**Fuente**: Sistema Estatal, Eje 10 — Indicador 10.1

> *"Número de servicios de orientación por agentes proveedores"*

**Acción concreta**:
- En `/ayuda`, crear sección de orientación profesional:
  - Itinerarios formativos recomendados
  - Ocupaciones asociadas a cada título
  - Enlaces a portales de empleo
  - Herramientas de autoevaluación vocacional

---

## 🟢 P3 — Funcionalidades Alineadas con la Transformación Digital

### 13. Módulo de Digitalización y Sostenibilidad

**Fuente**: Sistema Estatal, Eje 7

Los nuevos módulos obligatorios desde 2024-2025:
- "Digitalización aplicada al sistema productivo" (30h)
- "Sostenibilidad aplicada al sistema productivo" (30h)

**Acción concreta**:
- Crear programación didáctica específica para estos módulos transversales
- Incluir indicadores de digitalización:
  - Uso de herramientas digitales en el aula
  - Proyectos con gemelos digitales
  - Aulas ATECA
- Incluir indicadores de sostenibilidad:
  - Proyectos de economía circular
  - Huella de carbono del centro

### 14. Emprendimiento e Innovación

**Fuente**: Sistema Estatal, Eje 7 — Indicador 7.3

> *"Proyectos de emprendimiento e innovación en centros de Formación Profesional"*

**Acción concreta**:
- Crear módulo `/innovacion`:
  - Registro de proyectos de innovación
  - Proyectos finales de emprendimiento (obligatorios según Ley 3/2022)
  - Coordinador de innovación por centro
  - Conexión con Hubs de FP

### 15. Equidad y Diseño Universal para el Aprendizaje (DUA)

**Fuente**: Sistema Estatal, Eje 11

> *"Número de personas con necesidades específicas de apoyo matriculadas"*

**Acción concreta**:
- En `/alumnado`, añadir campo de necesidades específicas
- Adaptaciones curriculares registradas
- Personal de apoyo asignado
- Flexibilización temporal documentada

### 16. Financiación y Eficiencia

**Fuente**: Sistema Estatal, Eje 9 — Indicador 9.1

> *"Gasto por estudiante en Formación Profesional"*

**Acción concreta**:
- Si hay datos disponibles, mostrar coste por alumno
- Comparativa con la media nacional
- Análisis de eficiencia: coste vs resultados

---

## 🔵 P4 — Visión Estratégica (Ecosistema)

### 17. Integración con TodoFP y Plataformas Oficiales

**Fuente**: todofp.es, BOE, BOA

| Plataforma | Integración propuesta |
|------------|----------------------|
| **TodoFP** | Sincronización automática de catálogos |
| **BOE/BOA** | Alertas de cambios normativos |
| **SEPE** | Datos de inserción laboral |
| **INE** | Estadísticas educativas |
| **Erasmus+** | Gestión de movilidades |
| **FPConecta** | Conexión con empresas |

### 18. App Móvil para Alumnado

**Fuente**: Transformación digital del sistema

- Consulta de notas y asistencia
- Calendario de clases y exámenes
- Comunicación con el tutor
- Acceso a materiales didácticos
- Encuestas de satisfacción (Indicador 1.3)

### 19. API Pública para Centros

Permitir que otros sistemas del centro (gestión académica, biblioteca, etc.) se conecten con la APP.

### 20. Informe Automático de Calidad

Generar automáticamente el **Informe del Estado del Sistema de FP** a nivel de centro, alineado con los 34 indicadores del Sistema Estatal.

---

## 📊 Tabla Resumen de Mejoras

| # | Mejora | Eje/Indicador | Prioridad | Esfuerzo | Ruta afectada |
|---|--------|---------------|-----------|----------|---------------|
| 1 | 5 Grados formativos | Eje 2 | 🔴 P0 | Medio | `/modulo` |
| 2 | Formación Dual | Eje 3 | 🔴 P0 | Alto | `/feoe` |
| 3 | Tasa de abandono | Ind. 1.5 | 🔴 P0 | Bajo | `/seguimiento` |
| 4 | Itinerario vertical | Ind. 1.4 | 🔴 P0 | Medio | `/alumnado` |
| 5 | Dashboard indicadores | 12 ejes | 🟠 P1 | Alto | `/indicadores` (nueva) |
| 6 | Análisis rendimiento | Eje 1 vars | 🟠 P1 | Medio | `/progreso` |
| 7 | Inserción laboral | Eje 6 | 🟠 P1 | Alto | `/insercion` (nueva) |
| 8 | Marco EQAVET | Marco Común | 🟠 P1 | Alto | `/calidad` (nueva) |
| 9 | Formadores no docentes | Ind. 4.2 | 🟡 P2 | Medio | `/profesorado` |
| 10 | Acreditación competencias | Eje 8 | 🟡 P2 | Alto | `/acreditacion` (nueva) |
| 11 | Internacionalización | Eje 12 | 🟡 P2 | Medio | `/internacionalizacion` (nueva) |
| 12 | Orientación profesional | Eje 10 | 🟡 P2 | Medio | `/ayuda` |
| 13 | Digitalización/Sostenibilidad | Eje 7 | 🟢 P3 | Medio | `/programacion` |
| 14 | Emprendimiento | Ind. 7.3 | 🟢 P3 | Medio | `/innovacion` (nueva) |
| 15 | Equidad/DUA | Eje 11 | 🟢 P3 | Bajo | `/alumnado` |
| 16 | Financiación | Eje 9 | 🟢 P3 | Bajo | Dashboard |
| 17 | Integración externa | Múltiples | 🔵 P4 | Alto | API |
| 18 | App móvil alumnado | Transversal | 🔵 P4 | Muy alto | Nueva app |
| 19 | API pública | Transversal | 🔵 P4 | Alto | Backend |
| 20 | Informe automático | 34 indicadores | 🔵 P4 | Alto | Generador |

---

## 🎯 Plan de Acción Recomendado

### Fase 1 (1-2 meses) — P0
1. Completar gestión de grados A-E en `/modulo`
2. Implementar sección dual en `/feoe`
3. Añadir alerta de abandono en `/seguimiento`
4. Mostrar itinerario formativo en `/alumnado`

### Fase 2 (3-4 meses) — P1
5. Crear `/indicadores` con dashboard
6. Añadir filtros demográficos en `/progreso`
7. Crear módulo `/insercion` con datos SEPE
8. Implementar autoevaluación EQAVET en `/calidad`

### Fase 3 (5-6 meses) — P2
9. Añadir colaboradores externos en `/profesorado`
10. Crear módulo `/acreditacion`
11. Implementar `/internacionalizacion`
12. Enriquecer orientación en `/ayuda`

### Fase 4 (7-12 meses) — P3-P4
13-20. Funcionalidades de transformación digital y ecosistema

---

## 📚 Fuentes Consultadas

1. **Sistema Estatal de Indicadores de Evaluación y Calidad de la FP** (junio 2025) — 12 ejes, 34 indicadores
2. **Marco Común de Garantía de Evaluación y Calidad** (junio 2025) — Ciclo EQAVET
3. **Estado del Sistema de FP — Informe inicial** (marzo 2025) — 81 páginas de diagnóstico
4. **Estadísticas de FP del Sistema Educativo — Edición 2024** (publi-2024.pdf)
5. **Ley Orgánica 3/2022** de ordenación e integración de la FP
6. **Real Decreto 659/2023** de ordenación del Sistema de FP
7. **Real Decreto 69/2025** de elementos integrantes del Sistema Nacional de FP
8. [todofp.es/evaluacion-calidad](https://todofp.es/evaluacion-calidad/datos-y-evaluacion-del-sistema.html)

---

*Documento generado el 19 de junio de 2026 a partir del análisis de los documentos oficiales del Ministerio de Educación, Formación Profesional y Deportes.*
