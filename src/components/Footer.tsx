import { Camera, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

export default function Footer() {
  const { contact, logoBase64 } = useSiteContent();

  return (
    <footer className="bg-gray-950 text-gray-400 py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              {logoBase64 ? (
                 <img src={logoBase64} alt="Logo" className="h-10 object-contain" />
              ) : (
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-brand text-white overflow-hidden shadow-lg shadow-brand-purple/20">
                  <Camera className="w-5 h-5 absolute z-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-[spin_3s_linear_infinite]" />
                </div>
              )}
              <span className="font-display font-bold text-xl tracking-tight text-white">
                SIGMA<span className="text-brand-purple font-light">PHOTOGRAPHY</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Elevating special moments with cinematic, premium customized invitation videos. A perfect blend of technology and luxury photography aesthetics.
            </p>
            <div className="flex gap-4">
              <a href={contact?.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#home" className="hover:text-brand-electric transition-colors">Home</a></li>
              <li><a href="#templates" className="hover:text-brand-electric transition-colors">Templates Gallery</a></li>
              <li><a href="#features" className="hover:text-brand-electric transition-colors">Platform Features</a></li>
              <li><a href="#pricing" className="hover:text-brand-electric transition-colors">Price Calculator</a></li>
              <li><a href="#contact" className="hover:text-brand-electric transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold mb-6">Categories</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-brand-purple transition-colors">Wedding Invitations</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Engagement Invites</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Birthday Trailers</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Anniversary Videos</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Corporate Events</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-electric" />
                <span>{contact?.office || 'Patna, Bihar, India'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-electric" />
                <span>{contact?.phone || '9162478070'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-electric" />
                <span>{contact?.email || 'jhahimanshukumar87@gmail.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} SIGMAPHOTOGRAPHY. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
