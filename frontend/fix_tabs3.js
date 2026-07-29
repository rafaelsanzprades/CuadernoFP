const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else if (file === 'page.tsx') {
            results.push(filePath);
        }
    });
    return results;
}

const pages = walkDir(srcDir);
let changedCount = 0;

pages.forEach(page => {
    let content = fs.readFileSync(page, 'utf8');
    const originalContent = content;
    
    // Fix the double quote issue in JSX
    content = content.replace(/className="text-sm whitespace-nowrap min-w-\[100px\] py-2""/g, 'className="text-sm whitespace-nowrap min-w-[100px] py-2"');

    if (content !== originalContent) {
        fs.writeFileSync(page, content, 'utf8');
        console.log(`Updated ${page}`);
        changedCount++;
    }
});

console.log(`Updated ${changedCount} files.`);
