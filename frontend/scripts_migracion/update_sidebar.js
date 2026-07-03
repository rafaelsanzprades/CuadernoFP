const fs = require('fs');

let content = fs.readFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx', 'utf8');

// Add import if not exists
if (!content.includes('import { initialGroups }')) {
  content = content.replace(/import \{ navGroups \} from '@\/config\/navigation';/, 
    "import { navGroups } from '@/config/navigation';\nimport { initialGroups } from '@/store/initialData';");
}

// Add the acronym lookup logic before the return statement of Sidebar
const logicToInsert = `
  let moduleTitleSuffix = activeModuleId ? activeModuleId.split('-')[0] : 'CÓDIGO';
  if (activeModuleId) {
    const code = activeModuleId.split('-')[0];
    for (const g of initialGroups) {
      const m = g.modules.find(mod => mod.code === code);
      if (m && m.acronym) {
        moduleTitleSuffix = \`\${code} - \${m.acronym}\`;
        break;
      }
    }
  }
`;

// Insert the logic just before `const sidebarContent = (`
if (!content.includes('let moduleTitleSuffix =')) {
  content = content.replace(/const sidebarContent = \(/, 
    logicToInsert + '\n  const sidebarContent = (');
}

// Update the replace logic
content = content.replace(
  /\.replace\("\[Código del módulo\]", `\[\$\{activeModuleId \? activeModuleId\.split\('-'\)\[0\] : 'CÓDIGO'\}\]`\)/,
  `.replace("[Código del módulo]", \`[\${moduleTitleSuffix}]\`)`
);

fs.writeFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx', content, 'utf8');
console.log('Sidebar.tsx updated');
