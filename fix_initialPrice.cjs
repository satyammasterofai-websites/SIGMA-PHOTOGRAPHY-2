const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

const regexPriceDef = /  const basePrice = Number\(template\?\.price\) \|\| 0;\n  const initialPrice = template\?\.discountPrice\n    \? Number\(template\.discountPrice\)\n    : basePrice;/;

const match = code.match(regexPriceDef);
if (match) {
  code = code.replace(match[0], ''); // remove from old location
  // Insert before applyCoupon
  code = code.replace(`  const applyCoupon = () => {`, match[0] + `\n\n  const applyCoupon = () => {`);
  fs.writeFileSync('src/pages/Checkout.tsx', code);
  console.log("Fixed initialPrice scope");
}
