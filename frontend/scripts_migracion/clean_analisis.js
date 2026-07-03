const fs = require('fs');

let content = fs.readFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/features/analisis/AnalisisIndividualTab.tsx', 'utf8');

// Remove df_feoe variable definition
content = content.replace(/\s*const df_feoe = cursoData\?\.df_feoe \|\| \[\];\n/g, '\n');

// Remove feoe integration block in AnalisisIndividualTab
content = content.replace(/[\s]*df_ra\.forEach\(\(ra: any\) => \{[\s]*if \(ra\.is_dual && df_feoe\.length > 0 && selectedAlId\) \{[\s\S]*?\}\n[\s]*\}\);\n/g, '');

fs.writeFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/components/features/analisis/AnalisisIndividualTab.tsx', content, 'utf8');
console.log('AnalisisIndividualTab.tsx cleaned up');
