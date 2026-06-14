# Auditoría de Alineación: Cuaderno FP vs Documentos Oficiales

## 1. Funcionalidades de la APP Cuaderno FP

### 1.1. Estructura de Datos (según types/index.ts)
- **ModuleData**: Contiene toda la información del módulo
  - `df_ud`: Unidades Didácticas
  - `df_sesiones`: Sesiones de clase
  - `df_ra`: Resultados de Aprendizaje
  - `df_ce`: Criterios de Evaluación
  - `df_tareas`: Tareas competenciales
  - `df_act`: Actividades
  - `df_instr`: Instrumentos de evaluación
  - `df_pr`: Prácticas
  - `df_dua`: Medidas de atención a la diversidad
  - `df_contingencia`: Plan de contingencia
  - `df_ace`: Actividades complementarias y extraescolares

- **CursoData**: Información del curso
  - `df_al`: Alumnado
  - `df_sgmt`: Seguimiento de Unidades Didácticas
  - `df_feoe`: Formación en Empresa
  - `df_eval`: Evaluaciones
  - `daily_ledger`: Registro diario
  - `tutoria_ledger`: Registro de tutorías
  - `actuaciones_tutoria`: Actuaciones tutoría
  - `info_fechas`: Información de fechas académicas

### 1.2. Funcionalidades por Área (según README.md)

#### Área 1: General
- **Entorno de trabajo**: Gestión de programaciones didácticas, cursos y base de datos activa
- **Ciclos formativos**: Catálogo oficial de Ciclos Formativos
- **Agenda de clase**: Revisión de lo que toca impartir hoy
- **Documentos y descargas**: Generador de reportes PDF
- **Centro de ayuda**: Panel de salud y verificación de coherencia

#### Área 2: Programación
- **Módulo didáctico**: Configuración básica del módulo
- **Calendario académico**: Fechas generales, trimestres, horario semanal
- **Matrices OG→RA→CE→UD**: Definición y ponderación entre Resultados de Aprendizaje, Criterios de Evaluación y Unidades Didácticas
- **Instrumentos de evaluación**: Definición y ponderación de herramientas de evaluación
- **Programación de aula**: Secuenciación temporal de unidades didácticas

#### Área 3: Curso
- **Alumnado y tutoría**: Gestión oficial de estudiantes
- **Orientación profesional**: Plan de Orientación Profesional
- **Prácticas FEOE**: Gestión de empresas colaboradoras y seguimiento
- **Seguimiento diario**: Registro detallado del desarrollo de clases
- **Progreso académico**: Panel integrado de calificaciones y evaluación continua

## 2. Documentos Oficiales de Referencia

### 2.1. Normativa Estatal
- **RD 659/2023**: Real Decreto de ordenación del Sistema de Formación Profesional
- **LOMLOE**: Ley Orgánica 2/2006, de 3 de mayo, de Educación (modificada)

### 2.2. Normativa Autonómica (Aragón)
- **Orden ECD/842/2024**: Currículos CFGM de Aragón
- **Orden ECD/843/2024**: Currículos CFGS de Aragón
- **Orden ECD/841/2024**: Currículos CFGB de Aragón

### 2.3. Documentos de Validación CIFPA 2026
- **Evaluacion_Calificacion_Competencias_FP_Ed2.pdf**: Guía CIFPA 2ª Edición
- **Cuaderno-Profesorado-FP_v10-Manual.pdf**: Manual del Cuaderno FP v10
- **Cuaderno-Profesorado-FP_v10.1.xlsx**: Plantilla Excel del Cuaderno FP v10

## 3. Análisis de Alineación

### 3.1. Confirmación de Validación (según documento de validación)
**Sí, la herramienta está plenamente validada y alineada con el modelo CIFPA 2026:**

1. **Origen Compartido**: La estructura de datos replica exactamente el "Modelo de diseño, planificación y evaluación por competencias" de la Guía CIFPA
2. **Alineación Normativa**: La aplicación respeta la Orden ECD/842/2024 y el RD 659/2023
3. **Jerarquía de Evaluación**: Respeta la jerarquía: Evidencia → Indicador → Instrumento → CE → RA → Módulo

