const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

// 1. Fix openForm
code = code.replace(
    "setBaseOrdersCount(template.baseOrdersCount ?? 100);",
    "setBaseOrdersCount(template.baseOrdersCount ?? 100);\n      setLanguage(template.language || 'None');"
);
code = code.replace(
    "setBaseOrdersCount(100);",
    "setBaseOrdersCount(100);\n      setLanguage('None');"
);

// 2. Add Tabs for Categories
// Find where the table starts. 
const tableContainerStart = '<div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl overflow-x-auto">';

const tabsHtml = `
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-thin scrollbar-thumb-gray-800">
        <button
          onClick={() => setActiveTab('All')}
          className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${activeTab === 'All' ? 'bg-indigo-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'}\`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${activeTab === cat ? 'bg-indigo-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'}\`}
          >
            {cat}
          </button>
        ))}
      </div>
`;

code = code.replace(tableContainerStart, tabsHtml + '\n      ' + tableContainerStart);

// 3. Filter templates by activeTab
code = code.replace(
    "{templates.map((template) => (",
    "{templates.filter(t => activeTab === 'All' ? true : t.category === activeTab).map((template) => ("
);

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
console.log("Success");
