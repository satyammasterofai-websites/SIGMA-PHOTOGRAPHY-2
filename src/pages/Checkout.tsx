import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Upload, X, File, ShieldCheck, CheckCircle2, MessageSquare, CreditCard, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import VideoModal from '../components/VideoModal';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateTemplate = location.state?.template;
  
  const [template, setTemplate] = useState<any>(stateTemplate || null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(!stateTemplate);
  const [showVideo, setShowVideo] = useState(false);
  
  // Custom Fields State
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  // File Uploads
  const [files, setFiles] = useState<Array<{ name: string, base64: string }>>([]);
  const [fileProgress, setFileProgress] = useState(0);

  // Pricing State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Auth User
  const { user } = useAuthStore();

  // Additional Details State
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');

  // Payment Options Popups
  const [paymentSuccessPopup, setPaymentSuccessPopup] = useState<{show: boolean, msg: string}>({show: false, msg: ''});

  useEffect(() => {
    const fetchData = async () => {
      try {
         if (!id) return;
         
         // Try fetching if we don't have the template yet or we just want fresh settings
         try {
           const settingsSnap = await getDoc(doc(db, 'settings', 'config'));
           if (settingsSnap.exists()) {
             setSettings(settingsSnap.data());
           }
         } catch (err) {
           console.error("Error fetching settings:", err);
         }

         if (!template) {
           const tmplSnap = await getDoc(doc(db, 'templates', id));
           if (tmplSnap.exists()) {
             setTemplate({ id: tmplSnap.id, ...tmplSnap.data() });
           } else {
             toast.error("Template not found");
           }
         }
      } catch (err) {
         console.error("Template fetch error:", err);
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, [id, template]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       let uploaded = [...files];
       setFileProgress(0);
       for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = (ev) => {
              uploaded.push({ name: file.name, base64: ev.target?.result as string });
              setFileProgress(Math.round(((i + 1) / e.target.files!.length) * 100));
              resolve();
            };
            reader.readAsDataURL(file);
          });
       }
       setFiles(uploaded);
       toast.success("Files successfully uploaded to Secure Vault");
    }
  };

  const removeFile = (index: number) => {
     const newFiles = [...files];
     newFiles.splice(index, 1);
     setFiles(newFiles);
  };

  const applyCoupon = () => {
     if (!couponCode.trim()) return;
     if (!settings?.coupons) {
       toast.error("Invalid coupon code");
       return;
     }
     
     const matched = settings.coupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
     if (matched) {
       // Ignore expiry for now or simple check
       if (matched.expiryDate) {
         const today = new Date().toISOString().split('T')[0];
         if (today > matched.expiryDate) {
            toast.error("This coupon has expired");
            return;
         }
       }
       setAppliedCoupon(matched);
       toast.success(`Coupon Applied! ${matched.percentage}% OFF`);
     } else {
       toast.error("Invalid coupon code");
     }
  };

  // Pricing Calculations
  const basePrice = Number(template?.price) || 0;
  const initialPrice = template?.discountPrice ? Number(template.discountPrice) : basePrice;
  const discountAmount = appliedCoupon ? (initialPrice * (Number(appliedCoupon.percentage) / 100)) : 0;
  const finalPrice = Math.round(initialPrice - discountAmount);

  // WhatsApp Redirect URL
  const [waUrlToOpen, setWaUrlToOpen] = useState('');

  const createOrderRecord = async (paymentStatus: string, viaMethod: string) => {
     try {
       const orderRef = await addDoc(collection(db, 'orders'), {
          createdAt: new Date().toISOString(),
          templateId: template?.id || '',
          templateName: template?.title || template?.name || 'Template',
          userId: user ? user.uid : null,
          customerName: customerName || '',
          customerPhone: customerPhone || '',
          price: finalPrice || 0,
          paymentStatus: paymentStatus || 'Pending',
          status: 'Pending',
          customData: formData || {},
          filesCount: files.length || 0,
          viaMethod: viaMethod || 'Direct'
       });

       if (files.length > 0) {
          try {
             await addDoc(collection(db, 'order_files'), {
                orderId: orderRef.id,
                userId: user ? user.uid : null,
                files: files
             });
          } catch(err) {
             console.error("Files too large or storage error:", err);
          }
       }
       return orderRef.id;
     } catch (e) {
       console.error(e);
       return 'ORDER_ERR';
     }
  };

  const getWaUrl = (orderId: string) => {
     const number = settings?.whatsapp?.number || '9162478070';
     const displayOrderId = orderId === 'ORDER_ERR' ? `REQ-${Math.floor(Math.random() * 100000)}` : orderId;
     
     let customFieldsText = '';
     if (template?.customFields && template.customFields.length > 0) {
         customFieldsText += `*Customization Details*`;
         for(const f of template.customFields) {
            customFieldsText += `\n- ${f.name}: ${formData[f.id] || 'Not provided'}`;
         }
         customFieldsText += '\n\n';
     }
     
     let pricingText = `*Pricing Summary*\nBase Price: ₹${basePrice}`;
     if (basePrice > initialPrice) {
         pricingText += `\nDiscounted Price: ₹${initialPrice}`;
     }
     if (couponCode && appliedCoupon) {
        pricingText += `\nCoupon Applied: ${appliedCoupon.code} (-${appliedCoupon.percentage}%)`;
     }
     pricingText += `\n*Final Price: ₹${finalPrice}*`;

     const allDetails = customFieldsText + pricingText;
     
     let details = '';
     if (settings?.whatsapp?.messageFormat && settings.whatsapp.enabled !== false) {
         details = settings.whatsapp.messageFormat
            .replace('{template}', template?.title || 'Unknown')
            .replace('{templateId}', template?.id || 'Unknown')
            .replace('{orderId}', displayOrderId)
            .replace('{name}', customerName || 'N/A')
            .replace('{phone}', customerPhone || 'N/A')
            .replace('{details}', allDetails);
     } else {
         details = `*Booking Request*\n\nTemplate: ${template?.title || 'Unknown'}\nTemplate ID: ${template?.id}\nOrder ID: ${displayOrderId}\n\n*Customer Details*\nName: ${customerName}\nPhone: ${customerPhone}\n\n${allDetails}`;
     }
     
     const encodedMsg = encodeURIComponent(details);
     return `https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${encodedMsg}`;
  };

  const proceedToWhatsApp = async (viaMethod: string) => {
     setPaymentSuccessPopup({ show: true, msg: 'Saving order details...' });
     const orderId = await createOrderRecord('Pending', viaMethod);
     const url = getWaUrl(orderId);
     setWaUrlToOpen(url);
     setPaymentSuccessPopup({ show: true, msg: 'Order saved! Please click below to send us your details on WhatsApp.' });
  };

  const initiateOrder = () => {
     if (!customerName || !customerPhone) {
        toast.error("Please provide your Name and Phone Number");
        return;
     }
     const requiredFields = template?.customFields?.filter((f: any) => f.required) || [];
     for (const f of requiredFields) {
       if (!formData[f.id]) {
          toast.error(`Please fill out: ${f.name}`);
          return;
       }
     }
     
     // Skip payment gateway entirely, just proceed to WhatsApp
     proceedToWhatsApp('WhatsApp Direct');
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div></div>;

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Template Not Found</h2>
        <button onClick={() => navigate('/gallery')} className="px-6 py-2 bg-brand-purple text-white rounded-xl">Back to Gallery</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showVideo && template?.videoUrl && <VideoModal url={template.videoUrl} onClose={() => setShowVideo(false)} />}
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
             
             {/* Left Column: Form & Customization */}
             <div className="flex-1 space-y-8">
               
               {/* Contact Block */}
               <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                       <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-brand-purple" placeholder="John Doe" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                       <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-brand-purple" placeholder="+91 9876543210" />
                     </div>
                  </div>
               </div>

               {/* Custom Fields Block */}
               {template?.customFields && template.customFields.length > 0 && (
                 <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                   <h2 className="text-2xl font-bold text-gray-900 mb-2">Customization Details</h2>
                   <p className="text-gray-500 mb-6">Fill in the details you want to appear on the invitation.</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {template.customFields.map((field: any) => (
                       <div key={field.id} className="md:col-span-1">
                         <label className="block text-sm font-medium text-gray-700 mb-2">{field.name} {field.required && '*'}</label>
                         <input 
                           type="text" 
                           value={formData[field.id] || ''} 
                           onChange={e => setFormData({...formData, [field.id]: e.target.value})} 
                           className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-brand-purple" 
                         />
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Secure Artifact Vault */}
               <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                   <div className="flex items-center gap-2 mb-2">
                     <ShieldCheck className="w-6 h-6 text-green-500" />
                     <h2 className="text-2xl font-bold text-gray-900">Secure Artifact Vault</h2>
                   </div>
                   <p className="text-gray-500 mb-6">Upload photos, assets, or text notes for your video.</p>
                   
                   <div className="relative border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-brand-purple transition-colors cursor-pointer mb-6 group">
                      <Upload className="w-10 h-10 text-gray-400 group-hover:text-brand-purple mb-4" />
                      <p className="font-medium text-gray-700 mb-1">Click to upload files</p>
                      <p className="text-sm text-gray-500">Max size 50MB. PNG, JPG, PDF.</p>
                      <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>

                   {fileProgress > 0 && fileProgress < 100 && (
                     <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                       <div className="bg-brand-purple h-2.5 rounded-full" style={{ width: `${fileProgress}%` }}></div>
                     </div>
                   )}

                   {files.length > 0 && (
                     <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-400">Uploaded Files</h4>
                        {files.map((file, i) => (
                           <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3">
                              <div className="flex items-center gap-3">
                                 <File className="w-5 h-5 text-brand-purple" />
                                 <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">{file.name}</span>
                              </div>
                              <button onClick={() => removeFile(i)} className="text-red-500 p-1 hover:bg-red-50 rounded-lg">
                                <X className="w-4 h-4" />
                              </button>
                           </div>
                        ))}
                     </div>
                   )}
                   
                   <div className="mt-6 border-t border-gray-100 pt-6">
                      <p className="text-sm text-gray-500 text-center mb-4">Alternatively, send files directly on WhatsApp.</p>
                      <button onClick={() => proceedToWhatsApp('File Upload Fallback')} className="w-full py-3 bg-green-50 text-green-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-100 transition-colors">
                        <MessageSquare className="w-5 h-5" /> Send Files on WhatsApp
                      </button>
                   </div>
               </div>
             </div>
             
             {/* Right Column: Pricing & Summary */}
             <div className="w-full lg:w-[400px]">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-32">
                   <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                   
                   {/* Template Mini-Card */}
                   <div className="flex gap-4 mb-6">
                      <div className="w-24 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative group cursor-pointer" onClick={() => template?.videoUrl && setShowVideo(true)}>
                         {template?.thumbnailBase64 && <img src={template.thumbnailBase64} alt="Thumb" className="w-full h-full object-cover" />}
                         {template?.videoUrl && (
                           <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                              <Play className="w-6 h-6 text-white fill-white" />
                           </div>
                         )}
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900 line-clamp-1">{template?.title}</h4>
                         <span className="text-xs font-medium text-brand-purple px-2 py-0.5 bg-brand-purple/10 rounded-full mt-1 inline-block">{template?.category}</span>
                      </div>
                   </div>

                   <hr className="border-gray-100 mb-6" />

                   <div className="flex gap-2 mb-6">
                     <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Coupon Code" className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm" />
                     <button onClick={applyCoupon} className="px-4 py-2 bg-gray-900 text-white font-medium rounded-xl text-sm">Apply</button>
                   </div>

                   <div className="space-y-4 mb-6 text-sm">
                      <div className="flex justify-between text-gray-600">
                         <span>Template Base Price</span>
                         <span>₹{basePrice}</span>
                      </div>
                      {basePrice > initialPrice && (
                        <div className="flex justify-between text-gray-600">
                           <span>Template Discount</span>
                           <span className="text-green-600">- ₹{(basePrice - initialPrice).toFixed(0)}</span>
                        </div>
                      )}
                      
                      {appliedCoupon && (
                        <div className="flex justify-between items-center text-green-600 font-medium">
                           <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Coupon ({appliedCoupon.code})</span>
                           <span>- ₹{discountAmount.toFixed(0)}</span>
                        </div>
                      )}
                   </div>

                   <hr className="border-gray-100 mb-6" />

                   <div className="flex justify-between items-center mb-8">
                     <span className="text-lg font-bold text-gray-900">Total</span>
                     <span className="text-3xl font-bold text-gray-900">₹{finalPrice}</span>
                   </div>

                   <button onClick={initiateOrder} className="w-full py-4 bg-brand-purple hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                      Place Order
                   </button>
                </div>
             </div>

          </div>
        </div>
      </main>
      
      {/* Popups */}
      {paymentSuccessPopup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-purple-50 mx-auto flex items-center justify-center text-brand-purple mb-6 animate-pulse">
                {waUrlToOpen ? <MessageSquare className="w-10 h-10" /> : <CreditCard className="w-10 h-10" />}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{waUrlToOpen ? 'Ready to send' : 'Processing...'}</h3>
              <p className="text-gray-600 mb-8">{paymentSuccessPopup.msg}</p>
              
              {waUrlToOpen ? (
                <a 
                   href={waUrlToOpen} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   onClick={() => {
                     setPaymentSuccessPopup({show: false, msg: ''});
                     navigate(user ? '/dashboard' : '/');
                   }}
                   className="w-full py-3 bg-brand-purple text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 transition"
                >
                   <MessageSquare className="w-5 h-5"/> Send to WhatsApp
                </a>
              ) : (
                <div className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl flex items-center justify-center cursor-not-allowed">
                  Please wait...
                </div>
              )}
           </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
