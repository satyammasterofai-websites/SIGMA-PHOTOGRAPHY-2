import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { Link } from 'react-router-dom';

const defaultCategories = [
  { name: 'Wedding', price: '2,999', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800' },
  { name: 'Engagement', price: '1,999', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800' },
  { name: 'Reception', price: '2,499', image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800' },
  { name: 'Haldi', price: '1,499', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800' },
  { name: 'Mehendi', price: '1,499', image: 'https://images.unsplash.com/photo-1594980596870-8caa52a7fa7b?auto=format&fit=crop&q=80&w=800' },
  { name: 'Birthday', price: '999', image: 'https://images.unsplash.com/photo-1530103862676-de8896b10404?auto=format&fit=crop&q=80&w=800' },
  { name: 'Anniversary', price: '1,499', image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800' },
  { name: 'Baby Shower', price: '1,299', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800' },
  { name: 'Housewarming', price: '1,499', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800' },
  { name: 'Corporate Events', price: '3,499', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800' },
];

export default function TemplateCategories() {
  const { categories } = useSiteContent();
  const displayCategories = categories.length > 0 ? categories : defaultCategories;
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll functionality
  useEffect(() => {
    if (isHovered || !scrollRef.current) return;
    
    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (container) {
        const itemWidth = container.children[0]?.clientWidth || 0;
        const gap = 32; // gap-8 = 2rem = 32px
        const scrollAmount = itemWidth + gap;
        
        // Use a larger buffer (half an item width) to detect end reliably
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - (itemWidth / 2)) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovered]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.children[0]?.clientWidth || 0;
      scrollRef.current.scrollBy({ left: -(itemWidth + 32), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.children[0]?.clientWidth || 0;
      scrollRef.current.scrollBy({ left: itemWidth + 32, behavior: 'smooth' });
    }
  };

  return (
    <section id="templates" className="py-24 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-sm font-bold tracking-widest text-brand-rose uppercase bg-brand-rose/10 px-4 py-1.5 rounded-full border border-brand-rose/20">Masterpieces Collection</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-navy mt-6 mb-4">
              Explore Our Signature <br/>Templates
            </h2>
            <p className="text-brand-slate text-lg font-medium">
              Cinematic quality designs crafted to match the elegance of your finest moments.
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4 self-start md:self-end">
            <button 
              onClick={scrollLeft}
              className="w-12 h-12 rounded-full bg-white border border-brand-purple/20 text-brand-navy flex items-center justify-center hover:bg-gradient-premium hover:text-white transition-all shadow-lg hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={scrollRight}
              className="w-12 h-12 rounded-full bg-white border border-brand-purple/20 text-brand-navy flex items-center justify-center hover:bg-gradient-premium hover:text-white transition-all shadow-lg hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <Link to="/gallery" className="hidden sm:inline-block ml-4 px-8 py-3.5 rounded-full bg-gradient-premium text-white font-bold hover:opacity-90 hover:shadow-lg hover:shadow-brand-purple/30 hover:scale-105 transition-all text-center">
              View All Designs
            </Link>
          </div>
        </div>

        <div 
          className="relative -mx-6 px-6 sm:-mx-0 sm:px-0"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-8 pb-12 pt-4 snap-x snap-mandatory hide-scrollbar"
            style={{
               scrollbarWidth: 'none', 
               msOverflowStyle: 'none',
            }}
          >
            {displayCategories.map((cat, index) => (
              <motion.div
                key={cat.id || cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 6) * 0.1 }}
                className="group snap-center shrink-0 w-[85vw] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)] flex flex-col items-center"
              >
                {/* Thumbnail Container */}
                <div className="w-full relative rounded-3xl overflow-hidden glassmorphism-dark border border-brand-purple/10 shadow-xl group-hover:shadow-brand-purple/20 transition-all duration-700 bg-brand-navy">
                  <div className="relative w-full aspect-auto bg-white flex items-center justify-center overflow-hidden">
                    <img 
                      src={cat.image || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800'} 
                      alt={cat.name} 
                      className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-brand-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Hover Action Button (inside thumbnail) */}
                  <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end pointer-events-none">
                    <div className="translate-y-8 group-hover:-translate-y-2 transition-transform duration-500 ease-out flex flex-col justify-end">
                      <div className="w-full py-4 bg-white/90 backdrop-blur-md text-brand-navy font-bold rounded-2xl hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white transition-all transform opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 duration-500 inline-block text-center shadow-lg pointer-events-auto cursor-pointer border border-white/20">
                        View {cat.name}
                      </div>
                    </div>
                  </div>
                  <Link to={`/gallery?category=${encodeURIComponent(cat.name)}`} className="absolute inset-0 z-20 cursor-pointer"></Link>
                </div>

                {/* Stylish Category Text Below */}
                <div className="mt-8 relative w-full flex flex-col items-center justify-center px-4">
                  {/* Glowing decorative background */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-12 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-red-500/10 blur-xl rounded-full z-0 pointer-events-none" />
                  
                  <div className="flex items-center justify-center gap-4 w-full relative z-10 transition-transform duration-700 group-hover:-translate-y-1">
                    {/* Pink/Red decorative line */}
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-pink-400 to-red-500 rounded-full opacity-70" />
                    
                    <h3 className="text-2xl md:text-3xl font-display font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-500 drop-shadow-md pb-1">
                      {cat.name}
                    </h3>
                    
                    {/* Pink/Red decorative line */}
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-red-500 via-pink-400 to-transparent rounded-full opacity-70" />
                  </div>

                  <p className="text-brand-slate/80 text-sm mt-3 mb-6 text-center transition-all duration-700 group-hover:-translate-y-1 drop-shadow-sm">
                    {cat.description || `Explore our premium ${cat.name.toLowerCase()} invitation templates.`}
                  </p>

                  <Link 
                    to={`/gallery?category=${encodeURIComponent(cat.name)}`}
                    className="relative px-8 py-3 rounded-full bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold text-sm tracking-widest uppercase overflow-hidden transition-all duration-700 group-hover:-translate-y-1 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] shadow-lg hover:scale-105"
                  >
                    <span className="relative z-10">Explore Now</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
