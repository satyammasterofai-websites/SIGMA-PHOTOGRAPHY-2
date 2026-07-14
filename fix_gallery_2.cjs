const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const start = code.indexOf('const handleApplyCouponFromGallery');
if (start !== -1) {
  let end = code.indexOf('  };', start) + 4;
  code = code.substring(0, start) + code.substring(end);
}

fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
