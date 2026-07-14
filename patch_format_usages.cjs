const fs = require('fs');

let manageOrders = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');
manageOrders = manageOrders.replace(/<FormatOrderData data=\{order.customData\} theme="dark" \/>/g, '<FormatOrderData data={order.customData} theme="dark" templateId={order.templateId} />');
fs.writeFileSync('src/pages/admin/ManageOrders.tsx', manageOrders);

let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
dashboard = dashboard.replace(/<FormatOrderData data=\{order.customData\} theme="light" \/>/g, '<FormatOrderData data={order.customData} theme="light" templateId={order.templateId} />');
fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);

// Also Checkout.tsx passes it during review step, but there the ID might be template?.id
let checkout = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');
checkout = checkout.replace(/<FormatOrderData data=\{formConfig \? getLabeledFormData\(\) : legacyFormData\} theme="light" \/>/g, '<FormatOrderData data={formConfig ? getLabeledFormData() : legacyFormData} theme="light" templateId={template?.id} />');
fs.writeFileSync('src/pages/Checkout.tsx', checkout);
