const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

// Remove all fragments
code = code.replace(/<\/>/g, '');
code = code.replace(/<>\s*{\/\* Category Tabs \*\/}/g, '{/* Category Tabs */}');
code = code.replace(/<>\n\s*{\/\* Category Tabs \*\/}/g, '{/* Category Tabs */}');

// We have `{loading ? (...) : (`
// Here we should wrap `{/* Category Tabs */}` through to the end of the table container.
// The end of the table container is just before `)}` that ends the loading block.

let searchStr = '{/* Category Tabs */}';
let startIdx = code.indexOf(searchStr);

if (startIdx !== -1) {
    code = code.substring(0, startIdx) + '<>\n        ' + code.substring(startIdx);
    
    let modalStartIdx = code.indexOf('{/* Modal / Form Overlay */}');
    let tableEndIdx = code.lastIndexOf(')}', modalStartIdx);
    
    if (tableEndIdx !== -1) {
        code = code.substring(0, tableEndIdx) + '        </>\n      ' + code.substring(tableEndIdx);
    }
}

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
