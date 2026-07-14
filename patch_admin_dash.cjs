const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

const stateTarget = `const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);`;
const stateReplacement = `const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [templateMap, setTemplateMap] = useState<Record<string, string>>({});`;
if (code.includes(stateTarget)) {
  code = code.replace(stateTarget, stateReplacement);
}

const mapTarget = `        const usersData: any[] = usersSnap.docs.map(d=>({ ...d.data(), id: d.id }));`;
const mapReplacement = `        const usersData: any[] = usersSnap.docs.map(d=>({ ...d.data(), id: d.id }));
        
        const map: Record<string, string> = {};
        tmplSnap.docs.forEach(d => {
           map[d.id] = d.data().displayId || d.id.slice(-8);
        });
        setTemplateMap(map);`;
if (code.includes(mapTarget)) {
  code = code.replace(mapTarget, mapReplacement);
}

const displayTarget = `<p className="text-sm font-bold text-gray-900 truncate max-w-[150px] md:max-w-[200px]">{o.templateName || o.templateTitle || 'Order'}</p>`;
const displayReplacement = `<div className="flex items-center gap-1.5 truncate max-w-[150px] md:max-w-[200px]">
                            <p className="text-sm font-bold text-gray-900 truncate">{o.templateName || o.templateTitle || 'Order'}</p>
                            {o.templateId && templateMap[o.templateId] && (
                               <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0">#{templateMap[o.templateId]}</span>
                            )}
                         </div>`;
if (code.includes(displayTarget)) {
  code = code.replace(displayTarget, displayReplacement);
}

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
