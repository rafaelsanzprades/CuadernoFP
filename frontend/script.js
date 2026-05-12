const fs = require('fs');
const path = require('path');

const dir = 'c:/GD-rsp/APP/frontend/src/app';

function getFiles(dir) {
    const files = [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            files.push(...getFiles(res));
        } else if (res.endsWith('page.tsx')) {
            files.push(res);
        }
    });
    return files;
}

const descriptions = {
    'analisis': 'Visualiza las estadísticas globales, comparativas entre trimestres y evolución de las calificaciones.',
    'calendario': 'Fechas generales, trimestres, horario semanal, festivos y eventos relevantes del curso.',
    'calificacion': 'Registro y cálculo automático de las calificaciones por trimestre y evaluación final.',
    'calificacion-feoe': 'Seguimiento y evaluación del periodo de Formación en Empresa u Organismo Equiparado (FEOE).',
    'descargas': 'Genera y descarga los documentos oficiales de tu cuaderno digital en formato PDF.',
    'evaluacion': 'Control de faltas de asistencia, incidencias y notas de clase diarias.',
    'instrumentos': 'Definición y ponderación de las herramientas y métodos de evaluación.',
    'introduccion': 'Información general del centro, profesorado, aulas y planes estratégicos.',
    'matrices': 'Relación y ponderación entre los RA, CE y las diferentes UD del módulo.',
    'matricula': 'Listado oficial de estudiantes matriculados y sus datos básicos.',
    'modulo': 'Configuración estructural del módulo didáctico, incluyendo RAs, CEs y UDs.',
    'portal': 'Vista individualizada por estudiante con sus calificaciones y adquisición de competencias.',
    'programacion': 'Secuenciación temporal de las unidades didácticas y diseño de tareas competenciales.',
    'seguimiento': 'Registro detallado del desarrollo diario de las clases y contingencias.',
};

const replacements = [
    [/Fechas Generales/g, "Fechas generales"],
    [/Inicio de Curso/g, "Inicio de curso"],
    [/Inicio Clases/g, "Inicio clases"],
    [/Fin Clases/g, "Fin clases"],
    [/Fin de Curso/g, "Fin de curso"],
    [/1er Trimestre/g, "1er trimestre"],
    [/2º Trimestre/g, "2º trimestre"],
    [/3er Trimestre/g, "3er trimestre"],
    [/Festivos y Eventos/g, "Festivos y eventos"],
    [/Calendario Visual/g, "Calendario visual"],
    [/Notas Registradas/g, "Notas registradas"],
    [/Resultados de Aprendizaje/g, "Resultados de aprendizaje"],
    [/Unidades Didácticas/g, "Unidades didácticas"],
    [/Criterios de Evaluación/g, "Criterios de evaluación"],
    [/Lista Oficial/g, "Lista oficial"],
    [/Adquisición de Competencias/g, "Adquisición de competencias"],
    [/Simulador de Calificaciones/g, "Simulador de calificaciones"],
    [/Secuenciación por Unidades Didácticas/g, "Secuenciación por unidades didácticas"],
    [/Diseño de Tareas Competenciales/g, "Diseño de tareas competenciales"],
    [/Seguimiento Diario/g, "Seguimiento diario"],
    [/Diario de Clases/g, "Diario de clases"],
    [/Configuración del Aula/g, "Configuración del aula"],
    [/Plan de Atención a la Diversidad/g, "Plan de atención a la diversidad"],
    [/Plan de Contingencia/g, "Plan de contingencia"],
    [/Plan de Actividades Complementarias/g, "Plan de actividades complementarias"],
    [/Módulo Didáctico/g, "Módulo didáctico"],
    [/Curso y Alumnado/g, "Curso y alumnado"],
    [/Gestión de Archivos/g, "Gestión de archivos"],
    [/Calendario Académico/g, "Calendario académico"],
    [/Centro Educativo/g, "Centro educativo"],
    [/Descargas PDF/g, "Descargas PDF"],
    [/Evaluación Continua/g, "Evaluación continua"],
    [/Análisis de Grupo/g, "Análisis de grupo"],
    [/Análisis Grupal/g, "Análisis grupal"],
    [/Calificación Académica/g, "Calificación académica"],
    [/Portal Alumnado/g, "Portal alumnado"],
    [/Introducción y Planes/g, "Introducción y planes"]
];

getFiles(dir).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    replacements.forEach(([regex, replacement]) => {
        content = content.replace(regex, replacement);
    });

    const parts = file.split(path.sep);
    const folder = parts[parts.length - 2];
    
    if (descriptions[folder]) {
        const h1Regex = /<h1[^>]*>.*?<\/h1>/s;
        const h1Match = content.match(h1Regex);
        
        if (h1Match) {
            const h1Full = h1Match[0];
            const h1EndIdx = h1Match.index + h1Full.length;
            
            const pStart = content.indexOf('<p className="text-gray-400', h1EndIdx);
            const pEnd = content.indexOf('</p>', pStart);
            
            if (pStart !== -1 && pEnd !== -1 && (pStart - h1EndIdx) < 150) {
                 const pCloseTag = content.indexOf('>', pStart);
                 content = content.slice(0, pCloseTag + 1) + descriptions[folder] + content.slice(pEnd);
            } else {
                 const insertStr = `\n            <p className="text-gray-400 mt-2">${descriptions[folder]}</p>`;
                 content = content.slice(0, h1EndIdx) + insertStr + content.slice(h1EndIdx);
            }
        }
    }

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Script done!');
