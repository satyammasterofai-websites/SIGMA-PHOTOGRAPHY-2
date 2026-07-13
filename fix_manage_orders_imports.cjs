const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');
code = code.replace(/import \{\s*collection,\s*onSnapshot,/g, 'import { collection, onSnapshot, addDoc,');
fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
