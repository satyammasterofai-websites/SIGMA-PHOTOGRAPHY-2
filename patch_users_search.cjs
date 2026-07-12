const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageUsers.tsx', 'utf-8');

if (!code.includes('Search,')) {
    code = code.replace('Trash2, Edit, MessageSquare, Mail', 'Trash2, Edit, MessageSquare, Mail, Search');
}

if (!code.includes('const [searchQuery, setSearchQuery] = useState("");')) {
    code = code.replace('const [users, setUsers] = useState<any[]>([]);', 'const [users, setUsers] = useState<any[]>([]);\n  const [searchQuery, setSearchQuery] = useState("");');
}

const uiSearchHtml = `      <h1 className="text-2xl font-bold text-brand-navy mb-6">Customers Management</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
          />
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">`;
code = code.replace('<h1 className="text-2xl font-bold text-brand-navy mb-6">Customers Management</h1>\n      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">', uiSearchHtml);

const oldMap = `{users.map(u => {`;
const newMap = `{users.filter(u => {
                const searchLower = searchQuery.toLowerCase();
                return searchQuery === '' || 
                  (u.name || '').toLowerCase().includes(searchLower) ||
                  (u.email || '').toLowerCase().includes(searchLower) ||
                  (u.role || 'user').toLowerCase().includes(searchLower);
              }).map(u => {`;

if (code.includes(oldMap)) {
    code = code.replace(oldMap, newMap);
    fs.writeFileSync('src/pages/admin/ManageUsers.tsx', code);
    console.log("Patched users");
} else {
    console.log("Could not find oldMap for users");
}
