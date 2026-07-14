const fs = require('fs');
let code = fs.readFileSync('src/components/FormatOrderData.tsx', 'utf-8');

code = code.replace(
  /const spaced = k\.replace\(\/\(\[a-z\]\)\(\[A-Z\]\)\/g, '\$1 \$2'\)\.replace\(\/_/g, " "\);/,
  `let spaced = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, " ");\n    if (spaced.toLowerCase().startsWith('f ')) spaced = spaced.substring(2);`
);

fs.writeFileSync('src/components/FormatOrderData.tsx', code);
