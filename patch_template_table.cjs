const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

const target = `<td className="px-6 py-4 font-mono text-xs text-gray-500">{template.displayId ? \`#\${template.displayId}\` : '---'}</td>`;
const replacement = `<td className="px-6 py-4 font-mono text-xs text-gray-500">#{template.displayId || template.id.slice(-8)}</td>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
