const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

const target = `{editingId ? 'Edit Template' : 'Add New Template'}`;
const replacement = `{editingId ? \`Edit Template #\${templates.find(t => t.id === editingId)?.displayId || editingId.slice(-8)}\` : 'Add New Template'}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
