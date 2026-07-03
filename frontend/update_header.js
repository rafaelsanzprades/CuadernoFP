const fs = require('fs');

let content = fs.readFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Header.tsx', 'utf8');

// 1. Widen the box
content = content.replace(
  /<div className="relative w-\[180px\] sm:w-\[200px\] shrink-0 h-10">/g,
  '<div className="relative w-[240px] sm:w-[320px] shrink-0 h-10">'
);

// 2. Add helper function at the top of Header component
if (!content.includes('const getGroupDisplayName =')) {
  const helper = `
const getGroupDisplayName = (fileName: string) => {
  const cleanName = fileName.replace('.json', '');
  const parts = cleanName.split(' - ');
  if (parts.length >= 4) {
    const code = parts[2];
    let acronym = code;
    for (const g of initialGroups) {
      const m = g.modules.find(mod => mod.code === code);
      if (m && m.acronym) { acronym = m.acronym; break; }
    }
    if (acronym !== code) {
      return \`\${parts[0]} - \${parts[1]} - \${code} - \${acronym} - \${parts.slice(3).join(' - ')}\`;
    }
  }
  return cleanName;
};

export default function Header`;
  content = content.replace(/export default function Header/g, helper);
}

// 3. Update options in demo
content = content.replace(
  /<option value="1a">G - 1A-GM - 0237 - 2025-26<\/option>/g,
  '<option value="1a">{getGroupDisplayName("G - 1A-GM - 0237 - 2025-26")}</option>'
);
content = content.replace(
  /<option value="1b">G - 1B-GM - 0237 - 2025-26<\/option>/g,
  '<option value="1b">{getGroupDisplayName("G - 1B-GM - 0237 - 2025-26")}</option>'
);
content = content.replace(
  /<option value="1c">G - 1C-GM - 0237 - 2025-26<\/option>/g,
  '<option value="1c">{getGroupDisplayName("G - 1C-GM - 0237 - 2025-26")}</option>'
);

// 4. Update options in local
content = content.replace(
  /<option key=\{g\} value=\{g\}>\{g\.replace\('\.json', ''\)\}<\/option>/g,
  '<option key={g} value={g}>{getGroupDisplayName(g)}</option>'
);

fs.writeFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Header.tsx', content, 'utf8');
console.log('Header.tsx updated with acronyms and wider select');
