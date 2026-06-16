import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Plus, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageFAQ() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', question: '', answer: '' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'faqs'), (snapshot) => {
      setFaqs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Error fetching FAQs:", error);
    });
    return () => unsub();
  }, []);

  const saveFaq = async () => {
    try {
      const id = formData.id || Date.now().toString();
      await setDoc(doc(db, 'faqs', id), {
        question: formData.question,
        answer: formData.answer
      });
      toast.success("Saved successfully");
      setShowModal(false);
      setFormData({ id: '', question: '', answer: '' });
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const deleteFaq = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'faqs', id));
      toast.success("Deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">FAQ Management</h1>
        <button 
          onClick={() => { setFormData({ id: '', question: '', answer: '' }); setShowModal(true); }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-500">{faq.answer}</p>
              </div>
              <div className="flex gap-2 ml-4">
                 <button onClick={() => { setFormData(faq); setShowModal(true); }} className="text-indigo-400 p-2 hover:bg-indigo-400/10 rounded-lg">
                   <Edit className="w-4 h-4" />
                 </button>
                 <button onClick={() => deleteFaq(faq.id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg">
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
             <h2 className="text-xl font-bold text-white mb-4">{formData.id ? 'Edit' : 'Add'} FAQ</h2>
             <input type="text" placeholder="Question" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 mb-4" />
             <textarea placeholder="Answer" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 mb-4 resize-none" rows={4} />
             <div className="flex justify-end gap-2">
               <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400">Cancel</button>
               <button onClick={saveFaq} className="px-4 py-2 bg-indigo-500 text-white rounded-xl">Save</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
