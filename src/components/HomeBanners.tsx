import { motion, AnimatePresence } from 'motion/react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomeBanners() {
  const { banners } = useSiteContent();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const nextBanner = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };
  
  const prevBanner = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const setSpecificBanner = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.95,
      filter: "blur(8px)"
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)"
    },
    exit: (direction: number) => ({
      y: direction < 0 ? 200 : -200,
      opacity: 0,
      scale: 1.05,
      filter: "blur(8px)"
    })
  };

  return (
    <section className="pt-32 pb-8 w-full overflow-hidden">
      <div className="w-full">
        <div className="relative overflow-hidden shadow-2xl bg-black group w-full">
          <div className="w-full relative flex items-center justify-center">
            {/* Invisible placeholder to maintain exact aspect ratio of the current real image */}
            {banners[currentIndex] && (
              <img src={banners[currentIndex].image} className="w-full h-auto invisible" alt="Placeholder" />
            )}
            
             <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    y: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.5 },
                    scale: { duration: 0.5 },
                    filter: { duration: 0.5 }
                  }}
                  src={banners[currentIndex]?.image}
                  alt="Promotional Banner"
                  className="absolute inset-0 w-full h-full object-contain object-center"
                />
             </AnimatePresence>
          </div>

          {banners.length > 1 && (
            <>
              <button 
                onClick={prevBanner}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-transparent text-white p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group/btn z-30 drop-shadow-md"
              >
                <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover/btn:-translate-x-1 drop-shadow-lg" strokeWidth={2.5} />
              </button>
              <button 
                onClick={nextBanner}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-transparent text-white p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group/btn z-30 drop-shadow-md"
              >
                <ChevronRight className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover/btn:translate-x-1 drop-shadow-lg" strokeWidth={2.5} />
              </button>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30 bg-black/30 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full shadow-lg">
                {banners.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSpecificBanner(idx)}
                    className={`h-2 rounded-full transition-all duration-500 ease-out border border-transparent shadow-sm ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white w-2'}`}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className="absolute inset-0 pointer-events-none z-20"></div>
        </div>
      </div>
    </section>
  );
}
