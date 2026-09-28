const fs = require('fs');
let code = fs.readFileSync('src/components/SelfVideoEditing.tsx', 'utf-8');

const filterConst = `
const FILTERS = [
  { id: 'none', label: 'Normal', css: 'none' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(50%) contrast(110%) brightness(90%)' },
  { id: 'soft-glow', label: 'Soft Glow', css: 'brightness(110%) contrast(90%) saturate(80%)' },
  { id: 'bw', label: 'Black & White', css: 'grayscale(100%)' },
  { id: 'cinema', label: 'Cinematic', css: 'contrast(120%) saturate(120%) brightness(90%)' },
];
`;

if (!code.includes('const FILTERS')) {
  code = code.replace(/export default function SelfVideoEditing\(\) \{/, filterConst + '\nexport default function SelfVideoEditing() {');
}

if (!code.includes('const [selectedFilter, setSelectedFilter]')) {
  code = code.replace(
    /const \[exportProgress, setExportProgress\] = useState\(0\);/,
    `const [exportProgress, setExportProgress] = useState(0);\n  const [selectedFilter, setSelectedFilter] = useState('none');`
  );
}

// apply to canvas
if (!code.includes('ctx.filter = selectedFilter')) {
  code = code.replace(
    /ctx\.drawImage\(video, 0, 0, canvas\.width, canvas\.height\);/,
    `ctx.filter = selectedFilter === 'none' ? 'none' : FILTERS.find(f => f.id === selectedFilter)?.css || 'none';\n      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);\n      ctx.filter = 'none';`
  );
}

// apply to video
if (!code.includes('style={{ filter: ')) {
  code = code.replace(
    /className="w-full h-full object-contain"/,
    `className="w-full h-full object-contain"\n                  style={{ filter: selectedFilter === 'none' ? 'none' : FILTERS.find(f => f.id === selectedFilter)?.css }}`
  );
}

// Add UI for filters
const filterUI = `
                <div className="p-4 bg-white border-t border-gray-200">
                  <h4 className="font-bold text-sm text-gray-700 mb-3">Color Filter</h4>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {FILTERS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFilter(f.id)}
                        className={\`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${selectedFilter === f.id ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
`;

if (!code.includes('Color Filter')) {
  code = code.replace(
    /<div className="p-4 bg-white border-t border-gray-200">\s*<button\s*onClick=\{handleExport\}/,
    filterUI + '\n                <div className="p-4 bg-white border-t border-gray-200">\n                  <button \n                    onClick={handleExport}'
  );
}

fs.writeFileSync('src/components/SelfVideoEditing.tsx', code);
console.log('patched SelfVideoEditing.tsx with filters');
