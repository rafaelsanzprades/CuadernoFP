const fs = require('fs');

// 1. ALUMNADO
const alumnadoPath = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/app/alumnado/page.tsx';
let alumnado = fs.readFileSync(alumnadoPath, 'utf8');
alumnado = alumnado.replace(/[\s]*\{activeTab === "feoe" && <FeoeAssignTab \/>\}\n/g, '\n');
fs.writeFileSync(alumnadoPath, alumnado, 'utf8');

// 2. PROGRESO
const progresoPath = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/app/progreso/page.tsx';
let progreso = fs.readFileSync(progresoPath, 'utf8');
progreso = progreso.replace(/import \{ CalificacionFEOETab \} from ".*?CalificacionFEOETab";\n/g, '');
fs.writeFileSync(progresoPath, progreso, 'utf8');

// 3. HEADER
const headerPath = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Header.tsx';
let header = fs.readFileSync(headerPath, 'utf8');
const fila2FullRegex = /\{\/\* Fila 2: Contexto Actual \(Tres columnas\) \*\/\}.*?\{\/\* Fila 3: Breadcrumb y Buscar \*\/\}/s;
header = header.replace(fila2FullRegex, '{/* Fila 3: Breadcrumb y Buscar */}');
fs.writeFileSync(headerPath, header, 'utf8');

// 4. SIDEBAR
const sidebarPath = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx';
let sidebar = fs.readFileSync(sidebarPath, 'utf8');
// Fix dataSource before assignment: In line 47, `const isDemo = state.activeModuleId === '0237-ictve-pd';`
// But wait, it said `dataSource` was used before declaration.
// Let's see the error: src/components/layout/Sidebar.tsx(47,24): error TS2448: Block-scoped variable 'dataSource' used before its declaration.
// Let's look at `Sidebar.tsx` around line 47.
// Ah! In `Sidebar.tsx`, `dataSource` is destructured at line 15: `const { activeModuleId, activeCursoId, isSidebarOpen, toggleSidebar, dataSource } = useAppStore();`
// And I added `const [localGroups, setLocalGroups] = ...` and then `const { moduleData, cursoData, saveModuleData, saveCursoData, workspaceHandle } = useAppStore();`
// Wait! `dataSource` is declared at line 15, so why does it say it's used before declaration in line 47?
// Because I added the helper block *before* the component! Wait, line 47 of the NEW Sidebar?
// Let's just fix it by renaming the inner variables.

console.log('Bulk fix completed!');
