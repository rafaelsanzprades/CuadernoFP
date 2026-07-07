const fs = require('fs');
const file = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = '{/* Context Selector Block moved to top */}\n      {isSidebarOpen && (\n         <div className="px-3 pb-3 flex flex-col gap-2 relative z-20">';
const replacement = '{/* Context Selector Block moved to top */}\n      {isSidebarOpen && (\n         <div className="px-3 pb-3 flex flex-col gap-2 relative z-20 shrink-0">';

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log("Replaced target");
} else {
    console.log("Target not found!");
}
