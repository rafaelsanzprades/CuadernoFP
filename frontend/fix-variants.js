const fs = require('fs');
const path = require('path');

const buttonFiles = [
  "c:/GD-rsp/APP/frontend/src/app/programacion/page.tsx",
  "c:/GD-rsp/APP/frontend/src/app/seguimiento/page.tsx",
  "c:/GD-rsp/APP/frontend/src/app/progreso/page.tsx",
  "c:/GD-rsp/APP/frontend/src/app/modulo/page.tsx",
  "c:/GD-rsp/APP/frontend/src/app/matrices/page.tsx",
  "c:/GD-rsp/APP/frontend/src/app/instrumentos/page.tsx",
  "c:/GD-rsp/APP/frontend/src/components/features/matrices/ProposalLoaderModal.tsx"
];

buttonFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<Button variant="default"/g, '<Button variant="primary"');
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});
