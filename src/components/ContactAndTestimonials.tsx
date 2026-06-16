import { motion } from 'motion/react';
import { Star, MessageCircle, MapPin, Phone, Mail, Instagram, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

const defaultTestimonials = [
  {
    name: 'Emily & James',
    review: 'The quality of the wedding invitation video was absolutely breathtaking. It looked like a Hollywood trailer. SIGMAPHOTOGRAPHY delivered beyond our expectations!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1541250848049-b4f714ade240?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Priya Sharma',
    review: 'I customized my engagement invite using their dashboard. It was so easy, and the WhatsApp quick order made the final delivery seamless.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Rahul Verma',
    review: 'Outstanding service and premium designs. The metallic accents and camera lens inspired themes perfectly matched our modern wedding aesthetics.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200'
  }
];

const defaultFaqs = [
  { question: "How long does it take to receive the final video?", answer: "Most of our standard templates are delivered within 24 hours. Highly customized 4K videos might take up to 48 hours depending on the complexity of the revisions." },
  { question: "Can I use my own music?", answer: "Yes! Our Secure Artifact Vault allows you to easily upload your own high-quality music track, which our editors will seamlessly sync with the transitions." },
  { question: "Do you offer revisions?", answer: "Absolutely. We offer 2 rounds of free revisions for minor text or timing adjustments to ensure your invitation is perfect." }
];

export default function ContactAndTestimonials() {
  const { testimonials: cmsTestimonials, faqs: cmsFaqs, contact } = useSiteContent();

  const displayTestimonials = cmsTestimonials.length > 0 ? cmsTestimonials.map(t => ({
    name: t.name,
    review: t.content || '',
    rating: 5,
    image: t.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  })) : defaultTestimonials;

  const displayFaqs = cmsFaqs.length > 0 ? cmsFaqs : defaultFaqs;

  return (
    <div className="w-full">
      {/* Testimonials */}
      <section className="py-24 bg-gray-50 border-t border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Client <span className="text-gradient-brand">Triumphs</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Hear what couples are saying about their cinematic invitation experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col hover:shadow-brand-purple/10 hover:border-brand-purple/20 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-6">
                  {[...Array(t.rating || 5)].map((_, idx) => (
                    <Star key={idx} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="text-gray-700 italic flex-1 mb-8 leading-relaxed">
                  "{t.review}"
                </p>
                <div className="flex items-center gap-4">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover shadow-md" />
                  <span className="font-bold text-gray-900">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white relative">
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
      <section id="contact" className="py-24 bg-gray-900 text-white relative">
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-brand-purple/20 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Contact Info */}
            <div>
              <span className="text-brand-electric font-bold tracking-widest uppercase text-sm mb-4 block">Get In Touch</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
                Ready to create your <br/>cinematic invite?
              </h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Call Us</p>
                    <p className="text-lg font-bold">{contact?.phone || '9162478070'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">WhatsApp</p>
                    <p className="text-lg font-bold">{contact?.whatsapp || '9162478070'}</p>
                  </div>
                  <button onClick={() => {
                      if (contact?.whatsapp) {
                        window.open(`https://wa.me/${contact.whatsapp}`, '_blank');
                      }
                  }} className="ml-auto bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors">
                    Chat Now
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email Address</p>
                    <p className="text-lg font-bold">{contact?.email || 'jhahimanshukumar87@gmail.com'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Office</p>
                    <p className="text-lg font-bold">{contact?.office || 'Patna, Bihar, India'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a href={contact?.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : '#'} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-pink-500/20">
                   <Instagram className="w-5 h-5 text-white" />
                </a>
                <span className="font-medium text-gray-300">@{contact?.instagram?.replace('@', '') || 'sigmaphotography0'}</span>
              </div>
            </div>

            {/* Map Preview */}
            <div className="w-full h-[500px] glassmorphism-dark rounded-[2rem] overflow-hidden p-2 relative group">
              <div className="w-full h-full rounded-[1.8rem] overflow-hidden relative bg-gray-800">
                {contact?.mapUrl ? (
                   <iframe src={contact.mapUrl} className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700" loading="lazy"></iframe>
                ) : (
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115132.8610723877 federally!2d85.0730022718151!3d25.6081755716584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f29937c52d4f05%3A0x831a0e05f607b270!2sPatna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1701198544001!5m2!1sen!2sin" 
                    className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700" 
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
