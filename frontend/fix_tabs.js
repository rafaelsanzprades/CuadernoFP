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
    
    // Replace 'flex-1' inside TabsTrigger className
    content = content.replace(/<TabsTrigger\s+([^>]*?)className=["']([^"']*)flex-1([^"']*)["']/g, (match, p1, p2, p3) => {
        return `<TabsTrigger ${p1}className="${p2.trim()} ${p3.trim()}".trim()`.replace(/\s+/g, ' ').replace(/className=" "/, 'className="') + '"';
    });
    
    // Simplier replace: just find `<TabsTrigger` and if it has `flex-1`, remove it.
    // Since regex might be tricky, let's just do a simple string replace for the exact pattern we know:
    // `className="text-sm flex-1 whitespace-nowrap min-w-[100px] py-2"` -> `className="text-sm whitespace-nowrap min-w-[100px] py-2"`
    content = content.replace(/className="text-sm flex-1 whitespace-nowrap/g, 'className="text-sm whitespace-nowrap');

    if (content !== originalContent) {
        fs.writeFileSync(page, content, 'utf8');
        console.log(`Updated ${page}`);
        changedCount++;
    }
});

console.log(`Updated ${changedCount} files.`);
