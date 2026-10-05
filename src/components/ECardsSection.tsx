import { useState, useRef, useEffect, UIEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
  Eye,
  X,
  Smartphone,
  Monitor,
  Loader2,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Heart,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useSiteContent } from "../hooks/useSiteContent";
import toast from "react-hot-toast";

export interface ECard {
  id: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  link?: string;
  subCategory?: string;
  description?: string;
  tags?: string[];
  features?: string[];
}

export const defaultECardsData: {
  hindu: ECard[];
  muslim: ECard[];
  english: ECard[];
} = {
  hindu: [
    {
      id: "ecard-hindu-1",
      name: "Royal Marwar Palace E-Card",
      image:
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
      price: 1499,
      discountPrice: 999,
      link: "https://sigma-demo-preview.web.app/ecard/royal-marwar",
      subCategory: "Hindu Templates",
      description:
        "A regal Rajasthani palace wedding e-card with intricate gold foil arches, peacock motifs, and royal Hindi & English calligraphy.",
      features: [
        "Gold Foil Embossed Finish",
        "Personalized Shloka & Couple Monogram",
        "Instant High-Resolution Digital Delivery",
        "WhatsApp & Social Media Optimized",
      ],
    },
    {
      id: "ecard-hindu-2",
      name: "Shubh Vivah Golden Motif E-Card",
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
      price: 1699,
      discountPrice: 1199,
      link: "https://sigma-demo-preview.web.app/ecard/shubh-vivah",
      subCategory: "Hindu Templates",
      description:
        "Auspicious crimson velvet texture adorned with Lord Ganesha blessings, traditional temple bells, and royal mandap borders.",
      features: [
        "Vedic Shloka Inscription",
        "Multi-Event Itinerary Cards",
        "Ultra HD 300 DPI Format",
        "Editable Family Credits",
      ],
    },
    {
      id: "ecard-hindu-3",
      name: "Traditional Vedic Mandap E-Card",
      image:
        "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&q=80&w=800",
      price: 1299,
      discountPrice: 799,
      link: "https://sigma-demo-preview.web.app/ecard/vedic-mandap",
      subCategory: "Hindu Templates",
      description:
        "Vibrant marigold yellow and vermilion red theme capturing the sacred Saat Phere rituals with timeless Indian grace.",
      features: [
        "Sacred Agni & Phere Artwork",
        "Interactive Clickable Venue Map Link",
        "Instant 24-Hour WhatsApp Delivery",
        "Custom Music Integration Ready",
      ],
    },
    {
      id: "ecard-hindu-4",
      name: "Varanasi Ghats Diya Symphony E-Card",
      image:
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800",
      price: 1599,
      discountPrice: 1099,
      link: "https://sigma-demo-preview.web.app/ecard/varanasi-ghats",
      subCategory: "Hindu Templates",
      description:
        "Atmospheric twilight ghats lit with sacred floating diyas and classical sitar aesthetics designed for eternal celebrations.",
      features: [
        "Spiritual Aesthetic Layout",
        "Custom Portrait Illustration Spot",
        "Printable High-Res PDF + JPEG",
        "Free Revision Support",
      ],
    },
  ],
  muslim: [
    {
      id: "ecard-muslim-1",
      name: "Royal Nikah Mubarak Emerald E-Card",
      image:
        "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=800",
      price: 1799,
      discountPrice: 1299,
      link: "https://sigma-demo-preview.web.app/ecard/nikah-mubarak",
      subCategory: "Muslim Templates",
      description:
        "Deep emerald green with intricate Arabic Quranic verse calligraphy, shimmering gold foil lattice, and regal palace arches.",
      features: [
        "Bismillah & Quranic Calligraphy",
        "Luxury Emerald & Gold Palette",
        "Nikah & Walima Timing Split",
        "WhatsApp One-Click Sharing",
      ],
    },
    {
      id: "ecard-muslim-2",
      name: "Noor-e-Jahan Pastel Floral E-Card",
      image:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
      price: 1399,
      discountPrice: 899,
      link: "https://sigma-demo-preview.web.app/ecard/noor-e-jahan",
      subCategory: "Muslim Templates",
      description:
        "Delicate blush pink watercolor roses intertwined with gold damask arches, perfect for modern romantic Nikah ceremonies.",
      features: [
        "Soft Floral Watercolors",
        "Graceful Urdu Typography",
        "Optimized for Instagram & Status",
        "VIP RSVP QR Code Support",
      ],
    },
    {
      id: "ecard-muslim-3",
      name: "Grand Walima Golden Arch E-Card",
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
      price: 1599,
      discountPrice: 1099,
      link: "https://sigma-demo-preview.web.app/ecard/grand-walima",
      subCategory: "Muslim Templates",
      description:
        "Majestic Mughal gateway design with glittering chandeliers and gold typography for grand post-wedding reception galas.",
      features: [
        "Mughal Archway Architecture",
        "Dual Tone Gold Stamping",
        "Event Schedule & Venue Link",
        "Instant Delivery via WhatsApp",
      ],
    },
  ],
  english: [
    {
      id: "ecard-english-1",
      name: "Modern Minimalist Botanical E-Card",
      image:
        "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800",
      price: 1499,
      discountPrice: 999,
      link: "https://sigma-demo-preview.web.app/ecard/modern-botanical",
      subCategory: "English Templates",
      description:
        "Clean sage eucalyptus leaves with crisp modern serif typography and subtle embossed gold geometric borders.",
      features: [
        "Contemporary Minimalist Design",
        "Hand-painted Botanical Sprigs",
        "Clean High-Fashion Typography",
        "Digital & Print Ready",
      ],
    },
    {
      id: "ecard-english-2",
      name: "Celestial Starlight Monogram E-Card",
      image:
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
      price: 1699,
      discountPrice: 1199,
      link: "https://sigma-demo-preview.web.app/ecard/celestial-starlight",
      subCategory: "English Templates",
      description:
        "Midnight starry sky with glittering gold dust constellation accents and a customized couple interlocking monogram.",
      features: [
        "Bespoke Monogram Crest",
        "Midnight Blue & Stardust Finish",
        "Interactive RSVP Button",
        "Full Resolution Mobile Fit",
      ],
    },
    {
      id: "ecard-english-3",
      name: "Luxury Champagne & Ivory E-Card",
      image:
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800",
      price: 1399,
      discountPrice: 899,
      link: "https://sigma-demo-preview.web.app/ecard/champagne-ivory",
      subCategory: "English Templates",
      description:
        "Warm creamy ivory deckle-edge paper aesthetic styled with antique gold wax seal graphic and timeless romance.",
      features: [
        "Deckle Edge Paper Texture",
        "Vintage Wax Seal Stamp",
        "Elegant Calligraphy Script",
        "Instant WhatsApp Dispatch",
      ],
    },
  ],
};

