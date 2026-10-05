import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  MoveHorizontal,
  CheckCircle2,
  Eye,
  EyeOff,
  Play,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import { useSiteContent } from "../hooks/useSiteContent";
import InteractiveWebsiteInvitationPreview from "./InteractiveWebsiteInvitationPreview";

export interface WebsiteTemplateItem {
  id: string;
  title: string;
  category?: string;
  price: string | number;
  discountPrice?: string | number;
  thumbnailBase64?: string;
  image?: string;
  websiteUrl?: string;
  description?: string;
  createdAt?: any;
}

export const fallbackWebsiteTemplates: WebsiteTemplateItem[] = [
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

interface WebsiteTemplateCarouselProps {
  templates?: WebsiteTemplateItem[];
  headingTitle?: string;
  subtitle?: string;
  showHeader?: boolean;
  className?: string;
}

export default function WebsiteTemplateCarousel({
  templates = [],
  headingTitle = "Heading - Website Invitation Template",
  subtitle = "Interactive mobile-first digital website invitations featuring live RSVP, Google Maps venue directions, love story gallery, and countdown.",
  showHeader = true,
  className = "",
}: WebsiteTemplateCarouselProps) {
  // Filter for website templates
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

  // Prepare full list padded to multiple of 3 so every page has exactly 3 templates
  let fullList: WebsiteTemplateItem[] = [...rawWebsiteTemplates];
  if (fullList.length === 0) {
    fullList = [...fallbackWebsiteTemplates];
  } else if (fullList.length < 3) {
    const diff = 3 - fullList.length;
    fullList = [...fullList, ...fallbackWebsiteTemplates.slice(0, diff)];
  } else if (fullList.length % 3 !== 0) {
    const remainder = fullList.length % 3;
    const needed = 3 - remainder;
    fullList = [...fullList, ...fallbackWebsiteTemplates.slice(0, needed)];
  }

  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(fullList.length / pageSize));
  const [pageIndex, setPageIndex] = useState(0);
  const [focusedSlot, setFocusedSlot] = useState(1); // 0 = left item is center, 1 = middle item is center (default), 2 = right item is center
  const [direction, setDirection] = useState(0);
  const lastWheelTimeRef = useRef<number>(0);

  // Auth and settings for Hide/Unhide functionality
  const { role } = useAuthStore();
  const isAdmin = role === "admin";
  const { settings } = useSiteContent();

  const [categoryHidden, setCategoryHidden] = useState<boolean>(() => {
    try {
      const local = localStorage.getItem("sigma_hide_website_invitation");
      if (local !== null) return local === "true";
    } catch (e) {}
    return false;
  });

  // State to track which template is currently loading/showing live website inside mobile frame
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  useEffect(() => {
    if (settings && settings.websiteInvitationHidden !== undefined) {
      setCategoryHidden(settings.websiteInvitationHidden === true);
    }
  }, [settings]);

  const handleToggleCategoryVisibility = async () => {
    const nextHidden = !categoryHidden;
    setCategoryHidden(nextHidden);
    try {
      localStorage.setItem("sigma_hide_website_invitation", nextHidden.toString());
    } catch (e) {}

    if (isAdmin) {
      try {
        await setDoc(
          doc(db, "settings", "config"),
          { websiteInvitationHidden: nextHidden },
          { merge: true }
        );
        toast.success(
          nextHidden
            ? "Website Invitation Category is now HIDDEN for all visitors"
            : "Website Invitation Category is now UNHIDDEN and visible to all visitors",
          { icon: nextHidden ? "👁️‍🗨️" : "✨" }
        );
        return;
      } catch (err) {
        console.error("Failed to update setting in firestore", err);
      }
    }

    toast.success(
      nextHidden
        ? "Website Invitation Category hidden"
        : "Website Invitation Category unhidden and visible",
      { icon: nextHidden ? "👁️‍🗨️" : "✨" }
    );
  };

  const handleStartPreview = (
    template: WebsiteTemplateItem,
    position: "left" | "middle" | "right"
  ) => {
    if (position === "left") {
      setDirection(-1);
      setFocusedSlot(0);
    } else if (position === "right") {
      setDirection(1);
      setFocusedSlot(2);
    }
    setActivePreviewId(template.id);
    toast.success(`Loading live website for ${template.title}...`, {
      icon: "📱",
      duration: 2500,
    });
  };

  const handleClosePreview = () => {
    setActivePreviewId(null);
  };

  // Paginate handler with smooth transition
  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection > 0) {
      // Step forward
      if (focusedSlot === 0) {
        setFocusedSlot(1);
      } else if (focusedSlot === 1) {
        setFocusedSlot(2);
      } else {
        // Move to next page of 3 templates
        setPageIndex((prev) => (prev + 1) % totalPages);
        setFocusedSlot(1);
      }
    } else {
      // Step backward
      if (focusedSlot === 2) {
        setFocusedSlot(1);
      } else if (focusedSlot === 1) {
        setFocusedSlot(0);
      } else {
        // Move to previous page of 3 templates
        setPageIndex((prev) => (prev - 1 + totalPages) % totalPages);
        setFocusedSlot(1);
      }
    }
  };

  const jumpToPage = (targetPage: number) => {
    if (targetPage === pageIndex) return;
    setDirection(targetPage > pageIndex ? 1 : -1);
    setPageIndex(targetPage);
    setFocusedSlot(1);
  };

  // Horizontal mousewheel / trackpad horizontal swipe
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 320) return;

    const delta =
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : e.shiftKey
        ? e.deltaY
        : 0;
    if (Math.abs(delta) > 20) {
      lastWheelTimeRef.current = now;
      paginate(delta > 0 ? 1 : -1);
    }
  };

  // Get the 3 templates for the current page
  const base = pageIndex * pageSize;
  const pageItem0 = fullList[base % fullList.length];
  const pageItem1 = fullList[(base + 1) % fullList.length];
  const pageItem2 = fullList[(base + 2) % fullList.length];

  // Determine which template is placed at left, middle, right based on focusedSlot
  let leftTemplate: WebsiteTemplateItem;
  let middleTemplate: WebsiteTemplateItem;
  let rightTemplate: WebsiteTemplateItem;

  if (focusedSlot === 0) {
    // Left slot item is brought to middle (main, slightly bigger)
    middleTemplate = pageItem0;
    leftTemplate = pageItem2;
    rightTemplate = pageItem1;
  } else if (focusedSlot === 2) {
    // Right slot item is brought to middle (main, slightly bigger)
    middleTemplate = pageItem2;
    leftTemplate = pageItem1;
    rightTemplate = pageItem0;
  } else {
    // Middle item is main (slightly bigger)
    middleTemplate = pageItem1;
    leftTemplate = pageItem0;
    rightTemplate = pageItem2;
  }

  const renderPhoneCard = (
    template: WebsiteTemplateItem,
    position: "left" | "middle" | "right",
    onFocusClick?: () => void
  ) => {
    const isMiddle = position === "middle";
    const isLeft = position === "left";
    const isPreviewing = activePreviewId === template.id;

    return (
      <div
        key={`${template.id}-${position}`}
        onClick={!isMiddle ? onFocusClick : undefined}
        className={`flex flex-col items-center p-3 sm:p-4 md:p-5 rounded-3xl transition-all duration-500 select-none ${
          isMiddle
            ? "z-20 bg-white/95 backdrop-blur-xl border-2 border-purple-500 shadow-2xl shadow-purple-950/20 ring-4 ring-purple-300/40 scale-100 sm:scale-[1.04] md:scale-[1.08] lg:scale-[1.12] w-full max-w-[290px] sm:max-w-[320px] md:max-w-[350px]"
            : "z-10 bg-white/70 backdrop-blur-md border border-purple-200/70 shadow-md scale-[0.78] sm:scale-[0.83] md:scale-[0.88] opacity-75 hover:opacity-100 hover:scale-[0.90] cursor-pointer w-full max-w-[220px] sm:max-w-[250px] md:max-w-[275px] " +
              (isLeft ? "-rotate-1 sm:-rotate-2" : "rotate-1 sm:rotate-2")
        }`}
      >
        {/* Header Tag above Mobile Frame */}
        {isMiddle ? (
          <div className="mb-2.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 ring-2 ring-purple-300/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            {isPreviewing ? "Live Mobile Preview Active" : "Main Website Template"}
          </div>
        ) : (
          <div className="mb-2 px-2.5 py-0.5 rounded-full bg-purple-100/90 text-purple-700 text-[10px] font-bold flex items-center gap-1">
            {isLeft ? (
              <>
                <ChevronLeft className="w-3 h-3" /> Click to Focus Left
              </>
            ) : (
              <>
                Click to Focus Right <ChevronRight className="w-3 h-3" />
              </>
            )}
          </div>
        )}

        {/* Realistic Mobile Phone Frame Mockup */}
        <div
          className={`relative mx-auto aspect-[9/18.5] bg-neutral-900 rounded-[2.75rem] p-2.5 sm:p-3 shadow-2xl border-[3px] border-neutral-700 ring-1 ring-black/40 flex flex-col group transition-all duration-300 ${
            isMiddle
              ? "w-[210px] sm:w-[240px] md:w-[265px]"
              : "w-[160px] sm:w-[190px] md:w-[210px]"
          }`}
        >
          {/* Top Dynamic Island / Notch */}
          <div className="absolute top-3 sm:top-3.5 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-3.5 sm:h-4 bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-neutral-800 border border-neutral-700/50"></div>
          </div>

          {/* Speaker Ear Piece */}
          <div className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-1 bg-neutral-700/60 rounded-full z-20 pointer-events-none"></div>

          {/* Inner Phone Screen with Live Mobile Preview or A4 Thumbnail */}
          <div className="relative w-full h-full bg-neutral-950 rounded-[2.1rem] overflow-hidden flex flex-col shadow-inner">
            {isPreviewing ? (
              <InteractiveWebsiteInvitationPreview
                template={template}
                onClose={handleClosePreview}
                isMiddle={isMiddle}
              />
            ) : (
              <>
                {/* Status Bar */}
                <div className="h-5 sm:h-6 w-full flex items-center justify-between px-4 sm:px-5 pt-1 text-[9px] sm:text-[10px] text-gray-800 font-bold z-10 pointer-events-none bg-neutral-50/80 backdrop-blur-xs">
                  <span>9:41</span>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="text-[8px] sm:text-[9px] font-semibold">5G</span>
                    <div className="w-3.5 sm:w-4 h-1.5 sm:h-2 border border-gray-800 rounded-xs p-0.5">
                      <div className="w-full h-full bg-gray-800 rounded-2xs"></div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Image inside Phone Frame */}
                <div className="relative flex-1 overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={template.thumbnailBase64 || template.image}
                    alt={template.title}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                  />

                  {/* Live Badge Overlay */}
                  <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 pointer-events-none">
                    <Globe className="w-2.5 h-2.5" /> Live Site
                  </div>

                  {/* Quick Interactive Hover Preview Overlay on middle phone */}
                  {isMiddle && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartPreview(template, position);
                      }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-xs text-white p-3 text-center cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center mb-1.5 shadow-xl ring-2 ring-white/40 group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                      <span className="text-xs font-bold bg-white text-gray-900 px-3 py-1.5 rounded-full shadow-md">
                        Preview in Mobile Frame ↗
                      </span>
                      <span className="text-[9px] text-purple-200 mt-1 font-medium">
                        Starts automatically &amp; smoothly
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Home Indicator Bar */}
                <div className="h-3 sm:h-4 w-full flex items-center justify-center pointer-events-none bg-neutral-100">
                  <div className="w-20 sm:w-24 h-1 bg-neutral-400 rounded-full"></div>
                </div>
              </>
            )}
          </div>

          {/* Volume & Power hardware buttons on phone frame */}
          <div className="absolute -left-[5px] top-14 sm:top-16 w-[3px] h-6 sm:h-7 bg-neutral-600 rounded-l-xs pointer-events-none"></div>
          <div className="absolute -left-[5px] top-22 sm:top-26 w-[3px] h-6 sm:h-7 bg-neutral-600 rounded-l-xs pointer-events-none"></div>
          <div className="absolute -right-[5px] top-18 sm:top-20 w-[3px] h-8 sm:h-10 bg-neutral-600 rounded-r-xs pointer-events-none"></div>
        </div>

        {/* Template Info & Fixed Preview / Order Now Buttons Just Below */}
        <div
          className={`mt-4 w-full flex flex-col items-center ${
            isMiddle ? "max-w-[280px]" : "max-w-[220px]"
          }`}
        >
          <h4
            className={`font-display font-bold text-brand-navy text-center line-clamp-1 mb-1 ${
              isMiddle
                ? "text-base sm:text-lg"
                : "text-xs sm:text-sm text-gray-700"
            }`}
            title={template.title}
          >
            {template.title}
          </h4>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className={`font-black text-gray-900 ${
                isMiddle ? "text-base sm:text-xl" : "text-xs sm:text-sm"
              }`}
            >
              ₹{template.discountPrice || template.price}
            </span>
            {template.discountPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{template.price}
              </span>
            )}
          </div>

          {/* Fixed Buttons Just Below Phone Frame */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isPreviewing) {
                  handleClosePreview();
                } else {
                  handleStartPreview(template, position);
                }
              }}
              className={`py-2 px-2.5 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border shadow-xs cursor-pointer ${
                isPreviewing
                  ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-sm ring-2 ring-rose-300/40"
                  : "bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 border-purple-200"
              } ${
                !isMiddle ? "text-[11px] py-1.5" : "text-xs sm:text-sm py-2.5"
              }`}
              title={
                isPreviewing
                  ? "Close live mobile website preview"
                  : "Load and view website in mobile frame automatically"
              }
            >
              {isPreviewing ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-rose-600" /> Close Preview
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" /> Preview
                </>
              )}
            </button>
            <Link
              to={
                template.id && !template.id.startsWith("web-sample-")
                  ? `/checkout/${template.id}`
                  : `/gallery?category=Website%20Invitation`
              }
              onClick={(e) => e.stopPropagation()}
              className={`py-2 px-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/25 ${
                !isMiddle ? "text-[11px] py-1.5" : "text-xs sm:text-sm py-2.5"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Order now
            </Link>
          </div>
        </div>
      </div>
    );
  };

  if (categoryHidden) {
    return (
      <div
        id="website-invitations"
        className={`pt-8 pb-12 relative w-full ${className}`}
      >
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-indigo-950 to-neutral-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-purple-400/30 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
                <EyeOff className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Smartphone className="w-3 h-3" /> Category Hidden
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold">
                  Website Invitation Category is Hidden
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-lg">
                  {isAdmin
                    ? "This category is currently hidden. Click below to unhide it and make it visible to all visitors."
                    : "The interactive mobile website invitation templates section is hidden. Click below to unhide and browse."}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleCategoryVisibility}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Eye className="w-5 h-5" /> Unhide Website Category
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="website-invitations"
      className={`pt-8 pb-12 relative w-full ${className}`}
    >
      {/* Header Section */}
      {showHeader && (
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Globe className="w-3.5 h-3.5" /> Interactive RSVP & Digital Experience
          </div>
          {/* User-requested Heading */}
          <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-navy">
            {headingTitle}
          </h2>
          <p className="text-brand-slate text-base md:text-lg mt-3 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={handleToggleCategoryVisibility}
              className="px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-200 hover:border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Hide Website Invitation Category"
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-500" />
              <span>Hide Website Category</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Carousel Navigation Bar */}
      <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Page {pageIndex + 1} of {totalPages}
          </span>
          <span className="text-xs text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full font-bold">
            {fullList.length} Templates (3 per page)
          </span>
        </div>

        {/* Stepper Buttons & Optional Headerless Hide Button */}
        <div className="flex items-center gap-2">
          {!showHeader && (
            <button
              onClick={handleToggleCategoryVisibility}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-rose-50 text-purple-700 hover:text-rose-700 border border-purple-200 hover:border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Hide Website Invitation Category"
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-500" />
              <span>Hide Category</span>
            </button>
          )}
          <button
            onClick={() => paginate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white text-gray-800 hover:bg-purple-600 hover:text-white shadow-md border border-gray-200 cursor-pointer hover:scale-105 active:scale-95"
            title="Previous (or drag right)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white text-gray-800 hover:bg-purple-600 hover:text-white shadow-md border border-gray-200 cursor-pointer hover:scale-105 active:scale-95"
            title="Next (or drag left)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Smooth Transition Draggable Carousel Container (3 Templates Stage with Middle Main Bigger) */}
      <div
        className="relative overflow-hidden w-full py-4 min-h-[660px] flex items-center justify-center select-none"
        onWheel={handleWheel}
      >
        {/* Floating Left Button */}
        <button
          onClick={() => paginate(-1)}
          className="absolute left-1 sm:left-4 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 text-gray-800 hover:bg-purple-600 hover:text-white shadow-xl border border-purple-200 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Previous Template (or drag right)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Floating Right Button */}
        <button
          onClick={() => paginate(1)}
          className="absolute right-1 sm:right-4 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 text-gray-800 hover:bg-purple-600 hover:text-white shadow-xl border border-purple-200 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Next Template (or drag left)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={`${pageIndex}-${focusedSlot}`}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 320 : -320,
                opacity: 0,
                scale: 0.94,
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
                transition: {
                  x: { type: "spring", stiffness: 280, damping: 28 },
                  opacity: { duration: 0.22 },
                  scale: { duration: 0.22 },
                },
              },
              exit: (dir: number) => ({
                x: dir < 0 ? 320 : -320,
                opacity: 0,
                scale: 0.94,
                transition: {
                  x: { type: "spring", stiffness: 280, damping: 28 },
                  opacity: { duration: 0.22 },
                  scale: { duration: 0.22 },
                },
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, { offset, velocity }) => {
              const swipeThreshold = 35;
              const velocityThreshold = 180;
              if (
                offset.x < -swipeThreshold ||
                velocity.x < -velocityThreshold
              ) {
                paginate(1);
              } else if (
                offset.x > swipeThreshold ||
                velocity.x > velocityThreshold
              ) {
                paginate(-1);
              }
            }}
            className="flex items-center justify-center gap-1 sm:gap-4 md:gap-8 lg:gap-10 w-full max-w-6xl mx-auto px-2 sm:px-8 cursor-grab active:cursor-grabbing touch-pan-y"
          >
            {/* Left Template (Smaller in size) */}
            <div className="flex-1 flex justify-end">
              {renderPhoneCard(leftTemplate, "left", () => {
                setDirection(-1);
                setFocusedSlot(0);
              })}
            </div>

            {/* Middle Template (MAIN - Slightly Bigger) */}
            <div className="shrink-0 flex justify-center">
              {renderPhoneCard(middleTemplate, "middle")}
            </div>

            {/* Right Template (Smaller in size) */}
            <div className="flex-1 flex justify-start">
              {renderPhoneCard(rightTemplate, "right", () => {
                setDirection(1);
                setFocusedSlot(2);
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Pagination Controls & Draggable Hint */}
      <div className="flex flex-col items-center gap-3 mt-4">
        {/* Page Dots */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => jumpToPage(i)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                i === pageIndex
                  ? "w-8 bg-purple-600"
                  : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
              title={`Go to Page ${i + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar Track */}
        <div className="w-48 sm:w-64 h-1.5 bg-purple-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${((pageIndex + 1) / totalPages) * 100}%` }}
          />
        </div>

        {/* Dynamic Drag Hint */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <MoveHorizontal className="w-4 h-4 text-purple-600 animate-pulse" />
          <span>Freely drag left and right or scroll to browse templates</span>
        </div>
      </div>
    </div>
  );
}
