// Regenera public/Guia.md (copia para el asistente IA) y el bloque GUIA_CATALOGO de
// src/data/guiaData.ts a partir de las fuentes reales de la app:
//  - pasos 0-5 y FAQ: GUIA_PASOS / GUIA_FAQ de src/data/guiaData.ts;
//  - Anexo (catálogo de códigos): listas de las pestañas de Programación (METODOLOGIAS,
//    INCLUSION, CONTINGENCIA, TRANSVERSALES) y de src/data/{instrumentosEvaluacion,herramientasRecursos}.ts.
//
// Uso (desde frontend/):  node scripts/generar-guia-md.mjs
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const guiaTs = join(process.cwd(), "src", "data", "guiaData.ts");
const guiaMd = join(process.cwd(), "public", "Guia.md");
const leer = (f) => readFileSync(join(process.cwd(), "src", f), "utf8");

// Node solo importa .mts/.ts con tipos eliminados si la extensión lo permite:
// se copia a un directorio temporal como .mts.
const src = readFileSync(guiaTs, "utf8");
const tmp = join(mkdtempSync(join(tmpdir(), "guia-")), "guiaData.mts");
writeFileSync(tmp, src);
const { GUIA_PASOS, GUIA_FAQ } = await import(pathToFileURL(tmp).href);

// ---- Catálogo real de la app ----
const unq = (x) => x.replace(/\\'/g, "'");
const deLista = (fichero, nombre) => {
  const t = leer(fichero);
  const ini = t.indexOf(`const ${nombre}`);
  if (ini < 0) throw new Error(`No encuentro ${nombre} en ${fichero}`);
  const bloque = t.slice(ini, t.indexOf("];", ini));
  const re = /\{\s*id:\s*"([^"]+)",\s*label:\s*(?:t\([^,]+,\s*\{defaultValue:\s*'((?:[^'\\]|\\.)*)'\}\)|"([^"]*)")/g;
  const out = [];
  let m;
  while ((m = re.exec(bloque))) out.push({ code: m[1], label: unq(m[2] ?? m[3]) });
  if (!out.length) throw new Error(`Lista vacía: ${nombre}`);
  return out;
};
const deRecursos = () => {
  const cats = new Map();
  for (const m of leer("data/herramientasRecursos.ts").matchAll(/\{ id: "([^"]+)", label: "([^"]*)", categoria: "([^"]*)"/g)) {
    if (!cats.has(m[3])) cats.set(m[3], []);
    cats.get(m[3]).push({ code: m[1], label: m[2] });
  }
  return cats;
};
const CATALOGO = [
  { numero: "A.1", titulo: "Metodologías activas", items: deLista("components/features/modulo/MetodologiaTab.tsx", "METODOLOGIAS") },
  { numero: "A.2", titulo: "Instrumentos de evaluación y de calificación", items: [...deLista("data/instrumentosEvaluacion.ts", "INSTRUMENTOS_EVALUACION"), ...deLista("data/instrumentosEvaluacion.ts", "INSTRUMENTOS_CALIFICACION")] },
  { numero: "A.3", titulo: "Medidas de respuesta educativa para la inclusión", items: deLista("components/features/modulo/DiversidadTab.tsx", "INCLUSION") },
  { numero: "A.4", titulo: "Plan de contingencia", items: deLista("components/features/modulo/ContingenciaTab.tsx", "CONTINGENCIA") },
  ...[...deRecursos()].map(([cat, items], i) => ({ numero: `A.5.${i + 1}`, titulo: `Recursos: ${cat.charAt(0).toLowerCase() + cat.slice(1)}`, items })),
  { numero: "A.6", titulo: "Elementos transversales", items: deLista("components/features/modulo/OtrosElementosTab.tsx", "TRANSVERSALES") },
];

// Reescribe GUIA_CATALOGO en guiaData.ts entre su declaración y el marcador de cierre
const q = (x) => JSON.stringify(x);
const tsCat =
  "export const GUIA_CATALOGO: GuiaCatalogoGrupo[] = [\n" +
  CATALOGO.map(
    (g) =>
      `  {\n    numero: ${q(g.numero)},\n    titulo: ${q(g.titulo)},\n    items: [\n` +
      g.items.map((i) => `      { code: ${q(i.code)}, label: ${q(i.label)} },\n`).join("") +
      "    ],\n  },\n",
  ).join("") +
  "];\n";
{
  const crlf = src.includes("\r\n");
  let ts = src.replace(/\r\n/g, "\n");
  const a = ts.indexOf("export const GUIA_CATALOGO");
  const b = ts.indexOf("// </GUIA_CATALOGO>");
  if (a < 0 || b < 0) throw new Error("Faltan los marcadores de GUIA_CATALOGO en guiaData.ts");
  ts = ts.slice(0, a) + tsCat + ts.slice(b);
  writeFileSync(guiaTs, crlf ? ts.replace(/\n/g, "\r\n") : ts);
}

// ---- Guia.md ----
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

// Paso 0 (instrucciones para el asistente)
{
  const p0 = GUIA_PASOS.find((x) => x.numero === "0");
  let o = p0.intro.join("\n\n") + "\n\n";
  for (const s of p0.subsecciones) {
    o += `- **${s.titulo.charAt(0).toUpperCase() + s.titulo.slice(1)}:**\n`;
    if (s.intro) o += s.intro + "\n\n";
    const num = s.nodes.every((n) => /^\d+\. /.test(n.label || ""));
    const sangria = s.numero === "0.4" ? "  " : "";
    o +=
      s.nodes
        .map((n) => (num ? `${n.label.replace(/^(\d+)\. (.*)$/, "$1. **$2:**")} ${n.text}` : `${sangria}- **${n.label}:** ${n.text}`))
        .join("\n") + "\n\n";
  }
  o += p0.notaFinal + "\n";
  const cab = /^## [^\n]*Paso 0:[^\n]*\n\n/m.exec(md);
  if (!cab) throw new Error('Falta "## Paso 0" en Guia.md');
  const fin = md.indexOf("\n---\n", cab.index);
  md = md.slice(0, cab.index + cab[0].length) + o + md.slice(fin);
}

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

// FAQ
{
  const ini = md.indexOf("## ❓ FAQ");
  const fin = md.indexOf("\n---\n", ini);
  if (ini < 0 || fin < 0) throw new Error("Falta la sección FAQ en Guia.md");
  md = md.slice(0, ini) + "## ❓ FAQ - Preguntas frecuentes\n\n" + GUIA_FAQ.map((f) => `### ${f.q}\n${f.a}\n`).join("\n") + md.slice(fin);
}

// Anexo (catálogo de códigos)
{
  const ini = md.indexOf("## 📚 Anexo");
  if (ini < 0) throw new Error("Falta el Anexo en Guia.md");
  md =
    md.slice(0, ini) +
    "## 📚 Anexo: Catálogo de elementos a codificar\n\n" +
    CATALOGO.map((g) => `### ${g.numero} ${g.titulo}\n` + g.items.map((i) => `- **[${i.code}]** ${i.label}`).join("\n") + "\n").join("\n");
}

writeFileSync(guiaMd, md.replace(/\n/g, nl));
console.log("Guia.md y GUIA_CATALOGO regenerados desde las fuentes de la app");
