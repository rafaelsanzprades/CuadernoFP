const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/src/i18n/locales');

const translations = {
  pages: {
    progreso_title: { es: "Evaluación y progreso", ca: "Avaluació i progrés", gl: "Avaliación e progreso", eu: "Ebaluazioa eta progresoa", en: "Evaluation and progress" },
    progreso_desc: { es: "Calificaciones, evaluación de RA y analíticas.", ca: "Qualificacions, avaluació de RA i analítiques.", gl: "Cualificacións, avaliación de RA e analíticas.", eu: "Kalifikazioak, RAren ebaluazioa eta analitikak.", en: "Grades, RA evaluation and analytics." },
    calendario_title: { es: "Calendario y trimestres", ca: "Calendari i trimestres", gl: "Calendario e trimestres", eu: "Egutegia eta hiruhilekoak", en: "Calendar and quarters" },
    calendario_desc: { es: "Configura festivos, evaluaciones y tu horario semanal.", ca: "Configura festius, avaluacions i el teu horari setmanal.", gl: "Configura festivos, avaliacións e o teu horario semanal.", eu: "Konfiguratu jaiegunak, ebaluazioak eta zure asteko ordutegia.", en: "Set holidays, evaluations and your weekly schedule." },
    modulo_title: { es: "Configuración del Módulo", ca: "Configuració del Mòdul", gl: "Configuración do Módulo", eu: "Moduluaren konfigurazioa", en: "Module Configuration" },
    modulo_desc: { es: "Configuración de datos, contexto, planes, FEOE, metodología, recursos y elementos transversales.", ca: "Configuració de dades, context, plans, FEOE, metodologia, recursos i elements transversals.", gl: "Configuración de datos, contexto, plans, FEOE, metodoloxía, recursos e elementos transversais.", eu: "Datuen konfigurazioa, testuingurua, planak, FEOE, metodologia, baliabideak eta zeharkako elementuak.", en: "Data configuration, context, plans, FEOE, methodology, resources and transversal elements." },
    matrices_title: { es: "Matrices de Relación", ca: "Matrius de Relació", gl: "Matrices de Relación", eu: "Erlazio Matrizeak", en: "Relationship Matrices" },
    matrices_desc: { es: "Relación y ponderación: OG, RA, CE y UD/T.", ca: "Relació i ponderació: OG, RA, CE i UD/T.", gl: "Relación e ponderación: OG, RA, CE e UD/T.", eu: "Erlazioa eta haztapena: OG, RA, CE eta UD/T.", en: "Relationship and weighting: OG, RA, CE and UD/T." },
    instrumentos_title: { es: "Instrumentos de Evaluación", ca: "Instruments d'Avaluació", gl: "Instrumentos de Avaliación", eu: "Ebaluazio Tresnak", en: "Evaluation Instruments" },
    instrumentos_desc: { es: "Definición y ponderación de CE, RA e instrumentos.", ca: "Definició i ponderació de CE, RA i instruments.", gl: "Definición e ponderación de CE, RA e instrumentos.", eu: "CE, RA eta tresnen definizioa eta haztapena.", en: "Definition and weighting of CE, RA and instruments." },
    programacion_title: { es: "Secuenciación y Tareas", ca: "Seqüenciació i Tasques", gl: "Secuenciación e Tarefas", eu: "Sekuentziazioa eta Zereginak", en: "Sequencing and Tasks" },
    programacion_desc: { es: "Secuenciación temporal de UD y tareas competenciales.", ca: "Seqüenciació temporal d'UD i tasques competencials.", gl: "Secuenciación temporal de UD e tarefas competenciais.", eu: "UDen eta gaitasun-zereginen denbora-sekuentziazioa.", en: "Temporal sequencing of UD and competence tasks." },
    archivos_title: { es: "Gestor de Archivos", ca: "Gestor d'Arxius", gl: "Xestor de Arquivos", eu: "Fitxategi Kudeatzailea", en: "File Manager" },
    archivos_desc: { es: "Sincroniza y gestiona las programaciones y cursos locales.", ca: "Sincronitza i gestiona les programacions i cursos locals.", gl: "Sincroniza e xestiona as programacións e cursos locais.", eu: "Sinkronizatu eta kudeatu tokiko programazioak eta ikastaroak.", en: "Synchronize and manage local programming and courses." },
    documentos_title: { es: "Documentos Oficiales", ca: "Documents Oficials", gl: "Documentos Oficiais", eu: "Dokumentu Ofizialak", en: "Official Documents" },
    documentos_desc: { es: "Explorador de legislación, normativas y docs oficiales.", ca: "Explorador de legislació, normatives i docs oficials.", gl: "Explorador de lexislación, normativas e docs oficiais.", eu: "Legediaren, araudien eta dokumentu ofizialen esploratzailea.", en: "Explorer of legislation, regulations and official docs." },
    descargas_title: { es: "Descargas y Reportes", ca: "Descàrregues i Reports", gl: "Descargas e Informes", eu: "Deskargak eta Txostenak", en: "Downloads and Reports" },
    descargas_desc: { es: "Generación de actas, informes y boletines en PDF/Excel.", ca: "Generació d'actes, informes i butlletins en PDF/Excel.", gl: "Xeración de actas, informes e boletíns en PDF/Excel.", eu: "Aktak, txostenak eta buletinak sortzea PDF/Excel formatuan.", en: "Generation of records, reports and bulletins in PDF/Excel." },
    catalogo_title: { es: "Catálogo FP", ca: "Catàleg FP", gl: "Catálogo FP", eu: "LH Katalogoa", en: "VET Catalog" },
    catalogo_desc: { es: "Explorador de Títulos, Módulos, RA y CE oficiales.", ca: "Explorador de Títols, Mòduls, RA i CE oficials.", gl: "Explorador de Títulos, Módulos, RA e CE oficiais.", eu: "Titulu, Modulu, RA eta CE ofizialen esploratzailea.", en: "Explorer of official Titles, Modules, RA and CE." },
    legal_title: { es: "Aviso Legal", ca: "Avís Legal", gl: "Aviso Legal", eu: "Lege Oharra", en: "Legal Notice" },
    legal_desc: { es: "Aviso legal, privacidad y licencias.", ca: "Avís legal, privacitat i llicències.", gl: "Aviso legal, privacidade e licenzas.", eu: "Lege oharra, pribatutasuna eta lizentziak.", en: "Legal notice, privacy and licenses." }
  },
  tabs: {
    detalle: { es: "Por alumnado", ca: "Per alumnat", gl: "Por alumnado", eu: "Ikasleka", en: "By student" },
    grupal: { es: "Grupal", ca: "Grupal", gl: "Grupal", eu: "Taldeka", en: "Group" },
    individual: { es: "Individual", ca: "Individual", gl: "Individual", eu: "Banakakoa", en: "Individual" },
    fechas: { es: "Fechas clave", ca: "Dates clau", gl: "Datas clave", eu: "Funtsezko datak", en: "Key dates" },
    horario: { es: "Horario semanal", ca: "Horari setmanal", gl: "Horario semanal", eu: "Asteko ordutegia", en: "Weekly schedule" },
    datos: { es: "Datos", ca: "Dades", gl: "Datos", eu: "Datuak", en: "Data" },
    contexto: { es: "Contexto", ca: "Context", gl: "Contexto", eu: "Testuingurua", en: "Context" },
    planes: { es: "Planes", ca: "Plans", gl: "Plans", eu: "Planak", en: "Plans" },
    contexto_feoe: { es: "FEOE", ca: "FEOE", gl: "FEOE", eu: "FEOE", en: "FEOE" },
    metodologia: { es: "Metodología", ca: "Metodologia", gl: "Metodoloxía", eu: "Metodologia", en: "Methodology" },
    evaluacion: { es: "Recursos", ca: "Recursos", gl: "Recursos", eu: "Baliabideak", en: "Resources" },
    otros: { es: "Transversales", ca: "Transversals", gl: "Transversais", eu: "Zeharkakoak", en: "Transversal" },
    ra: { es: "RA y CE", ca: "RA i CE", gl: "RA e CE", eu: "RA eta CE", en: "RA and CE" },
    ud: { es: "Unidades", ca: "Unitats", gl: "Unidades", eu: "Unitateak", en: "Units" },
    relacion: { es: "Relación RA-UD", ca: "Relació RA-UD", gl: "Relación RA-UD", eu: "Erlazioa RA-UD", en: "Relationship RA-UD" },
    contribucion: { es: "Contribución OG", ca: "Contribució OG", gl: "Contribución OG", eu: "Ekarpena OG", en: "Contribution OG" },
    tri1: { es: "1º Trimestre", ca: "1r Trimestre", gl: "1º Trimestre", eu: "1. Hiruhilekoa", en: "1st Quarter" },
    tri2: { es: "2º Trimestre", ca: "2n Trimestre", gl: "2º Trimestre", eu: "2. Hiruhilekoa", en: "2nd Quarter" },
    tri3: { es: "3º Trimestre", ca: "3r Trimestre", gl: "3º Trimestre", eu: "3. Hiruhilekoa", en: "3rd Quarter" },
    secuenciacion: { es: "Secuenciación", ca: "Seqüenciació", gl: "Secuenciación", eu: "Sekuentziazioa", en: "Sequencing" },
    tareas: { es: "Tareas (TC)", ca: "Tasques (TC)", gl: "Tarefas (TC)", eu: "Zereginak (TC)", en: "Tasks (TC)" },
    archivos_nube: { es: "Archivos en la Nube", ca: "Arxius al Núvol", gl: "Arquivos na Nube", eu: "Fitxategiak Hodeian", en: "Cloud Files" },
    archivos_locales: { es: "Archivos Locales", ca: "Arxius Locals", gl: "Arquivos Locais", eu: "Fitxategi Lokalak", en: "Local Files" },
    plantillas: { es: "Plantillas", ca: "Plantilles", gl: "Modelos", eu: "Txantiloiak", en: "Templates" },
    curriculos: { es: "Currículos", ca: "Currículums", gl: "Currículos", eu: "Curriculumak", en: "Curriculums" },
    normativa: { es: "Normativa", ca: "Normativa", gl: "Normativa", eu: "Araudia", en: "Regulations" },
    todofp: { es: "TodoFP", ca: "TodoFP", gl: "TodoFP", eu: "TodoFP", en: "TodoFP" },
    autores: { es: "Autores", ca: "Autors", gl: "Autores", eu: "Egileak", en: "Authors" },
    informes: { es: "Informes", ca: "Informes", gl: "Informes", eu: "Txostenak", en: "Reports" },
    actas: { es: "Actas", ca: "Actes", gl: "Actas", eu: "Aktak", en: "Records" },
    boletines: { es: "Boletines", ca: "Butlletins", gl: "Boletíns", eu: "Buletinak", en: "Bulletins" },
    familias: { es: "Familias", ca: "Famílies", gl: "Familias", eu: "Familiak", en: "Families" },
    titulos: { es: "Títulos", ca: "Títols", gl: "Títulos", eu: "Tituluak", en: "Titles" },
    modulos: { es: "Módulos", ca: "Mòduls", gl: "Módulos", eu: "Moduluak", en: "Modules" }
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

console.log("Locales actualizados para Fases 3, 4 y 5.");