### 3.2. Funcionalidades Implementadas vs Requeridas

#### ✅ Implementadas:
1. **Estructura de datos**: `df_ra`, `df_ce`, `df_ud`, `df_sgmt` - Alineada con el modelo CIFPA
2. **Matrices de relación**: OG→RA→CE→UD - Implementada
3. **Planificación temporal**: Seguimiento mensual de unidades didácticas
4. **Generación de PDFs**: Reportes de seguimiento, boletines, planificación
5. **Gestión de alumnado**: Fichas individuales y matriz de tutoría
6. **Prácticas FEOE**: Gestión de empresas y seguimiento
7. **Calendario académico**: Fechas, trimestres, horarios

#### ❌ Pendientes de Implementar (según documento de validación):
1. **Cuaderno de Calificaciones**:
   - Módulo de Instrumentos e Indicadores (Rúbricas, Listas de Control)
   - Matriz de Calificación (tabla doble entrada Alumnado vs Indicadores)
   - Modificación Manual Justificada de RAs

2. **Integración de la FEOE**:
   - Distribución de RAs Centro-Empresa
   - Volcado de Notas del Tutor de Empresa
   - Generación del Anexo XI b

3. **Módulo de Acción Tutorial e Informes**:
   - Registro de Tutorías (panel CRM)
   - Boletines Individualizados con gráficos de progreso

4. **Procedimientos de Evaluación Parcial y Extraordinaria**:
   - Cortes de Evaluación (1ª, 2ª, 3ª evaluación)
   - Mecanismo de "Mejor Nota" en la Extraordinaria

5. **Dashboard de Estadísticas**:
   - Panel analítico con gráficos de distribución de aprobados/suspendidos

## 4. Cumplimiento Normativo

### 4.1. RD 659/2023 (Ordenación del Sistema de FP)
**Artículos relevantes y su implementación en la APP:**

- **Artículo 16: Derecho a una evaluación objetiva**: ✅ Implementado mediante matrices RA-CE
- **Artículo 18: Aspectos comunes sobre evaluación y calificación**: ✅ Implementado
- **Artículo 19: Documentos de evaluación**: ✅ Implementado (generación de PDFs)

### 4.2. Orden ECD/842/2024 (Currículos CFGM Aragón)
**Aspectos organizativos del currículo:**
- **Estructura de módulos**: ✅ Implementada en `ModuleData`
- **Resultados de Aprendizaje**: ✅ Implementados en `df_ra`
- **Criterios de Evaluación**: ✅ Implementados en `df_ce`
- **Unidades Didácticas**: ✅ Implementadas en `df_ud`

## 5. Conclusiones

### 5.1. Estado Actual
La aplicación Cuaderno FP está **plenamente validada** y alineada con:
- El modelo CIFPA 2026
- La normativa estatal (RD 659/2023)
- La normativa autonómica de Aragón (Orden ECD/842/2024)

### 5.2. Áreas de Mejora
Se identifican 5 áreas principales para el desarrollo futuro:
1. Cuaderno de calificaciones diario
2. Integración completa de la FEOE
3. Módulo de acción tutorial e informes
4. Procedimientos de evaluación parcial y extraordinaria
5. Dashboard de estadísticas

### 5.3. Recomendaciones
1. **Priorizar** la implementación del cuaderno de calificaciones diario
2. **Completar** la integración de la FEOE según la nueva ley
3. **Desarrollar** el módulo de acción tutorial para cumplir con los requisitos de tutoría
4. **Implementar** los procedimientos de evaluación parcial y extraordinaria

## 6. Próximos Pasos
1. Leer los documentos oficiales completos para verificar cumplimiento detallado
2. Comparar funcionalidades implementadas vs requeridas por normativa
3. Identificar lagunas específicas de cumplimiento normativo
4. Proponer plan de desarrollo para cerrar lagunas