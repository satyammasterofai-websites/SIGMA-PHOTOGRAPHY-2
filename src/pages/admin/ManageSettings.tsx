import React, { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useSiteStore } from "../../store/useSiteStore";
import {
  Plus,
  Trash2,
  Save,
  MessageSquare,
  Tag,
  Users,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import { useChatSound } from "../../hooks/useChatSound";

export default function ManageSettings() {
  const [activeTab, setActiveTab] = useState<"general" | "coupons">("general");
  const { soundEnabled, setSoundEnabled } = useChatSound();
  const [templateDiscounts, setTemplateDiscounts] = useState<Record<string, string>>({});
  const { templates, init } = useSiteStore();

  useEffect(() => {
    init();
  }, [init]);

  // General State
  const [baseOnlineUsers, setBaseOnlineUsers] = useState(50);
  
  // Chat State
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can we help you today?");
  
  // WhatsApp State
  const [waNumber, setWaNumber] = useState("9162478070");
  const [waMessageFormat, setWaMessageFormat] = useState(
    "*Booking Request*\n\nTemplate: {template}\nTemplate ID: {templateId}\nOrder ID: {orderId}\n\n*Customer Details*\nName: {name}\nPhone: {phone}\n\n{details}"
  );
  const [waOrderingEnabled, setWaOrderingEnabled] = useState(true);
  const [paymentQRBase64, setPaymentQRBase64] = useState("");

  // Checkout State
  const [checkoutFormNote, setCheckoutFormNote] = useState("");

  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    percentage: "",
    expiryDate: "",
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "config"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setBaseOnlineUsers(data.baseOnlineUsers || 50);
        setWaNumber(data.whatsapp?.number || "9162478070");
        setWaMessageFormat(
          data.whatsapp?.messageFormat ||
            "*Booking Request*\n\nTemplate: {template}\nTemplate ID: {templateId}\nOrder ID: {orderId}\n\n*Customer Details*\nName: {name}\nPhone: {phone}\n\n{details}"
        );
        setWaOrderingEnabled(data.whatsapp?.enabled ?? true);
        setWelcomeMessage(data.welcomeMessage || "Hello! How can we help you today?");
        setCheckoutFormNote(data.checkoutFormNote || "");
        setCoupons(data.coupons || []);
        setPaymentQRBase64(data.paymentQRBase64 || "");
      }
    });
    return () => unsub();
  }, []);

  const saveSettings = async (updatedCoupons?: any[]) => {
    try {
      const finalCoupons = Array.isArray(updatedCoupons) ? updatedCoupons : coupons;
      await setDoc(
        doc(db, "settings", "config"),
        {
          baseOnlineUsers: Number(baseOnlineUsers),
          whatsapp: {
            number: waNumber,
            messageFormat: waMessageFormat,
            enabled: waOrderingEnabled,
          },
          welcomeMessage,
          checkoutFormNote,
          coupons: finalCoupons,
          paymentQRBase64,
        },
        { merge: true }
      );
      toast.success("Settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    }
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (ev) => {
        img.src = ev.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setPaymentQRBase64(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const addCoupon = async () => {
    if (!newCoupon.code || !newCoupon.percentage) return;
    const updated = [...coupons, { id: Date.now().toString(), ...newCoupon, isTemplateSpecific: false }];
    setCoupons(updated);
    setNewCoupon({ code: "", percentage: "", expiryDate: "" });
    await saveSettings(updated);
  };

  const removeCoupon = async (id: string) => {
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    await saveSettings(updated);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">System Settings</h1>
          <p className="text-brand-slate mt-1">
            Manage global configurations for checkout.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === "general" ? "border-brand-electric text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
        >
          <Settings className="w-4 h-4" /> General Settings
        </button>
        <button
          onClick={() => setActiveTab("coupons")}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === "coupons" ? "border-brand-electric text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
        >
          <Tag className="w-4 h-4" /> Global Coupons
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
        {activeTab === "general" && (
          <div className="space-y-6 max-w-2xl">
            <div className="pb-6 border-b border-gray-800">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Base Online Users (Default is 50)
              </label>
              <input
                type="number"
                value={baseOnlineUsers}
                onChange={(e) => setBaseOnlineUsers(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3"
              />
            </div>
            
            <div className="pb-6 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-electric" />
                  Chat Sound Effects
                </label>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-electric focus:ring-offset-2 focus:ring-offset-gray-900 ${soundEnabled ? 'bg-brand-electric' : 'bg-gray-700'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Play a sound when receiving a new message.</p>
            </div>
            
            <div className="pb-6 border-b border-gray-800">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-electric" />
                Live Chat Welcome Message
              </label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={3}
                placeholder="Hello! How can we help you today?"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waOrderingEnabled}
                  onChange={(e) => setWaOrderingEnabled(e.target.checked)}
                  className="rounded border-gray-700 bg-gray-800 w-5 h-5"
                />
                <div>
                  <p className="font-medium text-white">Enable WhatsApp Ordering</p>
                </div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                WhatsApp Business Number (with country code)
              </label>
              <input
                type="text"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                placeholder="9162478070"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message Format
              </label>
              <textarea
                rows={8}
                value={waMessageFormat}
                onChange={(e) => setWaMessageFormat(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 resize-none font-mono text-sm"
              />
            </div>

            <div className="pb-6 mb-6 border-b border-gray-800">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Advance Payment QR Code
              </label>
              <div className="flex items-center gap-4">
                {paymentQRBase64 && (
                  <img src={paymentQRBase64} alt="QR Code" className="w-24 h-24 object-cover rounded-xl border border-gray-700 bg-gray-800" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="block w-full text-sm text-gray-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Checkout Form Note
                </label>
                <button
                  onClick={() => saveSettings()}
                  className="bg-brand-electric hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save General Settings
                </button>
              </div>
              <textarea
                rows={8}
                value={checkoutFormNote}
                onChange={(e) => setCheckoutFormNote(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 resize-none font-sans text-sm"
              />
            </div>
          </div>
        )}

        {activeTab === "coupons" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 bg-gray-800/50 p-6 rounded-xl border border-gray-800">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full md:w-1/3">
                  <label className="block text-xs font-medium text-gray-400 mb-2">Coupon Code</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. ALLFESTIVAL"
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                </div>
                <div className="flex-1 w-full md:w-1/3">
                  <label className="block text-xs font-medium text-gray-400 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={newCoupon.percentage}
                    onChange={(e) => setNewCoupon({ ...newCoupon, percentage: e.target.value })}
                    placeholder="e.g. 15"
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                </div>
                <div className="flex-1 w-full md:w-1/3">
                  <label className="block text-xs font-medium text-gray-400 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                </div>
                <div className="w-full md:w-auto mt-6">
                  <button
                    onClick={addCoupon}
                    className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-medium flex items-center justify-center gap-2 h-[42px]"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Expiry</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {coupons.filter(c => !c.isTemplateSpecific).map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-bold text-white">{c.code}</td>
                      <td className="px-4 py-3 text-green-400">{c.percentage}% OFF</td>
                      <td className="px-4 py-3 text-gray-400">{c.expiryDate || "Never ends"}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => removeCoupon(c.id)}
                          className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {coupons.filter(c => !c.isTemplateSpecific).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                        No coupons active.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
