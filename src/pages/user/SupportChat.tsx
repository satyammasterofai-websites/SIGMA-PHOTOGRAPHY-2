import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuthStore } from "../../store/useAuthStore";
import { Send, Check, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useTypingIndicator } from "../../hooks/useTypingIndicator";

import { useSiteStore } from "../../store/useSiteStore";
export default function SupportChat() {
  const { user } = useAuthStore();
  const { settings } = useSiteStore();
  const welcomeMessage = settings?.welcomeMessage || "Hello! How can we help you today?";
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isTyping, updateTyping } = useTypingIndicator(user?.uid || '');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chats"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));
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
          updateDoc(doc(db, 'chats', msg.id), { read: true }).catch(console.error);
        }
      });
    });
    return () => unsub();
  }, [user]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    updateTyping(e.target.value.length > 0);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    try {
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
        <div className="flex justify-start">
          <div className="max-w-[70%] rounded-2xl px-5 py-3 bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm">
            <p className="whitespace-pre-wrap">{welcomeMessage}</p>
          </div>
        </div>
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
              <p>{msg.text}</p>
              <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
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
