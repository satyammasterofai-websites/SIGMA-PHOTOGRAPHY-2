const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

code = code.replace(
    '                </div>\n              );\n            })()',
    '                </div>'
);

fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
console.log("Patched end");
