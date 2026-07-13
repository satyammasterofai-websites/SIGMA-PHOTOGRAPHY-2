const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSettings.tsx', 'utf-8');

// 1. Add state
code = code.replace(
  `  const [waOrderingEnabled, setWaOrderingEnabled] = useState(true);`,
  `  const [waOrderingEnabled, setWaOrderingEnabled] = useState(true);
  const [paymentQRBase64, setPaymentQRBase64] = useState("");`
);

// 2. Fetch state
code = code.replace(
  `          setWaOrderingEnabled(data.whatsapp?.enabled ?? true);`,
  `          setWaOrderingEnabled(data.whatsapp?.enabled ?? true);
          if (data.paymentQRBase64) setPaymentQRBase64(data.paymentQRBase64);`
);

// 3. Save state
code = code.replace(
  `          coupons: finalCoupons,`,
  `          coupons: finalCoupons,
          paymentQRBase64,`
);

// 4. File input handler
const fileUploadMethod = `  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPaymentQRBase64(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };`;
code = code.replace(
  `  const addCoupon = async () => {`,
  fileUploadMethod + `\n\n  const addCoupon = async () => {`
);

// 5. Render field
const renderQRField = `
            <div className="pb-6 border-b border-gray-800">
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
  `            <div className="pb-6 border-b border-gray-800">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Checkout Form Note
              </label>`,
  renderQRField + `            <div className="pb-6 border-b border-gray-800">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Checkout Form Note
              </label>`
);

fs.writeFileSync('src/pages/admin/ManageSettings.tsx', code);
console.log("Patched ManageSettings.tsx");
