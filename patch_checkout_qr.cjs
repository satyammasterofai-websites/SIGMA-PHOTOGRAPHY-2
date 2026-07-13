const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

// 1. Add state
code = code.replace(
  `  const [paymentSuccessPopup, setPaymentSuccessPopup] = useState<{
    show: boolean;
    msg: string;
  }>({ show: false, msg: "" });`,
  `  const [paymentSuccessPopup, setPaymentSuccessPopup] = useState<{
    show: boolean;
    msg: string;
  }>({ show: false, msg: "" });
  const [showQRPopup, setShowQRPopup] = useState(false);`
);

// 2. Change initiatePayment
const newInitiatePayment = `  const initiatePayment = async () => {
    if (!settings?.paymentQRBase64 && !template?.advancePayment) {
      // Fallback to old flow if no QR and no advance
      setPaymentSuccessPopup({
        show: true,
        msg: "Initializing secure payment gateway...",
      });
      setTimeout(async () => {
        const orderId = await createOrderRecord("Paid Online", "Online Payment");
        const advanceMsg = template?.advancePayment
          ? \` Note: An advance payment of ₹\${template.advancePayment} is required.\`
          : "";
        setPaymentSuccessPopup({
          show: true,
          msg: \`Payment successful! Redirecting to WhatsApp to send assets.\${advanceMsg}\`,
        });
        const url = getWaUrl(orderId);
        setWaUrlToOpen(url);
      }, 2000);
      return;
    }
    
    setShowQRPopup(true);
  };

  const handleQRConfirmed = async () => {
    setShowQRPopup(false);
    setPaymentSuccessPopup({
      show: true,
      msg: "Saving order details...",
    });
    const orderId = await createOrderRecord("Paid Online", "Online Payment");
    const advanceMsg = template?.advancePayment
      ? \` Note: An advance payment of ₹\${template.advancePayment} is required.\`
      : "";
    setPaymentSuccessPopup({
      show: true,
      msg: \`Order saved! Please send us the payment screenshot on WhatsApp.\${advanceMsg}\`,
    });
    const url = getWaUrl(orderId);
    setWaUrlToOpen(url);
  };`;

const oldInitiatePaymentRegex = /const initiatePayment = async \(\) => \{[\s\S]*?\}, 2000\);\n  \};/;
code = code.replace(oldInitiatePaymentRegex, newInitiatePayment);

// 3. Render QR popup
const renderQRPopup = `
      {/* QR Popup */}
      {showQRPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-up relative">
            <button
              onClick={() => setShowQRPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pay Advance</h3>
            <p className="text-gray-600 mb-6">
              Please pay the advance amount of <span className="font-bold text-gray-900">₹{template?.advancePayment || 0}</span> to proceed.
            </p>
            {settings?.paymentQRBase64 ? (
              <img
                src={settings.paymentQRBase64}
                alt="Payment QR Code"
                className="w-48 h-48 mx-auto object-contain rounded-xl border border-gray-200 mb-6"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 mb-6 border border-gray-200">
                <CreditCard className="w-12 h-12" />
              </div>
            )}
            <button
              onClick={handleQRConfirmed}
              className="w-full py-3 bg-brand-purple text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-lg"
            >
              I have Paid, Send screenshot on WhatsApp
            </button>
          </div>
        </div>
      )}
`;

code = code.replace(
  `{paymentSuccessPopup.show && (`,
  renderQRPopup + `\n      {paymentSuccessPopup.show && (`
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log("Patched Checkout.tsx");
