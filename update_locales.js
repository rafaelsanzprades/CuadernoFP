const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/src/i18n/locales');

const translations = {
  nav: {
    catalogo: { es: "Catálogo", ca: "Catàleg", gl: "Catálogo", eu: "Katalogoa", en: "Catalog" },
    archivos: { es: "Archivos", ca: "Arxius", gl: "Arquivos", eu: "Fitxategiak", en: "Files" },
    documentos: { es: "Documentos", ca: "Documents", gl: "Documentos", eu: "Dokumentuak", en: "Documents" },
    descargas: { es: "Descargas", ca: "Descàrregues", gl: "Descargas", eu: "Deskargak", en: "Downloads" },
    modulo: { es: "Módulo", ca: "Mòdul", gl: "Módulo", eu: "Modulua", en: "Module" },
    matrices: { es: "Matrices", ca: "Matrius", gl: "Matrices", eu: "Matrizeak", en: "Matrices" },
    instrumentos: { es: "Instrumentos", ca: "Instruments", gl: "Instrumentos", eu: "Tresnak", en: "Instruments" },
    programacion: { es: "Secuenciación", ca: "Seqüenciació", gl: "Secuenciación", eu: "Sekuentziazioa", en: "Sequencing" },
    calendario: { es: "Calendario", ca: "Calendari", gl: "Calendario", eu: "Egutegia", en: "Calendar" },
    alumnado: { es: "Alumnado", ca: "Alumnat", gl: "Alumnado", eu: "Ikasleak", en: "Students" },
    seguimiento: { es: "Diario", ca: "Diari", gl: "Diario", eu: "Egunerokoa", en: "Journal" },
    progreso: { es: "Evaluación", ca: "Avaluació", gl: "Avaliación", eu: "Ebaluazioa", en: "Evaluation" },
  },
  navGroups: {
    general: { es: "General", ca: "General", gl: "Xeral", eu: "Orokorra", en: "General" },
    programacion: { es: "Programación", ca: "Programació", gl: "Programación", eu: "Programazioa", en: "Programming" },
    curso: { es: "Curso", ca: "Curs", gl: "Curso", eu: "Ikasturtea", en: "Course" }
  },
  sidebar: {
    en_obras: { es: "En Obras", ca: "En Obres", gl: "En Obras", eu: "Lanetan", en: "Under Construction" },
    demo: { es: "DEMO", ca: "DEMO", gl: "DEMO", eu: "DEMO", en: "DEMO" },
    reales: { es: "REALES", ca: "REALS", gl: "REAIS", eu: "ERREALAK", en: "REAL" },
    abrir_grupo: { es: "Abrir Grupo", ca: "Obrir Grup", gl: "Abrir Grupo", eu: "Ireki Taldea", en: "Open Group" },
    agenda: { es: "Agenda", ca: "Agenda", gl: "Axenda", eu: "Agenda", en: "Agenda" },
    legal: { es: "Legal", ca: "Legal", gl: "Legal", eu: "Legezkoa", en: "Legal" }
  },
  header: {
    buscar: { es: "Buscar...", ca: "Cercar...", gl: "Buscar...", eu: "Bilatu...", en: "Search..." },
    deshacer: { es: "Deshacer", ca: "Desfer", gl: "Desfacer", eu: "Desegin", en: "Undo" },
    rehacer: { es: "Rehacer", ca: "Refer", gl: "Refacer", eu: "Berregin", en: "Redo" },
    sincronizado: { es: "Sincronizado", ca: "Sincronitzat", gl: "Sincronizado", eu: "Sinkronizatuta", en: "Synchronized" },
    guardando: { es: "Guardando...", ca: "Desant...", gl: "Gardando...", eu: "Gordetzen...", en: "Saving..." },
    guardado: { es: "Guardado", ca: "Desat", gl: "Gardado", eu: "Gordeta", en: "Saved" },
    error: { es: "Error", ca: "Error", gl: "Errorea", eu: "Errorea", en: "Error" }
  }
};

const files = ['es.json', 'ca.json', 'gl.json', 'eu.json', 'en.json'];

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  // Apply translations for this language
  ['nav', 'navGroups', 'sidebar', 'header'].forEach(section => {
    if (!data[section]) data[section] = {};
    for (const [key, langs] of Object.entries(translations[section])) {
      data[section][key] = langs[lang] || langs['es']; // fallback to 'es'
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});

console.log("Locales actualizados.");
