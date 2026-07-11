const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/ManageUsers.tsx', 'utf-8');

const search = `  useEffect(() => {\n    const q = query(\n      collection(db, 'chats'),\n      where('sender', '==', 'user'),\n      where('read', '==', false)\n    );\n    const unsub = onSnapshot(q, (snapshot) => {\n      const counts: Record<string, number> = {};\n      snapshot.docs.forEach(doc => {\n        const data = doc.data();\n        if (data.userId) {\n          counts[data.userId] = (counts[data.userId] || 0) + 1;\n        }\n      });`;

const replace = `  useEffect(() => {\n    const q = query(\n      collection(db, 'chats'),\n      where('read', '==', false)\n    );\n    const unsub = onSnapshot(q, (snapshot) => {\n      const counts: Record<string, number> = {};\n      snapshot.docs.forEach(doc => {\n        const data = doc.data();\n        if (data.sender === 'user' && data.userId) {\n          counts[data.userId] = (counts[data.userId] || 0) + 1;\n        }\n      });`;

content = content.replace(search, replace);
fs.writeFileSync('src/pages/admin/ManageUsers.tsx', content);
