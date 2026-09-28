import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlayCircle, ChevronLeft, ChevronRight, Globe, ShoppingBag, Sparkles, ExternalLink } from "lucide-react";
import { useSiteContent } from "../hooks/useSiteContent";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const defaultCategories = [
  {
    name: "Wedding",
    price: "2,999",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=500&q=60",
    description: "Cinematic digital wedding invitations customized with your couple portraits, music, and royal event itinerary.",
  },
  {
    name: "Engagement",
    price: "1,999",
    image:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=500&q=60",
    description: "Celebrate the beginning of forever with romantic ring ceremony and engagement video invitations.",
  },
  {
    name: "Reception",
    price: "2,499",
    image:
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=500&q=60",
    description: "Grand post-wedding reception and gala dinner invitations styled with luxury gold typography and transitions.",
  },
  {
    name: "Haldi",
    price: "1,499",
    image:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=500&q=60",
    description: "Vibrant yellow marigold-themed traditional Haldi & Pithi ceremony video invitations.",
  },
  {
    name: "Mehendi",
    price: "1,499",
    image:
      "https://images.unsplash.com/photo-1594980596870-8caa52a7fa7b?auto=format&fit=crop&q=80&w=500&q=60",
    description: "Festive henna night celebration invitations with traditional beats, floral aesthetics, and dancing themes.",
  },
  {
    name: "Birthday",
    price: "999",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8896b10404?auto=format&fit=crop&q=80&w=500&q=60",
    description: "Joyful milestone birthday celebration invitations for kids, sweet 16, 21st, and golden jubilees.",
  },
  {
    name: "Anniversary",
    price: "1,499",
    image:
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=500&q=60",
    description: "Celebrate years of love and companionship with nostalgic video montages and luxury anniversary cards.",
  },
  {
    name: "Baby Shower",
    price: "1,299",
    image:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=500&q=60",
    description: "Adorable Godh Bharai and modern baby shower announcements with cute animated motifs.",
  },
  {
    name: "Housewarming",
    price: "1,499",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=500&q=60",
    description: "Griha Pravesh and new home warming ceremony invitations welcoming family and friends to your new nest.",
  },
  {
    name: "Corporate Events",
    price: "3,499",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=500&q=60",
    description: "Professional summit, annual corporate gala, and product launch invitations tailored for business leaders.",
  },
];

const fallbackWebsiteTemplates = [
  {
    id: "web-sample-1",
    title: "Royal Rajputana Palace Wedding Website",
    category: "Website Invitation",
    price: "2,999",
    discountPrice: "2,499",
    thumbnailBase64:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600&q=80",
    websiteUrl: "https://preview.themeforest.net/item/wedding-invitation-website-template/full_screen_preview/24560783",
    description: "Interactive digital royal wedding invitation featuring RSVP tracker, Google Maps venue directions, bridal party, countdown timer, and love story timeline.",
  },
  {
    id: "web-sample-2",
    title: "Blush Floral Ivory Interactive RSVP Invite",
    category: "Website Invitation",
    price: "2,499",
    discountPrice: "1,999",
    thumbnailBase64:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600&q=80",
    websiteUrl: "https://preview.themeforest.net/item/wedding-responsive-invitation-template/full_screen_preview/25893420",
    description: "Elegant pastel floral mobile-first invitation website with live RSVP guestbook, event calendar sync, and photo gallery.",
  },
  {
    id: "web-sample-3",
    title: "Golden Euphoria Luxury Gala Invitation",
    category: "Website Invitation",
    price: "3,299",
    discountPrice: "2,699",
    thumbnailBase64:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600&q=80",
    websiteUrl: "https://preview.themeforest.net/item/event-and-wedding-invitation-theme/full_screen_preview/22810984",
    description: "Grand gold and emerald digital experience with ambient background music player, venue navigation, and custom dress code guide.",
  },
  {
    id: "web-sample-4",
    title: "Modern Minimalist Couple Story Portal",
    category: "Website Invitation",
    price: "2,199",
    discountPrice: "1,799",
    thumbnailBase64:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600&q=80",
    websiteUrl: "https://preview.themeforest.net/item/wedding-invitation-website-template/full_screen_preview/24560783",
    description: "Clean aesthetic typography with smooth parallax scrolling, Google Maps live pins, and guest dietary requirement forms.",
  },
  {
    id: "web-sample-5",
    title: "Sangeet & Mehendi Celebration Hub",
    category: "Website Invitation",
    price: "2,499",
    discountPrice: "1,999",
    thumbnailBase64:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600&q=80",
    websiteUrl: "https://preview.themeforest.net/item/wedding-responsive-invitation-template/full_screen_preview/25893420",
    description: "Festive colorful mobile invitation website with Spotify playlist integration, event timeline, and instant WhatsApp share.",
  },
  {
    id: "web-sample-6",
    title: "Destination Beachfront Wedding Experience",
    category: "Website Invitation",
    price: "2,999",
    discountPrice: "2,399",
    thumbnailBase64:
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600&q=80",
    websiteUrl: "https://preview.themeforest.net/item/event-and-wedding-invitation-theme/full_screen_preview/22810984",
    description: "Tropical coastal theme with flight/hotel accommodation guide for out-of-town guests and itinerary countdown.",
  },
];

