const fs = require('fs');
const path = require('path');

const directories = ['c:/GD-rsp/APP/frontend/src', 'c:/GD-rsp/APP/backend'];
const extensions = ['.ts', '.tsx', '.py', '.md', '.json'];

const replacements = {
    'alumno': 'alumnado',
    'alumnos': 'alumnado',
    'alumna': 'alumnado',
    'alumnas': 'alumnado',
    'Alumno': 'Alumnado',
    'Alumnos': 'Alumnado',
    'Alumna': 'Alumnado',
    'Alumnas': 'Alumnado'
};

const pattern = /\b(Alumno|Alumnos|Alumna|Alumnas|alumno|alumnos|alumna|alumnas)\b/g;

let totalReplacements = 0;
let filesChanged = 0;

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            processDirectory(filepath);
        } else if (extensions.includes(path.extname(file))) {
            let content = fs.readFileSync(filepath, 'utf8');
            let count = 0;
            const newContent = content.replace(pattern, (match) => {
                count++;
                return replacements[match];
            });
            if (count > 0) {
                fs.writeFileSync(filepath, newContent, 'utf8');
                totalReplacements += count;
                filesChanged++;
                console.log(`Replaced ${count} in ${filepath}`);
            }
        }
    }
}

for (const dir of directories) {
    processDirectory(dir);
}

console.log(`Total replacements: ${totalReplacements}`);
console.log(`Files changed: ${filesChanged}`);
