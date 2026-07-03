const fs = require('fs');
const glob = require('glob');

const files = glob.sync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/**/page.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  // Reduce margin on Tabs from mb-6 to mb-3
  const regex = /<Tabs([^>]+)className=['"]([^'"]*)mb-6([^'"]*)['"]/g;
  if (regex.test(content)) {
    content = content.replace(regex, (match, prefix, classBefore, classAfter) => {
      // Don't change if it's already small, but we matched mb-6
      return `<Tabs${prefix}className="${classBefore}mb-3${classAfter}"`;
    });
    changed = true;
  }

  // Same for TabsList if it has mb-6
  const regexList = /<TabsList([^>]+)className=['"]([^'"]*)mb-6([^'"]*)['"]/g;
  if (regexList.test(content)) {
    content = content.replace(regexList, (match, prefix, classBefore, classAfter) => {
      return `<TabsList${prefix}className="${classBefore}mb-3${classAfter}"`;
    });
    changed = true;
  }

  // Also in archivos/page.tsx, Tabs has no className, but it has a wrapper div
  if (f.includes('archivos')) {
    const regexArchivos = /<div className="flex justify-between items-center mb-2 border-b border-\[var\(--glass-border\)\]">/g;
    // Actually in archivos, TabsList is wrapped in mb-2.
    // Let's check Info box in archivos, maybe it had mt-6 and we already changed it to mt-3.
    // If it has mt-3, let's change it to mt-1 or remove it entirely.
    if (content.includes('mt-3')) {
      content = content.replace(/mb-6 mt-3/g, 'mb-6 mt-1');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Reduced Tabs margin in ' + f);
  }
});
