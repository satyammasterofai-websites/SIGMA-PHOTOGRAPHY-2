const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const regex = /(const \[prevOrders, setPrevOrders\] = useState[\s\S]*?\}, \[user\]\);)/;
const match = code.match(regex);
if (match) {
  const listenerCode = match[1];
  code = code.replace(listenerCode, '');
  
  const insertPoint = `  const { unreadCount } = useChatStore();`;
  code = code.replace(insertPoint, insertPoint + '\\n\\n' + listenerCode);
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
  console.log("Moved listener below user declaration.");
}
