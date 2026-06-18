import { Camera, Instagram, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

export default function Footer() {
  const { contact, logoBase64 } = useSiteContent();

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

        <div className="pt-8 border-t border-brand-purple/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-brand-lavender/60">© {new Date().getFullYear()} SIGMAPHOTOGRAPHY. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-brand-rose transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-rose transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
