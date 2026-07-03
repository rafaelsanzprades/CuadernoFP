const fs = require('fs');
const file = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/app/documentos/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the TABS declaration
const oldTabs = 'const TABS = ["Plantillas", "Currículos", "Normativa", "TodoFP", "Autores/Editoriales"];';
const newTabs = \  const TABS = [
    { id: "Plantillas", label: <span className="flex items-center gap-2"><FileEdit className="w-4 h-4 shrink-0" /> Plantillas</span>, cleanLabel: "Plantillas" },
    { id: "Currículos", label: <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 shrink-0" /> Currículos</span>, cleanLabel: "Currículos" },
    { id: "Normativa", label: <span className="flex items-center gap-2"><Scale className="w-4 h-4 shrink-0" /> Normativa</span>, cleanLabel: "Normativa" },
    { id: "TodoFP", label: <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 shrink-0" /> TodoFP</span>, cleanLabel: "TodoFP" },
    { id: "Autores/Editoriales", label: <span className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0" /> Autores/Editoriales</span>, cleanLabel: "Autores/Editoriales" }
  ];\;

content = content.replace(oldTabs, newTabs);

// Replace the map
const oldMap = \{TABS.map(tab => (
                  <TabsTrigger key={tab} value={tab} className="rounded-lg px-6 py-2.5 data-[state=active]:bg-info data-[state=active]:text-foreground text-muted font-medium transition-all">
                    {tab}
                  </TabsTrigger>
                ))}\;

const newMap = \{TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="rounded-lg px-6 py-2.5 data-[state=active]:bg-info data-[state=active]:text-foreground text-muted font-medium transition-all">
                    {tab.label}
                  </TabsTrigger>
                ))}\;

content = content.replace(oldMap, newMap);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed documentos tabs');
