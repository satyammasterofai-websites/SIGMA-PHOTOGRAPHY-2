const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

const updateStatusFn = `  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status: newStatus
      });
      toast.success(\`Order status updated to \${newStatus}\`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };`;

code = code.replace(
  `  const saveDownloadUrl = async (id: string) => {`,
  updateStatusFn + `\n\n  const saveDownloadUrl = async (id: string) => {`
);

const statusSelector = `
                                <div className="flex gap-2 items-center mb-4">
                                  <span className="text-gray-400 text-sm">Status:</span>
                                  <select 
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                                    value={order.status || "Pending"}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </div>
`;

code = code.replace(
  `                              <div className="space-y-4">`,
  `                              <div className="space-y-4">` + statusSelector
);

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
console.log("Patched ManageOrders.tsx");
