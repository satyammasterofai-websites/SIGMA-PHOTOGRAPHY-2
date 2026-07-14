const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const target1 = `                  <div>
                    </div>
                    <p className="text-xs text-gray-500">ID: {order.id}</p>
                  </div>`;
const replace1 = `                  <div>
                    <h3 className="font-bold text-gray-900">{order.templateName || "Template Order"}</h3>
                    <p className="text-xs text-gray-500">ID: {order.id}</p>
                  </div>`;
code = code.replace(target1, replace1);

const target2 = `                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>
                        Order ID:{" "}
                        <span className="font-mono text-xs">{order.displayId || order.id}</span>
                      </span>`;
const replace2 = `                      <h3 className="font-bold text-gray-900 text-lg">
                        {order.templateName || "Order"}
                      </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>
                        Order ID:{" "}
                        <span className="font-mono text-xs">{order.displayId || order.id}</span>
                      </span>`;
code = code.replace(target2, replace2);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
