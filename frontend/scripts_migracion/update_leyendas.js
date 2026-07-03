const fs = require('fs');
const glob = require('glob');
const path = require('path');

const dict = {
  "agenda": {
    "actual": { title: "Agenda Actual", desc: "Vista de la agenda diaria y tareas pendientes." },
    "resumen": { title: "Resumen de Agenda", desc: "Resumen semanal y mensual de la agenda y programación." }
  },
  "alumnado": {
    "alumnado": { title: "Alumnado", desc: "Gestión del listado de alumnado y ficha individual." },
    "plano": { title: "Plano de Clase", desc: "Distribución y plano visual del aula." },
    "boletines": { title: "Boletines", desc: "Generación de boletines y calificaciones parciales." },
    "feoe": { title: "Prácticas FEOE", desc: "Asignación de prácticas FEOE para el alumnado." }
  },
  "archivos": {
    "datos": { title: "Gestor de Archivos", desc: "Gestor de archivos locales de Programación y Curso." },
    "nube": { title: "Sincronización en la Nube", desc: "Sincronización en la nube y configuración del espacio de trabajo." }
  },
  "ayuda": {
    "asistente": { title: "Asistente IA", desc: "Asistente virtual potenciado con IA para resolver tus dudas." },
    "verificacion": { title: "Verificación de Datos", desc: "Panel de salud y coherencia de los datos de tu cuaderno." },
    "guia": { title: "Guía Paso a Paso", desc: "Manuales y guías paso a paso para configurar tu entorno." },
    "faq": { title: "Preguntas Frecuentes", desc: "Respuestas a las preguntas más frecuentes de los docentes." }
  },
  "calendario": {
    "fechas": { title: "Configuración de Fechas", desc: "Configuración de fechas de inicio, fin y trimestres." },
    "eventos": { title: "Eventos y Festivos", desc: "Gestión de festivos locales, provinciales y eventos de centro." },
    "visual": { title: "Calendario Visual", desc: "Calendario visual con el horario semanal y eventos asignados." }
  },
  "catalogo": {
    "familias": { title: "Familias Profesionales", desc: "Explorador de familias profesionales." },
    "titulo": { title: "Títulos", desc: "Títulos y currículos de la familia seleccionada." },
    "cursos": { title: "Cursos", desc: "Cursos y módulos del título seleccionado." },
    "modulos": { title: "Módulos", desc: "Resultados de aprendizaje y criterios de evaluación del módulo." },
    "autores": { title: "Autores y Editoriales", desc: "Bibliografía, autores y editoriales de referencia." }
  },
  "descargas": {
    "programacion": { title: "Descargas - Programación", desc: "Descarga de la programación didáctica completa en PDF." },
    "curso": { title: "Descargas - Curso", desc: "Descarga de actas, seguimientos y memorias de curso." }
  },
  "instrumentos": {
    "resumen": { title: "Resumen de Instrumentos", desc: "Resumen global de los instrumentos de evaluación configurados." },
    "tri1": { title: "Instrumentos - 1er Trimestre", desc: "Instrumentos de evaluación planificados para el 1er trimestre." },
    "tri2": { title: "Instrumentos - 2º Trimestre", desc: "Instrumentos de evaluación planificados para el 2º trimestre." },
    "tri3": { title: "Instrumentos - 3er Trimestre", desc: "Instrumentos de evaluación planificados para el 3er trimestre." }
  },
  "matrices": {
    "ra": { title: "Matriz RA - CE", desc: "Matriz de Resultados de Aprendizaje y Criterios de Evaluación." },
    "ud": { title: "Unidades Didácticas (UD/T)", desc: "Definición de Unidades Didácticas o Unidades de Trabajo." },
    "relacion": { title: "Relación RA - UD/T", desc: "Ponderación y relación entre Unidades y Resultados de Aprendizaje." },
    "contribucion": { title: "Contribución a OG", desc: "Contribución de los RA a los Objetivos Generales." }
  },
  "modulo": {
    "datos": { title: "Datos del Módulo", desc: "Datos generales del módulo y normativa aplicable." },
    "contexto": { title: "Contexto", desc: "Contexto socioeconómico y características del alumnado." },
    "planes": { title: "Planes de Centro", desc: "Planes y proyectos de centro asociados al módulo." },
    "contexto_feoe": { title: "Contexto FEOE", desc: "Contextualización de la Fase en Empresa (FEOE) si aplica." },
    "metodologia": { title: "Metodología", desc: "Orientaciones pedagógicas y metodológicas." },
    "evaluacion": { title: "Evaluación y Recursos", desc: "Criterios de calificación y recursos didácticos." },
    "otros": { title: "Otros Elementos", desc: "Medidas de atención a la diversidad y otros elementos." },
    "grados": { title: "Grados D y E", desc: "Asignación específica para grados formativos." }
  },
  "profesorado": {
    "acceso": { title: "Acceso de Usuarios", desc: "Control de acceso y autenticación de usuarios." },
    "gestion": { title: "Gestión de Roles", desc: "Gestión de roles y permisos del equipo docente." },
    "asignacion_docentes": { title: "Asignación de Docentes", desc: "Asignación de docentes a los diferentes módulos." },
    "asignacion_modulos": { title: "Asignación de Módulos", desc: "Distribución de carga horaria y módulos por docente." }
  },
  "programacion": {
    "secuenciacion": { title: "Secuenciación", desc: "Secuenciación temporal de las unidades y bloques de contenido." },
    "tareas": { title: "Tareas Competenciales", desc: "Diseño y planificación de tareas y actividades competenciales." }
  },
  "progreso": {
    "resumen": { title: "Resumen de Progreso", desc: "Panel global de rendimiento y calificaciones medias." },
    "detalle": { title: "Detalle por Alumno", desc: "Progreso y trazabilidad detallada por alumno/a." },
    "grupal": { title: "Progreso Grupal", desc: "Desempeño y estadísticas comparativas del grupo." },
    "individual": { title: "Progreso Individual", desc: "Hoja de progreso individual para tutorías." },
    "feoe": { title: "Calificación FEOE", desc: "Seguimiento y calificación de la fase en empresa." }
  },
  "seguimiento": {
    "diario": { title: "Diario de Aula", desc: "Anotaciones diarias, incidencias y desarrollo de las sesiones." },
    "asistencia": { title: "Asistencia", desc: "Registro y control de faltas y retrasos del alumnado." },
    "alerta_abandono": { title: "Alerta de Abandono", desc: "Sistema de detección temprana y protocolo de abandono." }
  }
};

