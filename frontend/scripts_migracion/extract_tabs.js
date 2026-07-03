const fs = require('fs');
const glob = require('glob');
const path = require('path');
const files = glob.sync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/**/page.tsx');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('TABS = [')) {
    const tabsMatch = content.match(/TABS\s*=\s*\[(.*?)\];/s);
    if (tabsMatch) {
      console.log('--- ' + path.basename(path.dirname(f)));
      const simplified = tabsMatch[1].replace(/<[^>]+>/g, '').replace(/className=\".*?\"/g, '');
      console.log(simplified.substring(0, 500));
    }
  }
});
