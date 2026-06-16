import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Plus, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', role: '', content: '' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      setTestimonials(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Error fetching testimonials:", error);
    });
    return () => unsub();
  }, []);

  const saveTestimonial = async () => {
    try {
      const id = formData.id || Date.now().toString();
      await setDoc(doc(db, 'testimonials', id), {
        name: formData.name,
        role: formData.role,
        content: formData.content
      });
      toast.success("Saved successfully");
      setShowModal(false);
      setFormData({ id: '', name: '', role: '', content: '' });
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      toast.success("Deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Testimonials Management</h1>
        <button 
          onClick={() => { setFormData({ id: '', name: '', role: '', content: '' }); setShowModal(true); }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map(t => (
          <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-300 italic mb-4">"{t.content}"</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white font-medium">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => { setFormData(t); setShowModal(true); }} className="text-indigo-400 p-2 hover:bg-indigo-400/10 rounded-lg">
                   <Edit className="w-4 h-4" />
                 </button>
                 <button onClick={() => deleteTestimonial(t.id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg">
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800">
             <h2 className="text-xl font-bold text-white mb-4">{formData.id ? 'Edit' : 'Add'} Testimonial</h2>
             <input type="text" placeholder="Visitor Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 mb-4" />
             <input type="text" placeholder="Title/Role (e.g. Happy Bride)" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 mb-4" />
             <textarea placeholder="Testimonial Content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 mb-4 resize-none" rows={4} />
             <div className="flex justify-end gap-2">
               <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400">Cancel</button>
               <button onClick={saveTestimonial} className="px-4 py-2 bg-indigo-500 text-white rounded-xl">Save</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
