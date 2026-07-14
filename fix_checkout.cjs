const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

code = code.replace(/      const priceThreshold = Number\(matched\.maxPriceThreshold\);\n      if \(priceThreshold > 0 && initialPrice > priceThreshold\) {\n        toast\.error\(`This coupon is only valid for templates priced at or below ₹\$\{priceThreshold\}`\);\n        return;\n      }\n      const priceThreshold = Number\(matched\.maxPriceThreshold\);/, '      const priceThreshold = Number(matched.maxPriceThreshold);');

fs.writeFileSync('src/pages/Checkout.tsx', code);
