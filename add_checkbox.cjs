const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

const target = `                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-gray-500 font-mono mb-1">#{order.id.slice(-8)}</div>`;

const replacement = `                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-800"
                      />
                    <div>
                      <div className="text-xs text-gray-500 font-mono mb-1">#{order.id.slice(-8)}</div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
