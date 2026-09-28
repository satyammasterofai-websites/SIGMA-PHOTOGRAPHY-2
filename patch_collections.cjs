const fs = require('fs');

const file1 = 'src/pages/admin/ManageSelfVideoTemplates.tsx';
let code1 = fs.readFileSync(file1, 'utf-8');
code1 = code1.replace(/collection\(db, 'selfVideoTemplates'\)/g, "collection(db, 'settings', 'data', 'selfVideoTemplates')");
code1 = code1.replace(/doc\(db, 'selfVideoTemplates', /g, "doc(db, 'settings', 'data', 'selfVideoTemplates', ");
fs.writeFileSync(file1, code1);

const file2 = 'src/components/SelfVideoEditing.tsx';
let code2 = fs.readFileSync(file2, 'utf-8');
code2 = code2.replace(/collection\(db, 'selfVideoTemplates'\)/g, "collection(db, 'settings', 'data', 'selfVideoTemplates')");
fs.writeFileSync(file2, code2);

console.log('patched collections');
