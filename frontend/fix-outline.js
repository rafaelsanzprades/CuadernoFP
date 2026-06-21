const fs = require('fs');

const outlineFiles = [
  "c:/GD-rsp/APP/frontend/src/app/matrices/page.tsx",
  "c:/GD-rsp/APP/frontend/src/components/features/settings/ThemeSelector.tsx"
];

outlineFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/variant="outline"/g, 'variant="secondary"');
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});
