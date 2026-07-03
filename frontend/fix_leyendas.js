const fs = require('fs');
const glob = require('glob');

const files = glob.sync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/**/page.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  if (content.includes('const infoMap = {')) {
    // Fix type error
    content = content.replace(/const infoMap = \{/g, 'const infoMap: Record<string, {title: string, desc: string}> = {');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed types in ' + f);
  }
  
  // Fix asignaciones where activeTab is not defined
  if (f.includes('asignaciones') && content.includes('infoMap[activeTab]')) {
    content = content.replace(/const info = infoMap\[activeTab\] \|\| \{ title: 'Herramienta operativa', desc: 'Gestión de ' \+ activeTab \};\n/g, '');
    content = content.replace(/const info = infoMap\[activeTab\] \|\| \{ title: 'Herramienta operativa', desc: 'Gestión operativa' \};\n/g, '');
    content = content.replace(/\{info\.title\}/g, 'Asignaciones');
    content = content.replace(/\{info\.desc\}/g, 'Gestión de tareas y asignaciones.');
    content = content.replace(/const infoMap: Record<string, \{title: string, desc: string\}> = \{[\s\S]*?\};\n/g, '');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed activeTab in asignaciones');
  }
});
