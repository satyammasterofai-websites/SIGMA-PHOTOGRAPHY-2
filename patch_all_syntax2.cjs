const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

// Fix line 171
code = code.replace(/<\/div>\}/g, '</div>\n                            );\n                          })()}');

fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
console.log("Patched 171");
