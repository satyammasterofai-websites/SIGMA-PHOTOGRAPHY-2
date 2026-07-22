const fs = require('fs');
let code = fs.readFileSync('src/components/UserNotifications.tsx', 'utf-8');

code = code.replace(
  /import \{ auth, db \} from "\.\.\/lib\/firebase";/,
  `import { auth, db } from "../lib/firebase";\nimport toast from "react-hot-toast";`
);

code = code.replace(
  /const unsubscribe = onSnapshot\(q, \(snapshot\) => \{/,
  `let initialLoad = true;\n    const unsubscribe = onSnapshot(q, (snapshot) => {\n      if (!initialLoad) {\n        snapshot.docChanges().forEach((change) => {\n          if (change.type === "added") {\n            const data = change.doc.data();\n            toast(data.title + ": " + data.message, { icon: '🔔' });\n          }\n        });\n      }\n      initialLoad = false;`
);

fs.writeFileSync('src/components/UserNotifications.tsx', code);
console.log('done');
