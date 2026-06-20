import { useState, useEffect } from 'react';
import { Camera, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import AnnouncementBar from './AnnouncementBar';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logoBase64, navbar } = useSiteContent();
  const navigate = useNavigate();
  const { user, role } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Templates', href: '/gallery' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'Contact', href: '/#contact' },
  ];

  // Apply navbar settings with defaults
  const bgGradient = navbar?.bgGradient || 'from-pink-700 via-rose-600 to-pink-700';
  const transparency = navbar?.transparency !== undefined ? navbar.transparency : 80;
  const textColor = navbar?.textColor || 'text-white';
  const logoColor = navbar?.logoColor || 'bg-gradient-to-r from-pink-100 via-white to-pink-200 bg-clip-text text-transparent';
  const isLogoTextNavy = logoColor?.includes('text-brand-navy') || false;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <AnnouncementBar />
      <nav
        className={`w-full transition-all duration-300 relative ${
          isScrolled ? `glassmorphism py-3 shadow-sm` : 'bg-transparent py-5'
        }`}
      >
        {isScrolled && (
          <div 
            className={`absolute inset-0 bg-gradient-to-r ${bgGradient}`}
            style={{ opacity: transparency / 100 }}
          />
        )}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          {logoBase64 ? (
            <img src={logoBase64} alt="Logo" className="h-10 object-contain" />
          ) : (
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-premium text-white overflow-hidden shadow-lg shadow-brand-purple/30">
              <Camera className="w-5 h-5 absolute z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-[spin_3s_linear_infinite]" />
            </div>
          )}
          <span className={`font-display font-bold text-2xl tracking-tighter ${logoColor}`}>
            SIGMA<span className={isLogoTextNavy ? "text-brand-purple font-light" : "font-light ml-1"}>PHOTOGRAPHY</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-bold hover:opacity-75 transition-colors tracking-wide ${textColor}`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <button 
              onClick={() => navigate(role === 'admin' ? '/admin' : '/dashboard')}
              className="text-sm font-bold text-white bg-gradient-premium rounded-full px-6 py-2.5 hover:opacity-90 hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-brand-purple/20 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {role === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </button>
          ) : (
            <div className="flex items-center bg-white/50 backdrop-blur-md rounded-full shadow-inner border border-brand-lavender/30 p-1">
              <button 
                onClick={() => navigate('/login')}
                className="text-sm font-bold text-brand-navy hover:text-brand-purple rounded-full px-5 py-2 transition-all hover:bg-white shadow-sm"
              >
                Sign In
              </button>
              <div className="w-px h-4 bg-brand-lavender/50 mx-1" />
              <button 
                onClick={() => navigate('/signup')}
                className="text-sm font-bold text-white bg-gradient-premium rounded-full px-6 py-2 hover:opacity-90 hover:shadow-lg transition-all shadow-brand-purple/30"
              >
                Start Creating
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-gray-700 hover:text-brand-purple transition-colors bg-white/50 rounded-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-4 right-4 bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 p-6 md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-gray-800 hover:text-brand-purple transition-colors p-2 hover:bg-brand-purple/5 rounded-xl"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-gray-100 my-2" />
              
              {user ? (
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(role === 'admin' ? '/admin' : '/dashboard');
                  }}
                  className="w-full text-base font-semibold text-white bg-gradient-primary rounded-xl px-5 py-3.5 hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  {role === 'admin' ? 'Open Admin Panel' : 'Open Dashboard'}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="text-base font-bold text-brand-purple bg-brand-purple/5 border border-brand-purple/20 rounded-xl px-5 py-3 hover:bg-brand-purple/10 transition-all"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/signup');
                    }}
                    className="text-base font-bold text-white bg-gradient-primary rounded-xl px-5 py-3 shadow-lg shadow-brand-purple/30 hover:opacity-90 transition-all"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </header>
  );
}
