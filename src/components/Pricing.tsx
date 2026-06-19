import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const pricingPlans = [
  {
    name: 'Standard Template',
    price: 1999,
    description: 'Perfect for elegant yet simple wedding invitations.',
    features: ['1080p Full HD Render', 'Standard Music Track', 'Basic Revisions (1 Round)', 'Delivery in 48 Hours'],
    popular: false
  },
  {
    name: 'Premium Cinematic',
    price: 3499,
    description: 'The luxury 4K experience with highly customized details.',
    features: ['4K Ultra HD Render', 'Custom Voiceover Support', 'Upload Custom Music', 'Unlimited Revisions', 'Delivery in 24 Hours', 'Priority WhatsApp Support'],
    popular: true
  },
  {
    name: 'Custom Storyboard',
    price: 6999,
    description: 'Bespoke design built uniquely for your grand story.',
    features: ['Everything in Premium', 'Custom Scene Creation', 'Dedicated Motion Designer', 'Raw Project Files', 'Same-Day Delivery'],
    popular: false
  }
];

export default function Pricing() {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'config'));
        if (snap.exists()) {
          setCoupons(snap.data().coupons || []);
        }
      } catch (err) {}
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === 'SIGMA20') {
      setDiscount(0.20);
      setSuccessMsg('20% Discount Applied Successfully!');
      return;
    }

    const matched = coupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (matched) {
       if (matched.expiryDate) {
         const today = new Date().toISOString().split('T')[0];
         if (today > matched.expiryDate) {
            setErrorMsg("This coupon has expired");
            setDiscount(0);
            return;
         }
       }
       setDiscount(Number(matched.percentage) / 100);
       setSuccessMsg(`${matched.percentage}% Discount Applied Successfully!`);
    } else {
       setDiscount(0);
       setErrorMsg("Invalid code");
    }
  };

  return (
    <section id="pricing" className="py-24 bg-brand-ivory w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold tracking-widest text-brand-purple uppercase bg-brand-purple/5 px-4 py-1.5 rounded-full border border-brand-purple/20">Pricing Packages</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-navy mt-6 mb-4">
            Luxury within Reach
          </h2>
          <p className="text-brand-slate text-lg font-medium">
            Transparent pricing for flawless cinematic masterpieces.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12 glassmorphism-dark p-6 rounded-3xl">
           <h3 className="text-white font-bold mb-3 text-center">Have a Coupon Code?</h3>
           <div className="flex gap-2">
             <input 
               type="text" 
               value={couponCode}
               onChange={(e) => setCouponCode(e.target.value)}
               placeholder="Enter SIGMA20"
               className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
             />
             <button onClick={handleApplyCoupon} className="px-6 py-3 bg-gradient-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-brand-purple/20">
               Apply
             </button>
           </div>
           {successMsg ? (
             <p className="text-brand-cyan text-sm mt-3 text-center font-medium animate-pulse">{successMsg}</p>
           ) : (
             errorMsg && <p className="text-brand-rose text-sm mt-3 text-center opacity-80">{errorMsg}</p>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan, index) => {
            const finalPrice = discount > 0 ? Math.floor(plan.price * (1 - discount)) : plan.price;
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-[2px] rounded-[2rem] bg-gradient-to-br ${plan.popular ? 'from-brand-purple via-brand-cyan to-brand-blue shadow-2xl shadow-brand-purple/20 scale-105 z-10' : 'from-brand-lavender/40 via-white to-brand-blush/30 hover:from-brand-purple hover:to-brand-cyan shadow-xl shadow-brand-navy/5'} transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-premium text-white text-xs font-black uppercase tracking-wider px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                )}
                
                <div className="h-full w-full bg-white/95 backdrop-blur-2xl rounded-[1.9rem] p-8 flex flex-col relative z-10">
                  <h3 className="text-2xl font-bold text-brand-navy mb-2">{plan.name}</h3>
                  <p className="text-sm text-brand-slate font-medium mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    {discount > 0 && (
                      <span className="text-brand-slate/50 line-through text-lg font-bold mr-2">₹ {plan.price.toLocaleString()}</span>
                    )}
                    <span className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-primary">
                      ₹ {finalPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="h-px w-full bg-brand-lavender mb-6" />
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 rounded-full bg-brand-purple/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-brand-purple font-bold" />
                        </div>
                        <span className="text-gray-700 font-medium text-sm leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/gallery" className={`py-4 w-full rounded-2xl text-center font-bold transition-all ${plan.popular ? 'bg-gradient-premium text-white shadow-lg hover:opacity-90 shadow-brand-purple/30' : 'bg-brand-purple/5 text-brand-purple border border-brand-purple/20 hover:bg-brand-purple hover:text-white'}`}>
                    Choose {plan.name.split(' ')[0]}
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
