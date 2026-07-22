import { useEffect, useRef } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

export function useOrderNotifications() {
  const { user } = useAuthStore();
  const prevStatuses = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    let initialLoad = true;
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (initialLoad) {
        snapshot.docs.forEach(doc => {
          prevStatuses.current[doc.id] = doc.data().status;
        });
        initialLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const data = change.doc.data();
          const oldStatus = prevStatuses.current[change.doc.id];
          const newStatus = data.status;

          if (oldStatus !== newStatus) {
            if (newStatus === "Processing" || newStatus === "Completed") {
              toast.success(`Your order for ${data.templateName || "Template"} is now ${newStatus}!`, {
                duration: 5000,
                icon: '📦'
              });
            }
            prevStatuses.current[change.doc.id] = newStatus;
          }
        } else if (change.type === "added") {
          prevStatuses.current[change.doc.id] = change.doc.data().status;
        }
      });
    });

    return () => unsubscribe();
  }, [user]);
}
