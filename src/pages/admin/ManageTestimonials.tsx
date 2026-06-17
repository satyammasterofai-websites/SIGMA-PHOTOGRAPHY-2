import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { fileToBase64 } from '../../lib/utils';
import { Trash2, Plus, Edit, ImagePlus, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', imageUrl: '', isVisible: true, order: 0 });
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      let list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list = list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setTestimonials(list);
    }, (error) => {
      console.error("Error fetching testimonials:", error);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoadingFile(true);
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setFormData({ ...formData, imageUrl: base64 });
        toast.success("Screenshot uploaded");
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoadingFile(false);
      }
    }
  };

  const saveTestimonial = async () => {
    if (!formData.imageUrl) {
       toast.error("Please upload a screenshot");
       return;
    }
    try {
      const id = formData.id || Date.now().toString();
      await setDoc(doc(db, 'testimonials', id), {
        imageUrl: formData.imageUrl,
        isVisible: formData.isVisible,
        order: formData.id ? formData.order : testimonials.length
      });
      toast.success("Saved successfully");
      setShowModal(false);
      setFormData({ id: '', imageUrl: '', isVisible: true, order: 0 });
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteTestimonial = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'testimonials', deleteId));
      toast.success("Deleted");
      setDeleteId(null);
    } catch (e) {
      toast.error("Failed to delete");
      setDeleteId(null);
    }
  };

  const toggleVisibility = async (t: any) => {
    try {
      await setDoc(doc(db, 'testimonials', t.id), {
        ...t,
        isVisible: !t.isVisible
      });
    } catch (e) {
      toast.error("Failed to update visibility");
    }
  };

  const changeOrder = async (t: any, direction: 'up' | 'down') => {
    const index = testimonials.findIndex(item => item.id === t.id);
    if (direction === 'up' && index > 0) {
      const current = testimonials[index];
      const previous = testimonials[index - 1];
      
      // Swap order values
      const currentOrder = previous.order || index - 1;
      const previousOrder = current.order || index;
      
      await setDoc(doc(db, 'testimonials', current.id), { ...current, order: currentOrder });
      await setDoc(doc(db, 'testimonials', previous.id), { ...previous, order: previousOrder });
    } else if (direction === 'down' && index < testimonials.length - 1) {
      const current = testimonials[index];
      const next = testimonials[index + 1];
      
      const currentOrder = next.order || index + 1;
      const nextOrder = current.order || index;
      
      await setDoc(doc(db, 'testimonials', current.id), { ...current, order: currentOrder });
      await setDoc(doc(db, 'testimonials', next.id), { ...next, order: nextOrder });
    }
  };

  return (
    <div className="w-full">
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-2">Delete Screenshot</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this screenshot? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={deleteTestimonial}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Testimonials Gallery</h1>
        <button 
          onClick={() => { setFormData({ id: '', imageUrl: '', isVisible: true, order: testimonials.length }); setShowModal(true); }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Screenshot
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {testimonials.map((t, index) => (
          <div key={t.id} className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col ${!t.isVisible ? 'opacity-60' : ''}`}>
            <div className="w-full h-48 bg-gray-800 relative">
               <img src={t.imageUrl || t.image} alt="Testimonial" className="w-full h-full object-contain" />
               {!t.isVisible && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">HIDDEN</span>
                 </div>
               )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-center mt-auto">
                 <div className="flex gap-1">
                   <button onClick={() => changeOrder(t, 'up')} disabled={index === 0} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded disabled:opacity-30">
                      <ArrowUp className="w-4 h-4" />
                   </button>
                   <button onClick={() => changeOrder(t, 'down')} disabled={index === testimonials.length - 1} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded disabled:opacity-30">
                      <ArrowDown className="w-4 h-4" />
                   </button>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => toggleVisibility(t)} className={`p-2 rounded-lg ${t.isVisible ? 'text-green-400 hover:bg-green-400/10' : 'text-gray-400 hover:bg-gray-400/10'}`}>
                      {t.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setFormData(t); setShowModal(true); }} className="text-indigo-400 p-2 hover:bg-indigo-400/10 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(t.id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
        {testimonials.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-900/50 rounded-xl border border-gray-800">
             No screenshots uploaded yet.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800">
             <h2 className="text-xl font-bold text-white mb-4">{formData.id ? 'Edit' : 'Add'} Screenshot Testimonial</h2>
             
             <div className="mb-6">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Upload Screenshot</label>
                <div className="relative w-full h-64 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors group cursor-pointer">
                   {loadingFile ? (
                      <div className="text-indigo-400">Processing image...</div>
                   ) : formData.imageUrl ? (
                     <>
                       <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm">
                         Change Image
                       </div>
                     </>
                   ) : (
                     <div className="flex flex-col items-center text-gray-500 group-hover:text-indigo-400 transition-colors">
                       <ImagePlus className="w-8 h-8 mb-2" />
                       <span className="text-sm">Click to upload screenshot</span>
                     </div>
                   )}
                   <input 
                     type="file" 
                     accept="image/*" 
                     onChange={handleImageUpload}
                     className="absolute inset-0 opacity-0 cursor-pointer"
                   />
                </div>
             </div>

             <div className="flex items-center gap-2 mb-6">
                 <input type="checkbox" id="isVisible" checked={formData.isVisible} onChange={e => setFormData({...formData, isVisible: e.target.checked})} className="rounded border-gray-700 w-4 h-4" />
                 <label htmlFor="isVisible" className="text-gray-300">Visible on website</label>
             </div>

             <div className="flex justify-end gap-2">
               <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
               <button onClick={saveTestimonial} disabled={loadingFile} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl disabled:opacity-50">Save</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
