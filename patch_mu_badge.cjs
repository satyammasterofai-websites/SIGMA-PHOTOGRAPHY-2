const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/ManageUsers.tsx', 'utf-8');

const search = `                       <button onClick={() => setSelectedUser(u)} className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg" title="Chat / Orders">\n                         <MessageSquare className="w-4 h-4" />\n                       </button>`;

const replace = `                       <button onClick={() => setSelectedUser(u)} className="relative p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg" title="Chat / Orders">\n                         <MessageSquare className="w-4 h-4" />\n                         {unreadMap[u.id] > 0 && (\n                           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">\n                             {unreadMap[u.id]}\n                           </span>\n                         )}\n                       </button>`;

content = content.replace(search, replace);
fs.writeFileSync('src/pages/admin/ManageUsers.tsx', content);
