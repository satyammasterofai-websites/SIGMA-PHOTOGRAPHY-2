const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

const stateInsertion = `  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedOrders.length === 0) return;
    try {
      const promises = selectedOrders.map(async (id) => {
        const order = orders.find(o => o.id === id);
        await updateDoc(doc(db, "orders", id), { status });
        if (order?.userId) {
          await createNotification(order.userId, "Order Status Updated", \`Your order status has been updated to \${status}.\`, id);
        }
      });
      await Promise.all(promises);
      // toast.success(\`Bulk update to \${status} successful\`);
      setSelectedOrders([]);
    } catch (e) {
      console.error(e);
      // toast.error("Bulk update failed");
    }
  };

  const bulkDeleteOrders = async () => {
    if (selectedOrders.length === 0) return;
    if (!window.confirm(\`Are you sure you want to delete \${selectedOrders.length} orders?\`)) return;
    try {
      const promises = selectedOrders.map(id => deleteDoc(doc(db, "orders", id)));
      await Promise.all(promises);
      // toast.success(\`Bulk delete successful\`);
      setSelectedOrders([]);
    } catch (e) {
      console.error(e);
      // toast.error("Bulk delete failed");
    }
  };`;
  
code = code.replace(/  const \[searchQuery, setSearchQuery\] = useState\(""\);/, stateInsertion);

const renderInsertion = `      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by ID, customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
          />
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between">
          <span className="text-indigo-400 font-medium">
            {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button onClick={() => {
              toast.promise(bulkUpdateStatus("Processing"), { loading: 'Updating...', success: 'Orders approved (Processing)', error: 'Failed' });
            }} className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors">
              Approve Selected
            </button>
            <button onClick={() => {
              toast.promise(bulkDeleteOrders(), { loading: 'Deleting...', success: 'Orders deleted', error: 'Failed' });
            }} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors">
              Delete Selected
            </button>
          </div>
        </div>
      )}`;

code = code.replace(/      \{\/\* Search Bar \*\/\}[\s\S]*?<\/div>\n      <\/div>/, renderInsertion);

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
