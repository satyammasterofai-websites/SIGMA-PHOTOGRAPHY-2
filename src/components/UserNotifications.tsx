import React, { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import toast from "react-hot-toast";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "userNotifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    let initialLoad = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!initialLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            toast(data.title + ": " + data.message, { icon: '🔔' });
          }
        });
      }
      initialLoad = false;
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !(n as any).read).length);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "userNotifications", id), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      if (unreadNotifs.length === 0) return;
      
      const batch = writeBatch(db);
      unreadNotifs.forEach(notif => {
        const notifRef = doc(db, "userNotifications", notif.id);
        batch.update(notifRef, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-brand-purple hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif, index) => (
                  <div 
                    key={`${notif.id}-${index}`}
                    className={`p-3 rounded-lg transition-colors cursor-pointer ${notif.read ? 'bg-white hover:bg-gray-50' : 'bg-brand-purple/5 hover:bg-brand-purple/10'}`}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif.id);
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-semibold ${notif.read ? 'text-gray-700' : 'text-brand-navy'}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-brand-purple rounded-full mt-1.5 flex-shrink-0"></span>
                      )}
                    </div>
                    <p className={`text-xs ${notif.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
