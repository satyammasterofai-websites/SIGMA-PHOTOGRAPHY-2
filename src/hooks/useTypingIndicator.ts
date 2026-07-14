import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';

export function useTypingIndicator(chatUserId: string) {
  const { role } = useAuthStore();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!chatUserId) return;

    const unsub = onSnapshot(doc(db, 'chat_typing', chatUserId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = Date.now();
        const lastUpdated = data.lastUpdated?.toMillis?.() || data.lastUpdated || 0;
        
        // If the typing update is older than 5 seconds, consider them stopped typing
        if (now - lastUpdated > 5000) {
          setIsTyping(false);
          return;
        }

        // Admin sees user typing, user sees admin typing
        if (role === 'admin') {
          setIsTyping(data.user || false);
        } else {
          setIsTyping(data.admin || false);
        }
      }
    }, (err) => {
      if (err.code !== 'permission-denied') console.error("Typing indicator error", err);
    });

    return () => unsub();
  }, [chatUserId, role]);

  const updateTyping = async (typing: boolean) => {
    if (!chatUserId || !role) return;
    try {
      await setDoc(doc(db, 'chat_typing', chatUserId), {
        [role]: typing,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (e: any) {
      // Silently ignore permission errors for typing indicator to avoid console spam if rules aren't deployed yet
      if (e.code !== 'permission-denied') {
        console.error('Error updating typing status', e);
      }
    }
  };

  return { isTyping, updateTyping };
}
