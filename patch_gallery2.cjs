const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const renderFn = `
  const renderTemplateCard = (template: any) => (
    <div
      key={template.id}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group flex flex-col h-full"
    >
      <div className="relative overflow-hidden bg-gray-100 flex items-center justify-center">
        {template.thumbnailBase64 || template.image ? (
          <img
            src={template.thumbnailBase64 || template.image}
            alt={template.title}
            className="w-full aspect-[4/5] object-cover"
          />
        ) : (
          <div className="w-full aspect-[4/5] bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {template.isFeatured && (
            <span className="px-3 py-1 bg-brand-rose text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Featured
            </span>
          )}
          {template.isTrending && (
            <span className="px-3 py-1 bg-brand-purple text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Trending
            </span>
          )}
          {template.language && template.language !== 'None' && (
            <span className="px-3 py-1 bg-white/90 backdrop-blur text-brand-navy text-xs font-bold rounded-full shadow-lg">
              {template.language}
            </span>
          )}
        </div>
        
        {/* Play Button Overlay */}
        {template.videoUrl && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => setPlayingVideo(template.videoUrl)}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-purple hover:scale-110 transition-transform shadow-xl"
            >
              <Play className="w-6 h-6 ml-1 fill-current" />
            </button>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-brand-navy mb-1">
              {template.title}
            </h3>
            <span className="text-sm font-medium text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full">
              {template.category}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6 line-clamp-2 mt-3">
          {template.description}
        </p>

        <div className="flex items-end justify-between mt-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">
                ₹{template.discountPrice || template.price}
              </span>
              {template.discountPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{template.price}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
              <Users className="w-3 h-3" />
              <span>{(template.baseOrdersCount || 100) + (template.ordersCount || 0)} orders</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setReviewsTemplateId(template.id)}
              className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              title="View Reviews"
            >
              <Star className="w-5 h-5 fill-current text-yellow-400" />
            </button>
            <button 
              onClick={() => navigate(\`/checkout/\${template.id}\`)}
              className="px-6 py-3 bg-brand-purple text-white font-medium rounded-xl hover:bg-brand-purple/90 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
`;

const blockStart = code.indexOf('{loading ? (');
const blockEnd = code.indexOf('</main>', blockStart);
const replacement = `
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
                <div className="space-y-12">
                  {showColumns && (
                    <div className="flex flex-col lg:flex-row gap-8">
                      {hindiTemplates.length > 0 && (
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-6 text-brand-navy flex items-center gap-2">
                            <span className="w-8 h-1 bg-brand-rose rounded-full"></span>
                            Hindi Templates
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                            {hindiTemplates.map(template => renderTemplateCard(template))}
                          </div>
                        </div>
                      )}
                      
                      {englishTemplates.length > 0 && (
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-6 text-brand-navy flex items-center gap-2">
                            <span className="w-8 h-1 bg-brand-purple rounded-full"></span>
                            English Templates
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                            {englishTemplates.map(template => renderTemplateCard(template))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {otherTemplates.length > 0 && (
                    <div>
                      {showColumns && <h2 className="text-2xl font-bold mb-6 text-brand-navy flex items-center gap-2"><span className="w-8 h-1 bg-gray-400 rounded-full"></span>Other Templates</h2>}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {otherTemplates.map(template => renderTemplateCard(template))}
                      </div>
                    </div>
                  )}

                  {filteredTemplates.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                      <div className="w-20 h-20 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No templates found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        We couldn't find any templates matching your search criteria. Try a different keyword or category.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
`;

if (blockStart !== -1 && blockEnd !== -1) {
   let newCode = code.substring(0, blockStart) + replacement + code.substring(blockEnd);
   newCode = newCode.replace("export default function PremiumGallery() {", "export default function PremiumGallery() {\n" + renderFn);
   fs.writeFileSync('src/pages/PremiumGallery.tsx', newCode);
}
