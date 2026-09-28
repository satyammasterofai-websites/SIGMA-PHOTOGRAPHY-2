const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', 'utf-8');

code = code.replace(
  /import \{ supabase \} from '\.\.\/\.\.\/lib\/supabase';/,
  "import { storage } from '../../lib/firebase';\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';"
);

code = code.replace(
  /const \{ error, data \} = await supabase\.storage\.from\('media'\)\.upload\(fileName, file\);\s*if \(error\) throw error;\s*const \{ data: publicData \} = supabase\.storage\.from\('media'\)\.getPublicUrl\(fileName\);\s*setEditingTemplate\(\(prev: any\) => \(\{ \.\.\.prev, \[field\]: publicData\.publicUrl \}\)\);/,
  `const storageRef = ref(storage, 'templates/' + fileName);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditingTemplate((prev: any) => ({ ...prev, [field]: url }));`
);

fs.writeFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', code);
console.log('patched upload');
