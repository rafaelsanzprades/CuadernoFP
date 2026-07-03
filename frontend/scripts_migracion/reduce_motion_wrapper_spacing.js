const fs = require('fs');
const glob = require('glob');

const files = glob.sync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/**/page.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  // Replace space-y-8 with space-y-4
  if (content.includes('space-y-8')) {
    content = content.replace(/space-y-8/g, 'space-y-4');
    changed = true;
  }
  
  // Replace space-y-6 with space-y-3
  if (content.includes('space-y-6')) {
    content = content.replace(/space-y-6/g, 'space-y-3');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Reduced spacing in ' + f);
  }
});
