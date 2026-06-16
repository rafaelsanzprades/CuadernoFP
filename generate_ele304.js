const fs = require('fs');
let content = fs.readFileSync('frontend/src/data/curriculos/sirl.ts', 'utf-8');

content = content.replace('export const SIRL: CurriculumTitulo = {', 'export const ELE304: CurriculumTitulo = {');
content = content.replace('codigo: "SIRL"', 'codigo: "ELE-23"');

const newModules = `
    { codigo: "0525", nombre: "Configuración de infraestructuras de sistemas de telecomunicaciones", horas: 133, curso: "1º", resultados_aprendizaje: [] },
    { codigo: "0551", nombre: "Elementos de sistemas de telecomunicaciones", horas: 133, curso: "1º", resultados_aprendizaje: [] },
    { codigo: "0554", nombre: "Sistemas de producción audiovisual", horas: 200, curso: "1º", resultados_aprendizaje: [] },
    { codigo: "0601", nombre: "Gestión de proyectos de instalaciones de teleco", horas: 67, curso: "1º", resultados_aprendizaje: [] },
    { codigo: "0713", nombre: "Sistemas de telefonía fija y móvil", horas: 133, curso: "1º", resultados_aprendizaje: [] },
    { codigo: "1665", nombre: "Digitalización aplicada a los sectores productivos (GS)", horas: 33, curso: "1º", resultados_aprendizaje: [] },
    { codigo: "0179", nombre: "Inglés Profesional", horas: 67, curso: "1º", resultados_aprendizaje: [] },
    { codigo: "1709", nombre: "Itinerario personal para la empleabilidad I", horas: 100, curso: "1º", resultados_aprendizaje: [] },
    { codigo: "0553", nombre: "Técnicas y procesos en infraestructuras de teleco", horas: 133, curso: "2º", resultados_aprendizaje: [] },
    { codigo: "0555", nombre: "Redes telemáticas", horas: 233, curso: "2º", resultados_aprendizaje: [] },
    { codigo: "0556", nombre: "Sistemas de radiocomunicaciones", horas: 200, curso: "2º", resultados_aprendizaje: [] },
    { codigo: "0557", nombre: "Sistemas integrados y hogar digital", horas: 167, curso: "2º", resultados_aprendizaje: [] },
    { codigo: "1708", nombre: "Sostenibilidad aplicada al sistema productivo", horas: 33, curso: "2º", resultados_aprendizaje: [] },
    { codigo: "1713", nombre: "Proyecto intermodular", horas: 67, curso: "2º", resultados_aprendizaje: [] }
`;

content = content.replace('      ]\n    }\n  ]\n};', '      ]\n    },\n' + newModules + '\n  ]\n};');

fs.writeFileSync('frontend/src/data/curriculos/ele304.ts', content);
console.log('Successfully created ele304.ts');
