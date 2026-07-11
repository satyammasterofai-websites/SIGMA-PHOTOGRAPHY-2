const fs = require('fs');
let content = fs.readFileSync('src/hooks/useChatNotifications.ts', 'utf-8');

const search = `    const unsub = onSnapshot(q, (snapshot) => {`;
const replace = `    const unsub = onSnapshot(q, (snapshot) => {`;
// Actually, let's just rewrite the whole hook to be simpler and catch errors.
