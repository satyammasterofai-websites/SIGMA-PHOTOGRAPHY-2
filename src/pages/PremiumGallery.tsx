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
  Globe,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import VideoModal from "../components/VideoModal";
import { useSiteContent } from "../hooks/useSiteContent";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import TemplateReviewsModal from "../components/TemplateReviewsModal";
import { formatTemplateDate, formatTemplateTime, formatTemplateDateTime, isNewlyCreated } from "../lib/utils";

const defaultCategories = [
  "Wedding",
  "Website Invitation",
  "Engagement",
  "Birthday",
  "Anniversary",
  "Baby Shower",
  "Housewarming",
  "Corporate",
  "Religious",
];

export default function PremiumGallery() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "All";

  const { user } = useAuthStore();
  const { categories: cmsCategories, settings, loading: cmsLoading } = useSiteContent();
  const [onlineUsersCount, setOnlineUsersCount] = useState(50);

  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [timeFilter, setTimeFilter] = useState<"all" | "new" | "week" | "month">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "priceAsc" | "priceDesc">("newest");
  const languages = ["All", "English", "Hindi"];
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [reviewsTemplateId, setReviewsTemplateId] = useState<string | null>(null);

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

  const dynamicCategories =
    cmsCategories.length > 0
      ? cmsCategories
          .map(c => c.name || "")
          .filter(name => name.trim() !== "")
          .filter((name, idx, arr) => arr.findIndex(n => n.trim().toLowerCase() === name.trim().toLowerCase()) === idx)
      : defaultCategories;
      
  // Ensure Website Invitation is in categories
  if (!dynamicCategories.some(c => c.toLowerCase() === 'website invitation')) {
    dynamicCategories.splice(1, 0, 'Website Invitation');
  }
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
        
        // Sort newest first by default
        list.sort((a: any, b: any) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

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
    let result = [...templates];
    if (activeCategory && activeCategory !== "All") {
      const normalizedActive = (activeCategory || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      result = result.filter(
        (t) =>
          t.category &&
          (t.category || '').trim().toLowerCase().replace(/\s+/g, " ") ===
            normalizedActive,
      );
    }
    if (activeLanguage !== "All") {
      result = result.filter(t => t.language === activeLanguage);
    }

    if (searchQuery) {
      const queryLower = (searchQuery || '').toLowerCase();
      result = result.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(queryLower) ||
          (t.category || '').toLowerCase().includes(queryLower) ||
          (t.description || "").toLowerCase().includes(queryLower),
      );
    }

    // Time-wise filtering
    const now = Date.now();
    if (timeFilter === "new" || timeFilter === "week") {
      result = result.filter((t) => isNewlyCreated(t.createdAt, 7));
    } else if (timeFilter === "month") {
      result = result.filter((t) => isNewlyCreated(t.createdAt, 30));
    }

    // Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      const priceA = a.discountPrice ? Number(a.discountPrice) : Number(a.price || 0);
      const priceB = b.discountPrice ? Number(b.discountPrice) : Number(b.price || 0);

      if (sortOrder === "newest") {
        return timeB - timeA;
      } else if (sortOrder === "oldest") {
        return timeA - timeB;
      } else if (sortOrder === "priceAsc") {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });

    setFilteredTemplates(result);
  }, [searchQuery, activeCategory, activeLanguage, timeFilter, sortOrder, templates]);

  const newlyCreatedTemplates = templates.filter(t => isNewlyCreated(t.createdAt, 7));

  const renderTemplateCard = (template: any) => {
    const isWebsite = (template.category || '').toLowerCase() === 'website invitation' || !!template.websiteUrl;
    const isNew = isNewlyCreated(template.createdAt);

    return (
      <div
        key={template.id}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group flex flex-col break-inside-avoid mb-8"
      >
        <div className={`relative overflow-hidden bg-gray-100 flex items-center justify-center ${
          isWebsite ? 'aspect-[1/1.414]' : ''
        }`}>
          {template.thumbnailBase64 || template.image ? (
            <img
              src={template.thumbnailBase64 || template.image}
              alt={template.title}
              className={`w-full h-auto object-contain bg-white ${
                isWebsite ? 'max-h-[420px]' : ''
              }`}
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center text-gray-400">
              No Preview
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
            {isNew && (
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Newly Added
              </span>
            )}
            {template.isFeatured && (
              <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                Featured
              </span>
            )}
          </div>

          {isWebsite && (
            <div className="absolute top-3 right-3 z-20 bg-purple-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 pointer-events-none">
              <Globe className="w-3 h-3" /> Website Invitation
            </div>
          )}

          {/* Website Invitation Live Redirect Button OR Video Modal Button */}
          {isWebsite && template.websiteUrl ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(template.websiteUrl, '_blank', 'noopener,noreferrer');
              }}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm z-10 w-full text-white cursor-pointer"
            >
              <div className="w-16 h-16 bg-purple-600/90 backdrop-blur border border-white/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform shadow-xl mb-2">
                <Globe className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold bg-black/60 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                Preview Live Website <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </button>
          ) : template.videoUrl ? (
            <button
              onClick={() => setActiveVideo(template.videoUrl)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10 w-full"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur border border-white/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-8 h-8 fill-white" />
              </div>
            </button>
          ) : null}
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-display font-bold text-xl text-gray-900 flex-1 pr-2">
              {template.title}
            </h3>
          </div>

          {/* Time & Date note on all templates */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <Calendar className="w-3.5 h-3.5 text-brand-purple/70" />
            <span>Created: {formatTemplateDateTime(template.createdAt)}</span>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              {(() => {
                const basePrice = Number(template.price) || 0;
                const currentPrice = template.discountPrice
                  ? Number(template.discountPrice)
                  : basePrice;
                return (
                  <div className="flex flex-col">
                    {template.discountPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{template.price}
                      </span>
                    )}
                    <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      ₹{currentPrice}
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-2">
              {isWebsite && template.websiteUrl && (
                <button
                  onClick={() => window.open(template.websiteUrl, '_blank', 'noopener,noreferrer')}
                  className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 border border-purple-200"
                  title="Redirect to live preview website"
                >
                  <Globe className="w-3.5 h-3.5" /> Preview ↗
                </button>
              )}
              <button
                onClick={() => navigate(`/template/${template.id}`)}
                className="px-5 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white font-medium rounded-xl transition-colors shadow-md text-sm"
              >
                {isWebsite ? "Order Site" : "View Details"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          <div className="text-center mb-10 relative flex flex-col items-center">
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
              Premium Invitation Gallery
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover cinematic video invitations & interactive digital website invitations for your special occasions.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates by name, keyword, or website invitation..."
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
                  <option value="newest">✨ Newest First (Recently Added)</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Time-wise separation filter bar */}
            <div className="bg-white/70 backdrop-blur-md p-2 rounded-2xl border border-brand-rose/20 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-purple" /> Timeline:
                </span>
                <button
                  onClick={() => setTimeFilter("all")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    timeFilter === "all"
                      ? "bg-brand-purple text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  All Releases ({templates.length})
                </button>
                <button
                  onClick={() => setTimeFilter("new")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    timeFilter === "new"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Newly Created ({newlyCreatedTemplates.length})
                </button>
                <button
                  onClick={() => setTimeFilter("week")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    timeFilter === "week"
                      ? "bg-brand-purple text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setTimeFilter("month")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    timeFilter === "month"
                      ? "bg-brand-purple text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  This Month
                </button>
              </div>

              <div className="text-xs text-gray-500 pr-2">
                Showing <strong className="text-brand-purple">{filteredTemplates.length}</strong> templates
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
              {categories.map((cat) => {
                const isActive =
                  (activeCategory || "").trim().toLowerCase().replace(/\s+/g, " ") ===
                  (cat || "").trim().toLowerCase().replace(/\s+/g, " ");
                const isWebsite = cat.toLowerCase() === 'website invitation';
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-3.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                      isActive 
                        ? isWebsite ? "bg-purple-700 text-white shadow-md" : "bg-brand-purple text-white shadow-md" 
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {isWebsite && <Globe className="w-4 h-4" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time-wise Separation Section: Highlight newly created templates when in default view */}
          {timeFilter === "all" && !searchQuery && activeCategory === "All" && newlyCreatedTemplates.length > 0 && (
            <div className="mb-14 bg-gradient-to-r from-emerald-50 via-teal-50 to-purple-50 rounded-3xl p-6 md:p-8 border border-emerald-200/60 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Recent Additions
                  </div>
                  <h2 className="text-2xl font-display font-bold text-gray-900">
                    ✨ Newly Created Templates
                  </h2>
                  <p className="text-sm text-gray-600">Fresh designs crafted in the last few days</p>
                </div>
                <button
                  onClick={() => setTimeFilter("new")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  View all new ({newlyCreatedTemplates.length}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8">
                {newlyCreatedTemplates.slice(0, 4).map(template => renderTemplateCard(template))}
              </div>
            </div>
          )}

          {/* Main Template Grid */}
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-gray-900">
                {timeFilter === "new" ? "Newly Created Templates" : activeCategory === "All" ? "All Templates" : `${activeCategory} Templates`}
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                {filteredTemplates.length} Available
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredTemplates.length > 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8">
                {filteredTemplates.map(template => renderTemplateCard(template))}
              </div>
            ) : (
              <div className="col-span-full py-20 text-center w-full bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500 text-lg">
                  No templates found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                    setActiveLanguage("All");
                    setTimeFilter("all");
                  }}
                  className="mt-4 text-brand-purple font-medium hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


