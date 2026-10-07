import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useSiteContent } from "../hooks/useSiteContent";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

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

  // Filter out "Website Invitation" and "E-Cards" from video categories list so all video categories appear first
  const videoCategories = allCategoryList.filter((c) => {
    const name = (c.name || "").trim().toLowerCase();
    return (
      name !== "website invitation" &&
      name !== "e-card" &&
      name !== "e-cards" &&
      name !== "ecard"
    );
  });

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
                {/* Numbering Badge on Category Thumbnail */}
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/75 backdrop-blur-md rounded-full border border-white/20 text-white font-black text-xs tracking-wider flex items-center gap-1.5 shadow-lg pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-brand-rose animate-pulse" />
                  <span>#{String(index + 1).padStart(2, "0")}</span>
                </div>

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
                {/* Position and Numbering Label */}
                <div className="flex flex-wrap items-center gap-2.5 mb-3">
                  <span className="text-xs font-black tracking-widest text-brand-rose uppercase bg-brand-rose/10 px-3.5 py-1 rounded-full border border-brand-rose/20 shadow-sm">
                    Position #{index + 1}
                  </span>
                  <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">
                    Category {String(index + 1).padStart(2, "0")} of {videoCategories.length}
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-display font-black uppercase tracking-wider text-brand-navy mb-4 flex items-center gap-3">
                  <span className="text-brand-purple/40 font-serif font-black text-2xl md:text-3xl">
                    {String(index + 1).padStart(2, "0")}.
                  </span>
                  <span>{cat.name}</span>
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
      </div>
    </section>
  );
}
