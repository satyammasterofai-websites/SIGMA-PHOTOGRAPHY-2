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

export default function ManageSettings() {
  const [activeTab, setActiveTab] = useState<"general" | "coupons">("general");
  const { templates } = useSiteStore();

  // General State
  const [baseOnlineUsers, setBaseOnlineUsers] = useState(50);

  // Chat State
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can we help you today?");

  // WhatsApp State
  const [waNumber, setWaNumber] = useState("9162478070");
  const [waMessageFormat, setWaMessageFormat] = useState(
    "*Booking Request*\n\nTemplate: {template}\nTemplate ID: {templateId}\nOrder ID: {orderId}\n\n*Customer Details*\nName: {name}\nPhone: {phone}\n\n{details}",
  );
  const [waOrderingEnabled, setWaOrderingEnabled] = useState(true);
  const [paymentQRBase64, setPaymentQRBase64] = useState("");

  // Checkout State
  const [checkoutFormNote, setCheckoutFormNote] = useState(
    '📝 Important Instructions / महत्वपूर्ण निर्देश\nEnglish:\nFill Carefully: Please enter the details of your events exactly as you want them to appear on your invitation card.\nNot Applicable: If a specific ceremony is not happening, or if you wish to keep that information private, simply enter "0" or "N/A" in that field.\nAdditional Requests: If you have any extra details or special instructions to add, please use the "Other" section.\nहिंदी:\nध्यानपूर्वक भरें: आपके यहाँ जो-जो फंक्शन होने वाले हैं, उनकी सही जानकारी इस फॉर्म में भरें ताकि कार्ड में वही दिखाई दे।\nजानकारी न होने पर: यदि कोई फंक्शन आपके यहाँ नहीं है या आप उसकी जानकारी शेयर नहीं करना चाहते, तो उस बॉक्स में "0" या "N/A" लिख दें।\nअन्य जानकारी: यदि आप कोई अतिरिक्त जानकारी या स्पेशल नोट जोड़ना चाहते हैं, तो उसे "Other" वाले सेक्शन में लिख सकते हैं।\nThank you! If you face any issues while filling out the form, feel free to contact us. / धन्यवाद! यदि आपको फॉर्म भरने में कोई समस्या आए, तो हमसे संपर्क करें।',
  );

  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState<{
    code: string;
    percentage: string;
    expiryDate: string;
    maxPriceThreshold: string;
    excludedTemplates: string[];
  }>({
    code: "",
    percentage: "",
    expiryDate: "",
    maxPriceThreshold: "",
    excludedTemplates: [],
  });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "settings", "config"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.baseOnlineUsers !== undefined) {
            setBaseOnlineUsers(data.baseOnlineUsers);
          }
          if (data.whatsapp) {
            setWaNumber(data.whatsapp.number || "9162478070");
            setWaMessageFormat(
              data.whatsapp.messageFormat ||
                "*Booking Request*\n\nTemplate: {template}\nTemplate ID: {templateId}\nOrder ID: {orderId}\n\n*Customer Details*\nName: {name}\nPhone: {phone}\n\n{details}",
            );
            setWaOrderingEnabled(data.whatsapp.enabled !== false);
          }
          if (data.welcomeMessage) {
            setWelcomeMessage(data.welcomeMessage);
          }
          if (data.checkoutFormNote) {
            setCheckoutFormNote(data.checkoutFormNote);
          }
          if (data.coupons) {
            setCoupons(data.coupons || []);
          }
        }
      },
      () => {},
    );
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
        { merge: true },
      );
      toast.success("Settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    }
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPaymentQRBase64(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCoupon = async () => {
    if (!newCoupon.code || !newCoupon.percentage) return;
    const updated = [...coupons, { id: Date.now().toString(), ...newCoupon }];
    setCoupons(updated);
    setNewCoupon({ code: "", percentage: "", expiryDate: "", maxPriceThreshold: "", excludedTemplates: [] });
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
        <button
          onClick={() => saveSettings()}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-medium"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Tabs */}
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
          <Tag className="w-4 h-4" /> Discount Coupons
        </button>
      </div>

      {/* Tab Contents */}
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
              <p className="text-xs text-gray-500 mt-2">
                This message will be shown to users when they open the live chat.
              </p>
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
                  <p className="font-medium text-white">
                    Enable WhatsApp Ordering
                  </p>
                  <p className="text-sm text-gray-400">
                    Allow users to place orders directly via WhatsApp
                  </p>
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
                Message Format (Variables:{" "}
                {
                  "{template}, {templateId}, {orderId}, {name}, {phone}, {details}"
                }
                )
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
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-purple file:text-white hover:file:bg-purple-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Checkout Form Note
              </label>
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
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={newCoupon.code || ""}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="SUMMER50"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={newCoupon.percentage || ""}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, percentage: e.target.value })
                    }
                    placeholder="20"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newCoupon.expiryDate || ""}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, expiryDate: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-1/3">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Max Price Threshold (Valid if Price &lt;= X)
                  </label>
                  <input
                    type="number"
                    value={newCoupon.maxPriceThreshold || ""}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, maxPriceThreshold: e.target.value })
                    }
                    placeholder="e.g. 500"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Leave empty to apply to any price.</p>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Exclude Templates (Coupon not valid for these)
                  </label>
                  <select
                    multiple
                    value={newCoupon.excludedTemplates || []}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setNewCoupon({ ...newCoupon, excludedTemplates: options });
                    }}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 h-24"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.title || t.name} (₹{t.price})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">Hold Cmd/Ctrl to select multiple. Leave empty to apply to all (unless blocked by price threshold).</p>
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
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-bold text-white">
                        {c.code}
                        {(c.maxPriceThreshold || (c.excludedTemplates && c.excludedTemplates.length > 0)) && (
                          <div className="text-[10px] font-normal text-gray-500 mt-1">
                            {c.maxPriceThreshold && <span>Max Price: ₹{c.maxPriceThreshold} </span>}
                            {c.excludedTemplates && c.excludedTemplates.length > 0 && <span>Excluded: {c.excludedTemplates.length} templates</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-green-400">
                        {c.percentage}% OFF
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {c.expiryDate || "Never ends"}
                      </td>
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
                  {coupons.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-gray-500"
                      >
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
