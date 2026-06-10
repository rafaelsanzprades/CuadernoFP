import * as fs from 'fs';
import { demoSeed } from './src/services/demo-ele203-0237ictve-curso202526';

const pdData = demoSeed["0237-ictve-pd" as keyof typeof demoSeed];
const cursoData = demoSeed["0237-ictve-curso-2025-26" as keyof typeof demoSeed];
fs.writeFileSync('C:\\GD-rsp\\APP\\Programacion_Demo.cddp', JSON.stringify(pdData, null, 2));
fs.writeFileSync('C:\\GD-rsp\\APP\\Curso_Demo.cddc', JSON.stringify(cursoData, null, 2));
console.log('Saved to C:\\GD-rsp\\APP\\Programacion_Demo.cddp and C:\\GD-rsp\\APP\\Curso_Demo.cddc');
