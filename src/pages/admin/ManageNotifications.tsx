import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Plus, Send, Edit, Play, Pause } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../store/useAuthStore';

export default function ManageNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '', // Internal name
    message: '', // The actual text displayed
    buttonText: '',
    buttonLink: '',
    bgColor: '#4F46E5', // Default Indigo 600
    textColor: '#FFFFFF',
    startDate: '',
    expiryDate: '',
    enabled: true
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log("ManageNotifications: Fetched docs:", docs);
      setNotifications(docs);
    }, (error) => {
      console.error("ManageNotifications snapshot error:", error);
      toast.error(`Permission denied reading Announcements: ${error.message}`);
    });
    return () => unsub();
  }, []);

  const saveAnnouncement = async () => {
    try {
      const id = editingId || Date.now().toString() + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      await setDoc(doc(db, 'announcements', id), {
        title: formData.title,
        message: formData.message,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        bgColor: formData.bgColor,
        textColor: formData.textColor,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        enabled: formData.enabled,
        timestamp: new Date().toISOString()
      });
      toast.success(editingId ? "Announcement updated" : "Announcement created");
      setShowModal(false);
      resetForm();
    } catch (e: any) {
      console.error("Save error:", e);
      toast.error(`Failed to save announcement: ${e.message}`);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      toast.success("Deleted");
    } catch (e: any) {
      console.error("Delete error:", e);
      toast.error(`Failed to delete: ${e.message}`);
    }
  };

  const toggleEnable = async (notif: any) => {
    try {
      await setDoc(doc(db, 'announcements', notif.id), {
        ...notif,
        enabled: !notif.enabled
      });
      toast.success(notif.enabled ? "Disabled" : "Enabled");
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const openEdit = (notif: any) => {
    setFormData({
      title: notif.title || '',
      message: notif.message || '',
      buttonText: notif.buttonText || '',
      buttonLink: notif.buttonLink || '',
      bgColor: notif.bgColor || '#4F46E5',
      textColor: notif.textColor || '#FFFFFF',
      startDate: notif.startDate || '',
      expiryDate: notif.expiryDate || '',
      enabled: notif.enabled ?? true
    });
    setEditingId(notif.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '', message: '', buttonText: '', buttonLink: '',
      bgColor: '#4F46E5', textColor: '#FFFFFF', startDate: '', expiryDate: '', enabled: true
    });
    setEditingId(null);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Announcement Bars</h1>
          <p className="text-brand-slate text-sm mt-1">Manage scrolling announcement bars at the top of the site. Logged in as: {user?.email}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              try {
                await setDoc(doc(db, 'announcements', Date.now().toString() + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)), {
                  title: 'SUMMER OFFER',
                  message: 'UPTO 50% OFF ON ALL TEMPLATES',
                  type: 'marketing',
                  enabled: true,
                  startDate: '',
                  expiryDate: '',
                  bgColor: '#4F46E5',
                  textColor: '#FFFFFF',
                  createdAt: new Date().toISOString()
                });
                toast.success("Default announcement created");
              } catch (e: any) {
                console.error("Create default announcement error:", e);
                toast.error(`Failed to create default announcement: ${e.message}`);
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            Create Default Announcement
          </button>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-brand-purple hover:bg-brand-purple/90 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Announcement
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notif, index) => (
          <div key={`${notif.id}-${index}`} className="bg-white border text-gray-900 border-gray-200 shadow-sm rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{notif.title || 'Untitled'}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${notif.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {notif.enabled ? 'Active' : 'Draft/Disabled'}
                  </span>
                </div>
                <div 
                  className="p-3 rounded mb-3 flex items-center justify-between"
                  style={{ backgroundColor: notif.bgColor, color: notif.textColor }}
                >
                  <p className="text-sm font-medium">{notif.message}</p>
                  {notif.buttonText && (
                    <span className="text-xs border px-2 py-1 rounded" style={{ borderColor: notif.textColor }}>{notif.buttonText}</span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 flex items-center gap-4">
                  {(notif.startDate || notif.expiryDate) && (
                    <span>
                      📅 {notif.startDate ? new Date(notif.startDate).toLocaleDateString() : 'Now'} - {notif.expiryDate ? new Date(notif.expiryDate).toLocaleDateString() : 'Forever'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
                <button onClick={() => toggleEnable(notif)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg" title={notif.enabled ? "Disable" : "Enable"}>
                  {notif.enabled ? <Pause className="w-5 h-5 text-amber-500" /> : <Play className="w-5 h-5 text-green-500" />}
                </button>
                <button onClick={() => openEdit(notif)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => deleteAnnouncement(notif.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
            No announcements found.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl border border-gray-100 shadow-2xl my-8">
             <h2 className="text-xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name (e.g. Navratri Offer)</label>
                 <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2" />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Message *</label>
                 <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 resize-none" rows={2} required />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Button Text (Optional)</label>
                   <input type="text" placeholder="e.g. Book Now" value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Button Link (URL)</label>
                   <input type="text" placeholder="https://" value={formData.buttonLink} onChange={e => setFormData({...formData, buttonLink: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2" />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                   <div className="flex gap-2">
                     <input type="color" value={formData.bgColor} onChange={e => setFormData({...formData, bgColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                     <input type="text" value={formData.bgColor} onChange={e => setFormData({...formData, bgColor: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                   <div className="flex gap-2">
                     <input type="color" value={formData.textColor} onChange={e => setFormData({...formData, textColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                     <input type="text" value={formData.textColor} onChange={e => setFormData({...formData, textColor: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3" />
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Optional)</label>
                   <input type="datetime-local" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                   <input type="datetime-local" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2" />
                 </div>
               </div>
               
               <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" checked={formData.enabled} onChange={e => setFormData({...formData, enabled: e.target.checked})} className="w-5 h-5 text-brand-purple rounded" />
                   <span className="text-sm font-bold text-gray-900">Enable on website</span>
                 </label>
               </div>
             </div>

             <div className="flex justify-end gap-3 mt-6">
               <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-xl">Cancel</button>
               <button onClick={saveAnnouncement} disabled={!formData.message} className="px-5 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white font-medium rounded-xl disabled:opacity-50 flex items-center gap-2">
                 <Send className="w-4 h-4" /> Save Announcement
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
