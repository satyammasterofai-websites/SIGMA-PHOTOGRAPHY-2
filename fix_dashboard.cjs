const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// 1. Remove from DashboardLayout
code = code.replace(`
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
    fetchTemplates();`, "");

code = code.replace(/\{order\.templateId && templateMap\[order\.templateId\] && \([\s\S]*?\}\)/g, "");

fs.writeFileSync('src/pages/Dashboard.tsx', code);
