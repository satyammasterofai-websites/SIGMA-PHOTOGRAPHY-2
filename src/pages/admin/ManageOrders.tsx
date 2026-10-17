import React, { useState, useEffect } from "react";
import { collection, getDocs, onSnapshot, addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Trash2,
  Edit,
  ChevronDown,
  CheckCircle,
  Package,
  Link as LinkIcon,
  Download, Search,
  Palette,
  MessageSquare,
  Sparkles,
  ExternalLink,
  FileText,
} from "lucide-react";
import { FormatOrderData } from "../../components/FormatOrderData";
import toast from "react-hot-toast";
import VideoModal from "../../components/VideoModal";
import { Play } from "lucide-react";

export default function ManageOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [templateMap, setTemplateMap] = useState<Record<string, string>>({});
  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const assignDesignerToOrder = async (orderId: string, designerId: string) => {
    try {
      const selected = designers.find(d => d.id === designerId);
      const updateData: any = {
        assignedDesignerId: selected ? selected.id : null,
        assignedDesignerName: selected ? selected.name : null,
        assignedDesignerPhone: selected ? selected.whatsapp : null,
        assignedAt: selected ? new Date().toISOString() : null,
      };

      const existingOrder = orders.find(o => o.id === orderId);
      if (selected && (!existingOrder?.designerStatus || existingOrder?.designerStatus === 'Unassigned')) {
        updateData.designerStatus = 'Assigned';
      }

      await updateDoc(doc(db, "orders", orderId), updateData);

      // Mirror to content/assigned_orders/items without any customer price or amount
      if (selected && existingOrder) {
        const designerCopy: any = {
          ...existingOrder,
          ...updateData,
          id: orderId,
        };
        // Explicitly strip customer sensitive financial data
        delete designerCopy.price;
        delete designerCopy.amount;
        delete designerCopy.finalPrice;
        delete designerCopy.advancePayment;
        delete designerCopy.paymentStatus;
        delete designerCopy.advancePaymentStatus;
        await setDoc(doc(db, "content", "assigned_orders", "items", orderId), designerCopy, { merge: true }).catch(console.warn);
      } else if (!selected) {
        await deleteDoc(doc(db, "content", "assigned_orders", "items", orderId)).catch(() => {});
      }

      toast.success(selected ? `Order assigned to ${selected.name}` : 'Order unassigned');

      if (selected && existingOrder) {
        // Create user notification for designer
        createNotification(
          selected.id,
          "New Order Assigned",
          `Order #${existingOrder.displayId || existingOrder.id.slice(-8)} has been assigned to you.`,
          orderId
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to assign designer");
    }
  };

  const sendOrderToDesignerWhatsApp = (order: any) => {
    const designer = designers.find(d => d.id === order.assignedDesignerId);
    const phone = designer?.whatsapp || order.assignedDesignerPhone;

    if (!phone) {
      toast.error("Please assign a registered designer first before sending to WhatsApp.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Designer WhatsApp number is invalid.");
      return;
    }

    // Format Custom Data into human readable summary
    let customSummary = "";
    if (order.customData && typeof order.customData === "object") {
      const cd = order.customData;
      const parts: string[] = [];

      if (cd.groom) {
        const g = cd.groom;
        parts.push(`*Groom:* ${g.name || ''} ${g.parents ? `(S/o ${g.parents})` : ''}`.trim());
      }
      if (cd.bride) {
        const b = cd.bride;
        parts.push(`*Bride:* ${b.name || ''} ${b.parents ? `(D/o ${b.parents})` : ''}`.trim());
      }
      if (cd.events && Array.isArray(cd.events)) {
        parts.push(`*Itinerary & Functions:*`);
        cd.events.forEach((ev: any, i: number) => {
          parts.push(`  ${i + 1}. *${ev.name || 'Event'}*: ${ev.date || ''} ${ev.time || ''} @ ${ev.venue || ''}`.trim());
        });
      }

      // Add remaining custom keys
      Object.entries(cd).forEach(([key, val]) => {
        if (key !== "groom" && key !== "bride" && key !== "events" && val) {
          const prettyKey = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          const prettyVal = typeof val === "object" ? JSON.stringify(val) : String(val);
          parts.push(`*${prettyKey}:* ${prettyVal}`);
        }
      });

      customSummary = parts.join("\n");
    }

    const messageLines = [
      `🎨 *SIGMA PHOTOGRAPHY - ORDER ASSIGNMENT* 🎨`,
      ``,
      `Hello ${order.assignedDesignerName || designer?.name || 'Designer'}, you have been assigned an invitation order:`,
      ``,
      `📋 *Order ID:* #${order.displayId || order.id.slice(-8)}`,
      `✨ *Template:* ${order.templateName || 'Custom Video'} ${order.templateDisplayId ? `(#${order.templateDisplayId})` : ''}`,
      `👤 *Customer Name:* ${order.customerName || 'N/A'}`,
      `📞 *Customer Phone:* ${order.customerPhone || 'N/A'}`,
      order.designerPayout ? `💰 *Designer Fee / Payout:* ₹${order.designerPayout}` : '',
      order.hasUploadedInvitationCard ? `💌 *Wedding Card / Hard Copy:* Attached in Designer Portal` : '',
      order.filesCount ? `📁 *Reference Files:* ${order.filesCount} attached file(s)` : '',
      order.videoUrl ? `🎥 *Template Reference Demo:*\n${order.videoUrl}` : '',
      ``,
      `📝 *CLIENT REQUIREMENTS & DETAILS:*`,
      customSummary || 'Please check order requirements in your Designer Portal.',
      ``,
      `⚡ *Work Status:* ${order.designerStatus || 'Assigned'}`,
      `🔗 *Open Designer Portal:*\n${window.location.origin}/designer`,
      ``,
      `Please review the requirements in your dashboard, download customer assets, and submit the finished video/design link once completed! 🙏`
    ].filter(Boolean);

    const fullMessage = messageLines.join("\n");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`;
    window.open(waUrl, "_blank");

    // Stamp designerNotifiedAt
    updateDoc(doc(db, "orders", order.id), {
      designerNotifiedAt: new Date().toISOString()
    }).catch(console.error);

    toast.success(`WhatsApp opened for ${order.assignedDesignerName || designer?.name || 'designer'}!`);
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedOrders.length === 0) return;
    try {
      const promises = selectedOrders.map(async (id) => {
        const order = orders.find(o => o.id === id);
        await updateDoc(doc(db, "orders", id), { status });
        if (order?.userId) {
          await createNotification(order.userId, "Order Status Updated", `Your order status has been updated to ${status}.`, id);
        }
      });
      await Promise.all(promises);
      setSelectedOrders([]);
    } catch (e) {
      console.error(e);
    }
  };

  const bulkDeleteOrders = async () => {
    if (selectedOrders.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) return;
    try {
      const promises = selectedOrders.map(id => deleteDoc(doc(db, "orders", id)));
      await Promise.all(promises);
      setSelectedOrders([]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // 1. Fetch templates
    const fetchTemplates = async () => {
      try {
        const snap = await getDocs(collection(db, "templates"));
        const map: Record<string, string> = {};
        const list: any[] = [];
        snap.docs.forEach(d => {
          const data = d.data();
          list.push({ id: d.id, ...data });
          map[d.id] = data.displayId || d.id.slice(-8);
        });
        setTemplatesList(list);
        setTemplateMap(map);
      } catch (e) {
        console.error("Failed to fetch templates for map", e);
      }
    };
    fetchTemplates();

    // 2. Fetch approved designers with resilient fallback
    const unsubDesigners = onSnapshot(collection(db, "designers"), (snap) => {
      const dList = snap.docs
        .map(d => ({ id: d.id, ...d.data() as any }))
        .filter(d => (d.status === 'approved' || d.role === 'designer') && d.active !== false);
      if (dList.length > 0) {
        setDesigners(dList);
      }
    }, (err) => {
      console.warn("Designers collection listener note:", err?.message);
    });

    const unsubContentDesigners = onSnapshot(collection(db, "content", "designers", "items"), (snap) => {
      const dList = snap.docs
        .map(d => ({ id: d.id, ...d.data() as any }))
        .filter(d => (d.status === 'approved' || d.role === 'designer') && d.active !== false);
      if (dList.length > 0) {
        setDesigners(prev => {
          const map = new Map<string, any>();
          prev.forEach(d => map.set(d.id, d));
          dList.forEach(d => map.set(d.id, { ...map.get(d.id), ...d }));
          return Array.from(map.values());
        });
      }
    }, (err) => {
      console.warn("content/designers/items listener note:", err?.message);
    });
    
    // 3. Listen to orders (newest first)
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setOrders(
          snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })).filter(o => o.type !== "service_enquiry")
        );
      },
      (error) => {
        console.error("Error fetching orders:", error);
        // Fallback if index missing
        const fallbackUnsub = onSnapshot(
          collection(db, "orders"),
          (snapshot) => {
            const list = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as any),
            })).filter(o => o.type !== "service_enquiry");
            list.sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime(),
            );
            setOrders(list);
          },
          () => {},
        );
        return () => fallbackUnsub();
      },
    );
    return () => {
      unsub();
      unsubDesigners();
      unsubContentDesigners();
    };
  }, []);

  const deleteOrder = async () => {
    if (!deleteOrderId) return;
    try {
      await deleteDoc(doc(db, "orders", deleteOrderId));
      toast.success("Order deleted");
      setDeleteOrderId(null);
    } catch (e) {
      toast.error("Failed to delete order");
      setDeleteOrderId(null);
    }
  };

  
  const createNotification = async (userId: string, title: string, message: string, orderId: string) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, "userNotifications"), {
        userId,
        title,
        message,
        orderId,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error creating notification", e);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      toast.success("Status updated");
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const updatePaymentStatus = async (id: string, newPaymentStatus: string, userId?: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { paymentStatus: newPaymentStatus });
      toast.success(`Payment status updated to ${newPaymentStatus}`);
      if (userId) {
        await createNotification(userId, "Payment Status Updated", `Your order payment status is now ${newPaymentStatus}.`, id);
      }
    } catch (e) {
      toast.error("Failed to update payment status");
    }
  };

  const updateAdvancePaymentStatus = async (id: string, newAdvanceStatus: string, userId?: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { advancePaymentStatus: newAdvanceStatus });
      toast.success(`Advance payment status updated to ${newAdvanceStatus}`);
      if (userId) {
        await createNotification(userId, "Advance Payment Updated", `Your order advance payment status is now ${newAdvanceStatus}.`, id);
      }
    } catch (e) {
      toast.error("Failed to update advance payment status");
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string, userId?: string) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status: newStatus
      });
      toast.success(`Order status updated to ${newStatus}`);
      if (userId) {
        await createNotification(userId, "Order Status Updated", `Your order status has been updated to ${newStatus}.`, id);
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const saveDownloadUrl = async (id: string, userId?: string) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        downloadUrl,
        status: "Delivered",
      });
      toast.success("Download link dispatched & marked Delivered");
      if (userId) {
        await createNotification(userId, "Order Delivered", `Your order has been delivered! A download link is now available.`, id);
      }
      setDownloadUrl("");
    } catch (e) {
      toast.error("Update failed");
    }
  };
  const filteredOrders = orders.filter(o => {
    const searchLower = (searchQuery || '').toLowerCase();
    const matchesSearch = searchQuery === '' || 
        (o.displayId || '').toLowerCase().includes(searchLower) ||
        (o.id || '').toLowerCase().includes(searchLower) ||
      (o.customerInfo?.name || '').toLowerCase().includes(searchLower) ||
      (o.customerInfo?.email || '').toLowerCase().includes(searchLower) ||
      (o.customerInfo?.phone || '').toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;
    if (activeTab === 'All') return true;
    const st = o.status || 'Pending';
    if (activeTab === 'Pending') return st === 'Pending' || st === 'Processing';
    if (activeTab === 'Completed') return st === 'Completed' || st === 'Delivered';
    return true;
  });

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  return (
    <div className="w-full">
      {previewVideoUrl && <VideoModal url={previewVideoUrl} onClose={() => setPreviewVideoUrl(null)} />}
      {deleteOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-2">Delete Order</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this order? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteOrderId(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={deleteOrder}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
            <h1 className="text-2xl font-bold text-brand-navy mb-6">Order Management</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by ID, customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
          />
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between">
          <span className="text-indigo-400 font-medium">
            {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button onClick={() => {
              toast.promise(bulkUpdateStatus("Processing"), { loading: 'Updating...', success: 'Orders approved (Processing)', error: 'Failed' });
            }} className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors">
              Approve Selected
            </button>
            <button onClick={() => {
              toast.promise(bulkDeleteOrders(), { loading: 'Deleting...', success: 'Orders deleted', error: 'Failed' });
            }} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors">
              Delete Selected
            </button>
          </div>
        </div>
      )}
      
      {/* Order Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin scrollbar-thumb-gray-800">
        <button
          onClick={() => setActiveTab('All')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'All' ? 'bg-indigo-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          All Orders
        </button>
        <button
          onClick={() => setActiveTab('Pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'Pending' ? 'bg-indigo-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          Pending / Processing
        </button>
        <button
          onClick={() => setActiveTab('Completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'Completed' ? 'bg-indigo-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          Completed / Delivered
        </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700 hover:border-gray-600"
          >
            <input 
              type="checkbox" 
              checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-800 pointer-events-none"
            />
            Select All
          </button>
        </div>
      </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No orders found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-gray-800/50 rounded-2xl border border-gray-800 overflow-hidden flex flex-col hover:border-gray-700 transition-colors">
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-800"
                      />
                    <div>
                      <div className="text-xs text-gray-500 font-mono mb-1">#{order.displayId || order.id.slice(-8)}</div>
                      <div className="font-bold text-white text-lg">{order.customerName || order.customerEmail || "N/A"}</div>
                      <div className="text-gray-400 text-sm">{order.customerPhone || "No Phone"}</div>
                    </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="font-bold text-emerald-400 text-lg">₹{order.price || order.amount || 0}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-xl border border-gray-800/50">
                    {order.thumbnailBase64 && (
                      <div 
                        className={`relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-gray-700 bg-gray-800 ${order.videoUrl ? 'cursor-pointer group' : ''}`}
                        onClick={() => order.videoUrl && setPreviewVideoUrl(order.videoUrl)}
                      >
                        <img src={order.thumbnailBase64} alt={order.templateName} className="w-full h-full object-cover" />
                        {order.videoUrl && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 text-white" fill="white" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-white text-sm">{order.templateName || "Custom Template"}</span>
                      {order.templateId && templateMap[order.templateId] && (
                        <span className="text-xs font-mono text-gray-400 mt-0.5">#{templateMap[order.templateId]}</span>
                      )}
                      {order.videoUrl && (
                        <button onClick={() => setPreviewVideoUrl(order.videoUrl)} className="text-xs text-brand-electric hover:underline flex items-center gap-1 mt-1 text-left">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          Live Preview
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Designer Assignment & WhatsApp Integration */}
                  {(() => {
                    const template = templatesList.find(t => t.id === order.templateId);
                    return (
                      <div className="bg-gray-900/80 rounded-xl p-3 border border-purple-500/20 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold text-gray-300">Designer:</span>
                            {order.assignedDesignerName ? (
                              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                                {order.assignedDesignerName} ({order.assignedDesignerPhone || 'N/A'})
                              </span>
                            ) : (
                              <span className="text-xs text-amber-400 italic font-medium">Unassigned</span>
                            )}
                          </div>

                          {order.designerStatus && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              order.designerStatus === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              Work: {order.designerStatus}
                            </span>
                          )}
                        </div>

                        {/* Dropdown & Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={order.assignedDesignerId || ""}
                            onChange={(e) => assignDesignerToOrder(order.id, e.target.value)}
                            className="flex-1 min-w-[150px] bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                          >
                            <option value="">-- Assign Designer --</option>
                            {designers.map(d => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.whatsapp}) {template?.assignedDesignerId === d.id ? '★ (Template Lead)' : ''}
                              </option>
                            ))}
                          </select>

                          {/* Quick assign recommended template lead */}
                          {template?.assignedDesignerId && order.assignedDesignerId !== template.assignedDesignerId && (
                            <button
                              type="button"
                              onClick={() => assignDesignerToOrder(order.id, template.assignedDesignerId)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-colors shrink-0"
                              title="Assign template lead designer"
                            >
                              ⚡ Assign {template.assignedDesignerName || 'Template Lead'}
                            </button>
                          )}

                          {/* Send Order to Designer via WhatsApp */}
                          <button
                            type="button"
                            onClick={() => sendOrderToDesignerWhatsApp(order)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                            title="Open WhatsApp with full customer order & requirements"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-white" />
                            <span>Send Order to Designer</span>
                          </button>
                        </div>

                        {/* Manual Designer Fee Input */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-800 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-medium">Designer Fee / Payout (₹):</span>
                            <input
                              type="number"
                              placeholder="e.g. 500 (Optional)"
                              defaultValue={order.designerPayout || ""}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                const num = val ? Number(val) : null;
                                if (num !== order.designerPayout) {
                                  updateDoc(doc(db, "orders", order.id), {
                                    designerPayout: num
                                  }).then(() => {
                                    setDoc(doc(db, "content", "assigned_orders", "items", order.id), {
                                      designerPayout: num
                                    }, { merge: true }).catch(() => {});
                                    toast.success("Designer payout fee updated");
                                  }).catch(console.error);
                                }
                              }}
                              className="w-32 bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-amber-300 placeholder-gray-500 outline-none"
                            />
                            <span className="text-[10px] text-gray-500 italic">(Sent to designer on WhatsApp/Portal if set)</span>
                          </div>
                        </div>

                        {/* Customer Uploaded Shadi Ka Card / Hard Copy Preview */}
                        {(order.hasUploadedInvitationCard || order.invitationCardUrl || (order.invitationCardUrls && order.invitationCardUrls.length > 0)) && (
                          <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/30 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                                    <span>💌 Customer Uploaded Shadi Ka Card {order.invitationCardCount ? `(${order.invitationCardCount} Photos)` : ""}</span>
                                  </span>
                                  <span className="text-[11px] text-gray-400 block truncate">
                                    {order.invitationCardName || "Wedding invitation card photo(s) attached"}
                                  </span>
                                </div>
                              </div>
                              {order.invitationCardUrl && (!order.invitationCardUrls || order.invitationCardUrls.length <= 1) && (
                                <a
                                  href={order.invitationCardUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shrink-0 flex items-center gap-1 shadow-sm transition-colors"
                                >
                                  <span>View Card</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            {/* If multiple card photos, display thumbnails */}
                            {order.invitationCardUrls && order.invitationCardUrls.length > 0 && (
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                                {order.invitationCardUrls.map((url: string, pIdx: number) => (
                                  <a
                                    key={pIdx}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-rose-900/30 border border-rose-500/40 hover:border-rose-400 block transition"
                                  >
                                    <img
                                      src={url}
                                      alt={`Card Photo ${pIdx + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-white text-[9px] font-bold">
                                      Photo #{pIdx + 1}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Designer submitted link alert */}
                        {order.designerDeliveryLink && (
                          <div className="p-2.5 bg-emerald-950/40 rounded-lg border border-emerald-500/30 text-xs">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-emerald-300 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                Designer Output Ready:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setDownloadUrl(order.designerDeliveryLink);
                                  saveDownloadUrl(order.id, order.userId);
                                }}
                                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline"
                              >
                                Accept as Final Customer Link →
                              </button>
                            </div>
                            <a
                              href={order.designerDeliveryLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline break-all block"
                            >
                              {order.designerDeliveryLink}
                            </a>
                            {order.designerNotes && (
                              <p className="text-gray-300 text-[11px] mt-1 italic">
                                Note: "{order.designerNotes}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  <div className="flex items-center justify-between mt-2">
                    <select
                      value={order.status || "Pending"}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value, order.userId)}
                      className={`bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none ${order.status === "Delivered" ? "text-purple-400" : order.status === "Completed" ? "text-green-400" : order.status === "Cancelled" ? "text-red-400" : "text-yellow-400"}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Editing">Editing</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${expandedId === order.id ? "bg-indigo-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                      >
                        {expandedId === order.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button
                        onClick={() => setDeleteOrderId(order.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="border-t border-gray-800 p-5 bg-gray-900/30 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 block text-xs mb-1">Via Method</span>
                        <span className="text-white font-medium">{order.viaMethod || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs mb-1">Template Preview</span>
                        {order.videoUrl ? (
                          <button onClick={() => setPreviewVideoUrl(order.videoUrl)} className="text-sm text-brand-electric hover:underline flex items-center gap-1 text-left font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            Live Preview
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Not available</span>
                        )}
                      </div>
                      <div className="hidden">
                        <span className="text-gray-500 block text-xs mb-1">Via Method</span>
                        <span className="text-white font-medium">{order.viaMethod || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs mb-1">Payment Status</span>
                        <select
                          value={order.paymentStatus || "Pending"}
                          onChange={(e) => updatePaymentStatus(order.id, e.target.value, order.userId)}
                          className={`bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm font-medium focus:outline-none ${order.paymentStatus === "Received" || order.paymentStatus === "Paid Online" || order.paymentStatus === "Full Amount Received" ? "text-green-400" : order.paymentStatus === "Advance Payment Received" ? "text-blue-400" : order.paymentStatus === "Pending Verification" ? "text-yellow-400" : "text-orange-400"}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Pending Verification">Pending Verification</option>
                          <option value="Received">Received</option>
                          <option value="Paid Online">Paid Online</option>
                          <option value="Advance Payment Received">Advance Payment Received</option>
                          <option value="Full Amount Received">Full Amount Received</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>
                      {(order.advancePayment > 0 || order.advancePaymentStatus) && (
                        <div>
                          <span className="text-gray-500 block text-xs mb-1">Advance (₹{order.advancePayment || 0})</span>
                          <select
                            value={order.advancePaymentStatus || "Pending"}
                            onChange={(e) => updateAdvancePaymentStatus(order.id, e.target.value, order.userId)}
                            className={`bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm font-medium focus:outline-none ${order.advancePaymentStatus === "Received" ? "text-green-400" : order.advancePaymentStatus === "Not Received" ? "text-red-400" : "text-yellow-400"}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Received">Received</option>
                            <option value="Not Received">Not Received</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {order.customData && Object.keys(order.customData).length > 0 && (
                      <div className="mt-4">
                        <span className="text-gray-500 block text-xs mb-2">Customization Data</span>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                          <FormatOrderData data={order.customData} theme="dark" templateId={order.templateId} />
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <span className="text-gray-500 block text-xs mb-3">Delivery Link</span>
                      {order.downloadUrl ? (
                        <div className="space-y-3">
                          <a href={order.downloadUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline break-all block text-sm">
                            {order.downloadUrl}
                          </a>
                          <button
                            onClick={() => setPreviewVideoUrl(order.downloadUrl)}
                            className="flex items-center justify-center w-full gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-green-500/20"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Preview Video
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs italic mb-3">No link attached yet.</p>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <input
                          type="url"
                          placeholder="Paste final video URL..."
                          value={downloadUrl}
                          onChange={(e) => setDownloadUrl(e.target.value)}
                          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => saveDownloadUrl(order.id, order.userId)}
                          disabled={!downloadUrl}
                          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium shrink-0 flex items-center gap-1.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
