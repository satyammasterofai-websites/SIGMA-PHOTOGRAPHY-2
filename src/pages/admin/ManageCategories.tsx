import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { fileToBase64 } from '../../lib/utils';

export default function ManageCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'content', 'categories'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        setCategories(docSnap.data().items);
      } else {
        setCategories([]);
      }
    }, (error) => {
      console.error("Error fetching categories:", error);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setNewCatImage(base64);
        toast.success("Image selected");
      } catch (err: any) {
        toast.error("Image too large or invalid");
      }
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Category name required");
      return;
    }
    try {
      const id = Date.now().toString(); // Or use a slug
      const newCat = {
        id,
        name: newCatName.trim(),
        image: newCatImage
      };
      await setDoc(doc(db, 'content', 'categories'), {
        items: [...categories, newCat]
      });
      toast.success("Sub Template Category added");
      setNewCatName('');
      setNewCatImage('');
    } catch (err: any) {
      toast.error("Failed to add category");
    }
  };

  const confirmDelete = async () => {
    if(!deleteId) return;
    try {
      const newCategories = categories.filter((c: any) => c.id !== deleteId);
      await setDoc(doc(db, 'content', 'categories'), {
        items: newCategories
      });
      toast.success("Category deleted");
      setDeleteId(null);
    } catch (e) {
      toast.error("Failed to delete category");
      setDeleteId(null);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Manage Sub Templates (Categories)</h1>
        <p className="text-brand-slate">Add sub template categories like Wedding, Engagement, Birthday, etc.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Add New Category</h2>
        <form onSubmit={addCategory} className="flex flex-col md:flex-row gap-4 items-end">
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
                <img src={newCatImage} alt="Preview" className="w-full h-full object-cover" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 relative group">
            <div className="absolute top-6 right-6 z-10">
              <button 
                onClick={() => setDeleteId(cat.id)} 
                className="bg-red-500/90 backdrop-blur hover:bg-red-600 text-white p-2 rounded-lg shadow-lg relative z-20" 
                title="Delete Sub Template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="h-40 w-full mb-3 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <h3 className="text-white font-medium text-lg text-center">{cat.name}</h3>
          </div>
        ))}
        {categories.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No categories added yet.</p>}
      </div>
    </div>
  );
}
