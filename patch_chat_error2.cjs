const fs = require('fs');
let content = fs.readFileSync('src/hooks/useChatNotifications.ts', 'utf-8');

const search = `    const unsub = onSnapshot(q, (snapshot) => {`;
const replace = `    const unsub = onSnapshot(q, (snapshot) => {`;

content = content.replace("    });\n    return () => unsub();", "    }, (error) => {\n      console.error('Chat notification error:', error);\n    });\n    return () => unsub();");
fs.writeFileSync('src/hooks/useChatNotifications.ts', content);
