const fs = require('fs');
const glob = require('glob');

const files = glob.sync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/**/page.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  const regex = /className=['"]flex items-start gap-3 p-4 rounded-xl bg-accent\/5 border border-accent\/20 mb-6 mt-6['"]/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, "className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6 mt-3'");
    changed = true;
  }

  // Also check if it's using double quotes
  const regex2 = /className="flex items-start gap-3 p-4 rounded-xl bg-accent\/5 border border-accent\/20 mb-6 mt-6"/g;
  if (regex2.test(content)) {
    content = content.replace(regex2, 'className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6 mt-3"');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Reduced spacing in ' + f);
  }
});
