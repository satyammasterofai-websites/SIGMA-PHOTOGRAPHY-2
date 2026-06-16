import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '../hooks/useSiteContent';
import VideoModal from './VideoModal';

export default function Hero() {
  const { hero } = useSiteContent();
  const [showVideo, setShowVideo] = useState(false);

  const heading = hero?.heading || 'Craft Your Luxury Wedding Masterpiece';
  const subheading = hero?.subheading || 'Transform your special moments into cinematic brilliance. SIGMAPHOTOGRAPHY delivers modern, elegant, and highly customized digital invitations that leave a lasting impression.';
  const buttonText = hero?.buttonText || 'Create Now';
  const heroImage = hero?.image || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2000';
  const bgImage = hero?.bgImage;

  return (
    <>
      {showVideo && hero?.videoUrl && (
        <VideoModal url={hero.videoUrl} onClose={() => setShowVideo(false)} />
      )}
      <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden overflow-x-hidden w-full">
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <img src={bgImage} className="w-full h-full object-cover opacity-20" alt="bg" />
        </div>
      )}
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-electric/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 mt-32 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start gap-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-purple/20 bg-brand-purple/5 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-brand-purple" />
              <span className="text-sm font-medium text-brand-purple tracking-wide">
                Premium Invitation Video Creation Service
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] text-gray-900 whitespace-pre-wrap">
              {heading}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed whitespace-pre-wrap">
              {subheading}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
              <Link to="/gallery" className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-brand-purple transition-all shadow-lg hover:shadow-brand-purple/30 text-lg flex items-center justify-center gap-2 group">
                {buttonText}
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
              <button 
                onClick={() => {
                  if (hero?.videoUrl) setShowVideo(true);
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-medium hover:border-gray-300 hover:bg-gray-50 transition-all text-lg flex items-center justify-center gap-2 group shadow-sm"
              >
                <Play className="w-5 h-5 text-brand-purple group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-[500px] lg:h-[600px] rounded-[2rem] p-1 bg-gradient-brand shadow-2xl shadow-brand-indigo/30 group"
          >
            {/* Inner "Video" container */}
            <div className="relative w-full h-full bg-gray-900 rounded-[1.9rem] overflow-hidden">
              <img 
                src={heroImage} 
                alt="Luxury Wedding" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button 
                  onClick={() => hero?.videoUrl && setShowVideo(true)}
                  className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 hover:scale-110 transition-all border border-white/40 pointer-events-auto"
                >
                  <Play className="w-8 h-8 text-white ml-2" />
                </button>
              </div>

              {/* Badges */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="glassmorphism-dark px-4 py-3 rounded-2xl">
                  <p className="text-white font-medium text-sm">Sara & David</p>
                  <p className="text-gray-300 text-xs mt-1">Premium Emerald Theme</p>
                </div>
                <div className="glassmorphism-dark px-3 py-2 rounded-full flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1" />
                  <span className="text-white text-xs font-medium">Live Preview</span>
                </div>
              </div>
            </div>

            {/* Decorative Floating Elements */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-24 h-24 glassmorphism rounded-2xl flex items-center justify-center p-4 border border-white/60"
            >
               <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=200" alt="Ring" className="w-full h-full object-cover rounded-xl" />
            </motion.div>

            <motion.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 glassmorphism px-6 py-4 rounded-2xl border border-white/60 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">4K Resolution</p>
                <p className="text-xs text-gray-600">Cinematic Quality</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
    </>
  );
}
