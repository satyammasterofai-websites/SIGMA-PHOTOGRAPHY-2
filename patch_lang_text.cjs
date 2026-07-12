const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

code = code.replace(
  '{lang === "All" ? "All Languages" : lang}',
  '{lang === "All" ? "All" : lang + " Templates"}'
);

fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
console.log("Patched language text");
