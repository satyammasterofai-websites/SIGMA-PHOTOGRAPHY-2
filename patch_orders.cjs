const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

// Add activeTab state
code = code.replace(
  'const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);',
  'const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);\n  const [activeTab, setActiveTab] = useState("All");'
);

// Add Tabs UI
const tabsHtml = `
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-thin scrollbar-thumb-gray-800">
        <button
          onClick={() => setActiveTab('All')}
          className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${activeTab === 'All' ? 'bg-indigo-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'}\`}
        >
          All Orders
        </button>
        <button
          onClick={() => setActiveTab('Pending')}
          className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${activeTab === 'Pending' ? 'bg-indigo-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'}\`}
        >
          Pending / Processing
        </button>
        <button
          onClick={() => setActiveTab('Completed')}
          className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${activeTab === 'Completed' ? 'bg-indigo-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'}\`}
        >
          Completed / Delivered
        </button>
      </div>
`;

code = code.replace(
  '<div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">',
  tabsHtml + '\n      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">'
);

// Filter orders
code = code.replace(
  '{orders.map((order) => (',
  `{orders.filter(o => {
          if (activeTab === 'All') return true;
          const st = o.status || 'Pending';
          if (activeTab === 'Pending') return st === 'Pending' || st === 'Processing';
          if (activeTab === 'Completed') return st === 'Completed' || st === 'Delivered';
          return true;
        }).map((order) => (`
);

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
console.log("Success");
