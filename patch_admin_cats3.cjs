const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageCategories.tsx', 'utf-8');

const addCatRepl = `  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Category name required");
      return;
    }
    
    // Check for duplicate category name
    const isDuplicate = (categories || []).some(
      (cat: any) => (cat.name || '').toLowerCase() === (newCatName || '').toLowerCase().trim()
    );
    
    if (isDuplicate) {
      toast.error("A category with this exact name already exists.");
      return;
    }

    const parsedNewOrder = newCatOrder !== '' ? parseInt(newCatOrder, 10) : null;
    if (parsedNewOrder !== null) {
      const isOrderDuplicate = (categories || []).some(
        (cat: any) => cat.order === parsedNewOrder
      );
      if (isOrderDuplicate) {
        toast.error("This order number already exists. Please choose a different order.");
        return;
      }
    }

    try {
      const newCat = {
        name: newCatName.trim(),
        image: newCatImage,
        order: parsedNewOrder !== null ? parsedNewOrder : (categories.length > 0 ? Math.max(...categories.map(c => c.order || 0)) + 1 : 1)
      };`;

code = code.replace(/  const addCategory = async \(e: React.FormEvent\) => \{[\s\S]*?      const newCat = \{[\s\S]*?\};\n/, addCatRepl + '\n');

const saveEditRepl = `  const saveEdit = async () => {
    if (!editCatName.trim() || !editingCatId) return;
    
    const isDuplicate = (categories || []).some(
      (cat: any) => cat.id !== editingCatId && (cat.name || '').toLowerCase() === (editCatName || '').toLowerCase().trim()
    );
    if (isDuplicate) {
      toast.error("Another category with this name already exists.");
      return;
    }

    const parsedOrder = editCatOrder !== '' ? parseInt(editCatOrder, 10) : null;
    if (parsedOrder !== null) {
      const isOrderDuplicate = (categories || []).some(
        (cat: any) => cat.id !== editingCatId && cat.order === parsedOrder
      );
      if (isOrderDuplicate) {
        toast.error("This order number already exists. Please choose a different order.");
        return;
      }
    }

    try {
      await setDoc(doc(db, 'content', 'template_categories', 'items', editingCatId), {
        name: editCatName.trim(),
        image: editCatImage,
        order: parsedOrder !== null ? parsedOrder : (categories.find(c => c.id === editingCatId)?.order || 0)
      }, { merge: true });`;

code = code.replace(/  const saveEdit = async \(\) => \{[\s\S]*?      \}, \{ merge: true \}\);\n/, saveEditRepl + '\n');

// Add "Reset Orders" button
const resetBtnHtml = `      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Manage Sub Templates (Categories)</h1>
          <p className="text-brand-slate">Add sub template categories like Wedding, Engagement, Birthday, etc.</p>
        </div>
        <button 
          onClick={async () => {
            try {
              let idx = 1;
              for (const c of categories) {
                 await updateDoc(doc(db, 'content', 'template_categories', 'items', c.id), { order: idx++ });
              }
              toast.success("Orders reset sequentially");
            } catch (err) {
              toast.error("Failed to reset orders");
            }
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Reset All Orders
        </button>
      </div>`;

code = code.replace(/      <div className="mb-6">\s*<h1 className="text-2xl font-bold text-brand-navy">Manage Sub Templates \(Categories\)<\/h1>\s*<p className="text-brand-slate">Add sub template categories like Wedding, Engagement, Birthday, etc.<\/p>\s*<\/div>/, resetBtnHtml);

fs.writeFileSync('src/pages/admin/ManageCategories.tsx', code);
console.log('done');
