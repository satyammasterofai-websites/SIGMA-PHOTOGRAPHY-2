const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

if (!code.includes('Search,')) {
    code = code.replace('Download,', 'Download, Search,');
}

if (!code.includes('const [searchQuery, setSearchQuery] = useState("");')) {
    code = code.replace('const [activeTab, setActiveTab] = useState("All");', 'const [activeTab, setActiveTab] = useState("All");\n  const [searchQuery, setSearchQuery] = useState("");');
}

const uiSearchHtml = `      <h1 className="text-2xl font-bold text-brand-navy mb-6">Order Management</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by ID, customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
          />
        </div>
      </div>
      
      {/* Order Tabs */}`;
code = code.replace('<h1 className="text-2xl font-bold text-brand-navy mb-6">Order Management</h1>\n      \n      {/* Order Tabs */}', uiSearchHtml);

const oldFilter = `                {orders.filter(o => {
          if (activeTab === 'All') return true;
          const st = o.status || 'Pending';
          if (activeTab === 'Pending') return st === 'Pending' || st === 'Processing';
          if (activeTab === 'Completed') return st === 'Completed' || st === 'Delivered';
          return true;
        }).map((order) => (`;

const newFilter = `                {orders.filter(o => {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = searchQuery === '' || 
            (o.id || '').toLowerCase().includes(searchLower) ||
            (o.customerInfo?.name || '').toLowerCase().includes(searchLower) ||
            (o.customerInfo?.email || '').toLowerCase().includes(searchLower) ||
            (o.customerInfo?.phone || '').toLowerCase().includes(searchLower);
            
          if (!matchesSearch) return false;
          
          if (activeTab === 'All') return true;
          const st = o.status || 'Pending';
          if (activeTab === 'Pending') return st === 'Pending' || st === 'Processing';
          if (activeTab === 'Completed') return st === 'Completed' || st === 'Delivered';
          return true;
        }).map((order) => (`;

if (code.includes(oldFilter)) {
    code = code.replace(oldFilter, newFilter);
    fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
    console.log("Patched orders");
} else {
    console.log("Failed to find oldFilter");
}
