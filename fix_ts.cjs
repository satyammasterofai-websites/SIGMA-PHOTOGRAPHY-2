const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// It says Property 'createdAt' does not exist on type '{ id: string; }'
// This means the sorting function has an issue with types.
code = code.replace(
  /new Date\(b\.createdAt\)\.getTime\(\) - new Date\(a\.createdAt\)\.getTime\(\)/g,
  'new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime()'
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
