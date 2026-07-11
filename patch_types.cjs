const fs = require('fs');

let chatContent = fs.readFileSync('src/pages/user/SupportChat.tsx', 'utf-8');
chatContent = chatContent.replace("const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));", "const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));");
fs.writeFileSync('src/pages/user/SupportChat.tsx', chatContent);

let cdContent = fs.readFileSync('src/pages/admin/CustomerDetail.tsx', 'utf-8');
cdContent = cdContent.replace("const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));", "const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));");
fs.writeFileSync('src/pages/admin/CustomerDetail.tsx', cdContent);
