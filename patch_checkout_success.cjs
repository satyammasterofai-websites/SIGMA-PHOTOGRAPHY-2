const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

code = code.replace(
  /msg: \`Order saved! Please click below to send us your details on WhatsApp\.\$\{advanceMsg\}\`,/g,
  `msg: \`Order saved (ID: \${orderData.displayId})! Please click below to send us your details on WhatsApp.\${advanceMsg}\`,`
);

code = code.replace(
  /msg: \`Order saved! Please send us the payment screenshot on WhatsApp\.\$\{advanceMsg\}\`,/g,
  `msg: \`Order saved (ID: \${orderData.displayId})! Please send us the payment screenshot on WhatsApp.\${advanceMsg}\`,`
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log('done');
