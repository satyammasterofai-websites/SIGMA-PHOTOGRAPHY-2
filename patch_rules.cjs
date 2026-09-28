const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

if (!code.includes('/selfVideoTemplates/')) {
  code = code.replace(
    /match \/orders\/\{orderId\}/,
    "match /selfVideoTemplates/{document=**} {\n      allow read: if true;\n      allow write: if isAdmin();\n    }\n\n    match /orders/{orderId}"
  );
  fs.writeFileSync('firestore.rules', code);
  console.log('patched rules');
}
