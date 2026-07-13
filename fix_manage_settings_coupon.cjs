const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSettings.tsx', 'utf-8');

const regexCouponBlock = /<div className="flex flex-col md:flex-row gap-4 items-end bg-gray-800\/50 p-6 rounded-xl border border-gray-800">([\s\S]*?)<\/button>\s*<\/div>/;

const newCouponInputs = `            <div className="flex flex-col gap-4 bg-gray-800/50 p-6 rounded-xl border border-gray-800">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={newCoupon.code || ""}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="SUMMER50"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={newCoupon.percentage || ""}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, percentage: e.target.value })
                    }
                    placeholder="20"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newCoupon.expiryDate || ""}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, expiryDate: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-1/3">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Max Price Threshold (Valid if Price <= X)
                  </label>
                  <input
                    type="number"
                    value={newCoupon.maxPriceThreshold || ""}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, maxPriceThreshold: e.target.value })
                    }
                    placeholder="e.g. 500"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Leave empty to apply to any price.</p>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Exclude Templates (Coupon not valid for these)
                  </label>
                  <select
                    multiple
                    value={newCoupon.excludedTemplates || []}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setNewCoupon({ ...newCoupon, excludedTemplates: options });
                    }}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 h-24"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.title || t.name} (₹{t.price})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">Hold Cmd/Ctrl to select multiple. Leave empty to apply to all (unless blocked by price threshold).</p>
                </div>
                <div className="w-full md:w-auto mt-6">
                  <button
                    onClick={addCoupon}
                    className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-medium flex items-center justify-center gap-2 h-[42px]"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </div>`;

code = code.replace(regexCouponBlock, newCouponInputs);

fs.writeFileSync('src/pages/admin/ManageSettings.tsx', code);
console.log("Patched ManageSettings.tsx coupon form");
