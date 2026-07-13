const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

const target = `{order.thumbnailBase64 && (
                      <img src={order.thumbnailBase64} alt={order.templateName} className="w-14 h-14 object-cover rounded-lg border border-gray-700 bg-gray-800 shrink-0" />
                    )}`;

const replacement = `{order.thumbnailBase64 && (
                      <div 
                        className={\`relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-gray-700 bg-gray-800 \${order.videoUrl ? 'cursor-pointer group' : ''}\`}
                        onClick={() => order.videoUrl && setPreviewVideoUrl(order.videoUrl)}
                      >
                        <img src={order.thumbnailBase64} alt={order.templateName} className="w-full h-full object-cover" />
                        {order.videoUrl && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 text-white" fill="white" />
                          </div>
                        )}
                      </div>
                    )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
