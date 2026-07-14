const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const target = `<h3 className="font-display font-bold text-xl text-gray-900 line-clamp-1 flex-1 pr-2">
                        {template.title}
                      </h3>`;
const replace = `<div className="flex flex-col flex-1 pr-2">
                        {template.displayId && <span className="text-xs font-mono text-gray-400 mb-0.5">#{template.displayId}</span>}
                        <h3 className="font-display font-bold text-xl text-gray-900 line-clamp-1">
                          {template.title}
                        </h3>
                      </div>`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
