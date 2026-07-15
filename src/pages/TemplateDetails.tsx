import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuthStore } from "../store/useAuthStore";
import { useSiteStore } from "../store/useSiteStore";
import toast from "react-hot-toast";
import VideoModal from "../components/VideoModal";
import { Play, Star, ShoppingBag, CheckCircle2, Tag, ChevronRight, Users, Clock, ArrowLeft, Send } from "lucide-react";

export default function TemplateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { settings, init: initSettings } = useSiteStore();
  useEffect(() => { initSettings(); }, [initSettings]);
  
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [onlineUsersCount, setOnlineUsersCount] = useState(50);
  
  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  
  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "templates", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTemplate({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Template not found");
          navigate("/gallery");
        }
      } catch (error) {
        console.error("Error fetching template", error);
        toast.error("Failed to load template details");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
    
    // Simulate online users
    const base = 50 + (user ? 1 : 0);
    setOnlineUsersCount(base + Math.floor(Math.random() * 5));
    const interval = setInterval(() => {
      setOnlineUsersCount(base + Math.floor(Math.random() * 5));
    }, 15000);
    return () => clearInterval(interval);
  }, [id, navigate, user]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        const q = query(collection(db, 'template_reviews'), where('templateId', '==', id));
        const snap = await getDocs(q);
        const fetchedReviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        fetchedReviews.sort((a: any, b: any) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
          return bTime - aTime;
        });
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews", error);
      }
    };
    fetchReviews();
  }, [id]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    let targetCode = couponInput.trim().toUpperCase();
    let matched = null;

    if (settings?.coupons && settings.coupons.length > 0) {
      matched = settings.coupons.find(
        (c: any) =>
          c.code.replace(/\s+/g, "").toUpperCase() === targetCode.replace(/\s+/g, "").toUpperCase(),
      );
    }

    if (!matched) {
      toast.error("Invalid coupon code");
      return;
    }

    if (matched.expiryDate) {
      const today = new Date().toISOString().split("T")[0];
      if (today > matched.expiryDate) {
        toast.error("This coupon has expired");
        return;
      }
    }

    // Apply template specific percentage override if defined
    let finalPercentage = matched.percentage;
    if (template?.couponOverrides && template.couponOverrides[matched.code] !== undefined) {
      finalPercentage = template.couponOverrides[matched.code];
    }

    setAppliedCoupon({ ...matched, percentage: finalPercentage });
    toast.success(`Coupon Applied! ${finalPercentage}% OFF`);
  };

  const handleBuy = () => {
    if (!user) {
      toast.error("Please login to order templates");
      navigate("/login", { state: { redirectTo: `/template/${id}` } });
      return;
    }
    navigate(`/checkout/${id}`, {
      state: { template, appliedCoupon }
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReview.trim()) return;
    setSubmittingReview(true);
    try {
      const reviewData = {
        templateId: id,
        userId: user ? user.uid : 'anonymous',
        userName: user ? (user.displayName || 'Anonymous') : 'Guest User',
        userPhoto: user ? (user.photoURL || '') : '',
        rating,
        comment: newReview.trim(),
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'template_reviews'), reviewData);
      setReviews(prev => [{ id: docRef.id, ...reviewData }, ...prev]);
      setNewReview('');
      setRating(5);
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!template) return null;

  const basePrice = Number(template.price) || 0;
  const currentPrice = template.discountPrice ? Number(template.discountPrice) : basePrice;
  const finalPrice = appliedCoupon 
    ? Math.round(currentPrice * (1 - Number(appliedCoupon.percentage) / 100))
    : currentPrice;

  const orderCount = (template.baseOrdersCount ?? 100) + (template.ordersCount || 0);
  const displayId = template.displayId || template.id.slice(-8);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {activeVideo && <VideoModal url={activeVideo} onClose={() => setActiveVideo(null)} />}
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <button 
            onClick={() => navigate('/gallery')}
            className="flex items-center gap-2 text-gray-500 hover:text-brand-purple transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Gallery
          </button>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row mb-12">
            {/* Left Image/Video Section */}
            <div className="w-full lg:w-1/2 bg-gray-100 relative flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
               {template.thumbnailBase64 || template.image ? (
                  <img
                    src={template.thumbnailBase64 || template.image}
                    alt={template.title}
                    className="w-full h-auto max-h-[600px] object-contain drop-shadow-2xl rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center text-gray-400">
                    No Preview
                  </div>
                )}
                
                {template.videoUrl && (
                  <button
                    onClick={() => setActiveVideo(template.videoUrl)}
                    className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-center group"
                  >
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform shadow-2xl">
                      <Play className="w-10 h-10 fill-white" />
                    </div>
                  </button>
                )}
            </div>

            {/* Right Details Section */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
               <div className="flex items-center gap-3 mb-4">
                 <span className="bg-brand-purple/10 text-brand-purple px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                   {template.category}
                 </span>
                 <span className="text-gray-400 font-mono text-sm">
                   #{displayId}
                 </span>
               </div>
               
               <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
                 {template.title}
               </h1>

               <div className="flex items-center gap-6 mb-6 flex-wrap">
                 <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                   <ShoppingBag className="w-4 h-4 text-brand-purple" />
                   {orderCount} Orders
                 </div>
                 <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-green-700">{onlineUsersCount}+ people online</span>
                 </div>
               </div>

               <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                 <h3 className="text-gray-900 font-semibold mb-2">Description</h3>
                 <p className="whitespace-pre-wrap">{template.description || "No description provided."}</p>
               </div>

               <div className="mt-auto">
                 {/* Price Section */}
                 <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                    <div className="flex items-end gap-3 mb-2">
                       <span className="text-4xl font-bold text-gray-900">₹{finalPrice}</span>
                       {(template.discountPrice || appliedCoupon) && (
                         <span className="text-lg text-gray-400 line-through mb-1">
                           ₹{template.discountPrice && !appliedCoupon ? template.price : currentPrice}
                         </span>
                       )}
                       {appliedCoupon && (
                         <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold mb-1.5 ml-2">
                           -{appliedCoupon.percentage}% OFF
                         </span>
                       )}
                    </div>
                    {template.advancePayment && template.advancePayment !== "0" && template.advancePayment !== 0 && (
                      <div className="text-sm font-semibold text-orange-600">
                        Advance Payment Required: ₹{template.advancePayment}
                      </div>
                    )}
                 </div>

                 {/* Coupon Section */}
                 {!appliedCoupon ? (
                   <div className="flex gap-3 mb-6">
                     <div className="relative flex-1">
                       <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input
                         type="text"
                         placeholder="Enter Coupon Code"
                         value={couponInput}
                         onChange={(e) => setCouponInput(e.target.value)}
                         className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none uppercase font-medium"
                       />
                     </div>
                     <button
                       onClick={handleApplyCoupon}
                       className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition-colors"
                     >
                       Apply
                     </button>
                   </div>
                 ) : (
                   <div className="flex justify-between items-center bg-green-50 border border-green-100 p-4 rounded-xl mb-6">
                     <div className="flex items-center gap-2 text-green-700 font-semibold">
                       <CheckCircle2 className="w-5 h-5" />
                       Coupon {appliedCoupon.code} Applied
                     </div>
                     <button 
                        onClick={() => setAppliedCoupon(null)}
                        className="text-sm text-green-700 hover:underline font-medium"
                     >
                       Remove
                     </button>
                   </div>
                 )}

                 {/* Action Button */}
                 <button
                   onClick={handleBuy}
                   className="w-full flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-brand-purple/30 hover:shadow-xl hover:shadow-brand-purple/40 hover:-translate-y-0.5"
                 >
                   Buy Template <ChevronRight className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              Customer Reviews ({reviews.length})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24">
                  <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                      <textarea
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        placeholder="Tell us what you think..."
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 h-24 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none resize-none text-sm"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold">
                            {review.userPhoto ? (
                              <img src={review.userPhoto} alt={review.userName} className="w-10 h-10 rounded-full" />
                            ) : (
                              review.userName?.charAt(0).toUpperCase() || 'A'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{review.userName || 'Anonymous'}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-900 font-medium mb-1">No reviews yet</h3>
                    <p className="text-gray-500 text-sm">Be the first to review this template!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
