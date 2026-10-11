// Regenera los pasos 1-5 de public/Guia.md (y la línea "Bloques" del glosario)
// a partir de src/data/guiaData.ts, que es la fuente que renderiza la pestaña
// Guía de Ayuda. Guia.md se conserva como copia para el asistente IA; este
// script evita que se desincronice. Paso 0, FAQ y Anexo de Guia.md no se tocan.
//
// Uso (desde frontend/):  node scripts/generar-guia-md.mjs
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const guiaTs = join(process.cwd(), "src", "data", "guiaData.ts");
const guiaMd = join(process.cwd(), "public", "Guia.md");

// Node solo importa .mts/.ts con tipos eliminados si la extensión lo permite:
// se copia a un directorio temporal como .mts.
const src = readFileSync(guiaTs, "utf8");
const tmp = join(mkdtempSync(join(tmpdir(), "guia-")), "guiaData.mts");
writeFileSync(tmp, src);
const { GUIA_PASOS } = await import(pathToFileURL(tmp).href);

const render = (nodes, ind = 0) =>
  nodes
    .map((n) => {
      const pad = " ".repeat(ind);
      const line = n.label ? `${pad}- **${n.label}:** ${n.text}` : `${pad}- ${n.text}`;
      return n.children?.length ? line + "\n" + render(n.children, ind + 2) : line;
    })
    .join("\n");

const cuerpo = (p, conTitulos) => {
  let out = "";
  for (const s of p.subsecciones) {
    if (conTitulos) {
      out += `### ${s.numero}. ${s.titulo}\n`;
      if (s.intro) out += s.intro + "\n";
    }
    out += render(s.nodes) + "\n";
    if (s.nota) out += `\n> ${s.nota}\n`;
    if (conTitulos) out += "\n";
  }
  return out.trimEnd() + "\n";
};

const raw = readFileSync(guiaMd, "utf8");
const nl = raw.includes("\r\n") ? "\r\n" : "\n";
let md = raw.replace(/\r\n/g, "\n");

for (const n of ["1", "2", "3", "4", "5"]) {
  const p = GUIA_PASOS.find((x) => x.numero === n);
  if (!p) throw new Error(`Falta el paso ${n} en guiaData.ts`);
  const cab = new RegExp(`^## [^\\n]*Paso ${n}:[^\\n]*\\n`, "m").exec(md);
  if (!cab) throw new Error(`Falta "## Paso ${n}" en Guia.md`);
  const conTitulos = n === "1" || n === "3" || n === "4";
  const ini = conTitulos ? md.indexOf("### ", cab.index + cab[0].length) : md.indexOf("\n- **", cab.index + cab[0].length) + 1;
  const fin = md.indexOf("\n---\n", ini);
  md = md.slice(0, ini) + cuerpo(p, conTitulos) + md.slice(fin);
}

const bloques = /label: "Bloques", text: "(3 grupos en el sidebar[^"]*)"/.exec(src);
if (bloques) md = md.replace(/^  - \*\*Bloques:\*\*.*$/m, "  - **Bloques:** " + bloques[1]);

writeFileSync(guiaMd, md.replace(/\n/g, nl));
console.log("Guia.md regenerado desde guiaData.ts");
