const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

code = code.replace(/createOrderRecord\("Paid Online", "Online Payment"\)/g, 'createOrderRecord("Pending Verification", "Online Payment")');

fs.writeFileSync('src/pages/Checkout.tsx', code);
