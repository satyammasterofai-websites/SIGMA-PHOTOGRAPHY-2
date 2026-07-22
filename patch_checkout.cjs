const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

const newGetLabeled = `
  const getLabeledFormData = () => {
    if (!formConfig) return formData;
    const labeled: any = {
      bride: {},
      groom: {},
      events: formData.events || [],
      additional: {}
    };
    
    if (formConfig.familySettings?.brideFields) {
      formConfig.familySettings.brideFields.forEach((f: any) => {
        if (formData.bride && formData.bride[f.id] !== undefined) {
          labeled.bride[f.name || f.id] = formData.bride[f.id];
        }
      });
    }
    
    if (formConfig.familySettings?.groomFields) {
      formConfig.familySettings.groomFields.forEach((f: any) => {
        if (formData.groom && formData.groom[f.id] !== undefined) {
          labeled.groom[f.name || f.id] = formData.groom[f.id];
        }
      });
    }
    
    if (formConfig.additionalFields) {
      formConfig.additionalFields.forEach((f: any) => {
        if (formData.additional && formData.additional[f.id] !== undefined) {
          labeled.additional[f.name || f.id] = formData.additional[f.id];
        }
      });
    }

    return labeled;
  };
`;

code = code.replace(/const getLabeledFormData = \(\) => \{[\s\S]*?return labeled;\n  \};/, newGetLabeled.trim());

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log('patched checkout');
