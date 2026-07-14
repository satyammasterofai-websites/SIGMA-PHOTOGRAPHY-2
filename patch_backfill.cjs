const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

const target = `      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setTemplates(list);`;
const replacement = `      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      // Backfill displayId if missing
      const toUpdate = list.filter(t => !t.displayId);
      if (toUpdate.length > 0) {
        let maxId = 0;
        list.forEach(t => {
          if (t.displayId) {
            const num = parseInt(t.displayId, 10);
            if (!isNaN(num) && num > maxId) maxId = num;
          }
        });
        
        for (const t of toUpdate) {
          maxId++;
          const nextId = String(maxId).padStart(5, '0');
          t.displayId = nextId;
          updateDoc(doc(db, 'templates', t.id), { displayId: nextId }).catch(console.error);
        }
      }

      setTemplates(list);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
}

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
