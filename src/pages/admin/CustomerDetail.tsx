import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Send, ArrowLeft, Mail } from "lucide-react";
import toast from "react-hot-toast";

interface CustomerDetailProps {
  user: any;
  onBack: () => void;
}

export default function CustomerDetail({ user, onBack }: CustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "orders">("chat");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chats"),
      where("userId", "==", user.id),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    const ordersQ = query(
      collection(db, "orders"),
      where("userId", "==", user.id)
    );
    getDocs(ordersQ).then((snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedOrders.sort((a, b) => {
        const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setOrders(fetchedOrders);
    });

    return () => unsub();
  }, [user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, "chats"), {
        userId: user.id,
        userEmail: user.email,
        sender: "admin",
        text: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleStatusUpdate = (orderId: string, status: string) => {
    const subject = encodeURIComponent("Order Status Update");
    const body = encodeURIComponent(`Hello,\n\nYour order #${orderId} is currently being: ${status}.\n\nThank you,\nSigma Pro`);
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
      <div className="p-4 border-b border-gray-800 flex items-center gap-4 bg-gray-900 shrink-0">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">{user.name || "Customer"}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="flex border-b border-gray-800 bg-gray-900 shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "chat" ? "border-brand-electric text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
        >
          Live Chat
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "orders" ? "border-brand-electric text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
        >
          Orders
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === "chat" && (
          <div className="absolute inset-0 flex flex-col bg-gray-900">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.sender === "admin"
                        ? "bg-brand-electric text-white rounded-br-none"
                        : "bg-gray-800 text-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-[10px] mt-1 opacity-70 text-right">
                      {(msg.timestamp && typeof msg.timestamp.toDate === 'function') 
                        ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...')}
                    </p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No messages yet.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-electric text-white placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-brand-electric text-white rounded-xl hover:bg-brand-electric/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="absolute inset-0 overflow-y-auto p-4 space-y-4 bg-gray-900">
            {orders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No orders found for this customer.</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-medium">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-400">
                        {typeof order.createdAt?.toDate === 'function' ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt || 0).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">
                      {order.status || "Pending"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['pending', 'reviewing', 'editing processing', 'completed', 'delivered'].map(status => (
                       <button
                         key={status}
                         onClick={() => handleStatusUpdate(order.id, status)}
                         className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs transition-colors"
                       >
                         <Mail className="w-3.5 h-3.5" />
                         Email as {status}
                       </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
