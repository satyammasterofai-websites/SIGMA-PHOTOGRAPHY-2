const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

const correctEnding = `
        </div>
      )}
      
      {/* Quick Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-100 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative my-8">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4">
                <h3 className="text-center font-bold text-gray-800 mb-4 uppercase tracking-widest text-xs">Preview Mode</h3>
                
                {/* Template Card Preview */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col pointer-events-none">
                  <div className="relative overflow-hidden bg-gray-100 flex items-center justify-center">
                    {thumbnailBase64 ? (
                      <img
                        src={thumbnailBase64}
                        alt={title || 'Template'}
                        className="w-full h-auto object-contain bg-white"
                      />
                    ) : (
                      <div className="w-full aspect-[4/5] flex items-center justify-center text-gray-400">
                        No Preview Image
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {isFeatured && (
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </div>
                      )}
                      {isTrending && (
                        <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <TrendingUp className="w-3 h-3" /> Trending
                        </div>
                      )}
                      <div className="bg-white/90 backdrop-blur text-brand-purple text-xs font-bold px-3 py-1 rounded-full shadow-md w-fit">
                        {category || 'Category'}
                      </div>
                      {language && language !== 'None' && (
                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-brand-navy text-xs font-bold rounded-full shadow-lg w-fit text-gray-800">
                          {language}
                        </span>
                      )}
                    </div>
                    
                    {/* Video Play Button */}
                    {videoUrl && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10 w-full">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur border border-white/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-8 h-8 fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-xl text-gray-900 line-clamp-1 flex-1 pr-2">
                        {title || 'Template Title'}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple bg-brand-purple/5 w-fit px-2.5 py-1 rounded-full">
                        <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-indigo-600">{baseOrdersCount || 100} Orders</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                      {description || 'Template description will appear here...'}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        {discountPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{price}
                          </span>
                        )}
                        <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          ₹{discountPrice || price || '0'}
                        </span>
                      </div>
                      {advancePayment && advancePayment !== "0" && advancePayment !== 0 && (
                         <span className="block text-xs font-semibold text-orange-600 mt-1">
                           Advance: ₹{advancePayment}
                         </span>
                      )}
                    </div>
                  </div>
                </div>
                
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

// Let's find where the modal starts:
const badStart = '{/* Quick Preview Modal */}';
const badStartIdx = code.indexOf(badStart);

// Let's find where the original div ended
// The original was:
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// Let's rewrite the end of file manually
// Find the closing of isModalOpen
const closingIndex = code.lastIndexOf('</form>');
if (closingIndex !== -1) {
    const validPart = code.substring(0, closingIndex + '</form>'.length);
    const newEnding = `
           </div>
        </div>
      )}
      
      {/* Quick Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-100 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative my-8">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4">
                <h3 className="text-center font-bold text-gray-800 mb-4 uppercase tracking-widest text-xs">Preview Mode</h3>
                
                {/* Template Card Preview */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col pointer-events-none">
                  <div className="relative overflow-hidden bg-gray-100 flex items-center justify-center">
                    {thumbnailBase64 ? (
                      <img
                        src={thumbnailBase64}
                        alt={title || 'Template'}
                        className="w-full h-auto object-contain bg-white"
                      />
                    ) : (
                      <div className="w-full aspect-[4/5] flex items-center justify-center text-gray-400">
                        No Preview Image
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {isFeatured && (
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </div>
                      )}
                      {isTrending && (
                        <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <TrendingUp className="w-3 h-3" /> Trending
                        </div>
                      )}
                      <div className="bg-white/90 backdrop-blur text-brand-purple text-xs font-bold px-3 py-1 rounded-full shadow-md w-fit">
                        {category || 'Category'}
                      </div>
                      {language && language !== 'None' && (
                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-brand-navy text-xs font-bold rounded-full shadow-lg w-fit text-gray-800">
                          {language}
                        </span>
                      )}
                    </div>
                    
                    {/* Video Play Button */}
                    {videoUrl && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10 w-full">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur border border-white/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-8 h-8 fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-xl text-gray-900 line-clamp-1 flex-1 pr-2">
                        {title || 'Template Title'}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple bg-brand-purple/5 w-fit px-2.5 py-1 rounded-full">
                        <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-indigo-600">{baseOrdersCount || 100} Orders</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                      {description || 'Template description will appear here...'}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        {discountPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{price}
                          </span>
                        )}
                        <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          ₹{discountPrice || price || '0'}
                        </span>
                      </div>
                      {advancePayment && advancePayment !== "0" && advancePayment !== 0 && (
                         <span className="block text-xs font-semibold text-orange-600 mt-1">
                           Advance: ₹{advancePayment}
                         </span>
                      )}
                    </div>
                  </div>
                </div>
                
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;
    fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', validPart + newEnding);
}
