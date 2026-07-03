const fs = require('fs');
const file = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/app/documentos/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = \<div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6 mt-6">
          <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Herramienta operativa y de gestin - Documentos</p>
            <p className="text-sm text-muted mt-1">Gestin centralizada de ficheros y recursos del docente.</p>
          </div>
        </div>\;

const targetStr2 = \<div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6 mt-6">\n          <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />\n          <div>\n            <p className="text-sm font-semibold text-foreground">Herramienta operativa y de gestin - Documentos</p>\n            <p className="text-sm text-muted mt-1">Gestin centralizada de ficheros y recursos del docente.</p>\n          </div>\n        </div>\;

const newStr = \{(() => {
              const infoMap: Record<string, {title: string, desc: string}> = {
                'Plantillas': {
                  'title': 'Plantillas',
                  'desc': 'Plantillas base para programaciones y actas.'
                },
                'Currículos': {
                  'title': 'Currículos',
                  'desc': 'Decretos de currículos oficiales.'
                },
                'Normativa': {
                  'title': 'Normativa',
                  'desc': 'Legislación y normativa educativa.'
                },
                'TodoFP': {
                  'title': 'TodoFP',
                  'desc': 'Recursos y guías del portal TodoFP.'
                },
                'Autores/Editoriales': {
                  'title': 'Autores y Editoriales',
                  'desc': 'Bibliografía y material de editoriales.'
                }
              };
              const info = infoMap[activeTab] || { title: 'Sistema de Autoevaluación', desc: 'Valora tu progreso docente.' };
              return (
                <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                  <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                  <div>
                    <p className='text-sm text-muted'>{info.desc}</p>
                  </div>
                </div>
              );
            })()}\;

let changed = false;
if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  changed = true;
} else if (content.includes(targetStr2)) {
  content = content.replace(targetStr2, newStr);
  changed = true;
} else {
  // Try regex
  const regex = /<div className="flex items-start gap-3 p-4 rounded-xl bg-accent\/5 border border-accent\/20 mb-6 mt-6">[\s\S]*?<\/div>\s*<\/div>/;
  if (regex.test(content)) {
     content = content.replace(regex, newStr);
     changed = true;
  }
}

if (changed) {
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed documentos info block');
} else {
  console.log('Could not find info block in documentos');
}