export default function TemplateCategories() {
  const { categories, settings, templates } = useSiteContent();
  const { user } = useAuthStore();
  const [onlineUsersCount, setOnlineUsersCount] = useState(50);

  // Online users indicator
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

  // Video categories: all video categories appear first
  const uniqueCategories: any[] = [];
  const seenNames = new Set();
  for (const cat of categories) {
    const normName = (cat.name || "").trim().toLowerCase();
    if (normName && !seenNames.has(normName)) {
      seenNames.add(normName);
      uniqueCategories.push(cat);
    }
  }
  const allCategoryList =
    uniqueCategories.length > 0 ? uniqueCategories : defaultCategories;

  // Filter out "Website Invitation" from video categories list so all video categories appear first
  const videoCategories = allCategoryList.filter(
    (c) => (c.name || "").trim().toLowerCase() !== "website invitation"
  );

  // Website Invitation templates (created by admin or fallback samples)
  const rawWebsiteTemplates = (templates || []).filter(
    (t: any) =>
      (t.category || "").trim().toLowerCase() === "website invitation" ||
      (t.type || "").trim().toLowerCase() === "website" ||
      !!t.websiteUrl
  );

  // Sort newest first
  rawWebsiteTemplates.sort((a: any, b: any) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  // If admin has created website templates, show them; pad with fallbacks if fewer than 3
  const websiteTemplates =
    rawWebsiteTemplates.length >= 3
      ? rawWebsiteTemplates
      : rawWebsiteTemplates.length > 0
      ? [
          ...rawWebsiteTemplates,
          ...fallbackWebsiteTemplates.slice(0, 3 - rawWebsiteTemplates.length),
        ]
      : fallbackWebsiteTemplates;

  // Pagination for Website Invitation Templates: Each page consists of 3 templates
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(websiteTemplates.length / pageSize));
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    const next = pageIndex + newDirection;
    if (next >= 0 && next < totalPages) {
      setDirection(newDirection);
      setPageIndex(next);
    }
  };

  const currentWebsitePage = websiteTemplates.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  return (
    <section id="templates" className="py-24 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold tracking-widest text-brand-rose uppercase bg-brand-rose/10 px-4 py-1.5 rounded-full border border-brand-rose/20">
                Masterpieces Collection
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-brand-rose/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-green-600">
                  {onlineUsersCount}+ people are online
                </span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-navy mt-6 mb-4">
              Explore Our Signature <br />
              Video Invitation Categories
            </h2>
            <p className="text-brand-slate text-lg font-medium">
              Cinematic quality designs crafted to match the elegance of your
              finest moments.
            </p>
          </div>
        </div>

        {/* 1. All Video Categories Appear First */}
        <div className="grid grid-cols-1 divide-y divide-gray-200 mb-28">
          {videoCategories.map((cat, index) => (
            <motion.div
              key={`${cat.id || cat.name}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="py-12 flex flex-col md:flex-row items-center gap-12 group"
            >
              <div className="w-full md:w-1/3 rounded-2xl overflow-hidden border border-brand-purple/10 shadow-lg group-hover:shadow-brand-purple/20 transition-all duration-500 relative bg-transparent">
                <div className="relative w-full h-auto bg-transparent flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      cat.image ||
                      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=500&q=60"
                    }
                    alt={cat.name}
                    className="w-full h-auto block group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors duration-500 pointer-events-none"></div>
                </div>
              </div>

              <div className="w-full md:w-2/3 flex flex-col items-center md:items-start text-center md:text-left relative py-4">
                <h3 className="text-3xl md:text-4xl font-display font-black uppercase tracking-wider text-brand-navy mb-4">
                  {cat.name}
                </h3>
                <p className="text-brand-slate text-base md:text-lg mb-8 max-w-xl">
                  {cat.description ||
                    `Explore our premium ${(cat.name || "").toLowerCase()} invitation templates crafted to perfection.`}
                </p>
                <Link
                  to={`/gallery?category=${encodeURIComponent(cat.name)}`}
                  className="px-8 py-3.5 rounded-full bg-gray-900 hover:bg-brand-purple text-white font-bold transition-all shadow-md flex items-center gap-2"
                >
                  Explore Now <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 2. Just after all the video categories appear: Website Invitation Category Section */}
        <div id="website-invitations" className="pt-8 pb-12 border-t-2 border-purple-200/60 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Globe className="w-3.5 h-3.5" /> Interactive RSVP & Digital Experience
            </div>
            {/* User-requested Heading */}
            <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-navy">
              Heading - Website Invitation Template
            </h2>
            <p className="text-brand-slate text-base md:text-lg mt-3 max-w-2xl mx-auto">
              Interactive mobile-first digital website invitations featuring live RSVP, Google Maps venue directions, love story gallery, and countdown.
            </p>
          </div>

          {/* Carousel Controls Header */}
          <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Page {pageIndex + 1} of {totalPages}
              </span>
              <span className="text-xs text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-full font-bold">
                {websiteTemplates.length} Website Templates
              </span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(-1)}
                disabled={pageIndex === 0}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  pageIndex === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-white text-gray-800 hover:bg-purple-600 hover:text-white shadow-md border border-gray-200 cursor-pointer"
                }`}
                title="Previous 3 Templates"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => paginate(1)}
                disabled={pageIndex >= totalPages - 1}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  pageIndex >= totalPages - 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-white text-gray-800 hover:bg-purple-600 hover:text-white shadow-md border border-gray-200 cursor-pointer"
                }`}
                title="Next 3 Templates"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Smooth Transition Draggable Carousel Container (3 Templates Per Single Page) */}
          <div className="relative overflow-hidden w-full py-4 min-h-[640px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={pageIndex}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({
                    x: dir > 0 ? 350 : -350,
                    opacity: 0,
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                  },
                  exit: (dir: number) => ({
                    x: dir < 0 ? 350 : -350,
                    opacity: 0,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 280, damping: 28 },
                  opacity: { duration: 0.25 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(e, { offset }) => {
                  if (offset.x < -40 && pageIndex < totalPages - 1) {
                    paginate(1);
                  } else if (offset.x > 40 && pageIndex > 0) {
                    paginate(-1);
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 cursor-grab active:cursor-grabbing w-full select-none"
              >
                {currentWebsitePage.map((template: any) => (
                  <div
                    key={template.id}
                    className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-md rounded-3xl border border-purple-200/50 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Realistic Mobile Phone Frame Mockup */}
                    <div className="relative mx-auto w-[240px] sm:w-[260px] aspect-[9/18.5] bg-neutral-900 rounded-[2.75rem] p-3 shadow-2xl border-[3px] border-neutral-700 ring-1 ring-black/40 flex flex-col group select-none">
                      {/* Top Dynamic Island / Notch */}
                      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700/50"></div>
                      </div>

                      {/* Speaker Ear Piece */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-neutral-700/60 rounded-full z-20 pointer-events-none"></div>

                      {/* Inner Phone Screen with A4 Thumbnail */}
                      <div className="relative w-full h-full bg-neutral-50 rounded-[2.1rem] overflow-hidden flex flex-col shadow-inner">
                        {/* Status Bar Mock */}
                        <div className="h-6 w-full flex items-center justify-between px-5 pt-1 text-[10px] text-gray-800 font-bold z-10 pointer-events-none">
                          <span>9:41</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-semibold">5G</span>
                            <div className="w-4 h-2 border border-gray-800 rounded-xs p-0.5">
                              <div className="w-full h-full bg-gray-800 rounded-2xs"></div>
                            </div>
                          </div>
                        </div>

                        {/* Thumbnail in Portrait Mobile Frame */}
                        <div className="relative flex-1 overflow-hidden bg-white flex items-center justify-center">
                          <img
                            src={template.thumbnailBase64 || template.image}
                            alt={template.title}
                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                          />
                          {/* Live Badge Overlay */}
                          <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 pointer-events-none">
                            <Globe className="w-2.5 h-2.5" /> Live Site
                          </div>

                          {/* Quick Interactive Hover Preview Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-xs text-white p-3 text-center">
                            <Globe className="w-8 h-8 text-white mb-2 animate-bounce" />
                            <span className="text-xs font-bold bg-white text-gray-900 px-3 py-1.5 rounded-full shadow-md">
                              Click Preview Below ↗
                            </span>
                          </div>
                        </div>

                        {/* Bottom Home Indicator */}
                        <div className="h-4 w-full flex items-center justify-center pointer-events-none">
                          <div className="w-24 h-1 bg-neutral-400 rounded-full"></div>
                        </div>
                      </div>

                      {/* Volume & Power hardware buttons */}
                      <div className="absolute -left-[5px] top-16 w-[3px] h-7 bg-neutral-600 rounded-l-xs pointer-events-none"></div>
                      <div className="absolute -left-[5px] top-26 w-[3px] h-7 bg-neutral-600 rounded-l-xs pointer-events-none"></div>
                      <div className="absolute -right-[5px] top-20 w-[3px] h-10 bg-neutral-600 rounded-r-xs pointer-events-none"></div>
                    </div>

                    {/* Template Info & Fixed Buttons Just Below Phone Frame */}
                    <div className="mt-5 w-full max-w-[270px] mx-auto flex flex-col items-center">
                      <h4
                        className="font-display font-bold text-lg text-brand-navy text-center line-clamp-1 mb-1"
                        title={template.title}
                      >
                        {template.title}
                      </h4>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="text-base font-black text-gray-900">
                          ₹{template.discountPrice || template.price}
                        </span>
                        {template.discountPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{template.price}
                          </span>
                        )}
                      </div>

                      {/* Fixed Just Below: Preview and Order now buttons */}
                      <div className="grid grid-cols-2 gap-2.5 w-full">
                        <button
                          onClick={() => {
                            if (template.websiteUrl) {
                              window.open(template.websiteUrl, "_blank", "noopener,noreferrer");
                            } else {
                              toast.success("Opening live website preview...");
                            }
                          }}
                          className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-purple-200 shadow-xs cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5" /> Preview
                        </button>
                        <Link
                          to={
                            template.id && !template.id.startsWith("web-sample-")
                              ? `/checkout/${template.id}`
                              : `/gallery?category=Website%20Invitation`
                          }
                          className="py-2.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-purple-600/20"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Order now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Indicators & Dragging Hint */}
          <div className="flex flex-col items-center gap-3 mt-4">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > pageIndex ? 1 : -1);
                    setPageIndex(i);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    i === pageIndex
                      ? "w-8 bg-purple-600"
                      : "w-2.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  title={`Go to page ${i + 1}`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 font-medium">
              ← Drag or swipe left / right to browse templates →
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