export const defaultWebsiteTemplates: ECard[] = [
  {
    id: "web-sample-1",
    name: "Royal Rajputana Palace Wedding Website",
    image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    price: 2999,
    discountPrice: 2499,
    link: "https://preview.themeforest.net/item/wedding-invitation-website-template/full_screen_preview/24560783",
    subCategory: "Website Templates",
    description:
      "Interactive digital royal wedding invitation website featuring RSVP tracker, Google Maps venue directions, bridal party, countdown timer, and love story timeline.",
    features: [
      "Live Interactive RSVP Tracker",
      "Google Maps Live Navigation",
      "Love Story & Photo Gallery",
      "Event Countdown & Music Player",
    ],
  },
  {
    id: "web-sample-2",
    name: "Blush Floral Ivory Interactive RSVP Invite",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
    price: 2499,
    discountPrice: 1999,
    link: "https://preview.themeforest.net/item/wedding-responsive-invitation-template/full_screen_preview/25893420",
    subCategory: "Website Templates",
    description:
      "Elegant pastel floral mobile-first invitation website with live RSVP guestbook, event calendar sync, and photo gallery.",
    features: [
      "Guestbook & Live RSVP Form",
      "Mobile-First Responsive Layout",
      "Calendar Add-to-Phone Sync",
      "Custom Audio & Couple Itinerary",
    ],
  },
  {
    id: "web-sample-3",
    name: "Golden Euphoria Luxury Gala Invitation",
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800",
    price: 3299,
    discountPrice: 2699,
    link: "https://preview.themeforest.net/item/event-and-wedding-invitation-theme/full_screen_preview/22810984",
    subCategory: "Website Templates",
    description:
      "Grand gold and emerald digital experience with ambient background music player, venue navigation, and custom dress code guide.",
    features: [
      "Royal Gold & Emerald Aesthetics",
      "Background Symphony Music Player",
      "Interactive Venue Directions",
      "Custom Dress Code & Notes",
    ],
  },
  {
    id: "web-sample-4",
    name: "Modern Minimalist Couple Story Portal",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
    price: 2199,
    discountPrice: 1799,
    link: "https://preview.themeforest.net/item/wedding-invitation-website-template/full_screen_preview/24560783",
    subCategory: "Website Templates",
    description:
      "Clean aesthetic typography with smooth parallax scrolling, Google Maps live pins, and guest dietary requirement forms.",
    features: [
      "Parallax Scrolling & Timeline",
      "Guest RSVP with Dietary Options",
      "Directions & Transport Guide",
      "Fast 24-Hour Customization",
    ],
  },
  {
    id: "web-sample-5",
    name: "Sangeet & Mehendi Celebration Hub",
    image:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800",
    price: 2499,
    discountPrice: 1999,
    link: "https://preview.themeforest.net/item/wedding-responsive-invitation-template/full_screen_preview/25893420",
    subCategory: "Website Templates",
    description:
      "Festive colorful mobile invitation website with Spotify playlist integration, event timeline, and instant WhatsApp share.",
    features: [
      "Spotify Playlist Player Link",
      "Event-by-Event Interactive Itinerary",
      "One-Click WhatsApp Sharing",
      "High Speed Cloud Hosting",
    ],
  },
  {
    id: "web-sample-6",
    name: "Destination Beachfront Wedding Experience",
    image:
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
    price: 2999,
    discountPrice: 2399,
    link: "https://preview.themeforest.net/item/event-and-wedding-invitation-theme/full_screen_preview/22810984",
    subCategory: "Website Templates",
    description:
      "Tropical coastal theme with flight/hotel accommodation guide for out-of-town guests and itinerary countdown.",
    features: [
      "Flight & Accommodation Guide",
      "Multi-Day Event Countdown",
      "Full Mobile & Desktop Responsive",
      "Direct WhatsApp RSVP Sync",
    ],
  },
];

