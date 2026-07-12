const fs = require('fs');
let code = fs.readFileSync('debug_tmpl.txt', 'utf-8');

// I need to undo my `<>` tags.
code = code.replace('<>{/* Category Tabs */}', '{/* Category Tabs */}');
code = code.replace('</>\n      )}', ')}');

// Wait, the syntax error is caused because I have two adjacent JSX elements inside the `loading ? ... : ...` ternary!
// Specifically, `{/* Category Tabs */}` (which is a div) AND `div` (the table container).
// They need to be wrapped in `<>` and `</>`.
// So the structure should be:
//      ) : (
//        <>
//          {/* Category Tabs */}
//          <div className="flex gap-2 ...
//          ...
//          <div className="bg-gray-900 border border-gray-800 ...>
//            ... table ...
//          </div>
//        </>
//      )}

code = code.replace('{/* Category Tabs */}', '<>\n        {/* Category Tabs */}');

// The closing `</>` should be just before `)}` that closes the loading ternary.
// Let's find the table container end.
const modalStartIdx = code.indexOf('{/* Modal / Form Overlay */}');
const tableEndIdx = code.lastIndexOf(')}', modalStartIdx);

if (tableEndIdx !== -1) {
    code = code.substring(0, tableEndIdx) + '        </>\n      ' + code.substring(tableEndIdx);
}

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
