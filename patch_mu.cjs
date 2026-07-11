const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/ManageUsers.tsx', 'utf-8');

// Replace imports
content = content.replace("import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';", "import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';");

// Insert state
content = content.replace("const [deleteUserId, setDeleteUserId] = useState<string | null>(null);", "const [deleteUserId, setDeleteUserId] = useState<string | null>(null);\n  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});");

// Insert useEffect
const insertAfter = `    return () => unsub();\n  }, []);`;
const newEffect = `\n\n  useEffect(() => {\n    const q = query(\n      collection(db, 'chats'),\n      where('sender', '==', 'user'),\n      where('read', '==', false)\n    );\n    const unsub = onSnapshot(q, (snapshot) => {\n      const counts: Record<string, number> = {};\n      snapshot.docs.forEach(doc => {\n        const data = doc.data();\n        if (data.userId) {\n          counts[data.userId] = (counts[data.userId] || 0) + 1;\n        }\n      });\n      setUnreadMap(counts);\n    }, (error) => {\n      console.error("Error fetching unread chats:", error);\n    });\n    return () => unsub();\n  }, []);`;
content = content.replace(insertAfter, insertAfter + newEffect);

fs.writeFileSync('src/pages/admin/ManageUsers.tsx', content);
