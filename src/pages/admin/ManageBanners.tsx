import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { fileToBase64 } from '../../lib/utils';

export default function ManageBanners() {
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'banners'), (snapshot) => {
      setBanners(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Error fetching banners:", error);
    });
    return () => unsub();
  }, []);

  const addBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        const id = Date.now().toString();
        await setDoc(doc(db, 'banners', id), { image: base64, active: true });
        toast.success("Banner added");
      } catch (err: any) {
        toast.error("Failed to add banner");
      }
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'banners', id));
      toast.success("Banner deleted");
    } catch (e) {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Banner Management</h1>
        <div className="relative">
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Banner
          </button>
          <input type="file" accept="image/*" onChange={addBanner} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="h-40 w-full mb-4 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              {banner.image ? (
                <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div className="flex justify-between items-center">
               <span className="text-gray-400 text-sm">Banner ID: {banner.id}</span>
               <button onClick={() => deleteBanner(banner.id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg">
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-gray-500 col-span-2 text-center py-8">No banners added.</p>}
      </div>
    </div>
  );
}
