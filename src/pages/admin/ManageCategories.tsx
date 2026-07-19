import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Plus, Image as ImageIcon, Edit2, X, Search, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { fileToBase64 } from '../../lib/utils';
import { isFileNameDuplicate, registerFileName } from '../../lib/fileRegistry';

export default function ManageCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatOrder, setNewCatOrder] = useState('');
  
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatImage, setEditCatImage] = useState('');
  const [editCatOrder, setEditCatOrder] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'content', 'template_categories', 'items'), async (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999;
        const orderB = typeof b.order === 'number' ? b.order : 9999;
        return orderA - orderB;
      });
      setCategories(list);

      // Auto-recover missing categories from templates
      try {
        const tSnap = await getDocs(collection(db, 'templates'));
        const templateCats = new Set<string>();
        tSnap.forEach(t => {
           if (t.data().category) templateCats.add(String(t.data().category).trim());
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
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          setNewCatImage(compressedBase64);
          toast.success("Image selected and compressed");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(newCatName || "").trim()) {
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
        name: (newCatName || "").trim(),
        image: newCatImage,
        order: parsedNewOrder !== null ? parsedNewOrder : (categories.length > 0 ? Math.max(...categories.map(c => c.order || 0)) + 1 : 1)
      };
      await addDoc(collection(db, 'content', 'template_categories', 'items'), newCat);
      toast.success("Sub Template Category added");
      setNewCatName('');
      setNewCatImage('');
      setNewCatOrder('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add category");
    }
  };

  const confirmDelete = async () => {
    if(!deleteId) return;
    const catToDelete = categories.find(c => c.id === deleteId);
    if (!catToDelete) return;

    try {
      const q = query(collection(db, 'templates'), where('category', '==', catToDelete.name));
      const sn = await getDocs(q);
      if (!sn.empty) {
        toast.error(`Cannot delete! ${sn.docs.length} templates are using this category.`);
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
  };

  const startEdit = (cat: any) => {
    setEditCatOrder(cat.order?.toString() || '0');
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatImage(cat.image || '');
  };

  const cancelEdit = () => {
    setEditingCatId(null);
    setEditCatName('');
    setEditCatImage('');
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setEditCatImage(canvas.toDataURL('image/jpeg', 0.85));
          toast.success("Image updated");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEdit = async () => {
    if (!(editCatName || "").trim() || !editingCatId) return;
    
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
        name: (editCatName || "").trim(),
        image: editCatImage,
        order: parsedOrder !== null ? parsedOrder : (categories.find(c => c.id === editingCatId)?.order || 0)
      }, { merge: true });
      toast.success("Category updated");
      cancelEdit();
    } catch (e: any) {
      toast.error(e.message || "Failed to update category");
    }
  };

  
  const moveUp = async (index) => {
    if (index === 0) return;
    const currentCat = categories[index];
    const prevCat = categories[index - 1];
    const currentOrder = currentCat.order !== undefined ? currentCat.order : index;
    const prevOrder = prevCat.order !== undefined ? prevCat.order : index - 1;
    
    try {
      await setDoc(doc(db, 'content', 'template_categories', 'items', currentCat.id), { order: prevOrder }, { merge: true });
      await setDoc(doc(db, 'content', 'template_categories', 'items', prevCat.id), { order: currentOrder }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  const moveDown = async (index) => {
    if (index === categories.length - 1) return;
    const currentCat = categories[index];
    const nextCat = categories[index + 1];
    const currentOrder = currentCat.order !== undefined ? currentCat.order : index;
    const nextOrder = nextCat.order !== undefined ? nextCat.order : index + 1;
    
    try {
      await setDoc(doc(db, 'content', 'template_categories', 'items', currentCat.id), { order: nextOrder }, { merge: true });
      await setDoc(doc(db, 'content', 'template_categories', 'items', nextCat.id), { order: currentOrder }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full">
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-2">Delete Sub Template</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this sub template? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-6 flex justify-between items-center">
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
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Add New Category</h2>
        <form onSubmit={addCategory} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-24">
            <label className="block text-sm text-gray-400 mb-1">Order</label>
            <input 
              type="number" 
              value={newCatOrder} 
              onChange={e => setNewCatOrder(e.target.value)} 
              placeholder="e.g. 1"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">Category Name</label>
            <input 
              type="text" 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)} 
              placeholder="e.g. Wedding"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
            />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-sm text-gray-400 mb-1">Thumbnail Preview</label>
            <div className="relative h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center overflow-hidden w-40 cursor-pointer">
              {newCatImage ? (
                <img src={newCatImage} alt="Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-500">Upload Image</span>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 h-10 rounded-lg font-medium">
            Add
          </button>
        </form>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(categories || []).filter(cat => searchQuery === '' || (cat.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())).map((cat, index) => (
          <div key={`${cat.id}-${index}`} className="bg-gray-900 border border-gray-800 rounded-xl p-4 relative group">
            
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              {searchQuery === '' && (
                <>
                  <button onClick={() => moveUp(index)} disabled={index === 0} className={`p-2 rounded-lg shadow-lg relative z-20 ${index === 0 ? 'bg-gray-800 text-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-white'}`} title="Move Up"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => moveDown(index)} disabled={index === categories.length - 1} className={`p-2 rounded-lg shadow-lg relative z-20 ${index === categories.length - 1 ? 'bg-gray-800 text-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-white'}`} title="Move Down"><ArrowDown className="w-4 h-4" /></button>
                </>
              )}

              <button 
                onClick={() => startEdit(cat)} 
                className="bg-indigo-500/90 backdrop-blur hover:bg-indigo-600 text-white p-2 rounded-lg shadow-lg relative z-20" 
                title="Edit Category"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDeleteId(cat.id)} 
                className="bg-red-500/90 backdrop-blur hover:bg-red-600 text-white p-2 rounded-lg shadow-lg relative z-20" 
                title="Delete Sub Template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {editingCatId === cat.id ? (
              <div className="flex flex-col gap-3 mt-8 relative z-30">
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={editCatOrder} 
                    onChange={e => setEditCatOrder(e.target.value)} 
                    className="w-20 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                    placeholder="Order"
                  />
                  <input 
                    type="text" 
                    value={editCatName} 
                    onChange={e => setEditCatName(e.target.value)} 
                    className="flex-1 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                   <div className="relative h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center overflow-hidden w-20 cursor-pointer">
                    {editCatImage ? (
                      <img src={editCatImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-gray-500">Image</span>
                    )}
                    <input type="file" accept="image/*" onChange={handleEditImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="flex gap-2 flex-1">
                    <button onClick={saveEdit} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm flex-1">Save</button>
                    <button onClick={cancelEdit} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm"><X className="w-4 h-4"/></button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="h-40 w-full mb-3 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative mt-2">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <h3 className="text-white font-medium text-lg text-center">{cat.name}</h3>
              </>
            )}
          </div>
        ))}
        {(!categories || categories.length === 0) && <p className="text-gray-500 col-span-3 text-center py-8">No categories added yet.</p>}
      </div>
    </div>
  );
}
