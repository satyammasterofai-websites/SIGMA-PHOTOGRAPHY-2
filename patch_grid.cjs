const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const regex = /\(\(\) => \{\s*const hindiTemplates = filteredTemplates\.filter.*?\{filteredTemplates\.length === 0/s;

const newBlock = `
              <div className="space-y-12 w-full">
                {filteredTemplates.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredTemplates.map(template => renderTemplateCard(template))}
                  </div>
                )}
                {filteredTemplates.length === 0`;

code = code.replace(regex, newBlock);
fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
console.log("Patched to single grid");
