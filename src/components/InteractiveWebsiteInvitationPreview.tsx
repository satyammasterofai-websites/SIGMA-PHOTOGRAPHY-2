import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  RotateCw,
  ExternalLink,
  X,
  Volume2,
  VolumeX,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Send,
  Sparkles,
  Play,
  Pause,
  CheckCircle2,
  ChevronDown,
  Navigation,
  Share2,
  Music,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

interface InteractiveWebsiteInvitationPreviewProps {
  template: {
    id: string;
    title: string;
    websiteUrl?: string;
    thumbnailBase64?: string;
    image?: string;
    price?: string | number;
    discountPrice?: string | number;
    description?: string;
  };
  onClose: () => void;
  isMiddle?: boolean;
}

export default function InteractiveWebsiteInvitationPreview({
  template,
  onClose,
  isMiddle = true,
}: InteractiveWebsiteInvitationPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(15);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [autoScrollActive, setAutoScrollActive] = useState(false);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpAttending, setRsvpAttending] = useState<"yes" | "no">("yes");
  const [rsvpGuests, setRsvpGuests] = useState(2);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [blessingInput, setBlessingInput] = useState("");
  const [blessings, setBlessings] = useState<string[]>([
    "Wishing you a lifetime of love and happiness! – Rahul & Priya",
    "Can't wait to dance at the Sangeet! 🎉 – Rohan",
  ]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<any>(null);

  // Derive customized couple names based on template title
  const getCoupleData = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("rajputana") || lower.includes("royal")) {
      return {
        groom: "Vikramaditya Singh",
        bride: "Radhika Kumari",
        tag: "Royal Rajputana Wedding",
        date: "Sunday, December 20, 2026",
        venue: "The Oberoi Udaivilas Palace, Udaipur",
        theme: "royal",
        palette: {
          bg: "from-amber-950 via-purple-950 to-neutral-950",
          accent: "text-amber-300",
          btn: "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-amber-950",
          border: "border-amber-400/30",
        },
      };
    } else if (lower.includes("blush") || lower.includes("floral")) {
      return {
        groom: "Aayush Sharma",
        bride: "Ananya Deshmukh",
        tag: "Blush Garden Vows",
        date: "Friday, November 14, 2026",
        venue: "Taj West End Gardens, Bengaluru",
        theme: "floral",
        palette: {
          bg: "from-rose-900 via-pink-950 to-neutral-900",
          accent: "text-pink-300",
          btn: "bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 text-white",
          border: "border-pink-300/30",
        },
      };
    } else if (lower.includes("gala") || lower.includes("gold") || lower.includes("euphoria")) {
      return {
        groom: "Kabir Malhotra",
        bride: "Tara Singhania",
        tag: "Luxury Black-Tie Gala",
        date: "Saturday, January 23, 2027",
        venue: "The Leela Palace Ballroom, New Delhi",
        theme: "gala",
        palette: {
          bg: "from-emerald-950 via-neutral-950 to-amber-950",
          accent: "text-yellow-300",
          btn: "bg-gradient-to-r from-yellow-500 to-amber-600 text-neutral-900",
          border: "border-yellow-400/30",
        },
      };
    } else {
      return {
        groom: "Dev Malhotra",
        bride: "Meera Kapoor",
        tag: "Celebration of Love",
        date: "Sunday, December 12, 2026",
        venue: "JW Marriott Resort & Spa, Jaipur",
        theme: "default",
        palette: {
          bg: "from-purple-950 via-indigo-950 to-neutral-950",
          accent: "text-purple-300",
          btn: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white",
          border: "border-purple-300/30",
        },
      };
    }
  };

  const couple = getCoupleData(template.title);

  // Countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({
    days: 74,
    hours: 14,
    minutes: 36,
    seconds: 22,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Smooth loading simulation
  useEffect(() => {
    setIsLoading(true);
    setLoadProgress(20);
    const p1 = setTimeout(() => setLoadProgress(65), 180);
    const p2 = setTimeout(() => setLoadProgress(100), 380);
    const p3 = setTimeout(() => {
      setIsLoading(false);
      // Kick off gentle auto-scroll tour so website starts moving smoothly!
      setAutoScrollActive(true);
    }, 550);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
    };
  }, [template.id]);

  // Handle smooth auto-scroll tour
  useEffect(() => {
    if (!autoScrollActive || isLoading) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      return;
    }

    autoScrollIntervalRef.current = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const el = scrollContainerRef.current;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
        // reached bottom, loop gently back to top or pause
        el.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        el.scrollTop += 1.2;
      }
    }, 30);

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [autoScrollActive, isLoading]);

  // User manually touching or scrolling pauses the auto-scroll gently
  const handleUserTouchScroll = () => {
    if (autoScrollActive) {
      setAutoScrollActive(false);
    }
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setRsvpSubmitted(true);
    toast.success(`RSVP received for ${rsvpName}! Thank you 🎉`, {
      icon: "💌",
      duration: 3500,
    });
  };

  const handleAddBlessing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blessingInput.trim()) return;
    setBlessings([`${blessingInput} – You`, ...blessings]);
    setBlessingInput("");
    toast.success("Blessing added to digital guestbook! 💖");
  };

  const reloadWebsite = () => {
    setIsLoading(true);
    setLoadProgress(20);
    setTimeout(() => setLoadProgress(70), 200);
    setTimeout(() => {
      setIsLoading(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }, 450);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-neutral-950 text-white overflow-hidden select-none font-sans">
      {/* Top Mini Browser Safari/Chrome Bar */}
      <div className="h-9 shrink-0 bg-neutral-900/95 border-b border-white/10 px-2 sm:px-3 flex items-center justify-between gap-1 z-30">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-1 bg-neutral-800/90 text-[8px] sm:text-[9px] text-gray-300 px-2 py-0.5 rounded-full border border-white/10 truncate max-w-[130px] sm:max-w-[155px]">
            <Globe className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            <span className="truncate">invite.sigma.com/{couple.theme}</span>
          </div>
          <button
            onClick={reloadWebsite}
            title="Reload page"
            className="p-1 text-gray-400 hover:text-white rounded transition-colors"
          >
            <RotateCw className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Auto Tour & External Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setAutoScrollActive((prev) => !prev)}
            title={autoScrollActive ? "Pause Auto-Tour" : "Start Smooth Auto-Tour"}
            className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold flex items-center gap-0.5 transition-all ${
              autoScrollActive
                ? "bg-purple-600 text-white animate-pulse"
                : "bg-neutral-800 text-gray-300 hover:text-white"
            }`}
          >
            {autoScrollActive ? (
              <>
                <Pause className="w-2 h-2" /> Tour
              </>
            ) : (
              <>
                <Play className="w-2 h-2" /> Tour
              </>
            )}
          </button>

          {template.websiteUrl && (
            <button
              onClick={() =>
                window.open(template.websiteUrl, "_blank", "noopener,noreferrer")
              }
              title="Open full site in new tab"
              className="p-1 text-gray-400 hover:text-white rounded"
            >
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          )}

          <button
            onClick={onClose}
            title="Exit live preview / back to poster"
            className="p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors ml-0.5"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="absolute top-9 left-0 right-0 h-1 bg-neutral-800 z-40 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400"
            initial={{ width: "15%" }}
            animate={{ width: `${loadProgress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>
      )}

      {/* Smooth Loading Shimmer Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 top-9 bg-neutral-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center"
          >
            <div className="relative w-12 h-12 mb-3">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
              <div className="w-12 h-12 rounded-full border-2 border-t-purple-400 border-r-pink-400 border-b-transparent border-l-transparent animate-spin flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-300" />
              </div>
            </div>
            <p className="text-[11px] font-bold text-white tracking-wide">
              Loading Invitation Website...
            </p>
            <p className="text-[9px] text-gray-400 mt-1 max-w-[170px] line-clamp-1">
              {template.title}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Website Body inside Phone Screen */}
      <div
        ref={scrollContainerRef}
        onWheel={handleUserTouchScroll}
        onTouchStart={handleUserTouchScroll}
        onMouseDown={handleUserTouchScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-none relative"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Floating Background Ambient Music Bar */}
        <div className="sticky top-2 z-20 mx-3 my-1">
          <div className="flex items-center justify-between px-2.5 py-1 rounded-full bg-neutral-900/90 backdrop-blur-md border border-white/10 shadow-lg text-[8px] text-gray-300">
            <div className="flex items-center gap-1.5 truncate">
              <Music className="w-2.5 h-2.5 text-purple-400 shrink-0 animate-bounce" />
              <span className="truncate font-medium">Din Shagna Da (Flute & Shehnai)</span>
            </div>
            <button
              onClick={() => setIsMusicPlaying(!isMusicPlaying)}
              className="text-gray-300 hover:text-white shrink-0 ml-1 p-0.5"
            >
              {isMusicPlaying ? (
                <Volume2 className="w-3 h-3 text-purple-300" />
              ) : (
                <VolumeX className="w-3 h-3 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div
          className={`relative min-h-[300px] bg-gradient-to-b ${couple.palette.bg} px-4 pt-4 pb-8 text-center flex flex-col items-center justify-center`}
        >
          {/* Subtle Background Pattern */}
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url(${template.thumbnailBase64 || template.image})`,
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full flex flex-col items-center"
          >
            {/* Wedding Monogram */}
            <div className="w-10 h-10 rounded-full border border-amber-300/40 flex items-center justify-center mb-2 bg-white/5 backdrop-blur-xs shadow-inner">
              <span className="font-serif text-sm font-bold text-amber-200">
                {couple.groom.charAt(0)} & {couple.bride.charAt(0)}
              </span>
            </div>

            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-amber-300/90 font-bold mb-1">
              Save The Date
            </span>

            <h1 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide leading-tight my-1">
              {couple.groom}
              <br />
              <span className="text-xs font-light italic text-amber-200/80">
                &amp;
              </span>
              <br />
              {couple.bride}
            </h1>

            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent my-2" />

            <p className="text-[9px] sm:text-[10px] text-gray-200 font-medium">
              {couple.date}
            </p>
            <p className="text-[8px] sm:text-[9px] text-amber-300/80 mt-0.5 flex items-center gap-1 justify-center max-w-[200px]">
              <MapPin className="w-2.5 h-2.5 shrink-0" /> {couple.venue}
            </p>

            {/* Countdown Cards */}
            <div className="grid grid-cols-4 gap-1.5 mt-4 w-full max-w-[210px]">
              {[
                { label: "Days", val: timeLeft.days },
                { label: "Hours", val: timeLeft.hours },
                { label: "Mins", val: timeLeft.minutes },
                { label: "Secs", val: timeLeft.seconds },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-black/40 backdrop-blur-md rounded-lg py-1.5 px-1 border border-white/10 text-center"
                >
                  <span className="block font-mono text-xs sm:text-sm font-black text-amber-300">
                    {String(item.val).padStart(2, "0")}
                  </span>
                  <span className="block text-[7px] text-gray-400 uppercase tracking-wider font-semibold">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <ChevronDown className="w-4 h-4 text-amber-300/60 animate-bounce mt-4" />
          </motion.div>
        </div>

        {/* Itinerary / Events Timeline */}
        <div className="p-3 bg-neutral-900 border-t border-b border-white/5 space-y-3">
          <div className="text-center">
            <span className="text-[8px] uppercase tracking-widest text-purple-400 font-bold">
              Celebrations
            </span>
            <h3 className="font-serif text-xs sm:text-sm font-bold text-white mt-0.5">
              Wedding Itinerary
            </h3>
          </div>

          <div className="space-y-2">
            {[
              {
                title: "Haldi & Phoolon Ki Holi",
                time: "10:00 AM • Morning Glow",
                desc: "Yellow attire, traditional dhol, and vibrant turmeric rituals.",
                color: "border-l-amber-400",
              },
              {
                title: "Musical Sangeet Night",
                time: "07:30 PM • Grand Ballroom",
                desc: "Cocktails, couple dance performances, and DJ till late.",
                color: "border-l-purple-400",
              },
              {
                title: "The Royal Vows & Pheras",
                time: "11:00 AM • Palace Mandap",
                desc: "Baraat procession, varmala exchange, and sacred Vedic vows.",
                color: "border-l-rose-400",
              },
              {
                title: "Reception Dinner Gala",
                time: "08:00 PM • Crystal Courtyard",
                desc: "Celebratory feast, cake cutting, and formal toasts.",
                color: "border-l-emerald-400",
              },
            ].map((event, i) => (
              <div
                key={i}
                className={`bg-neutral-800/80 rounded-xl p-2.5 border-l-3 ${event.color} border border-white/5 text-left`}
              >
                <div className="flex items-center justify-between text-[8px] text-gray-400 font-medium mb-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-purple-300" /> {event.time}
                  </span>
                </div>
                <h4 className="text-[10px] sm:text-[11px] font-bold text-white">
                  {event.title}
                </h4>
                <p className="text-[8px] text-gray-300 mt-0.5 leading-snug">
                  {event.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Google Maps Card */}
        <div className="p-3 bg-neutral-950 text-center">
          <div className="bg-neutral-900 rounded-2xl p-3 border border-white/10 text-left relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-[10px] sm:text-[11px] font-bold text-white">
                Venue Location
              </h4>
            </div>
            <p className="text-[9px] text-gray-300 leading-tight">
              {couple.venue}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      couple.venue
                    )}`,
                    "_blank"
                  );
                }}
                className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <MapPin className="w-2.5 h-2.5" /> Open in Google Maps
              </button>
            </div>
          </div>
        </div>

        {/* Interactive RSVP Form Inside Mobile Screen */}
        <div className="p-3 bg-neutral-900/90 border-t border-white/5 text-left">
          <div className="text-center mb-2.5">
            <span className="text-[8px] uppercase tracking-widest text-amber-300 font-bold">
              Kindly Respond
            </span>
            <h3 className="font-serif text-xs sm:text-sm font-bold text-white">
              Digital RSVP
            </h3>
            <p className="text-[8px] text-gray-400">
              Please let us know if you will celebrate with us!
            </p>
          </div>

          {rsvpSubmitted ? (
            <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-3 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1 animate-bounce" />
              <h4 className="text-[11px] font-bold text-emerald-200">
                RSVP Confirmed!
              </h4>
              <p className="text-[8px] text-emerald-300 mt-0.5">
                Thank you, {rsvpName}. We can't wait to see you on our big day!
              </p>
              <button
                onClick={() => setRsvpSubmitted(false)}
                className="mt-2 text-[8px] text-gray-400 underline hover:text-white"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-2">
              <div>
                <label className="block text-[8px] font-bold text-gray-300 mb-0.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-neutral-800 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-gray-300 mb-0.5">
                  Will You Attend?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRsvpAttending("yes")}
                    className={`py-1 px-1 rounded-lg text-[8px] font-bold transition-all text-center ${
                      rsvpAttending === "yes"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-neutral-800 text-gray-400"
                    }`}
                  >
                    Joyfully Accepts ✨
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpAttending("no")}
                    className={`py-1 px-1 rounded-lg text-[8px] font-bold transition-all text-center ${
                      rsvpAttending === "no"
                        ? "bg-neutral-700 text-white"
                        : "bg-neutral-800 text-gray-400"
                    }`}
                  >
                    Regretfully Declines
                  </button>
                </div>
              </div>

              {rsvpAttending === "yes" && (
                <div>
                  <label className="block text-[8px] font-bold text-gray-300 mb-0.5">
                    Total Number of Guests
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRsvpGuests(num)}
                        className={`flex-1 py-1 rounded-lg text-[8px] font-bold transition-all ${
                          rsvpGuests === num
                            ? "bg-purple-600 text-white"
                            : "bg-neutral-800 text-gray-300"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-1.5 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 shadow-md transition-all mt-1 cursor-pointer ${couple.palette.btn}`}
              >
                <Send className="w-2.5 h-2.5" /> Submit My RSVP
              </button>
            </form>
          )}
        </div>

        {/* Digital Blessings & Guestbook */}
        <div className="p-3 bg-neutral-950 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-white flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" /> Guest Blessings
            </span>
            <span className="text-[8px] text-gray-400">{blessings.length} wishes</span>
          </div>

          <form onSubmit={handleAddBlessing} className="flex gap-1">
            <input
              type="text"
              value={blessingInput}
              onChange={(e) => setBlessingInput(e.target.value)}
              placeholder="Leave a sweet wish..."
              className="flex-1 bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-[8px] text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[8px] font-bold shrink-0"
            >
              Post
            </button>
          </form>

          <div className="space-y-1 max-h-24 overflow-y-auto">
            {blessings.map((b, i) => (
              <div
                key={i}
                className="bg-neutral-900/70 border border-white/5 rounded-lg px-2 py-1 text-[8px] text-gray-300 leading-snug"
              >
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Footer of the Invitation Website */}
        <div className="p-4 bg-black text-center border-t border-white/10 space-y-2">
          <p className="font-serif text-[10px] text-amber-200">
            {couple.groom} & {couple.bride}
          </p>
          <p className="text-[8px] text-gray-500">
            Created with Sigma Photography Digital Web Invitations
          </p>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${couple.groom} & ${couple.bride} Wedding Invitation`,
                  text: `You're invited to our wedding on ${couple.date}!`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Invitation link copied!");
              }
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 text-[8px] text-gray-300 border border-white/10 transition-colors"
          >
            <Share2 className="w-2.5 h-2.5" /> Share Invitation
          </button>
        </div>
      </div>
    </div>
  );
}
