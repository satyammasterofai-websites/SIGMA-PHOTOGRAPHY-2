const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

const brokenTarget = `        const filteredOrders = orders.filter(o => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
        (o.id || '').toLowerCase().includes(searchLower) ||
      (o.customerInfo?.name || '').toLowerCase().includes(searchLower) ||
      (o.customerInfo?.email || '').toLowerCase().includes(searchLower) ||
      (o.customerInfo?.phone || '').toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;
    if (activeTab === 'All') return true;
    const st = o.status || 'Pending';
    if (activeTab === 'Pending') return st === 'Pending' || st === 'Processing';
    if (activeTab === 'Completed') return st === 'Completed' || st === 'Delivered';
    return true;
  });

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  return () => fallbackUnsub();`;

code = code.replace(brokenTarget, `        return () => fallbackUnsub();`);

const realReturnTarget = `
  return (
    <div className="w-full">`;

const renderInsertion = `  const filteredOrders = orders.filter(o => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
        (o.id || '').toLowerCase().includes(searchLower) ||
      (o.customerInfo?.name || '').toLowerCase().includes(searchLower) ||
      (o.customerInfo?.email || '').toLowerCase().includes(searchLower) ||
      (o.customerInfo?.phone || '').toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;
    if (activeTab === 'All') return true;
    const st = o.status || 'Pending';
    if (activeTab === 'Pending') return st === 'Pending' || st === 'Processing';
    if (activeTab === 'Completed') return st === 'Completed' || st === 'Delivered';
    return true;
  });

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  return (
    <div className="w-full">`;

code = code.replace(realReturnTarget, renderInsertion);

fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
