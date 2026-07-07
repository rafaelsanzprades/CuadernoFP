const fs = require('fs');

const file = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const blockToMove = `<div className="flex bg-foreground/5 rounded-lg p-0.5 w-full gap-0.5">
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
            )}`;

// First remove it from the old location
const regexOld = new RegExp(blockToMove.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'));
if (content.match(regexOld)) {
  content = content.replace(regexOld, '');
} else {
  console.log("Could not find the block to remove!");
  process.exit(1);
}

// Then insert it into the new location
const insertTarget = `      <div className="h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent mb-2" />`;

const newBlock = `      {/* Context Selector Block moved to top */}
      {isSidebarOpen && (
         <div className="px-3 pb-3 flex flex-col gap-2 relative z-20">
${blockToMove.split('\\n').map(l => '            ' + l).join('\\n')}
         </div>
      )}`;

content = content.replace(insertTarget, insertTarget + '\\n\\n' + newBlock);

fs.writeFileSync(file, content);
console.log("Moved context block to top successfully.");
