const fs = require('fs');

const file = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// The regexes to extract the blocks
const contextRegex = /\s*\{\/\* Context Selector Block moved to top \*\/\}.*?(?=\{\/\* ── Agenda fijada \(fuera del scroll\) ── \*\/\})/s;
const agendaRegex = /\s*\{\/\* ── Agenda fijada \(fuera del scroll\) ── \*\/\}.*?(?=\{\/\* ── Navegación principal ── \*\/\})/s;

const contextMatch = content.match(contextRegex);
const agendaMatch = content.match(agendaRegex);

if (!contextMatch || !agendaMatch) {
    console.log("Could not find blocks to move!");
    if (!contextMatch) console.log("Missing Context Block");
    if (!agendaMatch) console.log("Missing Agenda Block");
    process.exit(1);
}

let contextBlock = contextMatch[0];
let agendaBlock = agendaMatch[0];

// Remove them from their original location
content = content.replace(contextRegex, '');
content = content.replace(agendaRegex, '');

// Adjust padding since nav already has padding
contextBlock = contextBlock.replace(/className="px-3 pb-3 /g, 'className="pb-3 ').replace(/className="px-2 pb-3 /g, 'className="pb-3 ');
agendaBlock = agendaBlock.replace(/className="px-3 pb-2 /g, 'className="pb-2 ').replace(/className="px-2 pb-2 /g, 'className="pb-2 ');

// We want to insert them right after:
//       >
//         {/* ① General: items del primer grupo */}
// But to be safe, let's insert it inside the <nav> element right at the beginning.

const insertTarget = '      >\n        {/* ① General: items del primer grupo */}';
const newContent = '      >\n' + contextBlock + '\n' + agendaBlock + '\n        {/* ① General: items del primer grupo */}';

if (content.includes(insertTarget)) {
    content = content.replace(insertTarget, newContent);
    fs.writeFileSync(file, content);
    console.log("Moved Agenda and Context blocks inside scrollable nav successfully!");
} else {
    console.log("Could not find insert target inside nav!");
    process.exit(1);
}
