const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/**/page.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  const searchRegex = /<p[^>]*>\{info\.title\}<\/p>\s*<p[^>]*>\{info\.desc\}<\/p>/g;
  
  if (searchRegex.test(content)) {
    content = content.replace(/<p[^>]*>\{info\.title\}<\/p>\s*<p[^>]*className=['"]([^'"]*)['"][^>]*>\{info\.desc\}<\/p>/g, (match, classNames) => {
      let newClass = classNames.replace(/\bmt-\d\b/g, '').trim();
      return `<p className="${newClass}">{info.desc}</p>`;
    });
    changed = true;
  }

  // Also catch other regex fallback just in case
  const fallbackRegex = /<p className=['"]text-sm font-semibold text-foreground['"]>\{info\.title\}<\/p>\s*<p className=['"]text-sm text-muted mt-1['"]>\{info\.desc\}<\/p>/g;
  if (fallbackRegex.test(content) && !changed) {
    content = content.replace(fallbackRegex, `<p className="text-sm text-muted">{info.desc}</p>`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Removed info.title in ' + path.basename(path.dirname(f)));
  }
});
