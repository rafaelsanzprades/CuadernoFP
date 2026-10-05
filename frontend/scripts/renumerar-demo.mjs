// Deja el alumnado de los .fpc de demo en orden alfabético con ID AN01..ANnn
// (ver src/utils/renumerarAlumnado.ts). Uso: node scripts/renumerar-demo.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ordenarYRenumerarAlumnado } from "../src/utils/renumerarAlumnado.ts";

const dir = new URL("../public/demo/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
for (const f of readdirSync(dir).filter((n) => n.endsWith(".fpc"))) {
  const ruta = join(decodeURIComponent(dir), f);
  const doc = JSON.parse(readFileSync(ruta, "utf-8"));
  const esArray = Array.isArray(doc);
  const curso = esArray ? doc[0] : doc;
  const nuevo = ordenarYRenumerarAlumnado(curso);
  if (nuevo === curso) { console.log(`${f}: ya ordenado`); continue; }
  writeFileSync(ruta, JSON.stringify(esArray ? [nuevo, ...doc.slice(1)] : nuevo, null, 2), "utf-8");
  console.log(`${f}: reordenado (${nuevo.df_al.length} alumnos)`);
}
