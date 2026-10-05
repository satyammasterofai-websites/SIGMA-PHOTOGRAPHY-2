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
  Eye,
  EyeOff,
  Video,
  Clock,
  Globe,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  PhoneCall,
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
  const [selfVideoEditingEnabled, setSelfVideoEditingEnabled] = useState(true);
  const [timelineVisibility, setTimelineVisibility] = useState<"admin" | "public" | "hidden">("admin");
  const [websiteInvitationHidden, setWebsiteInvitationHidden] = useState(false);
  
  // Chat State
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can we help you today?");
  
  // WhatsApp State
  const [waNumber, setWaNumber] = useState("9162478070");
  const [waAlternativeNumber, setWaAlternativeNumber] = useState("9973482994");
  const [waRoutingStats, setWaRoutingStats] = useState<any>(null);
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
        const isEnabled = data.selfVideoEditingEnabled !== false && !data.hideSelfVideoEditor;
        setSelfVideoEditingEnabled(isEnabled);
        try {
          localStorage.setItem('sigma_hide_self_video_editor', (!isEnabled).toString());
          localStorage.setItem('sigma_self_video_editing_enabled', isEnabled.toString());
        } catch (e) {
          // ignore
        }
        if (data.timelineVisibility) {
          setTimelineVisibility(data.timelineVisibility);
        } else if (data.showTimelineToPublic) {
          setTimelineVisibility("public");
        } else if (data.hideTimeline) {
          setTimelineVisibility("hidden");
        }
        setWebsiteInvitationHidden(data.websiteInvitationHidden === true);
        setWaNumber(data.whatsapp?.number || "9162478070");
        setWaAlternativeNumber(data.whatsapp?.alternativeNumber || "9973482994");
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

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "whatsapp_routing"), (snap) => {
      if (snap.exists()) {
        setWaRoutingStats(snap.data());
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
          selfVideoEditingEnabled,
          hideSelfVideoEditor: !selfVideoEditingEnabled,
          websiteInvitationHidden,
          timelineVisibility,
          showTimelineToPublic: timelineVisibility === "public",
          hideTimeline: timelineVisibility === "hidden",
          whatsapp: {
            number: waNumber,
            alternativeNumber: waAlternativeNumber,
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

  const toggleWebsiteInvitationCategory = async () => {
    const next = !websiteInvitationHidden;
    setWebsiteInvitationHidden(next);
    try {
      localStorage.setItem("sigma_hide_website_invitation", next.toString());
      await setDoc(
        doc(db, "settings", "config"),
        {
          websiteInvitationHidden: next,
        },
        { merge: true }
      );
      if (!next) {
        toast.success("Website Invitation category is now LIVE & visible on website!");
      } else {
        toast.success("Website Invitation category is now HIDDEN from visitors.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update website category visibility");
      setWebsiteInvitationHidden(!next);
    }
  };

  const toggleSelfVideoTool = async () => {
    const next = !selfVideoEditingEnabled;
    setSelfVideoEditingEnabled(next);
    try {
      localStorage.setItem('sigma_hide_self_video_editor', (!next).toString());
      localStorage.setItem('sigma_self_video_editing_enabled', next.toString());
      await setDoc(
        doc(db, "settings", "config"),
        {
          selfVideoEditingEnabled: next,
          hideSelfVideoEditor: !next,
        },
        { merge: true }
      );
      if (next) {
        toast.success("Self Video Editing section is now LIVE on website!");
      } else {
        toast.success("Self Video Editing section is now completely HIDDEN from website.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update visibility");
      setSelfVideoEditingEnabled(!next);
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
    const updated = [...coupons, { id: Date.now().toString() + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), ...newCoupon, isTemplateSpecific: false }];
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
            {/* Self Video Editing Tool Visibility Toggle */}
            <div className="pb-6 border-b border-gray-800 bg-gray-800/40 p-5 rounded-2xl border border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-indigo-400" />
                    <label className="text-base font-bold text-white">
                      Self Video Editing Tool (Website Section)
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 max-w-lg">
                    Show or completely hide the self video editing interactive tool from the website and homepage. When hidden, visitors will not see or access this section at all.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    {selfVideoEditingEnabled ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Eye className="w-3.5 h-3.5" /> Tool is LIVE on Website
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <EyeOff className="w-3.5 h-3.5" /> Tool is COMPLETELY HIDDEN
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSelfVideoTool}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer ${
                    selfVideoEditingEnabled
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {selfVideoEditingEnabled ? (
                    <>
                      <EyeOff className="w-4 h-4" /> Hide from Website
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Unhide to Website
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Website Invitation Category Visibility Card */}
            <div className="pb-6 border-b border-gray-800 bg-gray-800/40 p-5 rounded-2xl border border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <label className="text-base font-bold text-white">
                      Website Invitation Category Visibility
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 max-w-lg">
                    Show or completely hide the Website Invitation Category from the website homepage and gallery. When hidden, regular visitors will not see this category or its interactive templates.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    {!websiteInvitationHidden ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Eye className="w-3.5 h-3.5" /> Category is LIVE on Website
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <EyeOff className="w-3.5 h-3.5" /> Category is COMPLETELY HIDDEN
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleWebsiteInvitationCategory}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer ${
                    !websiteInvitationHidden
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {!websiteInvitationHidden ? (
                    <>
                      <EyeOff className="w-4 h-4" /> Hide Category
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Unhide Category
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Template Timeline & Date Visibility Card */}
            <div className="pb-6 border-b border-gray-800 bg-gray-800/40 p-5 rounded-2xl border border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <label className="text-base font-bold text-white">
                      Template Timeline & Creation Date/Time Visibility
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 max-w-lg">
                    Control who can see the timeline filter column (All Releases, Newly Created, This Week, This Month) and template creation timestamps on the template selection page.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    {timelineVisibility === "public" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Eye className="w-3.5 h-3.5" /> Visible to All Visitors (Public)
                      </span>
                    ) : timelineVisibility === "hidden" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <EyeOff className="w-3.5 h-3.5" /> Completely Hidden
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Eye className="w-3.5 h-3.5" /> Admin Only (Default - Hidden from Visitors)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={timelineVisibility}
                    onChange={async (e) => {
                      const val = e.target.value as any;
                      setTimelineVisibility(val);
                      localStorage.setItem("sigma_timeline_visibility", val);
                      try {
                        await setDoc(
                          doc(db, "settings", "config"),
                          {
                            timelineVisibility: val,
                            showTimelineToPublic: val === "public",
                            hideTimeline: val === "hidden",
                          },
                          { merge: true }
                        );
                        toast.success(`Timeline visibility updated to ${val}`);
                      } catch (err) {
                        toast.error("Failed to update visibility");
                      }
                    }}
                    className="bg-gray-900 border border-gray-700 text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="admin">Admin Only (Default)</option>
                    <option value="public">Unhide for Public (All Visitors)</option>
                    <option value="hidden">Hide Completely</option>
                  </select>
                </div>
              </div>
            </div>

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
            
            {/* Alternating WhatsApp Redirect Routing Settings */}
            <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-emerald-400" />
                  <label className="text-base font-bold text-white">
                    WhatsApp Order Redirection (Alternating Numbers)
                  </label>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Alternating Load Balancing Active
                </span>
              </div>

              <p className="text-xs text-gray-400">
                When a user places an order, the website redirects them to the Official WhatsApp number. When the simultaneous or next 2nd user orders after the 1st person, they are automatically redirected to the Alternative WhatsApp number (<strong>9973482994</strong>), alternating seamlessly on every order.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-900/80 border border-gray-700/80 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      1st WhatsApp Number (Official)
                    </label>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded">
                      Orders 1, 3, 5, 7...
                    </span>
                  </div>
                  <input
                    type="text"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    placeholder="9162478070"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Official primary booking phone number.
                  </p>
                </div>

                <div className="bg-gray-900/80 border border-purple-500/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      2nd WhatsApp Number (Alternative)
                    </label>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 font-semibold px-2 py-0.5 rounded">
                      Orders 2, 4, 6, 8...
                    </span>
                  </div>
                  <input
                    type="text"
                    value={waAlternativeNumber}
                    onChange={(e) => setWaAlternativeNumber(e.target.value)}
                    placeholder="9973482994"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Alternative redirect phone number for simultaneous/alternate orders.
                  </p>
                </div>
              </div>

              {/* Real-time Rotation Status Bar */}
              <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-300">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <span className="text-gray-500">Total orders routed:</span>{" "}
                    <strong className="text-white font-mono text-sm">
                      {waRoutingStats?.totalOrdersCount || 0}
                    </strong>
                  </div>
                  <div className="hidden sm:block text-gray-700">|</div>
                  <div>
                    <span className="text-gray-500">Last routed to:</span>{" "}
                    <span className="font-semibold text-purple-300">
                      {waRoutingStats?.lastRoutingSlot === "alternative"
                        ? `Alternative (${waRoutingStats?.lastAssignedNumber || waAlternativeNumber})`
                        : `Official (${waRoutingStats?.lastAssignedNumber || waNumber})`}
                    </span>
                  </div>
                  <div className="hidden sm:block text-gray-700">|</div>
                  <div>
                    <span className="text-gray-500">Next order will route to:</span>{" "}
                    <span className="font-bold text-emerald-400">
                      {(Number(waRoutingStats?.totalOrdersCount) || 0) % 2 === 0
                        ? `Official Line (${waNumber})`
                        : `Alternative Line (${waAlternativeNumber})`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await setDoc(
                        doc(db, "settings", "whatsapp_routing"),
                        { totalOrdersCount: 0, lastRoutingSlot: "Reset", updatedAt: new Date().toISOString() },
                        { merge: true }
                      );
                      toast.success("Routing rotation reset to 1st Official number");
                    } catch (e) {
                      toast.error("Failed to reset rotation");
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] flex items-center gap-1 transition-colors border border-gray-700 cursor-pointer shrink-0"
                  title="Reset rotation to start with 1st Official number"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Rotation
                </button>
              </div>
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
                  {coupons.filter(c => !c.isTemplateSpecific).map((c, index) => (
                    <tr key={`${c.id}-${index}`}>
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
