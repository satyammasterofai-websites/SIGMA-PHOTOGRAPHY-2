const fs = require('fs');
let content = fs.readFileSync('src/hooks/useChatNotifications.ts', 'utf-8');

const search = `    const unsub = onSnapshot(q, (snapshot) => {\n      snapshot.docChanges().forEach((change) => {\n        if (change.type === 'added') {\n          const msg = change.doc.data();\n          // Only show popup for new messages (timestamp within last 10 seconds)\n          const now = Date.now();\n          const msgTime = msg.timestamp ? \n            (typeof msg.timestamp.toMillis === 'function' ? msg.timestamp.toMillis() : new Date(msg.timestamp).getTime()) \n            : now;\n          \n          if (now - msgTime < 10000) {\n            toast(\`New message from \${role === 'admin' ? msg.userEmail || 'User' : 'Support'}:\\n\${msg.text}\`, {\n              icon: '💬',\n              duration: 5000,\n            });\n            setUnreadCount(prev => prev + 1);\n          }\n        }\n      });\n    });`;

const replace = `    const unsub = onSnapshot(q, (snapshot) => {
      // Show toast for new messages
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const msg = change.doc.data();
          const now = Date.now();
          const msgTime = msg.timestamp ? 
            (typeof msg.timestamp.toMillis === 'function' ? msg.timestamp.toMillis() : new Date(msg.timestamp).getTime()) 
            : now;
          
          if (now - msgTime < 10000) {
            toast(\`New message from \${role === 'admin' ? msg.userEmail || 'User' : 'Support'}:\\n\${msg.text}\`, {
              icon: '💬',
              duration: 5000,
            });
          }
        }
      });
      
      // Calculate actual unread count if we're a user
      if (role !== 'admin') {
        const unread = snapshot.docs.filter(doc => doc.data().read === false).length;
        setUnreadCount(unread);
      } else {
        // Admin logic can stay the same or use global context if needed
      }
    });`;

content = content.replace(search, replace);
fs.writeFileSync('src/hooks/useChatNotifications.ts', content);
