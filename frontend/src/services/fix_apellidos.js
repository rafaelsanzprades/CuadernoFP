const fs = require('fs');
const file = 'c:/GD-rsp/APP/frontend/src/services/demo-ele203-0237ictve-curso202526.ts';
let content = fs.readFileSync(file, 'utf8');

// We use regex to append " Demo" before the closing quote in "Apellidos": "Something"
// E.g. "Apellidos": "Bennani" -> "Apellidos": "Bennani Demo"
// careful not to append it multiple times if run again. We'll check if it already ends in Demo.
content = content.replace(/"Apellidos":\s*"([^"]+?)(?:\s+Demo)?"/g, '"Apellidos": "$1 Demo"');

fs.writeFileSync(file, content);
console.log('Done fixing apellidos');