export function ECardCarouselGroup({
  title,
  ecards,
  onOrder,
  onQuickView,
  onLivePreview,
}: {
  title?: string;
  ecards: ECard[];
  onOrder: (card: ECard) => void;
  onQuickView: (card: ECard) => void;
  onLivePreview: (url: string, title: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ecards.length > 0 && scrollRef.current) {
      scrollToCard(0, "instant");
      setCurrentIndex(0);
    }
  }, [ecards.length]);

  if (ecards.length === 0) return null;

  const handleScroll = (_e: UIEvent<HTMLDivElement>) => {
    if (!scrollRef.current || ecards.length === 0) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const centerPosition = scrollLeft + scrollRef.current.clientWidth / 2;

    const cardElements = Array.from(
      scrollRef.current.querySelectorAll("[data-card-index]")
    ) as HTMLElement[];
    let closestIndex = currentIndex;
    let minDistance = Infinity;

    cardElements.forEach((el) => {
      const index = parseInt(el.getAttribute("data-card-index") || "0", 10);
      const rect = el.getBoundingClientRect();
      const parentRect = scrollRef.current!.getBoundingClientRect();
      const elementCenter =
        rect.left -
        parentRect.left +
        scrollRef.current!.scrollLeft +
        rect.width / 2;
      const distance = Math.abs(centerPosition - elementCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== currentIndex) {
      setCurrentIndex(closestIndex);
    }
  };

  const scrollToCard = (index: number, behavior: ScrollBehavior = "smooth") => {
    if (!scrollRef.current) return;
    const cardElements = Array.from(
      scrollRef.current.querySelectorAll("[data-card-index]")
    ) as HTMLElement[];
    const targetElement = cardElements.find(
      (el) => parseInt(el.getAttribute("data-card-index") || "0", 10) === index
    );

    if (targetElement) {
      const parentRect = scrollRef.current.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const scrollLeft =
        scrollRef.current.scrollLeft +
        (targetRect.left - parentRect.left) -
        parentRect.width / 2 +
        targetRect.width / 2;
      scrollRef.current.scrollTo({ left: scrollLeft, behavior });
    }
  };

  const nextCard = () => {
    if (currentIndex < ecards.length - 1) scrollToCard(currentIndex + 1);
  };

  const prevCard = () => {
    if (currentIndex > 0) scrollToCard(currentIndex - 1);
  };

  return (
    <div className="mb-24 last:mb-0">
      {/* Category Header with Dividers */}
      {title && (
        <div className="flex items-center justify-center gap-4 mb-10 px-6">
          <div className="h-px bg-gray-200 flex-1 max-w-[100px] md:max-w-[200px]" />
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-center text-slate-900 tracking-tight">
            {title}
          </h3>
          <div className="h-px bg-gray-200 flex-1 max-w-[100px] md:max-w-[200px]" />
        </div>
      )}

      <div className="relative group">
        {/* Floating Chevron Controls */}
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          aria-label="Previous E-Card"
          className="hidden md:flex absolute left-8 top-1/3 -translate-y-1/2 z-40 w-14 h-14 items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 text-slate-800 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        <button
          onClick={nextCard}
          disabled={currentIndex === ecards.length - 1}
          aria-label="Next E-Card"
          className="hidden md:flex absolute right-8 top-1/3 -translate-y-1/2 z-40 w-14 h-14 items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 text-slate-800 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-7 h-7" />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 md:gap-10 pb-16 pt-8 hide-scrollbar cursor-grab active:cursor-grabbing relative"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Centering Spacer Left */}
          <div className="snap-align-none shrink-0 w-[calc(50vw-130px)] md:w-[calc(50vw-160px)]" />

          {ecards.map((card, index) => {
            const isCenter = index === currentIndex;
            return (
              <div
                key={`${card.id}-${index}`}
                data-card-index={index}
                className="snap-center shrink-0 flex flex-col items-center w-[240px] md:w-[280px]"
              >
                {/* 3D Smartphone Mockup */}
                <div
                  onClick={() => scrollToCard(index)}
                  className={`transition-all duration-500 ease-out transform origin-bottom cursor-pointer w-full
                    ${
                      isCenter
                        ? "scale-105 md:scale-110 shadow-2xl z-10 translate-y-0 opacity-100"
                        : "scale-90 opacity-50 shadow-md z-0 translate-y-4"
                    }`}
                >
                  <div className="relative rounded-[2.5rem] overflow-hidden border-[6px] border-black bg-gray-900 aspect-[9/16] w-full ring-1 ring-white/10 group">
                    {/* Top Notch / Dynamic Island */}
                    <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-20">
                      <div className="w-24 md:w-28 h-5 md:h-6 bg-black rounded-b-2xl flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/10" />
                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-indigo-500/50" />
                      </div>
                    </div>

                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover rounded-[2rem]"
                      loading="lazy"
                    />

                    {!isCenter && (
                      <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-transparent" />
                    )}
                  </div>
                </div>

                {/* Information Card (Fade and Slide In) */}
                <div
                  className={`mt-8 md:mt-12 flex flex-col items-center w-full transition-all duration-500
                    ${
                      isCenter
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                >
                  <h4 className="text-xl md:text-2xl font-display font-bold text-brand-navy mb-1 text-center px-2 line-clamp-1">
                    {card.name}
                  </h4>

                  <div className="text-lg font-bold text-indigo-600 mb-4">
                    {card.discountPrice ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm line-through text-gray-400">
                          ₹{card.price}
                        </span>
                        <span className="font-extrabold text-brand-purple">
                          ₹{card.discountPrice}
                        </span>
                      </div>
                    ) : (
                      <span className="font-extrabold text-brand-purple">
                        ₹{card.price}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-full px-2">
                    <button
                      onClick={() => onOrder(card)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-brand-purple hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-brand-purple/20 transition-transform active:scale-95 cursor-pointer"
                    >
                      Order now <ShoppingBag className="w-5 h-5" />
                    </button>

                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => onQuickView(card)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-slate-800 rounded-2xl font-bold shadow-sm transition-all active:scale-95 hover:border-indigo-300 cursor-pointer text-sm"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                        Quick View
                      </button>
                      {card.link && (
                        <button
                          onClick={() => onLivePreview(card.link!, card.name)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-md transition-all active:scale-95 cursor-pointer text-sm"
                        >
                          <ExternalLink className="w-4 h-4 text-white/70" />
                          Live Demo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Centering Spacer Right */}
          <div className="snap-align-none shrink-0 w-[calc(50vw-130px)] md:w-[calc(50vw-160px)]" />
        </div>
      </div>
    </div>
  );
}

export default function ECardsSection({ ecards }: { ecards?: ECard[] }) {
  const { templates } = useSiteContent();
  const navigate = useNavigate();

  const [selectedPreview, setSelectedPreview] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">(
    "mobile"
  );
  const [iframeLoading, setIframeLoading] = useState(true);

  const [quickViewCard, setQuickViewCard] = useState<ECard | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<string>("All");

  // Derive templates from Firestore templates
  const customTemplates: ECard[] = (templates || [])
    .filter((t: any) => {
      const cat = (t.category || "").toLowerCase();
      const hasWebUrl = !!(t.websiteUrl && t.websiteUrl.trim());
      return (
        cat === "e-card" ||
        cat === "ecard" ||
        cat === "e-cards" ||
        cat === "website invitation" ||
        cat === "website" ||
        t.type === "ecard" ||
        t.type === "website" ||
        hasWebUrl
      );
    })
    .map((t: any) => {
      const cat = (t.category || "").toLowerCase();
      const isWebsite =
        cat.includes("website") || !!t.websiteUrl || t.type === "website";
      const subCat =
        t.subCategory ||
        (isWebsite
          ? "Website Templates"
          : t.language === "Hindi"
          ? "Hindu Templates"
          : "Hindu Templates");

      return {
        id: t.id,
        name: t.title || "Custom Template",
        image:
          t.thumbnailBase64 ||
          t.image ||
          "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
        price: Number(t.price) || 1499,
        discountPrice: t.discountPrice ? Number(t.discountPrice) : undefined,
        link:
          t.websiteUrl ||
          t.videoUrl ||
          `https://demo.sigmainvitations.com/template/${t.id}`,
        subCategory: subCat,
        description: t.description,
        features: [
          isWebsite
            ? "Live Interactive Website Experience"
            : "High-Resolution 300 DPI Format",
          "Personalized Names & Event Details",
          "WhatsApp & Social Media Ready",
          "24-Hour Express Turnaround",
        ],
      };
    });

  const allWebsiteCards = [
    ...defaultWebsiteTemplates,
    ...customTemplates.filter(
      (c) =>
        c.subCategory?.toLowerCase().includes("web") ||
        (c.link && c.link.includes("preview"))
    ),
  ];
  const allHinduCards = [
    ...defaultECardsData.hindu,
    ...customTemplates.filter((c) =>
      c.subCategory?.toLowerCase().includes("hindu")
    ),
  ];
  const allMuslimCards = [
    ...defaultECardsData.muslim,
    ...customTemplates.filter((c) =>
      c.subCategory?.toLowerCase().includes("muslim")
    ),
  ];
  const allEnglishCards = [
    ...defaultECardsData.english,
    ...customTemplates.filter((c) =>
      c.subCategory?.toLowerCase().includes("english")
    ),
  ];

  const allCards = [
    ...allWebsiteCards,
    ...allHinduCards,
    ...allMuslimCards,
    ...allEnglishCards,
  ];

  const displayedCards = (() => {
    if (activeTabFilter === "Website" || activeTabFilter === "Website Templates") {
      return allWebsiteCards;
    }
    if (activeTabFilter === "Hindu" || activeTabFilter === "Hindu Templates") {
      return allHinduCards;
    }
    if (activeTabFilter === "Muslim" || activeTabFilter === "Muslim Templates") {
      return allMuslimCards;
    }
    if (activeTabFilter === "English" || activeTabFilter === "English Templates") {
      return allEnglishCards;
    }
    return allCards;
  })();

  // If external ecards are passed directly via prop, use them
  const providedCards = ecards && ecards.length > 0 ? ecards : null;

  const handleOrder = (card: ECard) => {
    // If it's a Firestore template, navigate directly to checkout
    if (card.id && !card.id.startsWith("ecard-") && !card.id.startsWith("web-sample-")) {
      navigate(`/checkout/${card.id}`);
    } else {
      // Find matching template in Firestore or navigate to checkout with state
      const matched = (templates || []).find(
        (t: any) =>
          t.title?.toLowerCase() === card.name.toLowerCase() ||
          t.category?.toLowerCase() === "website invitation" ||
          t.category?.toLowerCase() === "e-card"
      );
      if (matched) {
        navigate(`/checkout/${matched.id}`);
      } else {
        navigate(`/checkout/${card.id}`, {
          state: {
            template: {
              id: card.id,
              title: card.name,
              price: card.discountPrice || card.price,
              category: card.subCategory || "Website Invitation",
              thumbnailBase64: card.image,
              image: card.image,
            },
          },
        });
        toast.success(`Selected ${card.name}! Proceeding to checkout.`);
      }
    }
  };

  const handleQuickView = (card: ECard) => {
    setQuickViewCard(card);
  };

  const handleLivePreview = (url: string, title: string) => {
    setIframeLoading(true);
    setSelectedPreview({ url, title });
  };

  useEffect(() => {
    if (selectedPreview) {
      setIframeLoading(true);
      const timer = setTimeout(() => {
        setIframeLoading(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [selectedPreview]);

  return (
    <section
      id="ecards"
      className="py-24 w-full overflow-hidden relative bg-white"
    >
      {/* Top-Right Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-50 via-white to-white opacity-60 pointer-events-none" />

      <div className="w-full relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 px-6 max-w-7xl mx-auto">
          <div className="flex justify-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-rose bg-brand-rose/10 px-4 py-1.5 rounded-full border border-brand-rose/20 shadow-xs">
              LIVE E-CARD DEMOS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-navy mb-4">
            Interactive 3D E-Cards
          </h2>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto mb-8">
            Swipe through our exclusive digital wedding invitations. Luxury
            cinematic styling, smooth phone cover-flow, and instant WhatsApp sharing.
          </p>

          {/* Filter Buttons */}
          {!providedCards && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-2">
              {["All", "Website", "Hindu", "Muslim", "English"].map((tab) => {
                const isActive = activeTabFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTabFilter(tab)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      isActive
                        ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30 scale-105"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black"
                    }`}
                  >
                    {tab === "All"
                      ? "All Templates"
                      : tab === "Website"
                      ? "Website Templates"
                      : `${tab} Templates`}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Single Unified 3D Phone-Mockup E-Card Showcase Carousel */}
        <ECardCarouselGroup
          key={activeTabFilter}
          ecards={providedCards || displayedCards}
          onOrder={handleOrder}
          onQuickView={handleQuickView}
          onLivePreview={handleLivePreview}
        />
      </div>

      {/* FULLSCREEN LIVE DEMO PREVIEW MODAL */}
      <AnimatePresence>
        {selectedPreview && (
          <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-neutral-900/90 text-white">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 className="font-display font-bold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-md">
                  {selectedPreview.title}
                </h3>
              </div>

              {/* Mobile / Desktop Switcher */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    previewDevice === "mobile"
                      ? "bg-brand-purple text-white shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    previewDevice === "desktop"
                      ? "bg-brand-purple text-white shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
              </div>

              {/* Actions: Open Original & Close */}
              <div className="flex items-center gap-2">
                <a
                  href={selectedPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  Open Original <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setSelectedPreview(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-rose-500 hover:text-white text-white/80 transition-all cursor-pointer"
                  aria-label="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with Animated Frame Container */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-3 sm:p-6 relative">
              <motion.div
                layout
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={
                  previewDevice === "mobile"
                    ? "w-full max-w-[375px] h-[780px] max-h-[85vh] rounded-[2.8rem] border-[8px] border-black bg-neutral-900 shadow-2xl relative overflow-hidden flex flex-col"
                    : "w-full max-w-6xl h-[82vh] rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl relative overflow-hidden flex flex-col"
                }
              >
                {/* Dynamic Island on Mobile */}
                {previewDevice === "mobile" && (
                  <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-30 pointer-events-none">
                    <div className="w-28 h-6 bg-black rounded-b-2xl flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/15" />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {iframeLoading && (
                  <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center z-20 text-white">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-400 mb-4" />
                    <p className="text-sm font-medium text-white/80">
                      Loading interactive live demo...
                    </p>
                    <span className="text-xs text-white/40 mt-1">
                      {selectedPreview.title}
                    </span>
                  </div>
                )}

                {/* Simulated interactive live invitation experience inside iframe container */}
                <iframe
                  src={selectedPreview.url}
                  title={selectedPreview.title}
                  onLoad={() => setIframeLoading(false)}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />

                {/* Fallback interactive e-card presentation if iframe fails or is blocked */}
                {iframeLoading && (
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 text-white flex flex-col items-center justify-center p-6 text-center z-10">
                    <Sparkles className="w-12 h-12 text-yellow-400 mb-4 animate-bounce" />
                    <h4 className="text-2xl font-display font-bold mb-2">
                      {selectedPreview.title}
                    </h4>
                    <p className="text-xs text-white/70 max-w-sm mb-6">
                      High-fidelity 9:16 mobile invitation experience with
                      custom animated typography, music, and interactive RSVP.
                    </p>
                    <div className="flex gap-3">
                      <a
                        href={selectedPreview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-brand-purple hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
                      >
                        Launch Full Demo <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {quickViewCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative border border-gray-100"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickViewCard(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-gray-100 flex items-center justify-center text-gray-700 hover:text-black transition-all cursor-pointer shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: 9:16 Card Image with Phone styling */}
                <div className="bg-gradient-to-b from-gray-900 to-black p-6 flex items-center justify-center">
                  <div className="relative rounded-[2rem] overflow-hidden border-4 border-neutral-800 bg-gray-950 aspect-[9/16] w-full max-w-[200px] shadow-2xl ring-1 ring-white/10">
                    <img
                      src={quickViewCard.image}
                      alt={quickViewCard.name}
                      className="w-full h-full object-cover rounded-[1.7rem]"
                    />
                  </div>
                </div>

                {/* Right: Details & Specs */}
                <div className="p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-rose bg-brand-rose/10 px-3 py-1 rounded-full border border-brand-rose/20 inline-block mb-2">
                      {quickViewCard.subCategory || "Luxury E-Card"}
                    </span>
                    <h3 className="text-2xl font-display font-bold text-brand-navy mb-2">
                      {quickViewCard.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-4 line-clamp-3">
                      {quickViewCard.description ||
                        "Tailored with your custom couple names, auspicious quotes, date, venue, and WhatsApp sharing."}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-5">
                      <span className="text-3xl font-black text-brand-purple">
                        ₹
                        {quickViewCard.discountPrice || quickViewCard.price}
                      </span>
                      {quickViewCard.discountPrice && (
                        <span className="text-base text-gray-400 line-through">
                          ₹{quickViewCard.price}
                        </span>
                      )}
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Limited Offer
                      </span>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Included Features:
                      </h4>
                      {(
                        quickViewCard.features || [
                          "High-Resolution 300 DPI Format",
                          "Personalized Couple Details",
                          "Instant WhatsApp Ready Share",
                          "24-48 Hours Fast Delivery",
                        ]
                      ).map((feat, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-gray-700"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setQuickViewCard(null);
                        handleOrder(quickViewCard);
                      }}
                      className="w-full py-3.5 bg-brand-purple hover:bg-purple-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-purple/25 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" /> Order Now
                    </button>
                    {quickViewCard.link && (
                      <button
                        onClick={() => {
                          const url = quickViewCard.link!;
                          const name = quickViewCard.name;
                          setQuickViewCard(null);
                          handleLivePreview(url, name);
                        }}
                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Live Demo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
