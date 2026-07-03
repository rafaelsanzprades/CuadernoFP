const fs = require('fs');
const glob = require('glob');
const path = require('path');

const dict = {
  "archivos": {
    "datos": { title: "Gestor de Archivos", desc: "Gestor de archivos locales de Programación y Curso." },
    "nube": { title: "Sincronización en la Nube", desc: "Sincronización en la nube y configuración del espacio de trabajo." }
  },
  "documentos": {
    "plantillas": { title: "Plantillas", desc: "Plantillas base para programaciones y actas." },
    "curriculos": { title: "Currículos", desc: "Decretos de currículos oficiales." },
    "normativa": { title: "Normativa", desc: "Legislación y normativa educativa." },
    "todofp": { title: "TodoFP", desc: "Recursos y guías del portal TodoFP." },
    "autores": { title: "Autores y Editoriales", desc: "Bibliografía y material de editoriales." }
  },
  "feoe": {
    "dual": { title: "FCT / Dual", desc: "Seguimiento de prácticas en empresas y FP Dual." },
    "empresas": { title: "Empresas Colaboradoras", desc: "Directorio de empresas y convenios." }
  },
  "asignaciones": {
    "lista": { title: "Asignaciones", desc: "Lista de asignaciones del módulo." }
  }
};

const files = glob.sync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/**/page.tsx');
let updatedCount = 0;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const pageName = path.basename(path.dirname(f));
  
  if (dict[pageName]) {
    // A more permissive regex
    const infoRegex = /<div className=\"flex items-start gap-3 p-4 rounded-xl bg-accent\/5 border border-accent\/20 [^\"]*\">\s*<Info className=\"w-5 h-5 text-accent mt-0\.5 shrink-0\" \/>\s*<div>\s*<p className=\"text-sm font-semibold text-foreground\">.*?<\/p>\s*<p className=\"text-sm text-muted mt-1\">.*?<\/p>\s*<\/div>\s*<\/div>/s;
    
    if (content.match(infoRegex)) {
      const classNameMatch = content.match(/<div className=\"(flex items-start gap-3 p-4 rounded-xl bg-accent\/5 border border-accent\/20 [^\"]*)\">/);
      const classes = classNameMatch ? classNameMatch[1] : 'flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6';

      const replacement = 
"              {(() => {\n" +
"                const infoMap = " + JSON.stringify(dict[pageName], null, 18).replace(/"/g, "'") + ";\n" +
"                const info = infoMap[activeTab] || { title: 'Herramienta operativa', desc: 'Gestión operativa' };\n" +
"                return (\n" +
"                  <div className='" + classes + "'>\n" +
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
