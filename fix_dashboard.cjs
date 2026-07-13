const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  `      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
      <div className="mt-8">`,
  `      <div className="mt-8">`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Fixed Dashboard.tsx");
