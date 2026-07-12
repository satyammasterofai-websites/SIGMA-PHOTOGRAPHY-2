const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

// The original grid start:
const gridStart = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">';
const gridStartIdx = code.indexOf(gridStart);
if (gridStartIdx === -1) {
    console.error("Could not find grid start");
    process.exit(1);
}

// The original map start:
const mapStart = '{filteredTemplates.map((template) => (';
const mapStartIdx = code.indexOf(mapStart, gridStartIdx);

// The card start
const cardStart = '<div\n                  key={template.id}\n                  className="bg-white';
const cardStartIdx = code.indexOf(cardStart, mapStartIdx);

// Let's just find the end of the map:
const mapEnd = '))}';
const mapEndIdx = code.indexOf(mapEnd, cardStartIdx);

const cardCode = code.substring(cardStartIdx, mapEndIdx);

// Replace grid Start to end of block with new logic
const blockStartIdx = code.indexOf('{loading ? (');
const blockEndIdx = code.indexOf('</main>');

if (blockStartIdx === -1 || blockEndIdx === -1) {
    console.error("Could not find block boundaries");
    process.exit(1);
}

// Generate renderTemplateCard
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
        </div>
`;

let finalCode = code.substring(0, blockStartIdx) + newBody + code.substring(blockEndIdx);
finalCode = finalCode.replace("export default function PremiumGallery() {", "export default function PremiumGallery() {\n" + renderFn);

fs.writeFileSync('src/pages/PremiumGallery.tsx', finalCode);
console.log("Success");
