const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const filterStateOld = `  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeLanguage, setActiveLanguage] = useState("All");`;

const filterStateNew = `  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [sortOrder, setSortOrder] = useState<"priceAsc" | "priceDesc">("priceAsc");`;

code = code.replace(filterStateOld, filterStateNew);

const useEffectFilterOld = `    result.sort((a, b) => {
      const aOrders = (a.baseOrdersCount ?? 100) + (a.ordersCount || 0);
      const bOrders = (b.baseOrdersCount ?? 100) + (b.ordersCount || 0);
      return bOrders - aOrders;
    });

    setFilteredTemplates(result);
  }, [searchQuery, activeCategory, activeLanguage, templates]);`;

const useEffectFilterNew = `    result.sort((a, b) => {
      const priceA = a.discountPrice ? Number(a.discountPrice) : Number(a.price || 0);
      const priceB = b.discountPrice ? Number(b.discountPrice) : Number(b.price || 0);
      
      if (sortOrder === "priceAsc") {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });

    setFilteredTemplates(result);
  }, [searchQuery, activeCategory, activeLanguage, sortOrder, templates]);`;

code = code.replace(useEffectFilterOld, useEffectFilterNew);

const searchBarOld = `              <input
                type="text"
                placeholder="Search templates by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-purple shadow-sm"
              />
            </div>
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">`;

const searchBarNew = `              <input
                type="text"
                placeholder="Search templates by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-purple shadow-sm"
              />
            </div>
            
            <div className="flex-shrink-0">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="h-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-purple shadow-sm font-medium text-gray-700"
              >
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
            
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">`;

code = code.replace(searchBarOld, searchBarNew);

fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
console.log("Patched PremiumGallery.tsx");
