import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export function useChatNotifications() {
  const { user, role } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    let q;
    
    // For admin, listen to all messages from users
    if (role === 'admin') {
      q = query(
        collection(db, 'chats'),
        where('sender', '==', 'user'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
    } else {
      // For user, listen to messages from admin to this user
      q = query(
        collection(db, 'chats'),
        where('userId', '==', user.uid),
        where('sender', '==', 'admin'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
    }

    const unsub = onSnapshot(q, (snapshot) => {
      // Show toast for new messages
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const msg = change.doc.data();
          const now = Date.now();
          const msgTime = msg.timestamp ? 
            (typeof msg.timestamp.toMillis === 'function' ? msg.timestamp.toMillis() : new Date(msg.timestamp).getTime()) 
            : now;
          
          if (now - msgTime < 10000) {
            toast(`New message from ${role === 'admin' ? msg.userEmail || 'User' : 'Support'}:\n${msg.text}`, {
              icon: '💬',
              duration: 5000,
            });
          }
        }
      });
      
      // Calculate actual unread count if we're a user
      if (role !== 'admin') {
        const unread = snapshot.docs.filter(doc => doc.data().read === false).length;
        setUnreadCount(unread);
      } else {
        // Admin logic can stay the same or use global context if needed
      }
    });

    return () => unsub();
  }, [user, role]);

  const clearUnread = () => setUnreadCount(0);

  return { unreadCount, clearUnread };
}
