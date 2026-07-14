const fs = require('fs');
let code = fs.readFileSync('src/components/FormatOrderData.tsx', 'utf-8');

const helper = `const formatKey = (k: string) => {
  if (k.includes('_')) {
    return k.replace(/_/g, " ").replace(/\\b\\w/g, c => c.toUpperCase());
  }
  return k;
};`;

code = code.replace("const formatValue", helper + "\n\nconst formatValue");

code = code.replace(/className={\`font-medium capitalize/g, "className={`font-medium");
code = code.replace(/className={\`sm:w-1\/3 shrink-0 font-medium capitalize/g, "className={`sm:w-1/3 shrink-0 font-medium");
code = code.replace(/\{k\.replace\(\/_\/g, " "\)\}/g, "{formatKey(k)}");

fs.writeFileSync('src/components/FormatOrderData.tsx', code);
