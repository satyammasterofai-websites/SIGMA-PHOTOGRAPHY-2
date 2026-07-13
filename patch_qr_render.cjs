const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSettings.tsx', 'utf-8');

const renderQRField = `
            <div className="pb-6 mb-6 border-b border-gray-800">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Advance Payment QR Code
              </label>
              <div className="flex items-center gap-4">
                {paymentQRBase64 && (
                  <img src={paymentQRBase64} alt="QR Code" className="w-24 h-24 object-cover rounded-xl border border-gray-700 bg-gray-800" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-purple file:text-white hover:file:bg-purple-700"
                />
              </div>
            </div>
`;

code = code.replace(
  `            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Checkout Form Note`,
  renderQRField + `            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Checkout Form Note`
);

fs.writeFileSync('src/pages/admin/ManageSettings.tsx', code);
console.log("Patched rendering of ManageSettings.tsx");
