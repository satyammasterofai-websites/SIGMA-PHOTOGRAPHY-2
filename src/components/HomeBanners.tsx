import { motion, AnimatePresence } from 'motion/react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomeBanners() {
  const { banners } = useSiteContent();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const nextBanner = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  return (
    <section className="py-8 w-full overflow-hidden border-y border-brand-purple/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB] group">
          <div className="w-full relative flex items-center justify-center min-h-[200px] md:min-h-[400px]">
             <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  src={banners[currentIndex]?.image}
                  alt="Promotional Banner"
                  className="w-full h-auto object-contain max-h-[80vh]"
                />
             </AnimatePresence>
          </div>

          {banners.length > 1 && (
            <>
              <button 
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur text-brand-purple p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:bg-white hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur text-brand-purple p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:bg-white hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-brand-purple w-8' : 'bg-white/60 hover:bg-white'}`}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
