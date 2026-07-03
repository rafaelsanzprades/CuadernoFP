const fs = require('fs');

let content = fs.readFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/types/index.ts', 'utf8');

// Remove CRM related types
content = content.replace(/export const CrmInteraccionSchema[\s\S]*?export type CrmInteraccion = z\.infer<typeof CrmInteraccionSchema>;\n/g, '');
content = content.replace(/export const CrmEmpresaSchema[\s\S]*?export type CrmEmpresa = z\.infer<typeof CrmEmpresaSchema>;\n/g, '');

// Remove feoe and profesional from CursoDataSchema
content = content.replace(/  df_feoe: z\.array\(z\.any\(\)\)\.optional\(\),\n/g, '');
content = content.replace(/  profesional_ledger: z\.record\(z\.string\(\), z\.any\(\)\)\.optional\(\),\n/g, '');

// Also remove the exports of CrmInteraccion and CrmEmpresa at the top if they exist
content = content.replace(/export type CrmInteraccion = z\.infer<typeof CrmInteraccionSchema>;\n/g, '');
content = content.replace(/export type CrmEmpresa = z\.infer<typeof CrmEmpresaSchema>;\n/g, '');

fs.writeFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/types/index.ts', content, 'utf8');
console.log('types/index.ts cleaned up');
