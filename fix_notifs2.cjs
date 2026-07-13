const fs = require('fs');
let code = fs.readFileSync('src/components/UserNotifications.tsx', 'utf-8');
code = code.replace(/className=\{\\\`/g, 'className={`');
code = code.replace(/\\`\}/g, '`}');
fs.writeFileSync('src/components/UserNotifications.tsx', code);
