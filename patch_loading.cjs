const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', 'utf-8');

code = code.replace(
  /const unsub = onSnapshot\(query\(collection\(db, 'selfVideoTemplates'\)\), \(snapshot\) => \{\s*setTemplates\(snapshot\.docs\.map\(\(doc\) => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\)\);\s*setLoading\(false\);\s*\}\);/,
  `const unsub = onSnapshot(query(collection(db, 'selfVideoTemplates')), (snapshot) => {
      setTemplates(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });`
);

fs.writeFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', code);
console.log('patched loading');
