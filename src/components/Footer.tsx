import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Instagram, Mail, Phone, MapPin, Sparkles, Palette, Lock } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import DesignerPasscodeModal, { isDesignerGateUnlocked } from './DesignerPasscodeModal';

export default function Footer() {
  const { contact, logoBase64 } = useSiteContent();
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleDesignerPortalClick = () => {
    if (isDesignerGateUnlocked()) {
      navigate('/designer');
    } else {
      setIsPasscodeModalOpen(true);
    }
  };

  const handlePasscodeSuccess = () => {
    navigate('/designer');
  };

  return (
    <footer className="bg-brand-navy text-gray-300 py-20 border-t-4 border-brand-purple relative overflow-hidden">
      
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-premium" />
      <div className="absolute -top-[200px] right-0 w-[400px] h-[400px] bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-brand-rose/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[200px] h-[200px] bg-brand-cyan/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              {logoBase64 ? (
                 <img src={logoBase64} alt="Logo" className="h-10 object-contain drop-shadow-lg" />
              ) : (
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-primary text-white overflow-hidden shadow-lg shadow-brand-purple/20">
                  <Camera className="w-5 h-5 absolute z-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-[spin_3s_linear_infinite]" />
                </div>
              )}
              <span className="font-display font-bold text-xl tracking-tight text-white">
                SIGMA<span className="text-brand-purple font-light">PHOTOGRAPHY</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 font-medium text-brand-lavender/80">
              Elevating special moments with cinematic, premium customized invitation videos. A perfect blend of technology and luxury aesthetics.
            </p>
            <div className="flex gap-4">
              <a href={contact?.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : '#'} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full glassmorphism-dark flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-brand-rose hover:to-brand-purple hover:text-white transition-all transform hover:scale-110 shadow-lg border-white/10">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-brand-rose" />
               Quick Links
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#home" className="hover:text-brand-cyan transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-brand-cyan/0 group-hover:bg-brand-cyan transition-colors" /> Home</a></li>
              <li><a href="#templates" className="hover:text-brand-cyan transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-brand-cyan/0 group-hover:bg-brand-cyan transition-colors" /> Gallery</a></li>
              <li>
                <button
                  onClick={handleDesignerPortalClick}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 group text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50 group-hover:bg-amber-400 transition-colors" />
                  Designer Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-brand-cyan" />
               Categories
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-brand-rose transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-brand-rose/0 group-hover:bg-brand-rose transition-colors" /> Weddings</a></li>
              <li><a href="#" className="hover:text-brand-rose transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-brand-rose/0 group-hover:bg-brand-rose transition-colors" /> Engagements</a></li>
              <li><a href="#" className="hover:text-brand-rose transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-brand-rose/0 group-hover:bg-brand-rose transition-colors" /> Birthdays</a></li>
              <li><a href="#" className="hover:text-brand-rose transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-brand-rose/0 group-hover:bg-brand-rose transition-colors" /> Anniversaries</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-brand-purple" />
               Contact Us
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-brand-purple/30 transition-colors">
                <MapPin className="w-5 h-5 mt-0.5 text-brand-rose shrink-0" />
                <span>{contact?.office || 'Patna, Bihar, India'}</span>
              </li>
              <li className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-brand-purple/30 transition-colors">
                <Phone className="w-5 h-5 text-brand-cyan shrink-0" />
                <span>{contact?.phone || '9162478070'}</span>
              </li>
              <li className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-brand-purple/30 transition-colors">
                <Mail className="w-5 h-5 text-brand-purple shrink-0" />
                <span>{contact?.email || 'Sigmaphotography0001@gmail.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dedicated Designer Portal Callout Banner */}
        <div className="mb-12 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-950/60 via-purple-950/60 to-amber-950/40 border border-rose-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30 ring-2 ring-amber-400/30">
              <Palette className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h4 className="text-lg font-bold text-white tracking-tight">Sigma Photography Designer Network</h4>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Staff Only
                </span>
              </div>
              <p className="text-xs text-gray-300 max-w-lg">
                Are you a verified video editor or template designer? Access your assigned customer orders, submission queue, and live design dashboard.
              </p>
            </div>
          </div>

          <button
            onClick={handleDesignerPortalClick}
            className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 shadow-xl shadow-rose-600/30 border border-amber-300/40 transition-all transform hover:scale-[1.03] active:scale-95 shrink-0"
          >
            <Lock className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
            <span>Designer Portal</span>
            <span className="text-[10px] bg-black/40 text-amber-200 px-2 py-0.5 rounded-full border border-amber-300/30">
              Restricted
            </span>
          </button>
        </div>

        <div className="pt-8 border-t border-brand-purple/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-brand-lavender/60">© {new Date().getFullYear()} SIGMAPHOTOGRAPHY. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400">
            <button
              onClick={handleDesignerPortalClick}
              className="text-amber-400/90 hover:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Designer Portal</span>
            </button>
            <a href="#" className="hover:text-brand-rose transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-rose transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Passcode Modal Gate */}
      <DesignerPasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSuccess={handlePasscodeSuccess}
      />
    </footer>
  );
}
