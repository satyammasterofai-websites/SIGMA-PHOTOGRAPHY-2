const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

// Fix line 171
code = code.replace(
    '                              </div>}',
    '                              </div>\n                            );\n                          })()}'
);

// Fix the end
const endRegex = /                <\/div>\s*\);\s*\}\)\(\)/;
if (endRegex.test(code)) {
    code = code.replace(endRegex, '                </div>');
    console.log("Patched the end syntax");
} else {
    console.log("End syntax not matched");
}

fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
console.log("Done patching");
