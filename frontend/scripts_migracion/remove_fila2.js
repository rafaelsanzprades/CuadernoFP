const fs = require('fs');
const headerPath = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Header.tsx';
let header = fs.readFileSync(headerPath, 'utf8');

const startMarker = '{/* Fila 2: Contexto Actual (Tres columnas) */}';
const endMarker = '{/* Fila 3: Breadcrumb y Buscar */}';

const startIndex = header.indexOf(startMarker);
const endIndex = header.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  header = header.substring(0, startIndex) + header.substring(endIndex);
  fs.writeFileSync(headerPath, header, 'utf8');
  console.log('Fila 2 removed!');
} else {
  console.log('Markers not found!');
}
