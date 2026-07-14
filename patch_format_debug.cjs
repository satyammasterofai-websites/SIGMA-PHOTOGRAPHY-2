const fs = require('fs');
let code = fs.readFileSync('src/components/FormatOrderData.tsx', 'utf-8');

code = code.replace(/<div className="space-y-3">/, '<div className="space-y-3">\n{templateId && <div className="text-xs text-red-500">DEBUG: templateId={templateId}</div>}');
code = code.replace(/<div className="space-y-2">/, '<div className="space-y-2">\n{templateId && <div className="text-xs text-red-500">DEBUG: templateId={templateId}</div>}\n{!templateId && <div className="text-xs text-red-500">DEBUG: NO templateId</div>}');

fs.writeFileSync('src/components/FormatOrderData.tsx', code);
