const fs = require('fs');
const file = 'c:/GD-rsp/APP/frontend/src/services/demo-ele203-0237ictve-curso202526.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/"Movil":\s*"6/g, '"Movil": "5');
fs.writeFileSync(file, content);
console.log('Done');
