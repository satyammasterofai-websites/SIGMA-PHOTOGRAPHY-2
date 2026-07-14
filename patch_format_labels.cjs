const fs = require('fs');
let code = fs.readFileSync('src/components/FormatOrderData.tsx', 'utf-8');

const fetchReplacement = `    const fetchTemplateFields = async () => {
      try {
        const snap = await getDoc(doc(db, "templates", templateId));
        if (snap.exists()) {
          const t = snap.data();
          const labels: Record<string, string> = {};
          if (t.customFields && Array.isArray(t.customFields)) {
            t.customFields.forEach((f: any) => {
              labels[f.id] = f.name;
            });
          }
          if (t.formId) {
            const formSnap = await getDoc(doc(db, 'settings', 'data', 'custom_forms', t.formId));
            if (formSnap.exists()) {
               const formData = formSnap.data();
               const fieldsToExtract = [
                  ...(formData.familySettings?.brideFields || []),
                  ...(formData.familySettings?.groomFields || []),
                  ...(formData.additionalFields || [])
               ];
               fieldsToExtract.forEach((f: any) => {
                  labels[f.id] = f.name;
               });
            }
          }
          if (t.formConfig && t.formConfig.additionalFields) {
            t.formConfig.additionalFields.forEach((f: any) => {
              labels[f.id] = f.name;
            });
          }
          setCustomLabels(labels);
        }
      } catch (e) {
        console.error("Failed to fetch template fields", e);
      }
    };`;

code = code.replace(/    const fetchTemplateFields = async \(\) => \{[\s\S]*?    \};/, fetchReplacement);

fs.writeFileSync('src/components/FormatOrderData.tsx', code);
