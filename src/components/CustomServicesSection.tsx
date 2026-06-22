import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Sparkles, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const websiteTypes = [
  "E-commerce Website", "Beauty Parlour & Salon Website", "Slots Booking Website", 
  "School/College Website", "Portfolio Website", "Medical Appointment Website", 
  "Café Website", "Booking Website", "Biography Website", "Gym Website", 
  "Cybercafe Website", "Clothing Brand Website", "Grocery Store Website", 
  "Wholesaler Website", "New Brand Website", "Shop Website", "Restaurant Website", "Other"
];

export default function CustomServicesSection() {
  const [settings, setSettings] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = await getDoc(doc(db, "content", "custom_services"));
      if (docRef.exists()) {
        const data = docRef.data();
        if (!data.services || data.services.length === 0) {
           data.services = [{
             id: "1",
             title: "Website Development",
             description: "Get a custom built, responsive and modern website designed exclusively for your brand and business growth.",
             buttonText: "Create Now",
             whatsappNumber: "911234567890",
             image: ""
           }];
        }
        setSettings(data);
      } else {
        setSettings({
          enabled: true,
          title: "NEW SERVICE – Website Development",
          description: "Premium high-converting digital solutions tailored for your business success.",
          badgeLine: "Premium Services",
          services: [{
             id: "1",
             title: "Website Development",
             description: "Get a custom built, responsive and modern website designed exclusively for your brand and business growth.",
             buttonText: "Create Now",
             whatsappNumber: "911234567890",
             image: ""
          }]
        });
      }
    };
    fetchSettings();
  }, []);

  if (!settings || !settings.enabled || !settings.services || settings.services.length === 0) return null;

  const openForm = (service: any) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  return (
    <div className="py-24 relative overflow-hidden" id="premium-services">
      <div className="absolute inset-0 max-w-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 relative">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 font-medium text-sm mb-6 shadow-sm border border-red-100"
           >
             <Sparkles className="w-4 h-4" />
             <span className="uppercase tracking-wider text-xs font-bold">{settings.badgeLine || "Premium Services"}</span>
           </motion.div>
           
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-black font-serif mb-6 drop-shadow-sm"
           >
             {settings.title || "NEW SERVICE – Website Development"}
           </motion.h2>
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="text-lg text-gray-700 max-w-2xl mx-auto font-medium"
           >
             {settings.description || "Premium high-converting digital solutions tailored for your business success."}
           </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {settings.services?.map((service: any, idx: number) => (
            <motion.div
              key={service.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 border border-red-100 shadow-[0_20px_40px_-15px_rgba(220,38,38,0.15)] relative group cursor-pointer overflow-hidden flex flex-col h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-pink-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-[2.2rem] blur opacity-0 group-hover:opacity-20 transition duration-500 pointer-events-none" />
              
              <div className="relative z-10 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-red-200/50 group-hover:scale-110 transition-transform duration-500">
                  {service.image ? (
                     <img src={service.image} alt={service.title} className="w-10 h-10 object-contain drop-shadow-sm" />
                  ) : (
                     <Globe className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-2xl font-bold font-display text-gray-900 mb-3">{service.title || "Website Development"}</h3>
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                  {service.description || "Get a modern, fast, and responsive website built."}
                </p>
              </div>

              <div className="mt-auto relative z-10 pt-6">
                <button 
                  onClick={() => openForm(service)}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-red-600 uppercase tracking-widest text-xs to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 group/btn flex items-center justify-center gap-2"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {service.buttonText || "Create Now"}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && selectedService && (
          <ServiceOrderForm 
            service={selectedService} 
            onClose={() => setIsFormOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ServiceOrderForm({ service, onClose }: { service: any, onClose: () => void }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    email: "",
    businessName: "",
    websiteType: "",
    otherWebsiteType: "",
    description: "",
    features: "",
    budget: "",
    completionDate: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "service_enquiries"), {
        ...formData,
        serviceTitle: service.title,
        createdAt: new Date(),
        status: "Pending"
      });

      const actualType = formData.websiteType === "Other" ? formData.otherWebsiteType : formData.websiteType;
      const message = `*NEW ${service.title.toUpperCase()} ENQUIRY* 🚀%0A%0A` +
        `*Customer Details*%0A` +
        `👤 Name: ${formData.fullName}%0A` +
        `📱 Phone: ${formData.phone}%0A` +
        `💬 WhatsApp: ${formData.whatsapp}%0A` +
        `📧 Email: ${formData.email}%0A%0A` +
        `*Project Details*%0A` +
        `🏢 Business: ${formData.businessName}%0A` +
        `🌐 Type: ${actualType}%0A` +
        `📝 Description: ${formData.description}%0A` +
        `✨ Features: ${formData.features}%0A` +
        `💰 Budget: ${formData.budget}%0A` +
        `📅 Timeline: ${formData.completionDate}%0A` +
        `📌 Notes: ${formData.notes || 'None'}`;

      const phoneNum = service.whatsappNumber?.replace(/[^0-9]/g, '') || "919011985955"; 
      const whatsappUrl = `https://wa.me/${phoneNum}?text=${message}`;

      window.open(whatsappUrl, '_blank');
      toast.success("Enquiry submitted! Redirecting to WhatsApp...");
      onClose();
    } catch (err) {
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dynamicTypes = service.options ? service.options.split(',').map((o: string) => o.trim()).filter(Boolean) : websiteTypes;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-red-100"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-sm">
                <Globe className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-xl font-bold font-display text-gray-900">{service.title}</h3>
               <p className="text-xs text-red-600 font-medium tracking-wide uppercase">Start Your Project</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full text-gray-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <form id="serviceForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                   <Phone className="w-4 h-4 text-red-500" />
                   Contact Details
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                  <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                   <Globe className="w-4 h-4 text-red-500" />
                   Project Details
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input required type="text" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type *</label>
                  <select required value={formData.websiteType} onChange={e => setFormData({...formData, websiteType: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50">
                    <option value="">Select a type...</option>
                    {dynamicTypes.map((t: string) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {formData.websiteType === "Other" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Please Specify *</label>
                    <input required type="text" value={formData.otherWebsiteType} onChange={e => setFormData({...formData, otherWebsiteType: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50" />
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget *</label>
                  <input required type="text" placeholder="e.g. ₹10,000 - ₹20,000" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Completion Date *</label>
                  <input required type="date" value={formData.completionDate} onChange={e => setFormData({...formData, completionDate: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Description *</label>
                  <textarea required rows={3} placeholder="Tell us about your business..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Features *</label>
                  <textarea required rows={3} placeholder="E-commerce, booking system, chat, etc." value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                  <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border bg-gray-50 resize-none" />
                </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button 
            form="serviceForm"
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold tracking-wide hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? 'Sending...' : 'Submit on WhatsApp'}
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
