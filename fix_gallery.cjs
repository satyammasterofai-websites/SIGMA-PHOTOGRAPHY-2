const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const cardStartMarker = '<div\n                  key={template.id}';
let cardStartIdx = code.indexOf(cardStartMarker);
if (cardStartIdx === -1) {
  // Try another format
  cardStartIdx = code.indexOf('<div key={template.id}');
}
if (cardStartIdx === -1) {
    const lines = code.split('\n');
    const idx = lines.findIndex(l => l.includes('key={template.id}'));
    if (idx !== -1) {
        cardStartIdx = code.indexOf(lines[idx - 1]); // the line before key=
    }
}

const mapEnd = '))}';
const mapEndIdx = code.indexOf(mapEnd, cardStartIdx);

if (cardStartIdx === -1 || mapEndIdx === -1) {
  console.log("Could not extract cardCode");
  process.exit(1);
}

const cardCode = code.substring(cardStartIdx, mapEndIdx).trim();

const blockStartIdx = code.indexOf('{loading ? (');
const blockEndIdx = code.lastIndexOf('</div>\n        </div>\n      </div>\n    </div>');

if (blockStartIdx === -1) {
   console.log("Could not find block boundaries");
   process.exit(1);
}

let renderFn = `
  const renderTemplateCard = (template: any) => (
    ${cardCode.replace(/key=\{template\.id\}/, 'key={template.id}')}
  );
`;

const newBody = `
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            (() => {
              const hindiTemplates = filteredTemplates.filter(t => t.language === 'Hindi');
              const englishTemplates = filteredTemplates.filter(t => t.language === 'English');
              const otherTemplates = filteredTemplates.filter(t => t.language !== 'Hindi' && t.language !== 'English');
              const showColumns = hindiTemplates.length > 0 || englishTemplates.length > 0;

              return (
                <div className="space-y-12 w-full">
                  {showColumns && (
                    <div className="flex flex-col lg:flex-row gap-8 w-full">
                      {hindiTemplates.length > 0 && (
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-bold mb-6 text-brand-navy flex items-center gap-2">
                            <span className="w-8 h-1 bg-brand-rose rounded-full"></span>
                            Hindi Templates
                          </h2>
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {hindiTemplates.map(template => renderTemplateCard(template))}
                          </div>
                        </div>
                      )}
                      
                      {englishTemplates.length > 0 && (
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-bold mb-6 text-brand-navy flex items-center gap-2">
                            <span className="w-8 h-1 bg-brand-purple rounded-full"></span>
                            English Templates
                          </h2>
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {englishTemplates.map(template => renderTemplateCard(template))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {otherTemplates.length > 0 && (
                    <div className="w-full">
                      {showColumns && <h2 className="text-2xl font-bold mb-6 text-brand-navy flex items-center gap-2"><span className="w-8 h-1 bg-gray-400 rounded-full"></span>Other Templates</h2>}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {otherTemplates.map(template => renderTemplateCard(template))}
                      </div>
                    </div>
                  )}

                  {filteredTemplates.length === 0 && (
                    <div className="col-span-full py-20 text-center w-full bg-white rounded-2xl border border-gray-100">
                      <p className="text-gray-500 text-lg">
                        No templates found matching your criteria.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setActiveCategory("All");
                        }}
                        className="mt-4 text-brand-purple font-medium hover:underline"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          )}
`;

let finalCode = code.substring(0, blockStartIdx) + newBody + code.substring(code.indexOf('</div>\n        </div>\n      </main>', blockStartIdx));
finalCode = finalCode.replace("export default function PremiumGallery() {", "export default function PremiumGallery() {\n" + renderFn);

fs.writeFileSync('src/pages/PremiumGallery.tsx', finalCode);
console.log("Done");
