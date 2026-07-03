const fs = require('fs');

let content = fs.readFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx', 'utf8');

const regex = /replace\("\[Año\]", `\[\$\{activeCursoId \? activeCursoId\.substring\(0, 7\) : 'AÑO'\}\]`\)/;

const newLogic = `replace("[Año]", \`[\${
  activeCursoId 
    ? (() => {
        const parts = activeCursoId.split('-');
        let y = parts[parts.length - 1];
        if (y === '26' || y === '202526') y = '2025-26';
        return y;
      })()
    : 'AÑO'
}]\`)`;

content = content.replace(regex, newLogic);

fs.writeFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx', content, 'utf8');
console.log('Sidebar.tsx updated to fix Curso [Año]');
