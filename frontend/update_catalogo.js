const fs = require('fs');

let content = fs.readFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/catalogo/page.tsx', 'utf8');

const getAcronymCode = `const getAcronym = (name: string) => {
  const ignoreWords = ['y', 'e', 'de', 'del', 'la', 'las', 'el', 'los', 'en', 'para', 'por', 'con', 'a', 'al', 'o', 'u'];
  let cleanName = name.replace(/\\([^)]+\\)/g, '').trim();
  if (cleanName.includes('-')) {
    cleanName = cleanName.split('-').slice(1).join('-').trim();
  }
  let acronym = cleanName.split(/\\s+/)
    .filter((w: string) => !ignoreWords.includes(w.toLowerCase()) && w.length > 0)
    .map((w: string) => w[0].toUpperCase())
    .join('');
  return acronym;
};

const formatModuleName = (code: string | null, name: string, skipCode: boolean = false) => {
  const acronym = getAcronym(name);
  if (skipCode) {
     return \`\${acronym} - \${name}\`;
  }
  return \`\${code} - \${acronym} - \${name}\`;
};

const formatDegreeName = (code: string | null, name: string) => {
  const acronym = getAcronym(name);
  if (!code) return \`\${acronym} - \${name}\`;
  let cleanName = name.startsWith(\`\${code} - \`) ? name.substring(code.length + 3) : name.startsWith(code) ? name.substring(code.length).trim() : name;
  if (cleanName.startsWith('- ')) cleanName = cleanName.substring(2);
  return \`\${code} - \${acronym} - \${cleanName}\`;
};`;

const originalFormatDegreeName = `const formatDegreeName = (code: string | null, name: string) => {
  if (!code) return name;
  return name.startsWith(code) ? name : \`\${code} - \${name}\`;
};`;

content = content.replace(originalFormatDegreeName, getAcronymCode);

// Replace {m.codigo} - {m.nombre} in options
content = content.replace(
  />\s*\{m\.codigo\}\s*-\s*\{m\.nombre\}\s*\(\{m\.curso\}\)\s*<\/option>/g,
  `>{formatModuleName(m.codigo, m.nombre)} ({m.curso})</option>`
);

// Replace {modulo.nombre} inside h2
content = content.replace(
  /<h2 className="text-lg font-bold text-foreground">\{modulo\.nombre\}<\/h2>/g,
  `<h2 className="text-lg font-bold text-foreground">{formatModuleName(modulo.codigo, modulo.nombre, true)}</h2>`
);

fs.writeFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/catalogo/page.tsx', content, 'utf8');
console.log('catalogo/page.tsx updated with acronyms');
