const fs = require('fs');
const file = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/features/catalogo/TabComunidades.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /interface CCAA \{[\s\S]*?color: string;\n\}/,
  `interface CCAA {
  id: string;
  nombre: string;
  siglas: string;
  bo: string;
  boNombre: string;
  portalNombre: string;
  webCurriculo: string;
  nota?: string;
  color: string;
}`
);

const portals = {
  'andalucia': { p: 'Portal de FP Andaluza', w: 'https://www.juntadeandalucia.es/educacion/portals/web/formacion-profesional-andaluza' },
  'aragon': { p: 'Educaragón - FP', w: 'https://educa.aragon.es/formaci%C3%B3n-profesional' },
  'asturias': { p: 'Educastur - FP', w: 'https://www.educastur.es/estudiantes/formacion-profesional' },
  'baleares': { p: 'Portal FP CAIB', w: 'https://www.caib.es/sites/fp/ca/inici/?campa=yes' },
  'canarias': { p: 'Portal FP Canarias', w: 'https://www.gobiernodecanarias.org/educacion/web/formacion_profesional' },
  'cantabria': { p: 'Educantabria - FP', w: 'https://www.educantabria.es/fp' },
  'castilla-mancha': { p: 'Portal de Educación JCCM - FP', w: 'https://www.educa.jccm.es/educa-jccm/cm/educa_jccm/tkContent?pgseed=1214900765392&idContent=28704&locale=es_ES&textOnly=false' },
  'castilla-leon': { p: 'Portal de FP JCyL', w: 'https://www.educa.jcyl.es/fp/es' },
  'cataluna': { p: 'Tria Educativa - FP', w: 'https://triaeducativa.gencat.cat/ca/fp/index.html' },
  'extremadura': { p: 'Educarex - FP', w: 'https://www.educarex.es/fp/inicio.html' },
  'galicia': { p: 'Portal FP Xunta', w: 'http://www.edu.xunta.gal/fp/' },
  'la-rioja': { p: 'Portal FP La Rioja', w: 'https://fp.larioja.org/' },
  'madrid': { p: 'Comunidad de Madrid - FP', w: 'https://www.comunidad.madrid/servicios/educacion/formacion-profesional' },
  'murcia': { p: 'Llegarás Alto - FP Región de Murcia', w: 'https://www.llegarasalto.com/' },
  'navarra': { p: 'Educación Navarra - FP', w: 'https://www.educacion.navarra.es/web/dpto/formacion-profesional' },
  'pais-vasco': { p: 'Euskadi.eus - FP', w: 'https://www.euskadi.eus/gobierno-vasco/fp-educacion/' },
  'valencia': { p: 'CEICE - FP Comunitat Valenciana', w: 'https://ceice.gva.es/es/web/formacion-profesional' },
  'ceuta': { p: 'Portal Educativo Ceuta', w: 'https://www.educacionyfp.gob.es/contenidos/ba/ceuta-melilla/ceuta/portada.html' },
  'melilla': { p: 'Portal Educativo Melilla', w: 'https://www.educacionyfp.gob.es/contenidos/ba/ceuta-melilla/melilla/portada.html' }
};

for (const [id, data] of Object.entries(portals)) {
  const regex = new RegExp(`(id: "${id}"[\\s\\S]*?)webCurriculo: ".*?",`);
  content = content.replace(regex, `$1portalNombre: "${data.p}",\n    webCurriculo: "${data.w}",`);
}

content = content.replace(
  '<th className="text-left py-2 px-3 font-medium text-muted">Boletín Oficial</th>',
  '<th className="text-left py-2 px-3 font-medium text-muted">Portal Oficial</th>'
);

content = content.replace(
  /className="underline text-primary hover:text-primary\/80"[\s\S]*?onClick=\{\(e\) => e.stopPropagation\(\)\}[\s\S]*?>[\s\S]*?\{ccaa\.bo\}[\s\S]*?<\/a>/,
  `className="underline text-primary hover:text-primary/80"\n                      onClick={(e) => e.stopPropagation()}\n                    >\n                      {ccaa.portalNombre}\n                    </a>`
);

content = content.replace(
  /<ExternalLink className="w-4 h-4" \/>[\s\S]*?Ver currículo oficial[\s\S]*?<\/a>/,
  `<ExternalLink className="w-4 h-4" />\n        {ccaa.portalNombre}\n      </a>`
);

fs.writeFileSync(file, content);
console.log('Done');
