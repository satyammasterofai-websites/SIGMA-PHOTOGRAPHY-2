import { motion } from 'motion/react';
import { PlaySquare, Settings, Calculator, MessageSquare, UploadCloud, LayoutDashboard, Search, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { Link } from 'react-router-dom';

const defaultFeatures = [
  {
    id: '01',
    title: 'Premium Video Gallery',
    description: 'Browse through our expansive collection of trending and classic designs with intelligent smart search and category filters.',
    icon: <PlaySquare className="w-8 h-8 text-brand-purple" />,
    actionLink: '/gallery',
    actionText: 'Explore Gallery',
    mockup: (
      <div className="w-full bg-white rounded-xl shadow-inner border border-gray-100 p-3 flex flex-col gap-2">
        <div className="flex gap-2 mb-1">
          <span className="bg-gray-100 text-[10px] px-2 py-1 rounded-full text-gray-600 font-medium">All</span>
          <span className="bg-brand-purple/10 text-[10px] px-2 py-1 rounded-full text-brand-purple font-medium">Trending</span>
          <span className="bg-gray-100 text-[10px] px-2 py-1 rounded-full text-gray-600 font-medium">Latest</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-20 bg-gray-200 rounded-lg overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=500&q=80" alt="mock" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center"><Search className="w-4 h-4 text-white" /></div>
          </div>
          <div className="h-20 bg-gray-200 rounded-lg overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80" alt="mock" className="w-full h-full object-cover opacity-80" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: '02',
    title: 'Self Customization Engine',
    description: 'Personalize every detail. Input names, venues, dates, select music, and see changes instantly in a live preview interface.',
    icon: <Settings className="w-8 h-8 text-brand-indigo" />,
    actionLink: '/gallery',
    actionText: 'Try Customization',
    mockup: (
      <div className="w-full bg-white rounded-xl shadow-inner border border-gray-100 p-3 flex gap-3 h-[120px]">
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
          <div className="h-6 bg-brand-indigo/10 rounded w-full border border-brand-indigo/20 flex items-center px-2">
             <span className="text-[8px] text-brand-indigo font-bold">LIVE UPDATE</span>
          </div>
        </div>
        <div className="w-[60px] bg-gray-900 rounded-lg relative overflow-hidden flex items-center justify-center">
            <div className="text-[10px] text-white font-medium rotate-[-90deg] tracking-widest opacity-50">PREVIEW</div>
        </div>
      </div>
    )
  },
  {
    id: '03',
    title: 'Smart Price Calculator',
    description: 'Transparent pricing based on your needs. Select video types, length, and add-ons to get instant, accurate price quotes.',
    icon: <Calculator className="w-8 h-8 text-brand-electric" />,
    actionLink: '/gallery',
    actionText: 'View Pricing in action',
    mockup: (
      <div className="w-full bg-white rounded-xl shadow-inner border border-gray-100 p-3 h-[120px] flex flex-col justify-between">
        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
           <span className="text-[10px] font-medium text-gray-500">Video Type</span>
           <span className="text-[10px] font-bold text-gray-800">Cinematic 4K</span>
        </div>
        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
           <span className="text-[10px] font-medium text-gray-500">Customizations</span>
           <span className="text-[10px] font-bold text-gray-800">+ Voiceover</span>
        </div>
        <div className="flex justify-between items-end pt-1">
           <span className="text-[10px] font-medium text-gray-500">Total Price</span>
           <span className="text-sm font-bold text-brand-electric">₹ 4,999</span>
        </div>
      </div>
    )
  },
  {
    id: '04',
    title: 'WhatsApp Quick Order',
    description: 'Skip the complex checkout. Every template features a rapid WhatsApp ordering button for instant human support and booking.',
    icon: <MessageSquare className="w-8 h-8 text-green-500" />,
    actionLink: '/gallery',
    actionText: 'Test via Checkout',
    mockup: (
      <div className="w-full h-[120px] bg-white rounded-xl shadow-inner border border-gray-100 p-4 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-green-500/5 blur-xl"></div>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 z-10">
          <MessageSquare className="w-6 h-6 text-green-600" />
        </div>
        <div className="w-32 py-2 bg-green-500 rounded-full text-[10px] font-bold text-white text-center z-10">
          Order via WhatsApp
        </div>
      </div>
    )
  },
  {
    id: '05',
    title: 'Secure Artifact Vault',
    description: 'Seamlessly upload high-resolution photos, custom background music, and event details through our secure upload portal.',
    icon: <UploadCloud className="w-8 h-8 text-brand-purple" />,
    actionLink: '/gallery',
    actionText: 'Test File Uploads',
    mockup: (
      <div className="w-full h-[120px] bg-white rounded-xl shadow-inner border border-gray-100 p-3 flex flex-col gap-2">
         <div className="flex-1 border-2 border-dashed border-brand-purple/30 rounded-lg bg-brand-purple/5 flex flex-col items-center justify-center">
            <UploadCloud className="w-5 h-5 text-brand-purple/50 mb-1" />
            <span className="text-[8px] font-medium text-brand-purple/70">Drag & Drop Media</span>
         </div>
         <div className="flex gap-2">
            <div className="h-6 flex-1 bg-gray-100 rounded flex items-center px-2"><span className="text-[8px] text-gray-500">photo_1.jpg</span></div>
            <div className="h-6 flex-1 bg-gray-100 rounded flex items-center px-2"><span className="text-[8px] text-gray-500">music.mp3</span></div>
         </div>
      </div>
    )
  },
  {
    id: '06',
    title: 'Client Dashboard',
    description: 'Track your order progress in real-time, safely download finalized master files, and manage your user profile in one place.',
    icon: <LayoutDashboard className="w-8 h-8 text-brand-blue" />,
    actionLink: '/dashboard',
    actionText: 'Open Dashboard',
    mockup: (
      <div className="w-full h-[120px] bg-white rounded-xl shadow-inner border border-gray-100 p-3">
         <div className="flex items-center justify-between mb-3">
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
            <div className="w-6 h-6 bg-brand-blue/20 rounded-full"></div>
         </div>
         <div className="w-full h-8 bg-brand-blue/5 border border-brand-blue/10 rounded-lg mb-2 flex items-center justify-between px-2">
            <span className="text-[8px] font-semibold text-brand-blue">#ORD-9921</span>
            <span className="text-[8px] font-bold bg-brand-blue text-white px-2 py-0.5 rounded">Rendering</span>
         </div>
         <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-3">
            <div className="w-[70%] h-full bg-gradient-brand"></div>
         </div>
      </div>
    )
  }
];

export default function Features() {
  const { features: cmsFeatures } = useSiteContent();

  const displayFeatures = cmsFeatures.length > 0 ? cmsFeatures.map((f, i) => ({
    id: f.number || `0${i + 1}`,
    title: f.title || defaultFeatures[i % defaultFeatures.length].title,
    description: f.description || defaultFeatures[i % defaultFeatures.length].description,
    icon: f.icon ? <img src={f.icon} alt="icon" className="w-8 h-8 object-contain" /> : defaultFeatures[i % defaultFeatures.length].icon,
    mockup: defaultFeatures[i % defaultFeatures.length].mockup,
    actionLink: defaultFeatures[i % defaultFeatures.length].actionLink,
    actionText: defaultFeatures[i % defaultFeatures.length].actionText
  })) : defaultFeatures;

  return (
    <section id="features" className="py-24 bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold tracking-widest text-brand-purple uppercase">Our Capabilities</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mt-4 mb-6">
            A Studio-Grade Platform for <br/>Flawless Deliverables
          </h2>
          <p className="text-gray-600 text-lg">
            Experience the intersection of luxury photography aesthetics and modern SaaS efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-[1px] rounded-3xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 hover:from-brand-purple hover:via-brand-electric hover:to-brand-indigo transition-all duration-500 overflow-hidden"
            >
              <div className="h-full w-full bg-white rounded-3xl p-8 flex flex-col relative z-10 transition-colors group-hover:bg-white/95 backdrop-blur-xl">
                
                {/* Number Badge */}
                <span className="absolute top-6 right-6 text-4xl font-display font-black text-gray-100 group-hover:text-brand-purple/10 transition-colors pointer-events-none">
                  {feature.id}
                </span>

                <div className="mb-6 w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-gray-100 shadow-sm">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                  {feature.description}
                </p>

                {/* Mockup Area */}
                <div className="mt-auto pt-6 border-t border-gray-100 group-hover:border-brand-purple/20 transition-colors">
                  {feature.mockup}
                  {feature.actionLink && (
                    <div className="mt-4 text-center">
                      <Link to={feature.actionLink} className="inline-block py-2 px-6 rounded-full bg-brand-purple/5 text-brand-purple text-xs font-bold hover:bg-brand-purple hover:text-white transition-colors border border-brand-purple/20">
                         {feature.actionText} →
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {/* Dividers & Bottom Badges */}
        <div className="mt-20 pt-10 border-t border-gray-200 flex flex-wrap justify-center gap-8 opacity-70">
           <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Fast Delivery</span>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Secure Platform</span>
           </div>
           <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Mobile Friendly</span>
           </div>
        </div>

      </div>
    </section>
  );
}
