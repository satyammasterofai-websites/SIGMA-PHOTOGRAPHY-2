import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
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
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ManageOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  useEffect(() => {
    // We should show newest first
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setOrders(
          snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })),
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
            }));
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

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      toast.success("Status updated");
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const saveDownloadUrl = async (id: string) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        downloadUrl,
        status: "Delivered",
      });
      toast.success("Download link dispatched & marked Delivered");
      setDownloadUrl("");
    } catch (e) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="w-full">
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
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="pb-3 font-medium text-sm">Order & Date</th>
                  <th className="pb-3 font-medium text-sm">Customer</th>
                  <th className="pb-3 font-medium text-sm">Template</th>
                  <th className="pb-3 font-medium text-sm">Amount</th>
                  <th className="pb-3 font-medium text-sm">Status</th>
                  <th className="pb-3 font-medium text-sm text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-4">
                        <div className="text-sm font-mono text-gray-400">
                          {order.id.slice(-6)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 text-sm">
                        <div className="font-medium text-white">
                          {order.customerName || order.customerEmail || "N/A"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {order.customerPhone}
                        </div>
                      </td>
                      <td className="py-4 text-sm font-medium">
                        {order.templateName || "Custom"}
                      </td>
                      <td className="py-4 text-sm font-medium text-emerald-400">
                        ₹{order.price || order.amount || 0}
                      </td>
                      <td className="py-4 text-sm">
                        <select
                          value={order.status || "Pending"}
                          onChange={(e) =>
                            updateStatus(order.id, e.target.value)
                          }
                          className={`bg-gray-800 border-none rounded px-2 py-1 text-xs font-bold font-sans ${order.status === "Delivered" ? "text-purple-400" : order.status === "Completed" ? "text-green-400" : order.status === "Cancelled" ? "text-red-400" : "text-yellow-400"}`}
                        >
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Editing</option>
                          <option>Review</option>
                          <option>Completed</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === order.id ? null : order.id,
                            )
                          }
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg mr-2"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transform transition-transform ${expandedId === order.id ? "rotate-180" : ""}`}
                          />
                        </button>
                        <button
                          onClick={() => setDeleteOrderId(order.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr className="bg-gray-800/20">
                        <td colSpan={6} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4" /> Order Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex text-gray-400">
                                  <span className="w-1/3">Via Method:</span>
                                  <span className="text-white">
                                    {order.viaMethod || "Unknown"}
                                  </span>
                                </div>
                                <div className="flex text-gray-400 items-center">
                                  <span className="w-1/3">Payment:</span>
                                  <span
                                    className={`text-sm font-medium ${order.paymentStatus === "Received" || order.paymentStatus === "Paid Online" ? "text-green-400" : "text-orange-400"}`}
                                  >
                                    {order.paymentStatus || "Unknown"}
                                  </span>
                                  {order.paymentStatus !== "Received" &&
                                  order.paymentStatus !== "Paid Online" ? (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await updateDoc(
                                            doc(db, "orders", order.id),
                                            {
                                              paymentStatus: "Received",
                                              status: "Processing",
                                            },
                                          );
                                          toast.success(
                                            "Payment marked as received, status set to Processing",
                                          );
                                        } catch (e) {
                                          toast.error(
                                            "Failed to update payment status",
                                          );
                                        }
                                      }}
                                      className="ml-3 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-2 py-0.5 rounded text-xs"
                                    >
                                      Mark Received
                                    </button>
                                  ) : (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await updateDoc(
                                            doc(db, "orders", order.id),
                                            {
                                              paymentStatus: "Pending",
                                              status: "Pending",
                                            },
                                          );
                                          toast.success(
                                            "Payment reverted to Pending",
                                          );
                                        } catch (e) {
                                          toast.error(
                                            "Failed to update payment status",
                                          );
                                        }
                                      }}
                                      className="ml-3 bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 px-2 py-0.5 rounded text-xs"
                                    >
                                      Revert
                                    </button>
                                  )}
                                </div>
                                <div className="flex text-gray-400 items-center">
                                  <span className="w-1/3">Advance:</span>
                                  <span className="text-orange-400 font-bold">
                                    ₹{order.advancePayment || 0}
                                  </span>
                                  <span
                                    className={`ml-2 px-2 py-0.5 rounded text-[10px] ${order.advancePaymentStatus === "Received" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}
                                  >
                                    {order.advancePaymentStatus || "Pending"}
                                  </span>
                                  {order.advancePaymentStatus === "Pending" ||
                                  !order.advancePaymentStatus ? (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await updateDoc(
                                            doc(db, "orders", order.id),
                                            {
                                              advancePaymentStatus: "Received",
                                              status: "Processing",
                                            },
                                          );
                                          toast.success(
                                            "Marked advance as received & set to processing",
                                          );
                                        } catch (e) {
                                          toast.error("Failed to update");
                                        }
                                      }}
                                      className="ml-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 px-2 py-0.5 rounded text-xs"
                                    >
                                      Confirm Received
                                    </button>
                                  ) : (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await updateDoc(
                                            doc(db, "orders", order.id),
                                            {
                                              advancePaymentStatus: "Pending",
                                              status: "Pending",
                                            },
                                          );
                                          toast.success("Reverted to pending");
                                        } catch (e) {
                                          toast.error("Failed to update");
                                        }
                                      }}
                                      className="ml-2 bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 px-2 py-0.5 rounded text-xs"
                                    >
                                      Revert
                                    </button>
                                  )}
                                </div>
                                <div className="flex text-gray-400">
                                  <span className="w-1/3">Files Uploaded:</span>
                                  <span className="text-white">
                                    {order.filesCount || 0}
                                  </span>
                                </div>
                              </div>

                              {order.customData &&
                                Object.keys(order.customData).length > 0 && (
                                  <>
                                    <h4 className="text-white font-bold mt-4 mb-2">
                                      Customization Data
                                    </h4>
                                    <div className="space-y-1 text-sm bg-gray-800 p-3 rounded-lg">
                                      {Object.entries(order.customData).map(
                                        ([k, v]) => (
                                          <div
                                            key={k}
                                            className="text-gray-300"
                                          >
                                            <span className="text-gray-500">
                                              {k}:
                                            </span>
                                            <pre className="inline-block whitespace-pre-wrap text-xs ml-2 align-top font-sans">
                                              {typeof v === "object"
                                                ? JSON.stringify(v, null, 2)
                                                : String(v)}
                                            </pre>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </>
                                )}
                            </div>

                            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Delivery
                              </h4>
                              <div className="space-y-4">
                                {order.downloadUrl ? (
                                  <div className="text-sm bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl flex items-start gap-2">
                                    <LinkIcon className="w-4 h-4 mt-0.5" />
                                    <div>
                                      <div className="font-bold mb-1">
                                        Link Sent to Client
                                      </div>
                                      <a
                                        href={order.downloadUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-400 hover:underline break-all"
                                      >
                                        {order.downloadUrl}
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-400">
                                    No delivery link attached yet. Upload the
                                    final video to Google Drive/YouTube and
                                    paste the link below.
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <input
                                    type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={downloadUrl}
                                    onChange={(e) =>
                                      setDownloadUrl(e.target.value)
                                    }
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                                  />
                                  <button
                                    onClick={() => saveDownloadUrl(order.id)}
                                    disabled={!downloadUrl}
                                    className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                                  >
                                    <Download className="w-4 h-4" /> Send Link
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
