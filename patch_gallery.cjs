const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const startIdx = code.indexOf('const renderTemplateCard = (template: any) => (');
const endIdx = code.indexOf('const { user } = useAuthStore();', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newFunc = `const renderTemplateCard = (template: any) => (
    <div
      key={template.id}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group flex flex-col"
    >
      <div className="relative overflow-hidden bg-gray-100 flex items-center justify-center">
        {template.thumbnailBase64 || template.image ? (
          <img
            src={template.thumbnailBase64 || template.image}
            alt={template.title}
            className="w-full h-auto object-contain bg-white"
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center text-gray-400">
            No Preview
          </div>
        )}

        {/* Video Quick View Overlay */}
        {template.videoUrl && (
          <button
            onClick={() => setActiveVideo(template.videoUrl)}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10 w-full"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur border border-white/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-8 h-8 fill-white" />
            </div>
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-bold text-xl text-gray-900 line-clamp-1 flex-1 pr-2">
            {template.title}
          </h3>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            {(() => {
              const basePrice = Number(template.price) || 0;
              const currentPrice = template.discountPrice
                ? Number(template.discountPrice)
                : basePrice;
              return (
                <div className="flex flex-col">
                  {template.discountPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{template.price}
                    </span>
                  )}
                  <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    ₹{currentPrice}
                  </span>
                </div>
              );
            })()}
          </div>

          <button
            onClick={() => navigate(\`/template/\${template.id}\`)}
            className="px-6 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white font-medium rounded-xl transition-colors shadow-md"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  `;
  
  code = code.substring(0, startIdx) + newFunc + code.substring(endIdx);
  fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
  console.log('Patched gallery');
} else {
  console.log('Could not find indices');
}
