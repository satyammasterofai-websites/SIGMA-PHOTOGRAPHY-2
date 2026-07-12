const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

const oldFilter = `                {templates.filter(t => {
                  const matchesTab = activeTab === 'All' ? true : t.category === activeTab;
                  const matchesSearch = searchQuery === '' || 
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()));
                  return matchesTab && matchesSearch;
                }).map(template => (`;

const newFilter = `                {templates.filter(t => {
                  const matchesTab = activeTab === 'All' ? true : t.category === activeTab;
                  const searchLower = searchQuery.toLowerCase();
                  const matchesSearch = searchQuery === '' || 
                    (t.title || '').toLowerCase().includes(searchLower) || 
                    (t.category || '').toLowerCase().includes(searchLower);
                  return matchesTab && matchesSearch;
                }).map(template => (`;

if (code.includes(oldFilter)) {
    code = code.replace(oldFilter, newFilter);
    fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
    console.log("Patched safely");
} else {
    console.log("Could not find old filter");
}
