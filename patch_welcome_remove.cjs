const fs = require('fs');
let code = fs.readFileSync('src/pages/user/SupportChat.tsx', 'utf-8');

const uiRemovalRegex = /        <div className="flex justify-start">\s*<div className="max-w-\[70%\] rounded-2xl px-5 py-3 bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm">\s*<p className="whitespace-pre-wrap">\{welcomeMessage\}<\/p>\s*<\/div>\s*<\/div>/;
code = code.replace(uiRemovalRegex, "");

fs.writeFileSync('src/pages/user/SupportChat.tsx', code);
