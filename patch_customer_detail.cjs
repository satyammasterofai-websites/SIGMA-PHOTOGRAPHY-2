const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/CustomerDetail.tsx', 'utf-8');

const orderInfoOld = `                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-medium">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-400">
                        {typeof order.createdAt?.toDate === 'function' ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt || 0).toLocaleDateString()}
                      </p>
                    </div>`;

const orderInfoNew = `                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {order.thumbnailBase64 && (
                        <img src={order.thumbnailBase64} alt={order.templateName} className="w-12 h-12 object-cover rounded-md border border-gray-700 bg-gray-900" />
                      )}
                      <div>
                        <h3 className="text-white font-medium">Order #{order.id.slice(0, 8)} {order.templateName && \`(\${order.templateName})\`}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">
                            {typeof order.createdAt?.toDate === 'function' ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt || 0).toLocaleDateString()}
                          </p>
                          {order.videoUrl && (
                            <a href={order.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-electric hover:underline flex items-center gap-1">
                              Live Preview
                            </a>
                          )}
                        </div>
                      </div>
                    </div>`;

code = code.replace(orderInfoOld, orderInfoNew);

fs.writeFileSync('src/pages/admin/CustomerDetail.tsx', code);
console.log("Patched CustomerDetail.tsx");
