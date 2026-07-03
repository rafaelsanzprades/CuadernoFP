const fs = require('fs');

const headerPath = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Header.tsx';
let header = fs.readFileSync(headerPath, 'utf8');

// Remove localGroups state
header = header.replace(/[\s]*const \[localGroups, setLocalGroups\] = useState<string\[\]>\(\[\]\);\n/g, '\n');
header = header.replace(/[\s]*const \[activeLocalGroup, setActiveLocalGroup\] = useState<string>\(""\);\n/g, '\n');

// Remove getGroupDisplayName helper
header = header.replace(/const getGroupDisplayName = [\s\S]*?return cleanName;\n\};\n/g, '');

// Remove the scanning effect
header = header.replace(/[\s]*useEffect\(\(\) => \{\n[\s]*if \(workspaceHandle && dataSource === 'local'\) \{\n[\s]*fileManager\.scanGroupsInWorkspace\(workspaceHandle\)\.then\(groups => setLocalGroups\(groups\)\);\n[\s]*\}\n[\s]*\}, \[workspaceHandle, dataSource\]\);\n/g, '\n');

// Remove Fila 2 completely
const fila2Regex = /\{\/\* Fila 2: Contexto Actual \(Tres columnas\) \*\/\}.*?\{\/\* Fila 3: Breadcrumb y Buscar \*\/\}/s;
header = header.replace(fila2Regex, '{/* Fila 3: Breadcrumb y Buscar */}');

fs.writeFileSync(headerPath, header, 'utf8');
console.log('Header.tsx cleaned up!');
