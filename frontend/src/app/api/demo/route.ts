import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
