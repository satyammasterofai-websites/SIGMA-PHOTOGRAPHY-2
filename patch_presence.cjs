const fs = require('fs');
let code = fs.readFileSync('src/hooks/usePresence.ts', 'utf-8');

code = code.replace(
  `      try {
        updateDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        });
      } catch (e) {}`,
  `      try {
        updateDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        }).catch(() => {});
      } catch (e) {}`
);

fs.writeFileSync('src/hooks/usePresence.ts', code);
console.log("Patched usePresence.ts");
