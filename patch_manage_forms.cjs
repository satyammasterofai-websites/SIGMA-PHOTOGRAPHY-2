const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageForms.tsx', 'utf-8');

// Add ArrowUp, ArrowDown to lucide-react import
if (!code.includes('ArrowUp') && code.includes('lucide-react')) {
  code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
    return `import { ${p1}, ArrowUp, ArrowDown } from 'lucide-react';`;
  });
}

const moveFieldFunc = `
  const moveField = (section: string, idx: number, direction: 'up' | 'down') => {
    const updated = { ...editingForm };
    let arr = [];
    if (section === 'bride') arr = updated.familySettings.brideFields;
    if (section === 'groom') arr = updated.familySettings.groomFields;
    if (section === 'additional') arr = updated.additionalFields;
    
    if (direction === 'up' && idx > 0) {
      const temp = arr[idx];
      arr[idx] = arr[idx - 1];
      arr[idx - 1] = temp;
    } else if (direction === 'down' && idx < arr.length - 1) {
      const temp = arr[idx];
      arr[idx] = arr[idx + 1];
      arr[idx + 1] = temp;
    }
    setEditingForm(updated);
  };
`;

code = code.replace(/const removeField = \(section: string, idx: number\) => \{/, moveFieldFunc + '\n  const removeField = (section: string, idx: number) => {');

// Add move buttons to UI
const replaceButtons = `
                <div className="mt-4 md:mt-0 md:ml-2 pt-2 md:pt-0 flex items-center gap-1">
                   <button onClick={() => moveField(section, i, 'up')} disabled={i === 0} className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <ArrowUp className="w-4 h-4" />
                   </button>
                   <button onClick={() => moveField(section, i, 'down')} disabled={i === fields.length - 1} className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <ArrowDown className="w-4 h-4" />
                   </button>
                   <button onClick={() => removeField(section, i)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors ml-1">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
`;

code = code.replace(/<div className="mt-4 md:mt-0 md:ml-2 pt-2 md:pt-0">\s*<button onClick=\{\(\) => removeField\(section, i\)\} className="p-2 bg-red-500\/10 text-red-400 hover:bg-red-500\/20 hover:text-red-300 rounded-lg transition-colors">\s*<Trash2 className="w-4 h-4" \/>\s*<\/button>\s*<\/div>/, replaceButtons);

fs.writeFileSync('src/pages/admin/ManageForms.tsx', code);
console.log('patched');
