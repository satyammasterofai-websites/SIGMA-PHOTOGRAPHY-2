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
      x: direction > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.95,
      filter: "blur(8px)"
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)"
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
      scale: 1.05,
      filter: "blur(8px)"
    })
  };

  return (
    <section className="pt-24 pb-8 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5 bg-gray-50/50 backdrop-blur-xl group">
          <div className="w-full relative flex items-center justify-center min-h-[300px] md:min-h-[500px]">
             <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.5 },
                    scale: { duration: 0.5 },
                    filter: { duration: 0.5 }
                  }}
                  src={banners[currentIndex]?.image}
                  alt="Promotional Banner"
                  className="absolute w-full h-full object-cover md:object-contain rounded-[2rem]"
                />
             </AnimatePresence>
          </div>

          {banners.length > 1 && (
            <>
              <button 
                onClick={prevBanner}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/40 backdrop-blur-md border border-white/50 text-brand-purple p-3 md:p-4 rounded-full shadow-lg opacity-100 transition-all transform hover:bg-white hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              <button 
                onClick={nextBanner}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/40 backdrop-blur-md border border-white/50 text-brand-purple p-3 md:p-4 rounded-full shadow-lg opacity-100 transition-all transform hover:bg-white hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">
                {banners.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSpecificBanner(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/80 w-2'}`}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem] pointer-events-none z-20"></div>
        </div>
      </div>
    </section>
  );
}
