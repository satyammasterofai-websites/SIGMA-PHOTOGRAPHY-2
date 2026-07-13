import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function usePresence() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const updatePresence = async () => {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          lastSeen: serverTimestamp(),
          isOnline: true
        });
      } catch (e) {
        console.error("Presence update failed", e);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 60000); // 1 min heartbeat

    const handleOffline = () => {
      // Best effort offline
      try {
        updateDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        }).catch(() => {});
      } catch (e) {}
    };

    window.addEventListener('beforeunload', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleOffline);
      handleOffline();
    };
  }, [user]);
}
