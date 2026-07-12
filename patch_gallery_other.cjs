const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const regex = /(\s*)\{\s*filteredTemplates\.length === 0 && \(/;

const newBlock = `
                  {otherTemplates.length > 0 && (
                    <div className="w-full">
                      {showColumns && <h2 className="text-2xl font-bold mb-6 text-brand-navy flex items-center gap-2"><span className="w-8 h-1 bg-gray-400 rounded-full"></span>Other Templates</h2>}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {otherTemplates.map(template => renderTemplateCard(template))}
                      </div>
                    </div>
                  )}
`;

code = code.replace(regex, (match, p1) => {
    return newBlock + match;
});

fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
console.log("Patched otherTemplates back successfully");
