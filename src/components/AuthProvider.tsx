import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const ADMIN_EMAILS = ['satyammasterofai@gmail.com', 'jhahimanshukumar87@gmail.com', 'sigmaphotography0001@gmail.com'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        let currentRole: 'user' | 'admin' = 'user';
        const isAdminEmail = currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
        
        if (isAdminEmail) {
          currentRole = 'admin';
        }
        
        try {
          // Fetch user role
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // Overwrite with DB role if available, unless they're hardcoded admin
            if (!isAdminEmail && userDocSnap.data().role === 'admin') {
               currentRole = 'admin';
            }
            // If they are admin by email but DB says user, let's update DB
            if (isAdminEmail && userDocSnap.data().role !== 'admin') {
               try {
                 await setDoc(userDocRef, { role: 'admin' }, { merge: true });
               } catch (e) {
                 console.error("Failed to upgrade DB role to admin", e);
               }
            }
          } else {
            // Create user record if it doesn't exist
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              role: currentRole,
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Firestore permission error or DB error:", error);
          // If we can't access DB (e.g. missing rules), fallback to predefined role
        }

        setUser(currentUser, currentRole);
      } else {
        setUser(null, null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return <>{children}</>;
}
