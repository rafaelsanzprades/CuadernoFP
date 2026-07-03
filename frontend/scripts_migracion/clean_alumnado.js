const fs = require('fs');

let content = fs.readFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/alumnado/page.tsx', 'utf8');

// Remove imports
content = content.replace(/import \{ FeoeAssignTab \} from ".*?FeoeAssignTab";\n/g, '');
content = content.replace(/import \{ OrientacionTab \} from ".*?OrientacionTab";\n/g, '');
content = content.replace(/import \{ ResumenTab \} from ".*?ResumenTab";\n/g, '');
content = content.replace(/import \{ TendenciasTab \} from ".*?TendenciasTab";\n/g, '');
content = content.replace(/import \{ TutoriaTab \} from ".*?TutoriaTab";\n/g, '');
content = content.replace(/import \{ TutoriaMatrixTab \} from ".*?TutoriaMatrixTab";\n/g, '');
content = content.replace(/import \{ ActuacionesTab \} from ".*?ActuacionesTab";\n/g, '');
content = content.replace(/import \{ ItinerarioTab \} from ".*?ItinerarioTab";\n/g, '');

// Remove tabs
content = content.replace(/,\s*\{\s*id:\s*"feoe"[\s\S]*?\}/g, '');
content = content.replace(/,\s*\{\s*id:\s*"tutoria"[\s\S]*?\}/g, '');
content = content.replace(/,\s*\{\s*id:\s*"orientacion"[\s\S]*?\}/g, '');

// Remove info map entries
content = content.replace(/,\s*'feoe':\s*\{[\s\S]*?\}/g, '');
content = content.replace(/,\s*'tutoria':\s*\{[\s\S]*?\}/g, '');
content = content.replace(/,\s*'orientacion':\s*\{[\s\S]*?\}/g, '');

// Remove rendering
content = content.replace(/\{activeTab === "feoe" && <FeoeAssignTab \/>\}\n/g, '');
content = content.replace(/\{activeTab === "tutoria" && <TutoriaTab \/>\}\n/g, '');
content = content.replace(/\{activeTab === "orientacion" && <OrientacionTab \/>\}\n/g, '');

fs.writeFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/alumnado/page.tsx', content, 'utf8');
console.log('alumnado/page.tsx cleaned up');
