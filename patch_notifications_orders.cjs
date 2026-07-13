const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

const notifHelper = `
  const createNotification = async (userId: string, title: string, message: string, orderId: string) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, "userNotifications"), {
        userId,
        title,
        message,
        orderId,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error creating notification", e);
    }
  };
`;

if (!code.includes('createNotification')) {
  code = code.replace(/const updateStatus = async/, notifHelper + '\n  const updateStatus = async');
}

// Update updatePaymentStatus
code = code.replace(
  /const updatePaymentStatus = async \(id: string, newPaymentStatus: string\) => \{/,
  'const updatePaymentStatus = async (id: string, newPaymentStatus: string, userId?: string) => {'
);
code = code.replace(
  /toast\.success\(`Payment status updated to \$\{newPaymentStatus\}`\);/,
  `toast.success(\`Payment status updated to \${newPaymentStatus}\`);
      if (userId) {
        await createNotification(userId, "Payment Status Updated", \`Your order payment status is now \${newPaymentStatus}.\`, id);
      }`
);

// Update updateOrderStatus
code = code.replace(
  /const updateOrderStatus = async \(id: string, newStatus: string\) => \{/,
  'const updateOrderStatus = async (id: string, newStatus: string, userId?: string) => {'
);
code = code.replace(
  /toast\.success\(`Order status updated to \$\{newStatus\}`\);/,
  `toast.success(\`Order status updated to \${newStatus}\`);
      if (userId) {
        await createNotification(userId, "Order Status Updated", \`Your order status has been updated to \${newStatus}.\`, id);
      }`
);

// Update saveDownloadUrl
code = code.replace(
  /const saveDownloadUrl = async \(id: string\) => \{/,
  'const saveDownloadUrl = async (id: string, userId?: string) => {'
);
code = code.replace(
  /toast\.success\("Download link dispatched & marked Delivered"\);/,
  `toast.success("Download link dispatched & marked Delivered");
      if (userId) {
        await createNotification(userId, "Order Delivered", \`Your order has been delivered! A download link is now available.\`, id);
      }`
);

// Now replace the JSX calls
code = code.replace(/updatePaymentStatus\(order\.id, e\.target\.value\)/, 'updatePaymentStatus(order.id, e.target.value, order.userId)');
code = code.replace(/updateOrderStatus\(order\.id, e\.target\.value\)/, 'updateOrderStatus(order.id, e.target.value, order.userId)');
code = code.replace(/saveDownloadUrl\(order\.id\)/, 'saveDownloadUrl(order.id, order.userId)');

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
