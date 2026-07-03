const fs = require('fs');

const path = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the block to move
const startBlock = '{/* DEMO/REAL Buttons and Group Selector */}';
const endBlock = '</div>\n            )}';

const blockStartIndex = content.indexOf(startBlock);
// The endBlock is around line 277. Let's find the exact string.
// We'll just use a regex to capture it.
const regex = /([\s]*\{\/\* DEMO\/REAL Buttons and Group Selector \*\/\}\r?\n[\s\S]*?)\r?\n[\s]*<\/div>\r?\n[\s]*\)\}\r?\n\r?\n[\s]*<\/div>\r?\n[\s]*\)\}\r?\n([\s]*<button onClick=\{toggleSidebar\}[\s\S]*?<\/button>\r?\n[\s]*<\/div>\r?\n)/;

// Wait, the structure is:
//             {/* DEMO/REAL Buttons and Group Selector */}
//             {isSidebarOpen && (
//               <div className="flex flex-col gap-2 mt-4 w-full px-0">
//                   ...
//               </div>
//             )}
//
//           </div>
//         )}
//         <button onClick={toggleSidebar} ...
//       </div>

// Let's use a robust replacement
let newContent = content.replace(
  /([\s]*\{\/\* DEMO\/REAL Buttons and Group Selector \*\/\}\r?\n[\s]*\{isSidebarOpen && \(\r?\n[\s]*<div className="flex flex-col gap-2 mt-4 w-full px-0">[\s\S]*?<\/div>\r?\n[\s]*\)\}\r?\n)/, 
  '' // Remove it from inside the title flex
);

// Now insert it after the end of the top flex row
// The top flex row ends with:
//         <button onClick={toggleSidebar} ...>
//           ...
//         </button>
//       </div>

// Let's capture the extracted block first
const match = content.match(/([\s]*\{\/\* DEMO\/REAL Buttons and Group Selector \*\/\}\r?\n[\s]*\{isSidebarOpen && \(\r?\n[\s]*<div className="flex flex-col gap-2 mt-4 w-full px-0">[\s\S]*?<\/div>\r?\n[\s]*\)\}\r?\n)/);

if (match) {
  let extracted = match[1];
  // Change px-0 to px-3 to match nav
  extracted = extracted.replace('w-full px-0', 'w-full px-3 mb-2');
  
  // Insert it after the first </div> after toggleSidebar
  newContent = newContent.replace(
    /(<button onClick=\{toggleSidebar\}[\s\S]*?<\/button>\r?\n[\s]*<\/div>\r?\n)/,
    `$1${extracted}`
  );
  
  fs.writeFileSync(path, newContent, 'utf8');
  console.log('Successfully moved the controls!');
} else {
  console.log('Match not found!');
}
