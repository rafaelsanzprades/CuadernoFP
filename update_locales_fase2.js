const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/src/i18n/locales');

const translations = {
  pages: {
    agenda_title: { es: "Agenda", ca: "Agenda", gl: "Axenda", eu: "Agenda", en: "Agenda" },
    agenda_desc: { es: "Resumen diario: estado de clase y UD a impartir.", ca: "Resum diari: estat de classe i UD a impartir.", gl: "Resumo diario: estado de clase e UD a impartir.", eu: "Eguneroko laburpena: klasearen egoera eta emateko UDa.", en: "Daily summary: class status and UD to teach." },
    alumnado_title: { es: "Alumnado y tutoría", ca: "Alumnat i tutoria", gl: "Alumnado e titoría", eu: "Ikasleak eta tutoretza", en: "Students and tutoring" },
    alumnado_desc: { es: "Gestión de alumnado, tutoría, FEOE y orientación.", ca: "Gestió d'alumnat, tutoria, FEOE i orientació.", gl: "Xestión de alumnado, titoría, FEOE e orientación.", eu: "Ikasleen, tutoretzaren, FEOEren eta orientazioaren kudeaketa.", en: "Management of students, tutoring, FEOE and orientation." },
    seguimiento_title: { es: "Seguimiento Diario", ca: "Seguiment Diari", gl: "Seguimento Diario", eu: "Eguneroko Segimendua", en: "Daily Tracking" },
    seguimiento_desc: { es: "Diario de aula, contingencias, control de asistencia y alertas.", ca: "Diari d'aula, contingències, control d'assistència i alertes.", gl: "Diario de aula, continxencias, control de asistencia e alertas.", eu: "Ikasgelako egunerokoa, kontingentziak, asistentzia kontrola eta alertak.", en: "Classroom journal, contingencies, attendance control and alerts." },
  },
  tabs: {
    actual: { es: "Actual", ca: "Actual", gl: "Actual", eu: "Egungoa", en: "Current" },
    resumen: { es: "Resumen", ca: "Resum", gl: "Resumo", eu: "Laburpena", en: "Summary" },
    listado: { es: "Listado", ca: "Llistat", gl: "Listado", eu: "Zerrenda", en: "List" },
    tutoria: { es: "Tutoría", ca: "Tutoria", gl: "Titoría", eu: "Tutoretza", en: "Tutoring" },
    plano: { es: "Plano Aula", ca: "Plànol Aula", gl: "Plano Aula", eu: "Ikasgelaren Planoa", en: "Classroom Map" },
    feoe: { es: "FEOE / Anecdotario", ca: "FEOE / Anecdotari", gl: "FEOE / Anecdotario", eu: "FEOE / Anekdotarioa", en: "FEOE / Anecdotal" },
    diario: { es: "Diario", ca: "Diari", gl: "Diario", eu: "Egunerokoa", en: "Journal" },
    asistencia: { es: "Asistencia", ca: "Assistència", gl: "Asistencia", eu: "Asistentzia", en: "Attendance" },
    abandono: { es: "Abandono", ca: "Abandonament", gl: "Abandono", eu: "Uztea", en: "Drop-out" }
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
  
  ['pages', 'tabs'].forEach(section => {
    if (!data[section]) data[section] = {};
    for (const [key, langs] of Object.entries(translations[section])) {
      data[section][key] = langs[lang] || langs['es'];
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});

console.log("Locales actualizados para Fase 2.");
