import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuthStore } from "../../store/useAuthStore";
import { Send, Check, CheckCheck, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useTypingIndicator } from "../../hooks/useTypingIndicator";
import { useChatSound } from "../../hooks/useChatSound";

import { useSiteStore } from "../../store/useSiteStore";
export default function SupportChat() {
  const { user } = useAuthStore();
  const { settings } = useSiteStore();
  const welcomeMessage = settings?.welcomeMessage || "Hello! How can we help you today?";
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isTyping, updateTyping } = useTypingIndicator(user?.uid || '');
  const { playSound } = useChatSound();
  const initialLoadRef = useRef(true);

  const [isSupportOnline, setIsSupportOnline] = useState(false);

  useEffect(() => {
    // Check if any admin is online
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const unsub = onSnapshot(q, (snapshot) => {
      let online = false;
      snapshot.forEach(d => {
        const admin = d.data();
        if (admin.isOnline && admin.lastSeen) {
          const lastSeenDate = typeof admin.lastSeen.toMillis === 'function' ? admin.lastSeen.toMillis() : new Date(admin.lastSeen).getTime();
          if (new Date().getTime() - lastSeenDate < 2 * 60 * 1000) {
            online = true;
          }
        }
      });
      setIsSupportOnline(online);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chats"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      
      if (!initialLoadRef.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const msgData = change.doc.data();
            if (msgData.sender === 'admin') {
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

      // Mark unread messages from admin as read
      data.forEach(msg => {
        if (msg.sender === 'admin' && !msg.read) {
          updateDoc(doc(db, 'chats', msg.id), { read: true }).catch(e => { if (e.code !== 'permission-denied') console.error(e); });
        }
      });
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
              userId: user?.uid,
              userEmail: user?.email,
              sender: "user",
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
    if (!newMessage.trim() || !user) return;
    try {
      const isFirstMessage = messages.length === 0;
      await addDoc(collection(db, "chats"), {
        userId: user.uid,
        userEmail: user.email,
        sender: "user",
        text: newMessage,
        timestamp: serverTimestamp(),
        read: false
      });
      setNewMessage("");
      updateTyping(false);

      if (isFirstMessage) {
        setTimeout(async () => {
          try {
            await addDoc(collection(db, "chats"), {
              userId: user.uid,
              userEmail: user.email,
              sender: "admin",
              text: welcomeMessage,
              timestamp: serverTimestamp(),
              read: false
            });
          } catch (e) {
            console.error("Failed to send welcome message", e);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 bg-brand-navy text-white border-b border-brand-purple/20">
        <h2 className="text-xl font-bold font-display tracking-tight">Live Support Chat</h2>
        <p className="text-gray-400 text-sm">Send us a message and we'll get back to you shortly.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                msg.sender === "user"
                  ? "bg-brand-purple text-white rounded-br-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
              }`}
            >
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Uploaded" className="max-w-full rounded-lg mb-2" />
              )}
              {(!msg.imageUrl || msg.text !== "Sent an image") && <p>{msg.text}</p>}
              <div className={`flex items-center justify-end gap-1.5 text-[9px] font-medium tracking-wider uppercase mt-2 px-2 py-0.5 rounded-full backdrop-blur-md w-fit ml-auto shadow-sm transition-all ${msg.sender === 'user' ? 'bg-white/10 text-white/90 border border-white/20' : 'bg-gray-500/5 text-gray-500 border border-gray-200'}`}>
                <span>
                  {(msg.timestamp && typeof msg.timestamp.toDate === 'function') 
                  ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...')}
                </span>
                {msg.sender === 'user' && (
                  msg.read ? <CheckCheck className="w-3 h-3 text-blue-300" /> : <Check className="w-3 h-3 opacity-70" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-500 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm text-sm flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </span>
              Support is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            id="user-chat-image-upload"
            className="hidden"
            onChange={handleImageUpload}
          />
          <label 
            htmlFor="user-chat-image-upload"
            className="flex items-center justify-center w-12 h-12 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 cursor-pointer transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </label>
        </div>
        <input
          type="text"
          value={newMessage}
          onChange={handleMessageChange}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple text-gray-900"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="px-6 py-3 bg-brand-electric text-white rounded-xl hover:bg-brand-electric/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md shadow-brand-electric/20"
        >
          <Send className="w-5 h-5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