const files = glob.sync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/**/page.tsx');
let updatedCount = 0;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const pageName = path.basename(path.dirname(f));
  
  if (dict[pageName]) {
    const infoRegex = /<div className="flex items-start gap-3 p-4 rounded-xl bg-accent\/5 border border-accent\/20 mb-6">\s*<Info className="w-5 h-5 text-accent mt-0\.5 shrink-0" \/>\s*<div>\s*<p className="text-sm font-semibold text-foreground">.*?<\/p>\s*<p className="text-sm text-muted mt-1">.*?<\/p>\s*<\/div>\s*<\/div>/s;
    
    if (content.match(infoRegex)) {
      const replacement = 
"              {(() => {\n" +
"                const infoMap = " + JSON.stringify(dict[pageName], null, 18).replace(/"/g, "'") + ";\n" +
"                const info = infoMap[activeTab] || { title: 'Herramienta operativa', desc: 'Gestión de ' + activeTab };\n" +
"                return (\n" +
"                  <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>\n" +
"                    <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />\n" +
"                    <div>\n" +
"                      <p className='text-sm font-semibold text-foreground'>{info.title}</p>\n" +
"                      <p className='text-sm text-muted mt-1'>{info.desc}</p>\n" +
"                    </div>\n" +
"                  </div>\n" +
"                );\n" +
"              })()}";

      const newContent = content.replace(infoRegex, replacement);
      fs.writeFileSync(f, newContent, 'utf8');
      updatedCount++;
      console.log('Updated ' + pageName);
    }
  }
});
console.log('Total files updated: ' + updatedCount);
