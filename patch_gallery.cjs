const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

code = code.replace(
  'const [activeCategory, setActiveCategory] = useState(initialCategory);',
  'const [activeCategory, setActiveCategory] = useState(initialCategory);\n  const [activeLanguage, setActiveLanguage] = useState("All");\n  const languages = ["All", "Hindi", "English", "Other"];'
);

// update useEffect dependency
code = code.replace(
  '}, [searchQuery, activeCategory, templates]);',
  '}, [searchQuery, activeCategory, activeLanguage, templates]);'
);

// update filter logic
const filterCategoryCode = `    if (activeCategory !== "All") {
      const normalizedActive = activeCategory
        .trim()
        .toLowerCase()
        .replace(/\\s+/g, " ");
      result = result.filter(
        (t) =>
          t.category &&
          t.category.trim().toLowerCase().replace(/\\s+/g, " ") ===
            normalizedActive,
      );
    }`;

const filterLanguageCode = `
    if (activeLanguage !== "All") {
      result = result.filter(t => {
        if (activeLanguage === "Other") {
            return t.language !== "Hindi" && t.language !== "English";
        }
        return t.language === activeLanguage;
      });
    }
`;

code = code.replace(filterCategoryCode, filterCategoryCode + filterLanguageCode);

// update UI
const searchAndFilters = `
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-6 mb-12">
`;
const newFilters = `
          {/* Search and Filters */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex flex-col md:flex-row gap-6">
`;
code = code.replace(searchAndFilters, newFilters);

const categoryTabsEnd = `              })}
            </div>
          </div>
`;
const newTabsEnd = `              })}
            </div>
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={\`px-6 py-4 rounded-xl font-medium whitespace-nowrap transition-all \${activeLanguage === lang ? "bg-brand-rose text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}\`}
                >
                  {lang === "All" ? "All Languages" : lang}
                </button>
              ))}
            </div>
          </div>
`;
code = code.replace(categoryTabsEnd, newTabsEnd);

// update clear filters
code = code.replace(
  'setSearchQuery("");\n                          setActiveCategory("All");',
  'setSearchQuery("");\n                          setActiveCategory("All");\n                          setActiveLanguage("All");'
);

fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
console.log("Success gallery");
