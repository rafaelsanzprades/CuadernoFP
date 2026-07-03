const fs = require('fs');

let content = fs.readFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/progreso/page.tsx', 'utf8');

// Remove import
content = content.replace(/import \{ CalificacionFEOETab \} from ".*?CalificacionFEOETab";\n/g, '');

// Remove df_feoe line and usage block
content = content.replace(/\s*const df_feoe = cursoData\?\.df_feoe \|\| \[\];\n/g, '\n');
content = content.replace(/[\s]*\/\/ FEOE integration[\s\S]*?\}\n[\s]*\}\);\n/g, '');

// Remove tab
content = content.replace(/,\s*\{\s*id:\s*"feoe"[\s\S]*?\}/g, '');

// Remove info map entry
content = content.replace(/,\s*'feoe':\s*\{[\s\S]*?\}/g, '');

// Remove rendering block
content = content.replace(/[\s]*\{\/\* TAB 5: CALIFICACIÓN FEOE \(Módulo Dual\) \*\/\}\n[\s]*\{activeTab === "feoe" && \([\s]*<div className="animate-in fade-in duration-500">[\s]*<CalificacionFEOETab \/>[\s]*<\/div>[\s]*\)\}\n/g, '');

fs.writeFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/progreso/page.tsx', content, 'utf8');
console.log('progreso/page.tsx cleaned up');
