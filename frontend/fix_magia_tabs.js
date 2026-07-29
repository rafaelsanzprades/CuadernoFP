const fs = require('fs');
const file = 'frontend/src/app/magia/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add activeTab state
content = content.replace(
  'const [loadingData, setLoadingData] = useState(true);',
  'const [loadingData, setLoadingData] = useState(true);\n  const [activeTab, setActiveTab] = useState("burocracia");'
);

// 2. Fix heading
content = content.replace(
  /<h1 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-3">[\s\S]*?<\/p>/m,
  `<h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-accent" />
                  Magia
                </h1>
                <p className="text-muted">Generación de la programación didáctica y reportes.</p>`
);

// 3. Replace AccordionBlocks wrapper with TabsList
content = content.replace(
  /<div className="space-y-4">\s*<AccordionBlock\s*title="Burocracia"\s*icon=\{<PenTool className="w-5 h-5" \/>\}\s*defaultOpen=\{true\}\s*>/m,
  `
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-foreground/5 border border-[var(--glass-border)] w-full justify-start h-auto p-1 rounded-xl flex-wrap">
                <TabsTrigger value="burocracia" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-info data-[state=active]:text-foreground text-muted font-medium transition-all flex items-center gap-2">
                  <PenTool className="w-4 h-4" /> Burocracia
                </TabsTrigger>
                <TabsTrigger value="programacion" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-info data-[state=active]:text-foreground text-muted font-medium transition-all flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Programación
                </TabsTrigger>
                <TabsTrigger value="guia" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-info data-[state=active]:text-foreground text-muted font-medium transition-all flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Guía PD
                </TabsTrigger>
                <TabsTrigger value="comparativa" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-info data-[state=active]:text-foreground text-muted font-medium transition-all flex items-center gap-2">
                  <Scale className="w-4 h-4" /> Comparativa
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4 animate-in fade-in duration-500">
              {activeTab === "burocracia" && (
                <div className="pt-2">`
);

// 4. Replace ends of Accordions with closing tags and new conditionals
content = content.replace(
  /<\/AccordionBlock>\s*<AccordionBlock\s*title="Programación"\s*icon=\{<FileText className="w-5 h-5" \/>\}\s*>/m,
  `                </div>
              )}
              {activeTab === "programacion" && (
                <div className="pt-2">`
);

content = content.replace(
  /<\/AccordionBlock>\s*<AccordionBlock\s*title="Guía PD \(Referencia Cruzada\)"\s*icon=\{<BookOpen className="w-5 h-5" \/>\}\s*>/m,
  `                </div>
              )}
              {activeTab === "guia" && (
                <div className="pt-2">`
);

content = content.replace(
  /<\/AccordionBlock>\s*<AccordionBlock\s*title="Comparativa PD \(3 Modelos\)"\s*icon=\{<Scale className="w-5 h-5" \/>\}\s*>/m,
  `                </div>
              )}
              {activeTab === "comparativa" && (
                <div className="pt-2">`
);

content = content.replace(
  /<\/AccordionBlock>\s*<\/div>/m,
  `                </div>
              )}
            </div>`
);

fs.writeFileSync(file, content);
console.log('Fixed magia layout');
