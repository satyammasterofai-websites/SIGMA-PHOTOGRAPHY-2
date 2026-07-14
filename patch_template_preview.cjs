const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

const target = `<div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-xl text-gray-900 line-clamp-1 flex-1 pr-2">
                        {title || 'Template Title'}
                      </h3>
                    </div>`;

const replacement = `<div className="flex flex-col flex-1 pr-2 mb-2">
                      <span className="text-xs font-mono text-gray-400 mb-0.5">
                        #{editingId ? (templates.find(t => t.id === editingId)?.displayId || editingId.slice(-8)) : 'Preview'}
                      </span>
                      <h3 className="font-display font-bold text-xl text-gray-900 line-clamp-1">
                        {title || 'Template Title'}
                      </h3>
                    </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
