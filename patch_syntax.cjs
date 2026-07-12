const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const regex = /\s*\);\s*\}\)\(\)/;

if (regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
    console.log("Patched syntax error");
} else {
    console.log("No syntax error found");
}
