const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

// Add import for Search icon
if (!code.includes('Search,')) {
    code = code.replace('Plus, Edit, Trash2, ImagePlus, Eye, Star, TrendingUp, Play, ShoppingBag, X', 'Plus, Edit, Trash2, ImagePlus, Eye, Star, TrendingUp, Play, ShoppingBag, X, Search');
}

// Add state
if (!code.includes('const [searchQuery, setSearchQuery]')) {
    code = code.replace("const [activeTab, setActiveTab] = useState('All');", "const [activeTab, setActiveTab] = useState('All');\n  const [searchQuery, setSearchQuery] = useState('');");
}

// Add UI
const uiSearchHtml = `      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
          />
        </div>
      </div>
      
      {/* Category Tabs */}`;
code = code.replace("{/* Category Tabs */}", uiSearchHtml);

// Add filter logic
const oldFilter = "templates.filter(t => activeTab === 'All' ? true : t.category === activeTab).map(template => (";
const newFilter = "templates.filter(t => {\n" +
                  "                  const matchesTab = activeTab === 'All' ? true : t.category === activeTab;\n" +
                  "                  const matchesSearch = searchQuery === '' || \n" +
                  "                    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || \n" +
                  "                    (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()));\n" +
                  "                  return matchesTab && matchesSearch;\n" +
                  "                }).map(template => (";
code = code.replace(oldFilter, newFilter);

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
console.log("Success TemplateManagement patch");
