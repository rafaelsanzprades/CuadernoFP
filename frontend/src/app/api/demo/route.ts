import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Sin parámetros de request, siempre lee el mismo contenido fijo de
// public/demo/ -- bajo output:'export' (build de Tauri, next.config.tauri.mjs)
// esto hace que Next ejecute GET() una sola vez en build time y sirva el
// resultado como un JSON estático, sin servidor detrás. Hace falta declararlo
// explícito: sin `dynamic`, el export estático rechaza el build entero con
// "not configured on route... with output: export" aunque el handler no use
// nada dinámico.
export const dynamic = "force-static";

export async function GET() {
  try {
    const demoDir = path.join(process.cwd(), 'public', 'demo');
    const files = fs.readdirSync(demoDir);
    const groups = files.filter(f => f.endsWith('.fpg')).sort();

    const allFiles = files
      .filter(f => f.endsWith('.fpg') || f.endsWith('.fpp') || f.endsWith('.fpc'))
      .sort()
      .map(name => ({
        name,
        ext: name.slice(name.lastIndexOf('.') + 1),
        size: fs.statSync(path.join(demoDir, name)).size,
      }));

    return NextResponse.json({ status: 'success', data: groups, files: allFiles });
  } catch (error) {
    console.error("Error reading demo directory:", error);
    return NextResponse.json({ status: 'error', message: 'Could not read demo directory' }, { status: 500 });
  }
}
