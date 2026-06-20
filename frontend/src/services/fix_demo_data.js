const fs = require('fs');
const file = 'c:/GD-rsp/APP/frontend/src/services/demo-ele203-0237ictve-curso202526.ts';
let content = fs.readFileSync(file, 'utf8');

// The regex /"email":\s*"([^@]+)@/g matches "email": "something@" and replaces it with "email": "something-demo@"
content = content.replace(/"email":\s*"([^@]+)@/g, '"email": "$1-demo@');

fs.writeFileSync(file, content);
console.log('Done fixing emails');
