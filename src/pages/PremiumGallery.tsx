import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Search,
  Play,
  Star,
  TrendingUp,
  Users,
  ShoppingBag,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import VideoModal from "../components/VideoModal";
import { useSiteContent } from "../hooks/useSiteContent";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import TemplateReviewsModal from "../components/TemplateReviewsModal";

const defaultCategories = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Anniversary",
  "Baby Shower",
  "Housewarming",
  "Corporate",
  "Religious",
];

export default function PremiumGallery() {

  const renderTemplateCard = (template: any) => (
    <div
                  key={template.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group flex flex-col"
                >
                  <div className="relative overflow-hidden bg-gray-100 flex items-center justify-center">
                    {template.thumbnailBase64 || template.image ? (
                      <img
                        src={template.thumbnailBase64 || template.image}
                        alt={template.title}
                        className="w-full h-auto object-contain bg-white"
                      />
                    ) : (
                      <div className="w-full aspect-video flex items-center justify-center text-gray-400">
                        No Preview
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {template.isFeatured && (
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </div>
                      )}
                      {template.isTrending && (
                        <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <TrendingUp className="w-3 h-3" /> Trending
                        </div>
                      )}
                      <div className="bg-white/90 backdrop-blur text-brand-purple text-xs font-bold px-3 py-1 rounded-full shadow-md w-fit">
                        {template.category}
                      </div>
                    </div>

                    {/* Video Quick View Overlay */}
                    {template.videoUrl && (
                      <button
                        onClick={() => setActiveVideo(template.videoUrl)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10 w-full"
                      >
                        <div className="w-16 h-16 bg-white/20 backdrop-blur border border-white/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-8 h-8 fill-white" />
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col flex-1 pr-2">
                        {template.displayId && <span className="text-xs font-mono text-gray-400 mb-0.5">#{template.displayId}</span>}
                        <h3 className="font-display font-bold text-xl text-gray-900 line-clamp-1">
                          {template.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple bg-brand-purple/5 w-fit px-2.5 py-1 rounded-full">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {(template.baseOrdersCount ?? 100) +
                          (template.ordersCount || 0)}{" "}
                        Orders
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewsTemplateId(template.id);
                        }}
                        className="flex items-center gap-1 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition px-2.5 py-1 rounded-full text-xs font-bold border border-yellow-200"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Reviews
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                      {template.description}
                    </p>

                    <div className="mt-auto">
                      {!appliedCoupons[template.id] && (
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            placeholder="Have a coupon?"
                            value={couponInputs[template.id] || ""}
                            onChange={(e) =>
                              setCouponInputs((p) => ({
                                ...p,
                                [template.id]: e.target.value,
                              }))
                            }
                            className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none uppercase font-medium"
                          />
                          <button
                            onClick={() =>
                              handleApplyCouponFromGallery(template.id)
                            }
                            className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-brand-purple transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          {(() => {
                            const appliedCoupon = appliedCoupons[template.id];
                            const basePrice = Number(template.price) || 0;
                            const currentPrice = template.discountPrice
                              ? Number(template.discountPrice)
                              : basePrice;
                            const finalPrice = appliedCoupon
                              ? Math.round(
                                  currentPrice *
                                    (1 -
                                      Number(appliedCoupon.percentage) / 100),
                                )
                              : currentPrice;

                            return (
                              <div className="flex flex-col">
                                {(template.discountPrice || appliedCoupon) && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹
                                    {template.discountPrice && !appliedCoupon
                                      ? template.price
                                      : currentPrice}
                                  </span>
                                )}
                                <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                  ₹{finalPrice}
                                  {appliedCoupon && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                      -{appliedCoupon.percentage}%
                                    </span>
                                  )}
                                </span>
                              </div>
                            );
                          })()}
                          {template.advancePayment &&
                            template.advancePayment !== "0" &&
                            template.advancePayment !== 0 && (
                              <span className="block text-xs font-semibold text-orange-600 mt-1">
                                Advance: ₹{template.advancePayment}
                              </span>
                            )}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-semibold text-green-600">
                              {onlineUsersCount}+ people are online
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!user) {
                              toast.error(
                                "Please login first to order templates.",
                              );
                              navigate("/login", {
                                state: {
                                  redirectTo: `/checkout/${template.id}`,
                                },
                              });
                            } else {
                              navigate(`/checkout/${template.id}`, {
                                state: {
                                  template,
                                  appliedCoupon: appliedCoupons[template.id],
                                },
                              });
                            }
                          }}
                          className="px-6 py-2 bg-gray-900 hover:bg-brand-purple text-white font-medium rounded-xl transition-colors shadow-md shadow-gray-900/10 hover:shadow-brand-purple/20"
                        >
                          Customize & Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
  );

  const { user } = useAuthStore();
  const { categories: cmsCategories, settings, loading: cmsLoading } = useSiteContent();
  const [onlineUsersCount, setOnlineUsersCount] = useState(50);

  useEffect(() => {
    const baseNum = settings?.baseOnlineUsers ?? 50;
    const base = baseNum + (user ? 1 : 0);
    const fluctuation = () => Math.floor(Math.random() * 4);
    setOnlineUsersCount(base + fluctuation());

    const interval = setInterval(() => {
      setOnlineUsersCount(base + fluctuation());
    }, 15000);
    return () => clearInterval(interval);
  }, [user, settings?.baseOnlineUsers]);

  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [sortOrder, setSortOrder] = useState<"priceAsc" | "priceDesc">("priceAsc");
  const languages = ["All", "English", "Hindi"];
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [reviewsTemplateId, setReviewsTemplateId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [couponInputs, setCouponInputs] = useState<Record<string, string>>({});
  const [appliedCoupons, setAppliedCoupons] = useState<Record<string, any>>({});

  const handleApplyCouponFromGallery = (templateId: string) => {
    const code = couponInputs[templateId];
    if (!code?.trim()) return;

    if (code.trim().toUpperCase() === "SIGMA20") {
      setAppliedCoupons((prev) => ({
        ...prev,
        [templateId]: { code: "SIGMA20", percentage: "20" },
      }));
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      toast.success(`Coupon Applied! 20% OFF`);
      return;
    }

    if (!settings?.coupons || settings.coupons.length === 0) {
      toast.error("Invalid coupon code");
      return;
    }

    const matched = settings.coupons.find(
      (c: any) =>
        c.code.replace(/\s+/g, "").toUpperCase() === code.replace(/\s+/g, "").toUpperCase(),
    );
    if (matched) {
      if (matched.expiryDate) {
        const today = new Date().toISOString().split("T")[0];
        if (today > matched.expiryDate) {
          toast.error("This coupon has expired");
          return;
        }
      }
      setAppliedCoupons((prev) => ({
        ...prev,
        [templateId]: matched,
      }));
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      toast.success(`Coupon Applied! ${matched.percentage}% OFF`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const dynamicCategories =
    cmsCategories.length > 0
      ? cmsCategories.map((c) => c.name)
      : defaultCategories;
  const categories = ["All", ...dynamicCategories];

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const q = query(
          collection(db, "templates"),
          where("status", "!=", "Hidden"),
        );
        const sn = await getDocs(q);
        const list = sn.docs.map((d) => ({ id: d.id, ...d.data() }));
        // In case there are missing status fields, fallback to showing them
        setTemplates(list);
        setFilteredTemplates(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    let result = templates;
    if (activeCategory !== "All") {
      const normalizedActive = activeCategory
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      result = result.filter(
        (t) =>
          t.category &&
          t.category.trim().toLowerCase().replace(/\s+/g, " ") ===
            normalizedActive,
      );
    }
    if (activeLanguage !== "All") {
      result = result.filter(t => {
        
        return t.language === activeLanguage;
      });
    }

    if (searchQuery) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.displayId || "").toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort by orders count
    result.sort((a, b) => {
      const priceA = a.discountPrice ? Number(a.discountPrice) : Number(a.price || 0);
      const priceB = b.discountPrice ? Number(b.discountPrice) : Number(b.price || 0);
      
      if (sortOrder === "priceAsc") {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });

    setFilteredTemplates(result);
  }, [searchQuery, activeCategory, activeLanguage, sortOrder, templates]);

  if (loading || cmsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 rounded-full border-4 border-brand-purple border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB] flex flex-col">
      {activeVideo && (
        <VideoModal url={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
      {reviewsTemplateId && (
        <TemplateReviewsModal 
          templateId={reviewsTemplateId} 
          isOpen={true} 
          onClose={() => setReviewsTemplateId(null)} 
        />
      )}
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 relative flex flex-col items-center">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-brand-rose/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-semibold text-green-600">
                {onlineUsersCount}+ people are online
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Premium Video Gallery
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our collection of cinematic invitations for your special
              moments.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-purple shadow-sm"
              />
            </div>
            
            <div className="flex-shrink-0 flex gap-2">
              <select
                value={activeLanguage}
                onChange={(e) => setActiveLanguage(e.target.value)}
                className="h-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-purple shadow-sm font-medium text-gray-700"
              >
                <option value="All">All Languages</option>
                <option value="English">English Templates</option>
                <option value="Hindi">Hindi Templates</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="h-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-purple shadow-sm font-medium text-gray-700"
              >
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
            
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
              {categories.map((cat) => {
                const isActive =
                  activeCategory.trim().toLowerCase().replace(/\s+/g, " ") ===
                  cat.trim().toLowerCase().replace(/\s+/g, " ");
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-4 rounded-xl font-medium whitespace-nowrap transition-all ${isActive ? "bg-brand-purple text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

          </div>
          </div>

          {/* Template Grid */}
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            
              <div className="space-y-12 w-full">
                {filteredTemplates.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredTemplates.map(template => renderTemplateCard(template))}
                  </div>
                )}
                {filteredTemplates.length === 0 && (
                    <div className="col-span-full py-20 text-center w-full bg-white rounded-2xl border border-gray-100">
                      <p className="text-gray-500 text-lg">
                        No templates found matching your criteria.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setActiveCategory("All");
                          setActiveLanguage("All");
                        }}
                        className="mt-4 text-brand-purple font-medium hover:underline"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

