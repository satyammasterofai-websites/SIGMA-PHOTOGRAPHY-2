import React, { useState, useEffect } from "react";
import { collection, getDocs, onSnapshot, addDoc,
  doc,
  updateDoc,
  deleteDoc,
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
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
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
      // toast.success(`Bulk update to ${status} successful`);
      setSelectedOrders([]);
    } catch (e) {
      console.error(e);
      // toast.error("Bulk update failed");
    }
  };

  const bulkDeleteOrders = async () => {
    if (selectedOrders.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) return;
    try {
      const promises = selectedOrders.map(id => deleteDoc(doc(db, "orders", id)));
      await Promise.all(promises);
      // toast.success(`Bulk delete successful`);
      setSelectedOrders([]);
    } catch (e) {
      console.error(e);
      // toast.error("Bulk delete failed");
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const snap = await getDocs(collection(db, "templates"));
        const map: Record<string, string> = {};
        snap.docs.forEach(d => {
          const data = d.data();
          map[d.id] = data.displayId || d.id.slice(-8);
        });
        setTemplateMap(map);
      } catch (e) {
        console.error("Failed to fetch templates for map", e);
      }
    };
    fetchTemplates();
    
    // We should show newest first
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
    return () => unsub();
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
    const searchLower = searchQuery.toLowerCase();
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
