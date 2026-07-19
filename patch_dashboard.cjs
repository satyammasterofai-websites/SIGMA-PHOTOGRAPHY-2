const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  /Order ID:\{" "\}\n\s*<span className="font-mono text-xs">\{order\.displayId \|\| order\.id\}<\/span>/,
  `Order ID:{" "}\n                          <span className="font-mono text-xs">{order.displayId || order.id}</span>\n                        </span>\n                        <span>•</span>\n                        <span>\n                          Template ID:{" "}\n                          <span className="font-mono text-xs">{order.templateDisplayId || order.templateId}</span>`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('done');
