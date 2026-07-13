import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, MapPin, Phone, Mail, Instagram, ArrowRight } from 'lucide-react';
import TestimonialsCarousel from './TestimonialsCarousel';
import { useSiteContent } from '../hooks/useSiteContent';
import CustomServicesSection from './CustomServicesSection';

const defaultFaqs = [
  { question: "How long does it take to receive the final video?", answer: "Most of our standard templates are delivered within 24 hours. Highly customized 4K videos might take up to 48 hours depending on the complexity of the revisions." },
  { question: "Can I use my own music?", answer: "Yes! Our Secure Artifact Vault allows you to easily upload your own high-quality music track, which our editors will seamlessly sync with the transitions." },
  { question: "Do you offer revisions?", answer: "Absolutely. We offer 2 rounds of free revisions for minor text or timing adjustments to ensure your invitation is perfect." }
];

export default function ContactAndTestimonials() {
  const { testimonials: cmsTestimonials, faqs: cmsFaqs, contact } = useSiteContent();
    
  // Filter visible testimonials and sort by order
  const displayTestimonials = cmsTestimonials
    .filter(t => t.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const displayFaqs = cmsFaqs.length > 0 ? cmsFaqs : defaultFaqs;


  return (
    <div className="w-full">
      {/* Testimonials Screenshot Gallery */}
            <section className="py-24 border-y border-brand-purple/10 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-electric/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Client <span className="text-gradient-primary">Triumphs</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Hear what our amazing couples have to say about their cinematic invitations.
            </p>
          </div>
          
          <TestimonialsCarousel testimonials={displayTestimonials} />
        </div>
      </section>

      <CustomServicesSection />

      {/* FAQ */}
      <section className="py-24 relative bg-red-50/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {displayFaqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-brand-purple/20 transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-between">
                  {faq.question || faq.q}
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-purple shadow-sm">
                    <span className="font-bold text-lg">+</span>
                  </div>
                </h3>
                <p className="text-gray-600 font-medium leading-relaxed pr-12">{faq.answer || faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Map */}
      <section id="contact" className="py-24 relative">
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-brand-purple/10 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Contact Info */}
            <div>
              <span className="text-brand-electric font-bold tracking-widest uppercase text-sm mb-4 block">Get In Touch</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 text-brand-navy">
                Ready to create your <br/>cinematic invite?
              </h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-brand-purple/10 hover:bg-white/80 transition-colors">
                  <div className="w-12 h-12 bg-gradient-premium rounded-full flex items-center justify-center shadow-md">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-slate">Call Us</p>
                    <p className="text-lg font-bold text-brand-navy">{contact?.phone || '9162478070'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-brand-purple/10 hover:bg-white/80 transition-colors">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-slate">WhatsApp</p>
                    <p className="text-lg font-bold text-brand-navy">{contact?.whatsapp || '9162478070'}</p>
                  </div>
                  <button onClick={() => {
                      if (contact?.whatsapp) {
                        window.open(`https://wa.me/${contact.whatsapp}`, '_blank');
                      }
                  }} className="ml-auto bg-[#25D366] hover:bg-[#128C7E] shadow-lg shadow-[#25D366]/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all">
                    Chat Now
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-brand-purple/10 hover:bg-white/80 transition-colors">
                  <div className="w-12 h-12 bg-brand-navy/5 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-slate">Email Address</p>
                    <p className="text-lg font-bold text-brand-navy">{contact?.email || 'Sigmaphotography0001@gmail.com'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-brand-purple/10 hover:bg-white/80 transition-colors">
                  <div className="w-12 h-12 bg-brand-navy/5 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-slate">Office</p>
                    <p className="text-lg font-bold text-brand-navy">{contact?.office || 'Patna, Bihar, India'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a href={contact?.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : '#'} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-pink-500/20">
                   <Instagram className="w-5 h-5 text-white" />
                </a>
                <span className="font-bold text-brand-navy">@{contact?.instagram?.replace('@', '') || 'sigmaphotography0'}</span>
              </div>
            </div>

            {/* Map Preview */}
            <div className="w-full h-[500px] glassmorphism-dark rounded-[2rem] overflow-hidden p-2 relative group shadow-2xl shadow-brand-purple/20">
              <div className="w-full h-full rounded-[1.8rem] overflow-hidden relative bg-gray-50 border border-brand-purple/20">
                {contact?.mapUrl ? (
                   <iframe src={contact.mapUrl} className="w-full h-full border-0 transition-all duration-700" loading="lazy"></iframe>
                ) : (
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115132.8610723877 federally!2d85.0730022718151!3d25.6081755716584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f29937c52d4f05%3A0x831a0e05f607b270!2sPatna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1701198544001!5m2!1sen!2sin" 
                    className="w-full h-full border-0 transition-all duration-700" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="SigmaPhotography Location"
                  ></iframe>
                )}
                
                {/* Pointer Events none to not obscure interaction but still show gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent pointer-events-none" />
                
                {/* Call to action over map */}
                <div className="absolute bottom-6 left-6 right-6">
                  <button onClick={() => {
                      if (contact?.mapUrl) window.open(contact.mapUrl, '_blank');
                  }} className="w-full bg-white text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-electric hover:text-white transition-colors group/btn">
                    Get Directions
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
