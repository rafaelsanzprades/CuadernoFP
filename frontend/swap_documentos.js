const fs = require('fs');
const file = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/app/documentos/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const iifeStart = content.indexOf('{(() => {');
const iifeEnd = content.indexOf('})()}', iifeStart) + 5;
const iifeBlock = content.substring(iifeStart, iifeEnd);

const tabsStart = content.indexOf('<Tabs value={activeTab}');
const tabsEnd = content.indexOf('</Tabs>', tabsStart) + 7;
const tabsBlock = content.substring(tabsStart, tabsEnd);

if (iifeStart !== -1 && tabsStart !== -1 && iifeStart < tabsStart) {
  const beforeIife = content.substring(0, iifeStart);
  const between = content.substring(iifeEnd, tabsStart);
  const afterTabs = content.substring(tabsEnd);

  // New content: beforeIife + tabsBlock + between + iifeBlock + afterTabs
  // Wait, I might need to adjust newlines.
  const newContent = beforeIife + tabsBlock + between + iifeBlock + afterTabs;
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('Swapped correctly!');
} else {
  console.log('Could not find or already swapped.');
}
