const fs = require('fs');
let code = fs.readFileSync('src/pages/user/SupportChat.tsx', 'utf-8');

const regex = /\{messages\.length === 0 && \(\s*<div className="h-full flex items-center justify-center text-gray-400">\s*No messages yet\. Start a conversation!\s*<\/div>\s*\)\}/;
code = code.replace(regex, '');

fs.writeFileSync('src/pages/user/SupportChat.tsx', code);
console.log("Patched no messages logic");
