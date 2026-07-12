const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

const tabsHtml = `
      {/* Order Tabs */}
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
    '<div className="bg-gray-900 rounded-xl p-6 border border-gray-800">',
    tabsHtml + '\n      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">'
);

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
console.log("Success orders");
