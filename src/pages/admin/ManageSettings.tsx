import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Trash2, Save, MessageSquare, CreditCard, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageSettings() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'payment' | 'coupons'>('whatsapp');
  
  // WhatsApp State
  const [waNumber, setWaNumber] = useState('');
  const [waMessageFormat, setWaMessageFormat] = useState('Payment Successful\nTemplate: {template}\nOrder ID: {orderId}\nName: {name}\n\nDetails: {details}');
  const [waOrderingEnabled, setWaOrderingEnabled] = useState(true);

  // Payment State
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('Payment gateway under process');

  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', percentage: '', expiryDate: '' });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.whatsapp) {
          setWaNumber(data.whatsapp.number || '');
          setWaMessageFormat(data.whatsapp.messageFormat || '');
          setWaOrderingEnabled(data.whatsapp.enabled !== false);
        }
        if (data.payment) {
           setPaymentEnabled(data.payment.enabled || false);
           setPaymentSuccessMessage(data.payment.successMessage || '');
        }
        if (data.coupons) {
           setCoupons(data.coupons || []);
        }
      }
    }, () => {});
    return () => unsub();
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'config'), {
        whatsapp: {
          number: waNumber,
          messageFormat: waMessageFormat,
          enabled: waOrderingEnabled
        },
        payment: {
          enabled: paymentEnabled,
          successMessage: paymentSuccessMessage
        },
        coupons
      });
      toast.success('Settings saved successfully');
    } catch (e) {
      toast.error('Failed to save settings');
    }
  };

  const addCoupon = () => {
    if (!newCoupon.code || !newCoupon.percentage) return;
    setCoupons([...coupons, { id: Date.now().toString(), ...newCoupon }]);
    setNewCoupon({ code: '', percentage: '', expiryDate: '' });
  };

  const removeCoupon = (id: string) => {
     setCoupons(coupons.filter(c => c.id !== id));
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400 mt-1">Manage global configurations for checkout.</p>
        </div>
        <button onClick={saveSettings} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-medium">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-800">
        <button onClick={() => setActiveTab('whatsapp')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'whatsapp' ? 'border-brand-electric text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
          <MessageSquare className="w-4 h-4" /> WhatsApp
        </button>
        <button onClick={() => setActiveTab('payment')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'payment' ? 'border-brand-electric text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
          <CreditCard className="w-4 h-4" /> Payment Options
        </button>
        <button onClick={() => setActiveTab('coupons')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'coupons' ? 'border-brand-electric text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
          <Tag className="w-4 h-4" /> Discount Coupons
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
        
        {activeTab === 'whatsapp' && (
          <div className="space-y-6 max-w-2xl">
             <div>
               <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" checked={waOrderingEnabled} onChange={e => setWaOrderingEnabled(e.target.checked)} className="rounded border-gray-700 bg-gray-800 w-5 h-5" />
                 <div><p className="font-medium text-white">Enable WhatsApp Ordering</p><p className="text-sm text-gray-400">Allow users to place orders directly via WhatsApp</p></div>
               </label>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Business Number (with country code)</label>
               <input type="text" value={waNumber} onChange={e => setWaNumber(e.target.value)} placeholder="+919876543210" className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-300 mb-2">Message Format (Variables: {"{template}, {orderId}, {name}, {details}"})</label>
               <textarea rows={6} value={waMessageFormat} onChange={e => setWaMessageFormat(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 resize-none font-mono text-sm" />
             </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6 max-w-2xl">
             <div>
               <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" checked={paymentEnabled} onChange={e => setPaymentEnabled(e.target.checked)} className="rounded border-gray-700 bg-gray-800 w-5 h-5 text-brand-purple" />
                 <div><p className="font-medium text-white">Enable Online Payment Gateway</p><p className="text-sm text-gray-400">Under construction; will show the success message popup and fallback to WhatsApp</p></div>
               </label>
             </div>
             {paymentEnabled && (
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Payment Gateway Notice Message</label>
                 <textarea rows={4} value={paymentSuccessMessage} onChange={e => setPaymentSuccessMessage(e.target.value)} placeholder="Payment gateway under process..." className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 resize-none" />
               </div>
             )}
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-6">
             <div className="flex flex-col md:flex-row gap-4 items-end bg-gray-800/50 p-6 rounded-xl border border-gray-800">
               <div className="flex-1 w-full">
                 <label className="block text-xs font-medium text-gray-400 mb-2">Coupon Code</label>
                 <input type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} placeholder="SUMMER50" className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
               </div>
               <div className="w-full md:w-32">
                 <label className="block text-xs font-medium text-gray-400 mb-2">Discount (%)</label>
                 <input type="number" value={newCoupon.percentage} onChange={e => setNewCoupon({...newCoupon, percentage: e.target.value})} placeholder="20" className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
               </div>
               <div className="flex-1 w-full">
                 <label className="block text-xs font-medium text-gray-400 mb-2">Expiry Date (Optional)</label>
                 <input type="date" value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
               </div>
               <button onClick={addCoupon} className="w-full md:w-auto bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl text-sm font-medium h-[42px]">Add Coupon</button>
             </div>

             <div className="overflow-hidden rounded-xl border border-gray-800">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-800">
                    <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {coupons.map(c => (
                      <tr key={c.id}>
                        <td className="px-4 py-3 font-bold text-white">{c.code}</td>
                        <td className="px-4 py-3 text-green-400">{c.percentage}% OFF</td>
                        <td className="px-4 py-3 text-gray-400">{c.expiryDate || 'Never ends'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => removeCoupon(c.id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No coupons active.</td></tr>}
                  </tbody>
                </table>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
