const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

if(!code.includes("FileText")) {
    code = code.replace("File,", "File, FileText,");
}

const contactInfoBlock = `        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-purple" />{" "}
            {t.contactInfo[lang]}
          </h3>
          <p className="text-sm text-gray-700">
            <strong>Name:</strong> {customerName}
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>WhatsApp:</strong> {customerPhone}
          </p>
        </div>`;

const formPreviewBlock = `
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-purple" /> Form Details
          </h3>
          <div className="space-y-3">
             {Object.entries(formConfig ? formData : legacyFormData).map(([key, value]) => {
                if (key === 'terms' || key === 'whatsapp_consent' || value === undefined || value === null || value === '') return null;
                const displayKey = key.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase());
                const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                return (
                  <div key={key} className="text-sm grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-500 font-medium sm:col-span-1">{displayKey}</span>
                    <span className="text-gray-900 font-semibold sm:col-span-2 whitespace-pre-wrap">{displayValue}</span>
                  </div>
                );
             })}
          </div>
        </div>
`;

code = code.replace(contactInfoBlock, contactInfoBlock + formPreviewBlock);

// Also add videoUrl to order
code = code.replace("thumbnailBase64: template?.thumbnailBase64 || \"\",", "thumbnailBase64: template?.thumbnailBase64 || \"\",\n          videoUrl: template?.videoUrl || \"\",");

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log("Patched Checkout.tsx");
