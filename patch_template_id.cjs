const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

const target = `      } else {
        // Calculate next displayId for this category
        const categoryTemplates = templates.filter(t => t.category === finalCategory);
        let maxId = 0;
        categoryTemplates.forEach(t => {
          if (t.displayId) {
            const num = parseInt(t.displayId, 10);
            if (!isNaN(num) && num > maxId) maxId = num;
          }
        });
        const nextId = String(maxId + 1).padStart(5, '0');
        
        await addDoc(collection(db, 'templates'), { ...data, displayId: nextId });
      }`;

const replacement = `      } else {
        let maxId = 0;
        templates.forEach(t => {
          if (t.displayId) {
            const num = parseInt(t.displayId, 10);
            if (!isNaN(num) && num > maxId) maxId = num;
          }
        });
        const nextId = String(maxId + 1).padStart(5, '0');
        await addDoc(collection(db, 'templates'), { ...data, displayId: nextId });
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
