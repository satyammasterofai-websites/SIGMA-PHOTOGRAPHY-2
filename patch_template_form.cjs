const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TemplateManagement.tsx', 'utf-8');

// 1. Add state
const stateReplacement = `  const [advancePayment,
      setAdvancePayment] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponPercentage, setCouponPercentage] = useState('');`;
code = code.replace(/  const \[advancePayment,[\s\n]*setAdvancePayment\] = useState\(''\);/, stateReplacement);

// 2. Add to reset form (search for "setAdvancePayment('');")
const resetReplacement = `    setAdvancePayment('');
    setCouponCode('');
    setCouponPercentage('');`;
code = code.replace(/    setAdvancePayment\(''\);/, resetReplacement);

// 3. Add to edit form population (search for "setAdvancePayment(template.advancePayment || '');")
const editReplacement = `      setAdvancePayment(template.advancePayment || '');
      setCouponCode(template.couponCode || '');
      setCouponPercentage(template.couponPercentage || '');`;
code = code.replace(/      setAdvancePayment\(template\.advancePayment \|\| ''\);/, editReplacement);

// 4. Add UI in the form. (search for "<div>\n                    <label className=\"block text-sm font-medium text-gray-300 mb-2\">Advance Payment (₹)</label>")
const uiReplacement = `                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Advance Payment (₹)</label>
                    <input 
                      type="number" value={advancePayment} onChange={(e) => setAdvancePayment(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Template Coupon Code (Optional)</label>
                    <input 
                      type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 uppercase"
                      placeholder="e.g. SAVE20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Template Coupon Discount (%)</label>
                    <input 
                      type="number" value={couponPercentage} onChange={(e) => setCouponPercentage(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 20"
                    />
                  </div>`;
code = code.replace(/                  <div>\s*<label className="block text-sm font-medium text-gray-300 mb-2">Advance Payment \(₹\)<\/label>\s*<input\s*type="number" value=\{advancePayment\} onChange=\{\(e\) => setAdvancePayment\(e\.target\.value\)\}\s*className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"\s*placeholder="e\.g\. 500"\s*\/>\s*<\/div>/, uiReplacement);

fs.writeFileSync('src/pages/admin/TemplateManagement.tsx', code);
