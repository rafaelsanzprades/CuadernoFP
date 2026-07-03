const fs = require('fs');

function getAcronym(name) {
  const ignoreWords = ['y', 'e', 'de', 'del', 'la', 'las', 'el', 'los', 'en', 'para', 'por', 'con', 'a', 'al', 'o', 'u', 'las'];
  // Remove content in parenthesis like (GM)
  let cleanName = name.replace(/\([^)]+\)/g, '').trim();
  // Split by words
  let words = cleanName.split(/\s+/);
  let initials = words
    .filter(w => !ignoreWords.includes(w.toLowerCase()) && w.length > 0)
    .map(w => w[0].toUpperCase());
  return initials.join('');
}

let content = fs.readFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/store/initialData.ts', 'utf8');

// The objects look like: code: "0237", name: "Infraestructuras comunes de telecomunicación en viviendas y edificios",
const regex = /(code:\s*"[^"]+",\s*name:\s*"([^"]+)")/g;

content = content.replace(regex, (match, codeAndName, name) => {
  const acronym = getAcronym(name);
  return codeAndName + \, acronym: "\"\;
});

fs.writeFileSync('c:/GD-rsp/APP-CuadernoFP/frontend/src/store/initialData.ts', content, 'utf8');
console.log('Acronyms added to initialData.ts');
