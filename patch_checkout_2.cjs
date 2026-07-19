const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

code = code.replace(
  /\\\*TEMPLATE ID\\\*: \$\{template\?\.id\}/g,
  `*TEMPLATE ID*: \${template?.displayId || template?.id}`
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log('done');
