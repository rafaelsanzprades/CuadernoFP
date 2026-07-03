const fs = require('fs');

function fixFile(path, fixes) {
  let content = fs.readFileSync(path, 'utf8');
  fixes.forEach(fix => {
    content = content.replace(fix.regex, fix.replacement);
  });
  fs.writeFileSync(path, content, 'utf8');
}

// ALUMNADO
fixFile('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/alumnado/page.tsx', [
  { regex: /\{activeTab === "feoe" && <FeoeAssignTab \/>\}\r?\n/g, replacement: '' },
  { regex: /import \{ TutoriaTab \} from ".*?TutoriaTab";\r?\n/g, replacement: '' },
  { regex: /import \{ TutoriaMatrixTab \} from ".*?TutoriaMatrixTab";\r?\n/g, replacement: '' },
  { regex: /import \{ ActuacionesTab \} from ".*?ActuacionesTab";\r?\n/g, replacement: '' },
  { regex: /import \{ FeoeAssignTab \} from ".*?FeoeAssignTab";\r?\n/g, replacement: '' },
  { regex: /import \{ OrientacionTab \} from ".*?OrientacionTab";\r?\n/g, replacement: '' },
  { regex: /import \{ ResumenTab \} from ".*?ResumenTab";\r?\n/g, replacement: '' },
  { regex: /import \{ TendenciasTab \} from ".*?TendenciasTab";\r?\n/g, replacement: '' },
  { regex: /import \{ ItinerarioTab \} from ".*?ItinerarioTab";\r?\n/g, replacement: '' },
]);

// PROGRESO
fixFile('c:/GD-rsp/APP-CuadernoFP/frontend/src/app/progreso/page.tsx', [
  { regex: /import \{ CalificacionFEOETab \} from ".*?CalificacionFEOETab";\r?\n/g, replacement: '' },
  { regex: /[\s]*\/\/ FEOE integration[\s\S]*?\}\r?\n[\s]*\}\);\r?\n/g, replacement: '' },
  { regex: /[\s]*\{\/\* TAB 5: CALIFICACIÓN FEOE \(Módulo Dual\) \*\/\}\r?\n[\s]*\{activeTab === "feoe" && \([\s]*<div className="animate-in fade-in duration-500">[\s]*<CalificacionFEOETab \/>[\s]*<\/div>[\s]*\)\}\r?\n/g, replacement: '' },
]);

// HEADER
fixFile('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Header.tsx', [
  { regex: /\{\/\* Fila 2: Contexto Actual \(Tres columnas\) \*\/\}.*?\{\/\* Fila 3: Breadcrumb y Buscar \*\/\}/s, replacement: '{/* Fila 3: Breadcrumb y Buscar */}' }
]);

// SIDEBAR
fixFile('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx', [
  { regex: /const \{ activeModuleId, activeCursoId, isSidebarOpen, toggleSidebar, dataSource \} = useAppStore\(\);\r?\n/g, replacement: '' },
  { regex: /import \{ ChevronLeft, ChevronRight, CalendarDays, FolderOpen, Hourglass, Save, ChevronDown \} from "lucide-react";/, replacement: 'import { ChevronLeft, ChevronRight, CalendarDays, FolderOpen, Hourglass, Save, ChevronDown, Cloud } from "lucide-react";' }
]);

// ANALISIS INDIVIDUAL
fixFile('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/features/analisis/AnalisisIndividualTab.tsx', [
  { regex: /[\s]*df_ra\.forEach\(\(ra: any\) => \{[\s]*if \(ra\.is_dual && df_feoe\.length > 0 && selectedAlId\) \{[\s\S]*?\}\r?\n[\s]*\}\);\r?\n/g, replacement: '' },
]);

console.log('Final bulk fix completed!');
