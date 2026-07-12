const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

code = code.replace(
  '{advancePayment && advancePayment !== "0" && advancePayment !== 0 && (',
  '{advancePayment && advancePayment !== "0" && Number(advancePayment) !== 0 && ('
);

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
console.log("Patched TemplateManagement lint error");
