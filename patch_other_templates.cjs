const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const regex = /const englishTemplates = filteredTemplates\.filter\(t => t\.language === 'English'\);/;
code = code.replace(regex, "const englishTemplates = filteredTemplates.filter(t => t.language === 'English');\n              const otherTemplates = filteredTemplates.filter(t => t.language !== 'Hindi' && t.language !== 'English');");

fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
console.log("Patched otherTemplates variable");
