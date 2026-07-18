import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Quote, X } from 'lucide-react';

interface Testimonial {
  id?: string;
  imageUrl?: string;
  image?: string;
  name?: string;
  feedback?: string;
  rating?: number;
}

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length, isPaused]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)"
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)"
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)"
    })
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = testimonials.length - 1;
      if (nextIndex >= testimonials.length) nextIndex = 0;
      return nextIndex;
    });
  };

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
        <p className="text-lg">More client triumphs coming soon!</p>
      </div>
    );
  }

  const current = testimonials[currentIndex];
  const hasText = current.name || current.feedback;
  const imageSrc = current.imageUrl || current.image;

  return (
    <>
      <div 
        className="relative w-full max-w-5xl mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-brand-purple/5 shadow-2xl ring-1 ring-black/5 p-2 sm:p-4">
          <div className="relative min-h-[400px] sm:min-h-[500px] w-full flex items-center justify-center rounded-[2rem] bg-white overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 }
                }}
                className="absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-center p-6 md:p-12 gap-8"
              >
                {imageSrc && (
                  <div className={`relative ${hasText ? 'w-full md:w-1/2' : 'w-full'} h-full flex items-center justify-center`}>
                    <img
                      src={imageSrc}
                      alt="Client Testimonial"
                      className="max-w-full max-h-[350px] sm:max-h-[450px] object-contain cursor-pointer transition-transform hover:scale-105"
                      onClick={() => setSelectedImage(imageSrc)}
                    />
                  </div>
                )}
                {hasText && (
                  <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
                    <Quote className="w-12 h-12 text-brand-purple/20" />
                    {current.rating && (
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < current.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    )}
                    {current.feedback && (
                      <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                        "{current.feedback}"
                      </p>
                    )}
                    {current.name && (
                      <div>
                        <h4 className="text-lg font-bold text-brand-navy">{current.name}</h4>
                        <p className="text-brand-purple font-medium">Verified Client</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur shadow-xl text-brand-navy p-3 sm:p-4 rounded-full transition-all hover:bg-brand-purple hover:text-white hover:scale-110 z-20 group"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); paginate(1); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur shadow-xl text-brand-navy p-3 sm:p-4 rounded-full transition-all hover:bg-brand-purple hover:text-white hover:scale-110 z-20 group"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full">
                {testimonials.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex 
                        ? 'w-8 bg-brand-purple' 
                        : 'w-2 bg-brand-navy/20 hover:bg-brand-navy/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 drop-shadow-2xl backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Enlarged Testimonial"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all backdrop-blur-sm z-[110]"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
