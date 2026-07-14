const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

const helper = `
  const getLabeledFormData = () => {
    if (!formConfig) return formData;
    const labeled: any = {
      bride: {},
      groom: {},
      events: formData.events,
      additional: {}
    };
    
    const getLabel = (fields, id) => {
      const f = fields?.find(f => f.id === id);
      return f ? f.name : id;
    };

    if (formData.bride && typeof formData.bride === 'object') {
      Object.entries(formData.bride).forEach(([k, v]) => {
        labeled.bride[getLabel(formConfig.familySettings?.brideFields, k)] = v;
      });
    }
    if (formData.groom && typeof formData.groom === 'object') {
      Object.entries(formData.groom).forEach(([k, v]) => {
        labeled.groom[getLabel(formConfig.familySettings?.groomFields, k)] = v;
      });
    }
    if (formData.additional && typeof formData.additional === 'object') {
      Object.entries(formData.additional).forEach(([k, v]) => {
        labeled.additional[getLabel(formConfig.additionalFields, k)] = v;
      });
    }
    return labeled;
  };
`;

code = code.replace(
  '  const getWaUrl = (orderId: string) => {',
  helper + '\n  const getWaUrl = (orderId: string) => {'
);

code = code.replace(
  '          customData: formConfig ? formData : legacyFormData,',
  '          customData: formConfig ? getLabeledFormData() : legacyFormData,'
);

code = code.replace(
  /if \(formData\.bride\) \{[\s\S]*?if \(formData\.groom\) \{[\s\S]*?if \(formData\.events\.length > 0\) \{/g,
  `const labeledData = getLabeledFormData();
      if (labeledData.bride) {
        if (typeof labeledData.bride === 'object') {
          Object.entries(labeledData.bride).forEach(
            ([k, v]) => (customFieldsText += \`*\${k.toUpperCase()}*: \${formatWaValue(v)}\\n\`)
          );
        } else {
          customFieldsText += \`*BRIDE*: \${labeledData.bride}\\n\`;
        }
      }
      
      if (labeledData.groom) {
        if (typeof labeledData.groom === 'object') {
          Object.entries(labeledData.groom).forEach(
            ([k, v]) => (customFieldsText += \`*\${k.toUpperCase()}*: \${formatWaValue(v)}\\n\`)
          );
        } else {
          customFieldsText += \`*GROOM*: \${labeledData.groom}\\n\`;
        }
      }

      if (labeledData.events.length > 0) {`
);

code = code.replace(
  `Object.entries(formData.additional).forEach(
        ([k, v]) => {
            const displayVal = formatWaValue(v);
            customFieldsText += \`*\${k.replace(/_/g, " ").toUpperCase()}*: \${displayVal}\\n\`;
        }
      );`,
  `Object.entries(labeledData.additional).forEach(
        ([k, v]) => {
            const displayVal = formatWaValue(v);
            customFieldsText += \`*\${k.replace(/_/g, " ").toUpperCase()}*: \${displayVal}\\n\`;
        }
      );`
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
