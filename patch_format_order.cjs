const fs = require('fs');
let code = fs.readFileSync('src/components/FormatOrderData.tsx', 'utf-8');

const importAdd = `import React, { useState, useEffect } from 'react';\nimport { doc, getDoc } from 'firebase/firestore';\nimport { db } from '../lib/firebase';`;
code = code.replace(/import React from 'react';/, importAdd);

const propsReplacement = `export const FormatOrderData = ({ data, theme = 'light', templateId }: { data: any, theme?: 'light' | 'dark', templateId?: string }) => {`;
code = code.replace(/export const FormatOrderData = \(\{ data, theme = 'light' \}: \{ data: any, theme\?: 'light' \| 'dark' \}\) => \{/, propsReplacement);

const fetchHook = `  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!templateId) return;
    
    // Check if there are any keys starting with f_
    const hasLegacyKeys = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      for (const key of Object.keys(obj)) {
        if (key.startsWith('f_')) return true;
        if (typeof obj[key] === 'object') {
           if (hasLegacyKeys(obj[key])) return true;
        }
      }
      return false;
    };

    if (!hasLegacyKeys(data)) return;

    const fetchTemplateFields = async () => {
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
    };
    fetchTemplateFields();
  }, [templateId, data]);`;

code = code.replace(/  if \(!data\) return null;/, `  ${fetchHook}\n\n  if (!data) return null;`);

const newFormatKey = `  const formatKeyLocal = (k: string) => {
    if (!k) return '';
    if (customLabels[k]) return customLabels[k];
    const spaced = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, " ");
    return spaced.replace(/\\b\\w/g, c => c.toUpperCase());
  };`;

// replace formatKey with formatKeyLocal inside the component
// actually, since formatKey is defined OUTSIDE the component, I will rename the outer one and pass customLabels to it?
// No, I can just redefine it inside the component.

code = code.replace(/const formatKey = \([\s\S]*?\};\n/, ""); // remove outer formatKey

// Now insert formatKeyLocal inside the component
code = code.replace(/  if \(!data\) return null;/, `  ${newFormatKey}\n  if (!data) return null;`);

// replace formatKey with formatKeyLocal everywhere
code = code.replace(/formatKey\(/g, "formatKeyLocal(");

fs.writeFileSync('src/components/FormatOrderData.tsx', code);
