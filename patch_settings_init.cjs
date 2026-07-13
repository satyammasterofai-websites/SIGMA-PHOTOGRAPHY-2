const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSettings.tsx', 'utf-8');

// 1. Add init
code = code.replace(
  `  const { templates } = useSiteStore();`,
  `  const { templates, init } = useSiteStore();\n  useEffect(() => {\n    init();\n  }, [init]);`
);

// 2. Add paymentQRBase64 to onSnapshot
code = code.replace(
  `          if (data.checkoutFormNote) {
            setCheckoutFormNote(data.checkoutFormNote);
          }`,
  `          if (data.checkoutFormNote) {
            setCheckoutFormNote(data.checkoutFormNote);
          }
          if (data.paymentQRBase64) {
            setPaymentQRBase64(data.paymentQRBase64);
          }`
);

fs.writeFileSync('src/pages/admin/ManageSettings.tsx', code);
console.log("Patched ManageSettings.tsx for init and QR base64");
