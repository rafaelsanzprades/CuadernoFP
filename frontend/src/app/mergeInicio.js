const fs = require('fs');

const inicioFile = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/app/inicio/page.tsx';
const ayudaFile = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/app/ayuda/page.tsx';

let inicioContent = fs.readFileSync(inicioFile, 'utf8');
let ayudaContent = fs.readFileSync(ayudaFile, 'utf8');

// Extract the content from inicio
const inicioMainRegex = /<main[^>]*>([\s\S]*?)<\/main>/;
const inicioMatch = inicioContent.match(inicioMainRegex);
if (!inicioMatch) {
    console.log("Could not find main content in inicio");
    process.exit(1);
}

let extractedContent = inicioMatch[1];
// We'll wrap it slightly differently, the outer div in extractedContent has `w-full space-y-12 pb-12`

// 1. Add navGroups import to ayuda if not exists
if (!ayudaContent.includes('import { navGroups }')) {
    ayudaContent = ayudaContent.replace('import { Card }', 'import { navGroups } from "@/config/navigation";\nimport { Card }');
}

// 2. Change default activeTab
ayudaContent = ayudaContent.replace('const [activeTab, setActiveTab] = useState("asistente");', 'const [activeTab, setActiveTab] = useState("bienvenida");');

// 3. Add to TABS array
const tabsTarget = 'const TABS = [';
const newTab = '\n    { id: "bienvenida", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> Bienvenida</>, cleanLabel: "Bienvenida" },';
ayudaContent = ayudaContent.replace(tabsTarget, tabsTarget + newTab);

// 4. Update the infoMap
const infoMapTarget = "const infoMap: Record<string, {title: string, desc: string}> = {";
const newInfoMapEntry = "\n          'bienvenida': {\n                    'title': 'Bienvenida',\n                    'desc': 'Panel de control de acceso rápido a todas las herramientas.'\n          },";
ayudaContent = ayudaContent.replace(infoMapTarget, infoMapTarget + newInfoMapEntry);

// 5. Insert the new tab content just before ── CONTENIDO: ASISTENTE IA ──
const contentTarget = '{/* ── CONTENIDO: ASISTENTE IA ──────────────────────────────── */}';
const newTabContent = `
            {/* ── CONTENIDO: BIENVENIDA ──────────────────────────────── */}
            {activeTab === "bienvenida" && (
              <div className="animate-in fade-in duration-500 w-full">
                ${extractedContent}
              </div>
            )}

            `;
ayudaContent = ayudaContent.replace(contentTarget, newTabContent + contentTarget);

// Wait! In the extracted content, there's <MotionWrapper delay={...}> which is imported in ayuda. But what about the `title` of the page?
// In ayuda, the page title is hardcoded:
// <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
//   <Activity className="w-6 h-6 text-accent" /> Ayuda
// </h1>
// The user says: "borra /inicio y renombra /ayuda a nuevo nombre /inicio. Así eliminamos /ayuda y dotamos al inicio de mucha fuerza"
// So the page title should probably change from "Ayuda" to "Inicio", and the icon to maybe `Activity` or `Home` (but let's keep Activity or replace with whatever was in Inicio).
// Inicio had:
// <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
//   Bienvenido al Cuaderno FP
// </h1>
// I will change the main Ayuda title to "Inicio" or "Cuaderno FP - Inicio".
ayudaContent = ayudaContent.replace(
    /<h1 className="text-\[1\.3rem\] font-extrabold text-foreground tracking-tight flex items-center gap-3">[\s\S]*?<\/h1>/,
    `<h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">\n                <Activity className="w-6 h-6 text-accent" /> Inicio\n              </h1>`
);
ayudaContent = ayudaContent.replace(
    /<p className="text-muted mt-2 text-base">Guía de inicio, FAQ y validación de datos\.<\/p>/,
    `<p className="text-muted mt-2 text-base">Panel principal, guía de inicio, FAQ y validación de datos.</p>`
);

// Rename component AyudaPage to InicioPage
ayudaContent = ayudaContent.replace('export default function AyudaPage() {', 'export default function InicioPage() {');

fs.writeFileSync(ayudaFile, ayudaContent);
console.log("Successfully migrated inicio to ayuda");
