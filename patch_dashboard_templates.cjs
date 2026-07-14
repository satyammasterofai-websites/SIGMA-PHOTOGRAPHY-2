const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const stateTarget = `const [activeTab, setActiveTab] = useState("all");`;
const stateReplacement = `const [activeTab, setActiveTab] = useState("all");
  const [templateMap, setTemplateMap] = useState<Record<string, string>>({});`;
if (code.includes(stateTarget)) {
  code = code.replace(stateTarget, stateReplacement);
}

const effectTarget = `  useEffect(() => {
    if (!user) return;`;
const effectReplacement = `  useEffect(() => {
    if (!user) return;

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
    fetchTemplates();`;
if (code.includes(effectTarget)) {
  code = code.replace(effectTarget, effectReplacement);
}

// First replacement: H3 template name in the Orders List
const displayTarget1 = `<h3 className="font-bold text-gray-900">{order.templateName || "Template Order"}</h3>`;
const displayReplacement1 = `<div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{order.templateName || "Template Order"}</h3>
                      {order.templateId && templateMap[order.templateId] && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-mono">#{templateMap[order.templateId]}</span>
                      )}
                    </div>`;
if (code.includes(displayTarget1)) {
  code = code.replace(displayTarget1, displayReplacement1);
}

// Second replacement: H3 template name in the individual Order details (if any)
const displayTarget2 = `<h3 className="font-bold text-gray-900 text-lg mb-1">
                      {order.templateName || "Order"}
                    </h3>`;
const displayReplacement2 = `<div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {order.templateName || "Order"}
                      </h3>
                      {order.templateId && templateMap[order.templateId] && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-mono">#{templateMap[order.templateId]}</span>
                      )}
                    </div>`;
if (code.includes(displayTarget2)) {
  code = code.replace(displayTarget2, displayReplacement2);
}

fs.writeFileSync('src/pages/Dashboard.tsx', code);
