const fs = require('fs');
let code = fs.readFileSync('src/components/FormatOrderData.tsx', 'utf-8');

const newFormatKey = `const formatKey = (k: string) => {
  if (!k) return '';
  const spaced = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, " ");
  return spaced.replace(/\\b\\w/g, c => c.toUpperCase());
};`;

code = code.replace(/const formatKey =[\s\S]*?};/, newFormatKey);

fs.writeFileSync('src/components/FormatOrderData.tsx', code);
