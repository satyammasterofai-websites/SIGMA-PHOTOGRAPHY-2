import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Star, User, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function TemplateReviewsModal({ templateId, isOpen, onClose }: { templateId: string, isOpen: boolean, onClose: () => void }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchReviews();
    }
  }, [templateId, isOpen]);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'template_reviews'), where('templateId', '==', templateId));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
        const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setReviews(data);
    } catch (e: any) {
      console.error(e);
      if (e.message && e.message.includes('Missing or insufficient permissions')) {
        toast.error("Set up Firestore Rules for 'template_reviews' to view reviews.");
      } else {
        toast.error("Failed to load reviews");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!newReview.trim()) {
      toast.error('Please write a review');
      return;
    }
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'template_reviews'), {
        templateId,
        userId: user?.uid || 'guest',
        userName: user?.displayName || user?.email?.split('@')[0] || 'Guest User',
        text: newReview.trim(),
        rating,
        createdAt: serverTimestamp()
      });
      toast.success('Review submitted successfully!');
      setNewReview('');
      setRating(5);
      fetchReviews();
    } catch (e: any) {
      console.error(e);
      if (e.message && e.message.includes('Missing or insufficient permissions')) {
        toast.error("Set up Firestore Rules for 'template_reviews' to submit reviews.");
      } else {
        toast.error('Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const averageRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 border-b-2 border-brand-purple pb-1">Reviews & Ratings</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <span className="font-bold text-yellow-700">{averageRating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-yellow-600/70 font-medium">({reviews.length})</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {/* Write a Review Section */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">{user ? 'Write a Review' : 'Write a Review (Guest)'}</h4>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} className="focus:outline-none transform hover:scale-110 transition-transform">
                  <Star className={`w-7 h-7 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                </button>
              ))}
            </div>
            <textarea 
              placeholder="Share your experience with this template..."
              value={newReview}
              onChange={e => setNewReview(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-purple focus:border-transparent resize-none mb-3 shadow-sm"
              rows={3}
            />
            <div className="flex justify-end">
              <button 
                onClick={submitReview}
                disabled={submitting}
                className="bg-brand-navy hover:bg-brand-purple text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 mb-4 px-1">Customer Reviews</h4>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-400 text-center py-12 bg-gray-50/50 rounded-2xl italic border border-dashed border-gray-200">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-purple/20 to-brand-purple/5 rounded-full flex items-center justify-center border border-brand-purple/10">
                        <User className="w-5 h-5 text-brand-purple" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-gray-900 block">{review.userName || 'Anonymous User'}</span>
                        <div className="flex mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.createdAt && (
                       <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                         {new Date(typeof review.createdAt?.toMillis === 'function' ? review.createdAt.toMillis() : review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                       </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mt-3 bg-gray-50/50 p-3 rounded-xl border border-gray-50">{review.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
