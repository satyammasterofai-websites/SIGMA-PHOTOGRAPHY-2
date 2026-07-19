import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Send, ArrowLeft, Mail, Check, CheckCheck, Image as ImageIcon } from "lucide-react";
import VideoModal from "../../components/VideoModal";
import toast from "react-hot-toast";
import { useTypingIndicator } from "../../hooks/useTypingIndicator";
import { useChatSound } from "../../hooks/useChatSound";

interface CustomerDetailProps {
  user: any;
  onBack: () => void;
}

export default function CustomerDetail({ user, onBack }: CustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "orders">("chat");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isTyping, updateTyping } = useTypingIndicator(user?.id || '');
  const { playSound } = useChatSound();
  const initialLoadRef = useRef(true);

  const [isCustomerOnline, setIsCustomerOnline] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = onSnapshot(doc(db, "users", user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isOnline && data.lastSeen) {
          const lastSeenDate = typeof data.lastSeen.toMillis === 'function' ? data.lastSeen.toMillis() : new Date(data.lastSeen).getTime();
          setIsCustomerOnline(new Date().getTime() - lastSeenDate < 2 * 60 * 1000);
        } else {
          setIsCustomerOnline(false);
        }
      }
    });
    return () => unsub();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chats"),
      where("userId", "==", user.id)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      
      if (!initialLoadRef.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const msgData = change.doc.data();
            if (msgData.sender === 'user') {
              playSound();
            }
          }
        });
      } else {
        initialLoadRef.current = false;
      }

      data.sort((a: any, b: any) => {
        const timeA = a.timestamp ? (typeof a.timestamp.toMillis === 'function' ? a.timestamp.toMillis() : new Date(a.timestamp).getTime()) : Date.now();
        const timeB = b.timestamp ? (typeof b.timestamp.toMillis === 'function' ? b.timestamp.toMillis() : new Date(b.timestamp).getTime()) : Date.now();
        return timeA - timeB;
      });
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

      // Mark unread messages from user as read
      if (activeTab === 'chat') {
        data.forEach(msg => {
          if (msg.sender === 'user' && !msg.read) {
            import('firebase/firestore').then(({ doc, updateDoc }) => {
              updateDoc(doc(db, 'chats', msg.id), { read: true }).catch(e => { if (e.code !== 'permission-denied') console.error(e); });
            });
          }
        });
      }
    });

    const ordersQ = query(
      collection(db, "orders"),
      where("userId", "==", user.id)
    );
    getDocs(ordersQ).then((snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedOrders.sort((a: any, b: any) => {
        const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setOrders(fetchedOrders);
    });

    return () => unsub();
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          
          try {
            await addDoc(collection(db, "chats"), {
              userId: user.id,
              userEmail: user.email,
              sender: "admin",
              text: "Sent an image",
              imageUrl: base64,
              timestamp: serverTimestamp(),
              read: false
            });
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
          } catch (error) {
            console.error("Error sending image:", error);
            toast.error("Failed to send image");
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (e.target.value.length > 0) {
      updateTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        updateTyping(false);
      }, 2000);
    } else {
      updateTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(newMessage || "").trim() || !user) return;

    try {
      await addDoc(collection(db, "chats"), {
        userId: user.id,
        userEmail: user.email,
        sender: "admin",
        text: newMessage,
        timestamp: serverTimestamp(),
        read: false
      });
      setNewMessage("");
      updateTyping(false);
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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{user.name || "Customer"}</h2>
            {isCustomerOnline && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Online"></span>}
          </div>
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
              {messages.map((msg, index) => (
                <div
                  key={`${msg.id}-${index}`}
                  className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.sender === "admin"
                        ? "bg-brand-electric text-white rounded-br-none"
                        : "bg-gray-800 text-gray-200 rounded-bl-none"
                    }`}
                  >
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Uploaded" className="max-w-full rounded-lg mb-2" />
                    )}
                    {(!msg.imageUrl || msg.text !== "Sent an image") && <p className="text-sm">{msg.text}</p>}
                    <div className={`flex items-center justify-end gap-1.5 text-[9px] font-medium tracking-wider uppercase mt-2 px-2 py-0.5 rounded-full backdrop-blur-md w-fit ml-auto shadow-sm transition-all ${msg.sender === 'admin' ? 'bg-white/10 text-white/90 border border-white/20' : 'bg-black/20 text-gray-400 border border-white/5'}`}>
                      <span>
                        {(msg.timestamp && typeof msg.timestamp.toDate === 'function') 
                          ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...')}
                      </span>
                      {msg.sender === 'admin' && (
                        msg.read ? <CheckCheck className="w-3 h-3 text-blue-300" /> : <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No messages yet.
                </div>
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 text-gray-400 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm text-sm flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </span>
                    User is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900 flex gap-2">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  id="admin-chat-image-upload"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label 
                  htmlFor="admin-chat-image-upload"
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 hover:text-white cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </label>
              </div>
              <input
                type="text"
                value={newMessage}
                onChange={handleMessageChange}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-electric text-white placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!(newMessage || "").trim()}
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
              orders.map((order, index) => (
                <div key={`${order.id}-${index}`} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {order.thumbnailBase64 && (
                        <img src={order.thumbnailBase64} alt={order.templateName} className="w-12 h-12 object-cover rounded-md border border-gray-700 bg-gray-900" />
                      )}
                      <div>
                        <h3 className="text-white font-medium">Order #{order.id.slice(0, 8)} {order.templateName && `(${order.templateName})`}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">
                            {typeof order.createdAt?.toDate === 'function' ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt || 0).toLocaleDateString()}
                          </p>
                          {order.videoUrl && (
                            <button onClick={() => setPreviewVideoUrl(order.videoUrl)} className="text-xs text-brand-electric hover:underline flex items-center gap-1 text-left">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              Live Preview
                            </button>
                          )}
                        </div>
                      </div>
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
