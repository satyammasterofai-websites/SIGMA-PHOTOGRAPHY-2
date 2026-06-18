import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch all announcements and filter locally to avoid any Firestore index or boolean/string type mismatch errors
    const unsub = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const now = new Date();
      
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("AnnouncementBar: Fetched all docs:", allDocs);

      const validAnnouncements = allDocs.filter((a: any) => {
        // Must be enabled
        if (a.enabled === false || a.enabled === 'false') return false;
        
        if (a.startDate) {
          const s = new Date(a.startDate);
          if (!isNaN(s.getTime()) && s > now) return false;
        }
        if (a.expiryDate) {
          const e = new Date(a.expiryDate);
          if (!isNaN(e.getTime()) && e < now) return false;
        }
        return true;
      });
      
      console.log("AnnouncementBar: Valid docs after filter:", validAnnouncements);
      setAnnouncements(validAnnouncements);
    }, (error) => {
      console.error("AnnouncementBar snapshot error:", error);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 5000); // Slide every 5 seconds

    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <div 
      className="relative w-full z-50 overflow-hidden sticky top-0"
      style={{ backgroundColor: current.bgColor, color: current.textColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-10 items-center justify-center text-sm font-medium">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 md:gap-4 text-center px-4"
            >
              <span>{current.message}</span>
              {current.buttonText && current.buttonLink && (
                <a 
                  href={current.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity border-b pb-0.5 border-transparent hover:border-current"
                  style={{ fontWeight: 600 }}
                >
                  {current.buttonText} <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Show navigation dots if multiple announcements */}
      {announcements.length > 1 && (
        <div className="absolute top-0 bottom-0 right-4 flex items-center gap-1.5 md:gap-2">
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-current opacity-100 scale-125' : 'bg-current opacity-40'
              }`}
              aria-label={`Go to announcement ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
