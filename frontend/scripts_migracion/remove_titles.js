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
      // Remove 'mt-1' or 'mt-2'
      let newClass = classNames.replace(/\bmt-\d\b/g, '').trim();
      return \<p className="\">\{info.desc\}</p>\;
    });
    changed = true;
  }

  // Also catch variations where there might be formatting differences
  const searchRegex2 = /<p className=['"]text-sm font-semibold text-foreground['"]>\{info\.title\}<\/p>\s*<p className=['"]text-sm text-muted mt-1['"]>\{info\.desc\}<\/p>/g;
  if (searchRegex2.test(content)) {
    content = content.replace(searchRegex2, \<p className="text-sm text-muted">\{info.desc\}</p>\);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Removed info.title in ' + path.basename(path.dirname(f)));
  }
});
