const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const importStatement = `import CleanupDuplicates from './components/CleanupDuplicates';\n`;
code = code.replace(/import AuthProvider from '\.\/components\/AuthProvider';/, importStatement + `import AuthProvider from './components/AuthProvider';`);

const toaster = `<Toaster position="top-right" />`;
const replaceToaster = `<Toaster position="top-right" />\n      <CleanupDuplicates />`;
code = code.replace(toaster, replaceToaster);

fs.writeFileSync('src/App.tsx', code);
