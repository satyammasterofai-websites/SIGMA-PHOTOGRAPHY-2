const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

if (!code.includes('updatePaymentStatus')) {
  code = code.replace(/const updateOrderStatus = async \(id: string, newStatus: string\) => \{/, 
`const updatePaymentStatus = async (id: string, newPaymentStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { paymentStatus: newPaymentStatus });
      toast.success(\`Payment status updated to \${newPaymentStatus}\`);
    } catch (e) {
      toast.error("Failed to update payment status");
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {`);
}

const oldPaymentStatus = /<div>\s*<span className="text-gray-500 block text-xs mb-1">Payment Status<\/span>\s*<span className=\{`font-medium \$\{order\.paymentStatus === "Received" \|\| order\.paymentStatus === "Paid Online" \? "text-green-400" : "text-orange-400"\}`\}>\s*\{order\.paymentStatus \|\| "Unknown"\}\s*<\/span>\s*<\/div>/;

const newPaymentStatus = `<div>
                        <span className="text-gray-500 block text-xs mb-1">Payment Status</span>
                        <select
                          value={order.paymentStatus || "Pending"}
                          onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                          className={\`bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm font-medium focus:outline-none \${order.paymentStatus === "Received" || order.paymentStatus === "Paid Online" ? "text-green-400" : order.paymentStatus === "Pending Verification" ? "text-yellow-400" : "text-orange-400"}\`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Pending Verification">Pending Verification</option>
                          <option value="Received">Received</option>
                          <option value="Paid Online">Paid Online</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>`;

code = code.replace(oldPaymentStatus, newPaymentStatus);

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
