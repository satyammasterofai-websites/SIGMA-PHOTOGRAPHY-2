import { useState, useEffect } from 'react';
import { Camera, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logoBase64 } = useSiteContent();
  const navigate = useNavigate();

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
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glassmorphism py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          {logoBase64 ? (
            <img src={logoBase64} alt="Logo" className="h-10 object-contain" />
          ) : (
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-brand text-white overflow-hidden shadow-lg shadow-brand-purple/20">
              <Camera className="w-5 h-5 absolute z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-[spin_3s_linear_infinite]" />
            </div>
          )}
          <span className="font-display font-bold text-xl tracking-tight">
            SIGMA<span className="text-brand-purple font-light">PHOTOGRAPHY</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-brand-purple transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-gray-700 hover:text-brand-purple transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="text-sm font-medium text-white bg-gray-900 rounded-full px-5 py-2 hover:bg-brand-purple transition-all shadow-md"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 md:hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-gray-800 hover:text-brand-purple transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-gray-100 my-2" />
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="text-base font-medium text-left text-gray-800 hover:text-brand-purple"
              >
                Login
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/signup');
                }}
                className="text-base font-medium text-center text-white bg-gradient-brand rounded-full px-5 py-2 hover:opacity-90 transition-all shadow-md"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
