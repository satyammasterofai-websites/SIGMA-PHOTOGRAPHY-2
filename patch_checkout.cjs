const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

// Update createOrderRecord return value
code = code.replace(
  /return orderRef\.id;/,
  `return { id: orderRef.id, displayId: cleanData.displayId };`
);
code = code.replace(
  /return "ORDER_ERR";/,
  `return { id: "ORDER_ERR", displayId: "ORDER_ERR" };`
);

// Update getWaUrl
code = code.replace(
  /const getWaUrl = \(orderId: string\) => \{/,
  `const getWaUrl = (orderId: string, displayId: string) => {`
);

code = code.replace(
  /const displayOrderId =\s*orderId === "ORDER_ERR"\s*\?\s*`REQ-\$\{Math\.floor\(Math\.random\(\) \* 100000\)\}`\s*:\s*orderId;/,
  `const displayOrderId = orderId === "ORDER_ERR" ? \`REQ-\${Math.floor(Math.random() * 100000)}\` : (displayId || orderId);`
);

// Update templateId in getWaUrl
code = code.replace(
  /\.replace\("\{templateId\}", template\?\.id \|\| "Unknown"\)/g,
  `.replace("{templateId}", template?.displayId || template?.id || "Unknown")`
);

code = code.replace(
  /\\\*TEMPLATE ID\\\*: \$\{template\?\.id\}/g,
  `*TEMPLATE ID*: \${template?.displayId || template?.id}`
);

// Update proceedToWhatsApp
code = code.replace(
  /const orderId = await createOrderRecord\("Pending", viaMethod\);\n\s*const url = getWaUrl\(orderId\);/g,
  `const orderData = await createOrderRecord("Pending", viaMethod);\n    const url = getWaUrl(orderData.id, orderData.displayId);`
);

// Update initiatePayment
code = code.replace(
  /const orderId = await createOrderRecord\("Pending Verification", "Online Payment"\);\n\s*const advanceMsg =/g,
  `const orderData = await createOrderRecord("Pending Verification", "Online Payment");\n        const advanceMsg =`
);
code = code.replace(
  /const url = getWaUrl\(orderId\);/g,
  `const url = getWaUrl(orderData.id, orderData.displayId);`
);

// Update handleQRConfirmed
code = code.replace(
  /const orderId = await createOrderRecord\("Pending Verification", "Online Payment"\);\n\s*const advanceMsg =/g,
  `const orderData = await createOrderRecord("Pending Verification", "Online Payment");\n    const advanceMsg =`
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log('done');
