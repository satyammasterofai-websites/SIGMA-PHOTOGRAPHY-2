const fs = require('fs');
let code = fs.readFileSync('src/components/UserNotifications.tsx', 'utf-8');
code = code.replace(/setUnreadCount\(notifs\.filter\(n => !n\.read\)\.length\);/, 'setUnreadCount(notifs.filter(n => !(n as any).read).length);');
fs.writeFileSync('src/components/UserNotifications.tsx', code);
