const fs = require('fs');

const file = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const regexGrupoBlock = /\s*\{\/\* ② Bloque GRUPO: DEMO\/REALES \+ selector \*\/\}.*?(?=\{\/\* ③ Programación \+ ④ Curso con info-box coloreada \*\/)/s;

const match = content.match(regexGrupoBlock);
if (!match) {
    console.log("Could not find Bloque GRUPO!");
    process.exit(1);
}

// Remove the Grupo block entirely
content = content.replace(regexGrupoBlock, '\n\n        ');

// Construct the new Context Selector Block
const newContextBlock = `{/* Context Selector Block moved to top */}
      {isSidebarOpen && (
         <div className="px-3 pb-3 flex flex-col gap-2 relative z-20 shrink-0">
            {/* Sync Status Indicator */}
            {dataSource === 'local' && (
              <div className="flex items-center justify-center gap-1.5 px-2 py-1 rounded-full bg-foreground/5 text-xs font-medium w-full mb-1">
                {syncStatus === 'saving' && <><Hourglass className="w-3 h-3 text-warning animate-spin" /><span className="text-warning">Guardando...</span></>}
                {syncStatus === 'saved' && <><Save className="w-3 h-3 text-success" /><span className="text-success">Guardado</span></>}
                {syncStatus === 'error' && <><AlertTriangle className="w-3 h-3 text-danger" /><span className="text-danger">Error</span></>}
                {syncStatus === 'idle' && <><Cloud className="w-3 h-3 text-muted/50" /><span className="text-muted/60">Sincronizado</span></>}
              </div>
            )}
            <div className="flex bg-foreground/5 rounded-lg p-0.5 w-full gap-0.5">
              <button
                onClick={() => { setDataSource('demo'); fileManager.loadDemoData('1a'); toast.success('Modo DEMO'); }}
                className={\`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-bold transition-all \${dataSource === 'demo'
                  ? 'bg-warning/20 text-warning shadow-sm ring-1 ring-warning/30'
                  : 'text-muted hover:bg-foreground/10 hover:text-foreground'}\`}
              >
                <Cloud className="w-3.5 h-3.5" /> DEMO
              </button>
              <button
                onClick={() => { setDataSource('local'); toast.success('Modo REALES'); }}
                className={\`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-bold transition-all \${dataSource === 'local'
                  ? 'bg-success/20 text-success shadow-sm ring-1 ring-success/30'
                  : 'text-muted hover:bg-foreground/10 hover:text-foreground'}\`}
              >
                <HardDrive className="w-3.5 h-3.5" /> REALES
              </button>
            </div>
            {dataSource === 'demo' ? (
              <div className="relative w-full">
                <select
                  className="w-full bg-foreground/5 border rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold tracking-wide focus:outline-none cursor-pointer appearance-none transition-colors"
                  style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}
                  value={demoGroupValue}
                  onChange={(e) => { fileManager.loadDemoData(e.target.value); toast.success(\`Grupo \${e.target.value.toUpperCase()}\`); }}
                >
                  <option value="1a">DEMO 1A-GM {moduleTitleSuffix !== 'CÓDIGO' ? moduleTitleSuffix : ''}</option>
                  <option value="1b">DEMO 1B-GM {moduleTitleSuffix !== 'CÓDIGO' ? moduleTitleSuffix : ''}</option>
                  <option value="1c">DEMO 1C-GM {moduleTitleSuffix !== 'CÓDIGO' ? moduleTitleSuffix : ''}</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--warning)' }} />
              </div>
            ) : !workspaceHandle ? (
              <button
                onClick={() => router.push('/archivos')}
                className="w-full bg-foreground/5 border border-success/30 rounded-lg py-1.5 text-xs font-semibold tracking-wide text-success hover:bg-success/10 transition-colors"
              >
                No hay grupos
              </button>
            ) : (
              <div className="relative w-full">
                <select
                  className="w-full bg-foreground/5 border rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold tracking-wide focus:outline-none cursor-pointer appearance-none transition-colors"
                  style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                  value={activeCursoId || ''}
                  onChange={(e) => useAppStore.getState().setActiveCursoId(e.target.value)}
                >
                  {localGroups.length === 0
                    ? <option value="" disabled>No hay grupos</option>
                    : localGroups.map(g => <option key={g} value={g}>{g}</option>)
                  }
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--success)' }} />
              </div>
            )}
         </div>
      )}
`;

const insertTarget = '{/* ── Agenda fijada (fuera del scroll) ── */}';
if (content.includes(insertTarget)) {
    content = content.replace(insertTarget, newContextBlock + '\n      ' + insertTarget);
    fs.writeFileSync(file, content);
    console.log("Replaced Sidebar correctly with insertion!");
} else {
    console.log("Could not find insertTarget!");
    process.exit(1);
}
