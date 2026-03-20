# 🚧 FASE DE PRUEBAS 🚧
# 📓 Cuaderno Digital Docente Ciclos FP

Una aplicación web interactiva desarrollada en **Python** con **Streamlit** diseñada para facilitar la labor del profesorado de Formación Profesional (o cualquier otra etapa educativa) en la gestión diaria de sus clases. Automatiza la planificación, el seguimiento en vivo, y el cálculo de evaluaciones en sintonía con los Resultados de Aprendizaje (RA).

## 🚀 Características Principales

La herramienta se divide en **7 pilares fundamentales** accesibles mediante un menú de navegación rápido y oscuro:

1. **Módulo didáctico:** Parametrización operativa del módulo (Nombre, curso, centro) y selección ágil de bases de datos JSON para rotar entre múltiples asignaturas.
2. **Calendario lectivo:** Configuración global del curso, trimestres y periodo FEOE, indicando las horas semanales impartidas por día.
3. **Matriz programación:** Asignación en tiempo real de qué RA tributan a qué Unidades Didácticas o Prácticas.
4. **Resumen docente:** Visualización transparente sobre cómo se evalúa cada RA y estructuración de UDs a lo largo de los tres trimestres.
5. **Seguimiento diario:** Verificador mensual para cuadrar las horas estimadas frente a las horas reales impartidas.
6. **Matrícula alumnado:** Ficha completa y editable de la clase. Control de estados (Alta, Baja).
7. **Calificación numérica:** Cuaderno tabular de notas por instrumentos. Interfaz matemática de medias y conversión automática al sistema de calificación cualitativa **SIGAD**.
8. **Progreso porcentual:** Gráficos integrales de consecución por Resultados de Aprendizaje para cada estudiante.

### 📥 Motor de Informes PDF Autónomos
El cuaderno incluye un avanzado sistema de renderizado (basado en `ReportLab`) para descargar al instante los anexos administrativos y docentes de tu aula. Tres formatos a un clic:
* **Calendario académico:** Un cronograma por meses en A4 apaisado indicando huecos laborales y semestrales.
* **Seguimiento diario:** Tablas mensuales en A4 vertical, adaptadas al horario real del ciclo para las firmas de asistencia presencial.
* **Boletín competencial:** Un reporte completo, personal y de varias páginas por alumno con toda su progresión trimestral y el grado de logro exacto de todos sus Resultados de Aprendizaje.

## 🛠️ Tecnologías Empleadas

- **[Python 3](https://www.python.org/):** Lenguaje base.
- **[Streamlit](https://streamlit.io/):** Framework para la generación de la Interfaz de Usuario.
- **[Pandas](https://pandas.pydata.org/):** Tratamiento y estructuración de los Dataframes (tablas de alumnos, notas, fechas).
- Archivos locales **JSON** como motor de base de datos persistente dinámica.

## ⚙️ Instalación y Uso

1. Es recomendable crear un entorno virtual:
   ```bash
   python -m venv env
   source env/bin/activate  # en Linux/Mac
   env\Scripts\activate     # en Windows
   ```
2. Instala las dependencias necesarias:
   ```bash
   pip install streamlit pandas
   ```
3. Arranca el servidor local:
   ```bash
   streamlit run app.py
   ```

## 📁 Archivos de Configuración

El guardado de progreso es modular. La aplicación rastrea dinámicamente tu directorio local buscando archivos JSON (ejemplo: `0238-id.json`, `0555-rt.json`). Si no hay nada, arranca un contenedor nuevo llamado `nuevo-modulo.json` protegiendo que jamás se rompa. Puedes exportar o importar asignaturas completas (alumnos incluidos) tan solo compartiendo ese único archivo JSON.

## 🎨 Personalización Visual
Todo el diseño se ha creado inyectando reglas CSS y HTML a medida para acercar la sensación a una auténtica aplicación web oscura (Dark Mode nativo). Las barras de carga, insignias SIGAD y celdas congeladas interactúan suavizando el trabajo habitual de las densas hojas de Excel.
