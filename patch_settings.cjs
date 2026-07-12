const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSettings.tsx', 'utf-8');

// Add state
const waState = `  // WhatsApp State`;
const chatState = `  // Chat State\n  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can we help you today?");\n\n  // WhatsApp State`;
code = code.replace(waState, chatState);

// Add read
const readCheckout = `          if (data.checkoutFormNote) {`;
const readChat = `          if (data.welcomeMessage) {\n            setWelcomeMessage(data.welcomeMessage);\n          }\n          if (data.checkoutFormNote) {`;
code = code.replace(readCheckout, readChat);

// Add save
const saveCheckout = `          checkoutFormNote,`;
const saveChat = `          welcomeMessage,\n          checkoutFormNote,`;
code = code.replace(saveCheckout, saveChat);

fs.writeFileSync('src/pages/admin/ManageSettings.tsx', code);
console.log("Patched settings state/db logic");
