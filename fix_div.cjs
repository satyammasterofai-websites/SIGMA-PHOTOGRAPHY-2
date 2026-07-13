const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

const target = `                    <div>
                      <div className="text-xs text-gray-500 font-mono mb-1">#{order.id.slice(-8)}</div>
                      <div className="font-bold text-white text-lg">{order.customerName || order.customerEmail || "N/A"}</div>
                      <div className="text-gray-400 text-sm">{order.customerPhone || "No Phone"}</div>
                    </div>`;

const replacement = `                    <div>
                      <div className="text-xs text-gray-500 font-mono mb-1">#{order.id.slice(-8)}</div>
                      <div className="font-bold text-white text-lg">{order.customerName || order.customerEmail || "N/A"}</div>
                      <div className="text-gray-400 text-sm">{order.customerPhone || "No Phone"}</div>
                    </div>
                    </div>`; // added a closing div for flex items-start gap-3

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
