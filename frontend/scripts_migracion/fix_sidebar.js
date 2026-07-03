const fs = require('fs');

const sidebarPath = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx';
let sidebar = fs.readFileSync(sidebarPath, 'utf8');

sidebar = sidebar.replace(/import \{ ChevronLeft, ChevronRight, CalendarDays, FolderOpen, Hourglass, Save, ChevronDown \} from "lucide-react";/, 'import { ChevronLeft, ChevronRight, CalendarDays, FolderOpen, Hourglass, Save, ChevronDown, Cloud } from "lucide-react";');

// Fix dataSource used before being assigned
// In useEffect, it used `dataSource === 'demo' ? 'bg-warning/20' ...` but `dataSource` might not be in scope there?
// Ah! In `Sidebar.tsx`, `dataSource` was destructured from `useAppStore()` inside the component.
// But wait:
// `src/components/layout/Sidebar.tsx(47,24): error TS2448: Block-scoped variable 'dataSource' used before its declaration.`
// Let's check where it's used.

fs.writeFileSync(sidebarPath, sidebar, 'utf8');
console.log('Sidebar.tsx fixed imports');
