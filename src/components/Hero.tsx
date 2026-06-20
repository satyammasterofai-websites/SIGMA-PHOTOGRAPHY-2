import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '../hooks/useSiteContent';
import VideoModal from './VideoModal';

export default function Hero() {
  const { hero } = useSiteContent();
  const [showVideo, setShowVideo] = useState(false);

  const heading = hero?.heading || 'Premium Invitation Video Creation Services';
  const subheading = hero?.subheading || 'Create beautiful invitation videos for Weddings, Engagements, Birthdays, Anniversaries, Housewarming Ceremonies, Baby Showers, and Special Events.';
  const heroImage = hero?.image || 'https://images.unsplash.com/photo-1544078755-9a6aa877d9c6?auto=format&fit=crop&q=80&w=2000'; // elegant wedding image
  const bgImage = hero?.bgImage;

  return (
    <>
      {showVideo && hero?.videoUrl && (
        <VideoModal url={hero.videoUrl} onClose={() => setShowVideo(false)} />
      )}
      <section id="home" className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden overflow-x-hidden w-full">
      
      {/* Background Ornaments & Floral/Luxury Patterns */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/floral-motif.png')] mix-blend-multiply pointer-events-none" />
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <img src={bgImage} className="w-full h-full object-cover opacity-10 mix-blend-luminosity" alt="bg" />
        </div>
      )}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-blush/40 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-lavender/50 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-brand-cyan/20 rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 mt-6 md:mt-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start gap-6"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-purple/20 bg-white/60 backdrop-blur-md shadow-sm">
              <Heart className="w-4 h-4 text-brand-rose fill-brand-rose/20" />
              <span className="text-sm font-semibold text-gradient-premium tracking-wide uppercase">
                Luxury Digital Experiences
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.15] text-brand-navy whitespace-pre-wrap">
              {heading}
            </h1>

            <p className="text-lg md:text-xl text-brand-slate max-w-lg leading-relaxed whitespace-pre-wrap font-medium">
              {subheading}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full sm:w-auto">
              <Link to="/gallery" className="w-full sm:w-auto px-8 py-4 bg-gradient-premium text-white rounded-full font-bold hover:opacity-90 transition-all shadow-xl shadow-brand-purple/20 text-lg flex items-center justify-center gap-2 group">
                Explore Templates
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
              <Link 
                to="/gallery"
                className="w-full sm:w-auto px-8 py-4 bg-white/80 text-brand-navy border-2 border-brand-lavender rounded-full font-bold hover:border-brand-purple hover:bg-white transition-all text-lg flex items-center justify-center gap-2 group shadow-sm backdrop-blur-sm"
              >
                Order Now
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-[500px] lg:h-[650px] rounded-[2.5rem] p-1.5 bg-gradient-premium shadow-2xl shadow-brand-purple/20 group"
          >
            {/* Inner "Video" container */}
            <div className="relative w-full h-full bg-brand-navy rounded-[2.3rem] overflow-hidden">
              <img 
                src={heroImage} 
                alt="Luxury Wedding" 
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000 ease-out mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent" />
              <div className="absolute inset-0 bg-brand-purple/10 mix-blend-overlay" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button 
                  onClick={() => hero?.videoUrl && setShowVideo(true)}
                  className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 hover:scale-110 transition-all border border-white/30 pointer-events-auto shadow-2xl overflow-hidden relative group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover/btn:opacity-20 transition-opacity" />
                  <Play className="w-10 h-10 text-white ml-2 drop-shadow-md" />
                </button>
              </div>

              {/* Badges */}
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div className="glassmorphism-dark px-5 py-4 rounded-3xl border-white/20">
                  <p className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-pink-500">Our Viral Template</p>
                  <p className="text-brand-lavender font-medium text-xs mt-1">Premium Emerald Theme</p>
                </div>
                <div className="glassmorphism-dark px-4 py-2.5 rounded-full flex items-center gap-2 border-white/20">
                  <div className="w-2 h-2 rounded-full bg-brand-rose animate-pulse" />
                  <span className="text-white text-xs font-bold tracking-wide uppercase">4K Ready</span>
                </div>
              </div>
            </div>

            {/* Decorative Floating Elements */}
            <motion.div 
              animate={{ y: [-15, 15, -15] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -top-8 -right-8 w-32 h-32 glassmorphism rounded-3xl flex items-center justify-center p-3 border border-white/60 shadow-2xl"
            >
               <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=200" alt="Ring" className="w-full h-full object-cover rounded-2xl" />
            </motion.div>

            <motion.div 
              animate={{ y: [15, -15, 15] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 glassmorphism px-8 py-5 rounded-3xl border border-white/60 flex items-center gap-5 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center shadow-inner">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-base font-black text-brand-navy">Cinematic</p>
                <p className="text-sm font-semibold text-brand-purple">Quality Delivery</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
    </>
  );
}
