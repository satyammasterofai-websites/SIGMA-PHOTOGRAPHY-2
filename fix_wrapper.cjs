const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

// I will look for:
// ) : (
//       {/* Category Tabs */}

code = code.replace(
  "      ) : (\n              {/* Category Tabs */}",
  "      ) : (\n      <>\n        {/* Category Tabs */}"
);

// I will look for the end of the table container:
//         </div>
//       )}
//     </div>

// Actually, I can just find the closing bracket for the ternary block. 
const searchStr = '      ) : (\n      <>\n        {/* Category Tabs */}';
if(code.indexOf(searchStr) !== -1) {
    const lines = code.split('\\n');
    // It is easier to replace using string index
    const endIndex = code.lastIndexOf(')}', code.lastIndexOf('      {/* Quick Preview Modal */}'));
    if (endIndex !== -1) {
        code = code.substring(0, endIndex - 1) + '\\n        </>\\n      ' + code.substring(endIndex);
    }
} else {
    // try finding the start differently
    let startIdx = code.indexOf('{/* Category Tabs */}');
    let endIdx = code.indexOf(')}', startIdx);
    
    // We can replace the start with `<>` and the end with `</>}`
    code = code.substring(0, startIdx) + '<>\n' + code.substring(startIdx);
    
    // Now find the `)}` that closes the ternary
    const modalStartIdx = code.indexOf('{/* Quick Preview Modal */}');
    const tableEndIdx = code.lastIndexOf(')}', modalStartIdx);
    
    if (tableEndIdx !== -1) {
        code = code.substring(0, tableEndIdx) + '</>\n      ' + code.substring(tableEndIdx);
    }
}

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
