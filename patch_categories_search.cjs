const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageCategories.tsx', 'utf-8');

if (!code.includes('Search,')) {
    code = code.replace('Trash2, Plus, Image as ImageIcon, Edit2, X', 'Trash2, Plus, Image as ImageIcon, Edit2, X, Search');
}

if (!code.includes('const [searchQuery, setSearchQuery] = useState("");')) {
    code = code.replace('const [categories, setCategories] = useState<any[]>([]);', 'const [categories, setCategories] = useState<any[]>([]);\n  const [searchQuery, setSearchQuery] = useState("");');
}

const oldMap = `      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(categories || []).map(cat => (`;

const newMap = `      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(categories || []).filter(cat => searchQuery === '' || cat.name.toLowerCase().includes(searchQuery.toLowerCase())).map(cat => (`;

if (code.includes(oldMap)) {
    code = code.replace(oldMap, newMap);
    fs.writeFileSync('src/pages/admin/ManageCategories.tsx', code);
    console.log("Patched categories");
} else {
    console.log("Could not find oldMap for categories");
}
