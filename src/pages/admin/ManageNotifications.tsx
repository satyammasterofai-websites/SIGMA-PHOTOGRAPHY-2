import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Plus, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });
    return () => unsub();
  }, []);

  const sendNotification = async () => {
    try {
      const id = Date.now().toString();
      await setDoc(doc(db, 'notifications', id), {
        title: formData.title,
        message: formData.message,
        timestamp: new Date().toISOString()
      });
      toast.success("Notification sent");
      setShowModal(false);
      setFormData({ title: '', message: '' });
    } catch (e) {
      toast.error("Failed to send notification");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      toast.success("Deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Push Notifications</h1>
        <button 
          onClick={() => { setFormData({ title: '', message: '' }); setShowModal(true); }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Send Notification
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map(notif => (
          <div key={notif.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold mb-2">{notif.title}</h3>
                <p className="text-sm text-gray-400">{notif.message}</p>
                <p className="text-xs text-gray-600 mt-2">{new Date(notif.timestamp).toLocaleString()}</p>
              </div>
              <button onClick={() => deleteNotification(notif.id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800">
             <h2 className="text-xl font-bold text-white mb-4">Send Notification</h2>
             <input type="text" placeholder="Notification Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 mb-4" />
             <textarea placeholder="Message body" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 mb-4 resize-none" rows={4} />
             <div className="flex justify-end gap-2">
               <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400">Cancel</button>
               <button onClick={sendNotification} className="px-4 py-2 bg-indigo-500 text-white rounded-xl flex items-center gap-2">
                 <Send className="w-4 h-4" /> Send
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
