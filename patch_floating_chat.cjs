const fs = require('fs');
let content = fs.readFileSync('src/components/SupportChatButton.tsx', 'utf-8');

const search = `        <motion.button\n          onClick={handleClick}`;

const replace = `        {unreadCount > 0 && (\n          <motion.div\n            initial={{ opacity: 0, y: 10, scale: 0.8 }}\n            animate={{ opacity: 1, y: 0, scale: 1 }}\n            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none"\n          >\n            {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}\n            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>\n          </motion.div>\n        )}\n        <motion.button\n          onClick={handleClick}`;

content = content.replace(search, replace);
fs.writeFileSync('src/components/SupportChatButton.tsx', content);
