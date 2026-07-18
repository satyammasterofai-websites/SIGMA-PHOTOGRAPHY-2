const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/ManageCategories.tsx', 'utf-8');

// 1. Add query, where, getDocs
code = code.replace(
  "import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';",
  "import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';"
);

// 2. Prevent deletion if templates exist
const confirmDeleteCode = `  const confirmDelete = async () => {
    if(!deleteId) return;
    const catToDelete = categories.find(c => c.id === deleteId);
    if (!catToDelete) return;

    try {
      const q = query(collection(db, 'templates'), where('category', '==', catToDelete.name));
      const sn = await getDocs(q);
      if (!sn.empty) {
        toast.error(\`Cannot delete! \${sn.docs.length} templates are using this category.\`);
        setDeleteId(null);
        return;
      }

      await deleteDoc(doc(db, 'content', 'template_categories', 'items', deleteId));
      toast.success("Category deleted");
      setDeleteId(null);
    } catch (err: any) {
      toast.error("Failed to delete category");
      setDeleteId(null);
    }
  };`;

code = code.replace(/  const confirmDelete = async \(\) => \{[\s\S]*?  \};\n/, confirmDeleteCode + '\n');

// 3. Remove image resize limit
// For new image upload
code = code.replace(
  `          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);`,
  `          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);`
);

// For edit image upload
code = code.replace(
  `          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setEditCatImage(canvas.toDataURL('image/jpeg', 0.6));`,
  `          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setEditCatImage(canvas.toDataURL('image/jpeg', 0.85));`
);

// 4. Auto-recover categories on load
const useEffectCode = `  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'content', 'template_categories', 'items'), async (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(list);

      // Auto-recover missing categories from templates
      try {
        const tSnap = await getDocs(collection(db, 'templates'));
        const templateCats = new Set<string>();
        tSnap.forEach(t => {
           if (t.data().category) templateCats.add(t.data().category.trim());
        });
        const existingCats = new Set(list.map(c => (c.name || '').trim().toLowerCase()));
        
        for (const tc of templateCats) {
           if (tc && !existingCats.has(tc.toLowerCase())) {
              // Recover it
              await addDoc(collection(db, 'content', 'template_categories', 'items'), {
                 name: tc,
                 order: list.length,
                 image: ''
              });
              existingCats.add(tc.toLowerCase());
           }
        }
      } catch (err) {
        console.error("Failed to recover categories", err);
      }

    }, (error) => {
      console.error("Error fetching categories:", error);
    });
    return () => unsub();
  }, []);`;

code = code.replace(/  useEffect\(\(\) => \{[\s\S]*?  \}, \[\]\);\n/, useEffectCode + '\n');

fs.writeFileSync('src/pages/admin/ManageCategories.tsx', code);
console.log('done');
