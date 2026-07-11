import { useChatStore } from '../store/useChatStore';
import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export function useChatNotifications() {
  const { user, role } = useAuthStore();
  const { setUnreadCount } = useChatStore();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!user) return;
    isInitialLoad.current = true;
    
    let unsubFb = () => {};

    // We use a simple query to avoid composite index requirements
    const q = role === 'admin' 
      ? query(collection(db, 'chats'), where('sender', '==', 'user'))
      : query(collection(db, 'chats'), where('userId', '==', user.uid));

    const unsub = onSnapshot(q, (snapshot) => {
      const unreadDocs = snapshot.docs.filter(d => {
        const data = d.data();
        return data.read === false && data.sender === (role === 'admin' ? 'user' : 'admin');
      });
      
      setUnreadCount(unreadDocs.length);
      
      if (!isInitialLoad.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const msg = change.doc.data();
            if (msg.read === false && msg.sender === (role === 'admin' ? 'user' : 'admin')) {
              toast(`New message from ${role === 'admin' ? msg.userEmail || 'User' : 'Support'}:\n${msg.text}`, {
                icon: '💬',
                duration: 5000,
              });
            }
          }
        });
      } else {
        isInitialLoad.current = false;
      }
    }, (error) => {
      console.error('Chat notification error:', error);
    });

    return () => {
      unsub();
      unsubFb();
    };
  }, [user, role]);

  const { clearUnread } = useChatStore();

  return null;
}
