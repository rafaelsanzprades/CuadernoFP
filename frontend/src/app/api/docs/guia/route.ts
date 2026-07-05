import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // The Guia.md file is located at the root of the project, which is one level above the frontend folder.
    const filePath = path.join(process.cwd(), '..', 'Guia.md');
    
    // Attempt to read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error reading Guia.md:', error);
    return new NextResponse('No se pudo cargar la guía de inicio.', { status: 500 });
  }
}
