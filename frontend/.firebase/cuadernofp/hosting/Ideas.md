# 💡 Backlog de Ideas y Mejoras - Cuaderno FP

> **Última actualización:** 19 julio 2026  
> **Fuentes analizadas:** Documentos organizados en `RF Ideas/referencia/` (ver `INDICE.md`)
> - Normativa: LO 3/2022, RD 659/2023, RD 69/2025, RD 532/2025, D 91/2024 Aragón, O ECD/1005/2018
> - Guía PD v1, Modelos UD/Tarea/Instrumento
> - Cuaderno v10, Ejemplo PD, PD completa Detallada, TFM, Indicadores, Memoria

*(Nota: La Fase de Estructura UI, Fase de Consolidación de Pestañas y otras Fases previas se han completado exhaustivamente según la Revisión Estructural. Han sido eliminadas de este backlog).*

---

## Sprint A: Instrumentos de Evaluación y Generación (Fases 3 y 5)
*Objetivo: Dotar a la aplicación de herramientas para crear rúbricas, exámenes y emitir boletines a las familias.*

1. **Instrumentos de Evaluación (Fase 3):**
   - Construir UI para diseñar **Rúbricas** dinámicas conectadas a los Criterios de Evaluación (CE).
   - Generadores de **Listas de control** y **Escalas de Valoración (Likert)**.
   - Banco de preguntas para la generación automática de **Exámenes tipo test**.
2. **Documentación Administrativa (Fase 5):**
   - Generación en PDF de **Boletines de calificaciones** individuales para los alumnos (con desglose por RA/CE).
   - Generación de **Actas de evaluación**.
   - Informes de evaluación individualizados y certificados académicos.
   - **Envío de Emails automatizado**: Conectar un servicio SMTP para enviar boletines a alumnos/familias.
3. **Generación Didáctica Específica (Fase 5):**
   - Generador en PDF/DOCX de **Unidades Didácticas (UD)** con el desglose metodológico completo.
   - Generador en PDF/DOCX de **Tareas Competenciales** (escenario, evidencias, técnicas).
   - Generación de la tabla obligatoria **Anexo I** con la ponderación de RAs/CEs.

## Sprint X: Distribución y Despliegue
*Objetivo: Facilitar la instalación y uso de la aplicación a los docentes sin conocimientos técnicos.*

1. **Instalador mediante PowerShell:**
   - Crear script que se ejecute directamente desde la web (ej. `iwr -useb https://cuadernofp.com/instalar | iex`).
   - El script descarga la app, crea un acceso directo en el escritorio y arranca el servidor local automáticamente.
2. **Base de Datos Empaquetada:**
   - Aprovechar que la base de datos `cdd_pro.db` es un archivo **SQLite** ligero (~31 MB).
   - Distribuirla empaquetada junto con la app, logrando una experiencia 100% Offline tras la instalación.
   - Separación estricta: los datos personales del docente siguen estando en "Archivos Locales" completamente apartados.
