const fs = require('fs');

let content = fs.readFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx', 'utf8');

const regex = /replace\("\[Año\]", `\[\$\{[\s\S]*?\}\]`\)/;

const newLogic = `replace("[Año]", \`[\${
  activeCursoId 
    ? (() => {
        let y = '2025-26';
        const parts = activeCursoId.split('-');
        const lastPart = parts[parts.length - 1];
        if (lastPart !== '1a' && lastPart !== '1b' && lastPart !== '1c' && lastPart !== '1A' && lastPart !== '1B' && lastPart !== '1C' && lastPart.length > 3) {
            y = lastPart;
        }
        if (y === '26' || y === '202526') y = '2025-26';
        
        let group = '';
        const idUpper = activeCursoId.toUpperCase();
        if (idUpper.includes('-1A') || idUpper.endsWith('1A')) group = ' - 1A';
        else if (idUpper.includes('-1B') || idUpper.endsWith('1B')) group = ' - 1B';
        else if (idUpper.includes('-1C') || idUpper.endsWith('1C')) group = ' - 1C';
        else if (idUpper.includes('-2A') || idUpper.endsWith('2A')) group = ' - 2A';
        else if (idUpper.includes('-2B') || idUpper.endsWith('2B')) group = ' - 2B';
        
        return y + group;
      })()
    : 'AÑO'
}]\`)`;

content = content.replace(regex, newLogic);

fs.writeFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx', content, 'utf8');
console.log('Sidebar.tsx updated to show group in Curso [Año]');
