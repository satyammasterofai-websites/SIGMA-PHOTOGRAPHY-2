const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const orderStatusListener = `
  const [prevOrders, setPrevOrders] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (sn) => {
      const currentOrders: Record<string, string> = {};
      sn.docs.forEach(doc => {
        const data = doc.data();
        if (data.type !== "service_enquiry") {
          currentOrders[doc.id] = data.status || "Pending";
        }
      });
      
      setPrevOrders(prev => {
        if (Object.keys(prev).length > 0) {
          Object.keys(currentOrders).forEach(id => {
            if (prev[id] && prev[id] !== currentOrders[id]) {
              toast.success(\`Order \${id.slice(0, 6)} status updated to \${currentOrders[id]}!\`);
            }
          });
        }
        return currentOrders;
      });
    });
    return unsub;
  }, [user]);
`;

code = code.replace(
  `export default function DashboardLayout() {`,
  `export default function DashboardLayout() {` + orderStatusListener
);

const recentOrdersUI = `
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <Link to="/dashboard/orders" className="text-sm font-medium text-brand-purple hover:underline">
            View All
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {order.thumbnailBase64 && (
                    <img src={order.thumbnailBase64} alt="Thumbnail" className="w-16 h-16 rounded-lg object-cover border border-gray-100" />
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{order.templateName || "Template Order"}</h3>
                    <p className="text-xs text-gray-500">ID: {order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={\`px-3 py-1 rounded-full text-xs font-bold \${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Processing"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "Delivered"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                    }\`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
`;

code = code.replace(
  `  const [stats, setStats] = useState({ pending: 0, total: 0, downloads: 0 });`,
  `  const [stats, setStats] = useState({ pending: 0, total: 0, downloads: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);`
);

code = code.replace(
  `        const orders = ordersList;`,
  `        const orders = ordersList;
        setRecentOrders(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3));`
);

code = code.replace(
  `        <h2 className="text-lg font-bold text-gray-800 mb-2">`,
  recentOrdersUI + `\n      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-2">`
);

code = code.replace(
  `      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">`,
  `      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched Dashboard.tsx");
