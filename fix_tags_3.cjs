const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const target = `                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {order.templateName || "Order"}
                      </h3>
                         
                          </span>
                        </>
                      )}
                    </div>`;

const replace = `                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {order.templateName || "Order"}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span>
                          Order ID:{" "}
                          <span className="font-mono text-xs">{order.displayId || order.id}</span>
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        {order.price && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-gray-900">
                              ₹{order.price}
                            </span>
                          </>
                        )}
                      </div>
                    </div>`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
