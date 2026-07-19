const fs = require('fs');
let code = fs.readFileSync('src/components/FormatOrderData.tsx', 'utf-8');

code = code.replace(
  /\{templateId && <div className="text-xs text-red-500">DEBUG: templateId=\{templateId\}<\/div>\}\n/g,
  ""
);
code = code.replace(
  /\{!templateId && <div className="text-xs text-red-500">DEBUG: NO templateId<\/div>\}\n/g,
  ""
);

fs.writeFileSync('src/components/FormatOrderData.tsx', code);
console.log('done');
