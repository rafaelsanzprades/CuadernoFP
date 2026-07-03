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
  "documentos": {
    "Plantillas": { title: "Plantillas", desc: "Plantillas base para programaciones y actas." },
    "Currículos": { title: "Currículos", desc: "Decretos de currículos oficiales." },
    "Normativa": { title: "Normativa", desc: "Legislación y normativa educativa." },
    "TodoFP": { title: "TodoFP", desc: "Recursos y guías del portal TodoFP." },
    "Autores/Editoriales": { title: "Autores y Editoriales", desc: "Bibliografía y material de editoriales." }
  },
  "feoe": {
    "dual": { title: "FCT / Dual", desc: "Seguimiento de prácticas en empresas y FP Dual." },
    "empresas": { title: "Empresas Colaboradoras", desc: "Directorio de empresas y convenios." }
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

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  const pageName = path.basename(path.dirname(f));
  
  // 1. Fix UTF-8 strings by regenerating infoMap
  if (dict[pageName]) {
    const infoMapStart = content.indexOf('const infoMap: Record<string, {title: string, desc: string}> = {');
    if (infoMapStart !== -1) {
      const infoMapEnd = content.indexOf('};', infoMapStart) + 2;
      const oldInfoMap = content.substring(infoMapStart, infoMapEnd);
      const newInfoMap = 'const infoMap: Record<string, {title: string, desc: string}> = ' + JSON.stringify(dict[pageName], null, 18).replace(/"/g, "'") + ';';
      
      if (oldInfoMap !== newInfoMap) {
        content = content.replace(oldInfoMap, newInfoMap);
        changed = true;
      }
      
      // Also fix "Gestin de " inside the fallback
      content = content.replace(/desc: 'Gesti[^']* de '/g, "desc: 'Gestión de '");
      content = content.replace(/desc: 'Gesti[^']* operativa'/g, "desc: 'Gestión operativa'");
    }
  }

  // 2. Ensure TABS appears BEFORE info block
  // Find where TABS starts and info block starts
  const tabsStartRegex = /<Tabs value=\{activeTab\}[^>]*>/;
  const tabsMatch = content.match(tabsStartRegex);
  
  const iifeStart = content.indexOf('{(() => {');
  
  if (tabsMatch && iifeStart !== -1) {
    const tabsIndex = tabsMatch.index;
    
    if (iifeStart < tabsIndex) {
      // Info block is BEFORE tabs block. We need to SWAP them.
      // But wait, the Tabs block goes until </Tabs>.
      const iifeEnd = content.indexOf('})()}', iifeStart) + 5;
      const iifeBlock = content.substring(iifeStart, iifeEnd);
      
      const tabsEnd = content.indexOf('</Tabs>', tabsIndex) + 7;
      const tabsBlock = content.substring(tabsIndex, tabsEnd);
      
      const between = content.substring(iifeEnd, tabsIndex);
      
      // We replace the whole section starting from iifeStart up to tabsEnd
      const sectionToReplace = content.substring(iifeStart, tabsEnd);
      const replacement = tabsBlock + between + iifeBlock;
      
      content = content.replace(sectionToReplace, replacement);
      console.log('Swapped Info and Tabs in ' + pageName);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed UTF-8 in ' + pageName);
  }
});
