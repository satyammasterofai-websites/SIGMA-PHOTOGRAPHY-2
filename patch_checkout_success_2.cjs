const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

code = code.replace(
  /msg: \`Payment successful! Redirecting to WhatsApp to send assets\.\$\{advanceMsg\}\`,/g,
  `msg: \`Payment successful (Order ID: \${orderData.displayId})! Redirecting to WhatsApp to send assets.\${advanceMsg}\`,`
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log('done');
