const fs = require('fs');

const sidebarPath = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx';
let sidebar = fs.readFileSync(sidebarPath, 'utf8');

// Combine the two useAppStore calls
sidebar = sidebar.replace(/const \{ moduleData, cursoData, saveModuleData, saveCursoData, workspaceHandle \} = useAppStore\(\);\n/g, 'const { moduleData, cursoData, saveModuleData, saveCursoData, workspaceHandle, activeModuleId, activeCursoId, isSidebarOpen, toggleSidebar, dataSource } = useAppStore();\n');

// Remove the second call
sidebar = sidebar.replace(/const \{ activeModuleId, activeCursoId, isSidebarOpen, toggleSidebar, dataSource \} = useAppStore\(\);\n/g, '');

fs.writeFileSync(sidebarPath, sidebar, 'utf8');
console.log('Sidebar.tsx fixed useAppStore');
