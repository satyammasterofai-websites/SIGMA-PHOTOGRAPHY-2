const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

const importTarget = `import { collection, onSnapshot`;
const importReplacement = `import { collection, getDocs, onSnapshot`;
if (code.includes(importTarget)) {
  code = code.replace(importTarget, importReplacement);
}

const stateTarget = `const [searchQuery, setSearchQuery] = useState("");`;
const stateReplacement = `const [searchQuery, setSearchQuery] = useState("");
  const [templateMap, setTemplateMap] = useState<Record<string, string>>({});`;
code = code.replace(stateTarget, stateReplacement);

const effectTarget = `  useEffect(() => {
    // We should show newest first`;
const effectReplacement = `  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const snap = await getDocs(collection(db, "templates"));
        const map: Record<string, string> = {};
        snap.docs.forEach(d => {
          const data = d.data();
          map[d.id] = data.displayId || d.id.slice(-8);
        });
        setTemplateMap(map);
      } catch (e) {
        console.error("Failed to fetch templates for map", e);
      }
    };
    fetchTemplates();
    
    // We should show newest first`;
code = code.replace(effectTarget, effectReplacement);

const displayTarget = `<span className="font-medium text-white truncate text-sm">{order.templateName || "Custom Template"}</span>`;
const displayReplacement = `<span className="font-medium text-white truncate text-sm">{order.templateName || "Custom Template"}</span>
                      {order.templateId && templateMap[order.templateId] && (
                        <span className="text-xs font-mono text-gray-400 mt-0.5">#{templateMap[order.templateId]}</span>
                      )}`;
code = code.replace(displayTarget, displayReplacement);

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
