const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

code = code.replace(
  /templateId: template\?\.id \|\| "",/g,
  `templateId: template?.id || "",\n          templateDisplayId: template?.displayId || "",`
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log('done');
