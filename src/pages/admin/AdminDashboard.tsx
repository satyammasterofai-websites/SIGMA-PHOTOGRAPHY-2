import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { getDocs, collection } from 'firebase/firestore';
import { 
  LayoutDashboard, Users, ShoppingBag, Images, FileEdit, 
  MessageSquare, HelpCircle, Bell, Settings, LogOut, Menu, X, ShieldAlert, ArrowLeft 
} from 'lucide-react';
import toast from 'react-hot-toast';
import TemplateManagement from './TemplateManagement';
import SiteContentManagement from './SiteContentManagement';
import ManageOrders from './ManageOrders';
import ManageBanners from './ManageBanners';
import ManageTestimonials from './ManageTestimonials';
import ManageFAQ from './ManageFAQ';
import ManageNotifications from './ManageNotifications';
import ManageUsers from './ManageUsers';
import ManageSettings from './ManageSettings';

import ManageForms from './ManageForms';
import ManageCategories from './ManageCategories';

export default function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully logged out');
      navigate('/');
    } catch (e) {
      toast.error('Failed to log out');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Categories', path: '/admin/categories', icon: Images },
    { name: 'Templates', path: '/admin/templates', icon: FileEdit },
    { name: 'Forms', path: '/admin/forms', icon: FileEdit },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Banners', path: '/admin/banners', icon: Images },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'FAQ', path: '/admin/faq', icon: HelpCircle },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Site Content', path: '/admin/content', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB] flex font-sans text-brand-navy">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/60 backdrop-blur-md border-r border-brand-purple/10 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between px-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 text-white shadow-lg">
                <ShieldAlert className="w-4 h-4 absolute z-10" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-brand-navy">
                ADMIN<span className="text-brand-purple font-light">PANEL</span>
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-brand-slate">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active ? 'bg-brand-purple/10 text-brand-purple' : 'text-brand-slate hover:bg-white/50 hover:text-brand-navy'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${active ? 'text-brand-purple' : 'text-brand-slate'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 mt-6 pt-6 border-t border-brand-purple/10">
             <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl text-sm font-medium text-brand-purple hover:bg-brand-purple/10 transition-colors"
             >
                <ArrowLeft className="w-5 h-5" />
                Go Back to Site
             </Link>
             <div className="flex items-center gap-3 px-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-white/50 overflow-hidden shadow-sm">
                   {user?.photoURL ? <img src={user.photoURL} alt="Admin" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-premium"/>}
                </div>
                <div className="flex-1 truncate">
                   <p className="text-sm font-medium text-brand-navy truncate">{user?.displayName || 'Admin'}</p>
                   <p className="text-xs text-brand-slate truncate">{user?.email}</p>
                </div>
             </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/60 backdrop-blur-md border-b border-brand-purple/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-purple" />
              <span className="font-display font-bold text-lg tracking-tight text-brand-navy">ADMIN</span>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-brand-slate rounded-md">
              <Menu className="w-6 h-6" />
            </button>
        </div>

        <main className="flex-1 overflow-y-auto w-full p-6 md:p-8">
           <Routes>
              <Route path="/" element={<AdminHome />} />
              <Route path="/orders" element={<ManageOrders />} />
              <Route path="/categories" element={<ManageCategories />} />
              <Route path="/templates" element={<TemplateManagement />} />
              <Route path="/forms" element={<ManageForms />} />
              <Route path="/settings" element={<ManageSettings />} />
              <Route path="/banners" element={<ManageBanners />} />
              <Route path="/testimonials" element={<ManageTestimonials />} />
              <Route path="/faq" element={<ManageFAQ />} />
              <Route path="/notifications" element={<ManageNotifications />} />
              <Route path="/users" element={<ManageUsers />} />
              <Route path="/content" element={<SiteContentManagement />} />
           </Routes>
        </main>
      </div>
    </div>
  );
}

function AdminHome() {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    pending: 0,
    completed: 0,
    templates: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, ordersSnap, tmplSnap] = await Promise.all([
           getDocs(collection(db, 'users')),
           getDocs(collection(db, 'orders')),
           getDocs(collection(db, 'templates'))
        ]);
        
        const ordersData = ordersSnap.docs.map(d=>d.data());
        let revenue = 0;
        let pending = 0;
        let completed = 0;
        ordersData.forEach(o => {
           revenue += Number(o.price) || 0;
           if (o.status === 'Pending' || o.status === 'Processing') pending++;
           if (o.status === 'Completed' || o.status === 'Delivered') completed++;
        });

        setStats({
           users: usersSnap.size,
           orders: ordersSnap.size,
           pending,
           completed,
           templates: tmplSnap.size,
           revenue
        });

      } catch(e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Users', value: stats.users.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Total Orders', value: stats.orders.toString(), icon: ShoppingBag, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { name: 'Pending & Processing', value: stats.pending.toString(), icon: Bell, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { name: 'Completed & Delivered', value: stats.completed.toString(), icon: ShieldAlert, color: 'text-green-400', bg: 'bg-green-400/10' },
    { name: 'Total Templates', value: stats.templates.toString(), icon: FileEdit, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Est. Revenue', value: `₹${stats.revenue}`, icon: LayoutDashboard, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
         <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-navy">Dashboard Overview</h1>
         <p className="text-brand-slate mt-1">Real-time stats and metrics for SIGMAPHOTOGRAPHY.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white/80 backdrop-blur-sm border border-brand-purple/10 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-brand-slate">{stat.name}</p>
                   <p className="text-3xl font-bold text-brand-navy mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                   <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white/80 backdrop-blur-sm border border-brand-purple/10 rounded-2xl p-6 shadow-sm min-h-[300px]">
             <h3 className="text-lg font-bold text-brand-navy mb-4">Recent Registrations</h3>
             <div className="flex items-center justify-center h-[200px] text-brand-slate text-sm">
                No recent registrations
             </div>
         </div>
         <div className="bg-white/80 backdrop-blur-sm border border-brand-purple/10 rounded-2xl p-6 shadow-sm min-h-[300px]">
             <h3 className="text-lg font-bold text-brand-navy mb-4">Recent Orders</h3>
             <div className="flex items-center justify-center h-[200px] text-brand-slate text-sm border-2 border-dashed border-brand-purple/20 rounded-xl">
                No recent orders found
             </div>
         </div>
      </div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
       <div className="mb-8">
         <h1 className="text-2xl md:text-3xl font-display font-bold text-white">{title}</h1>
         <p className="text-gray-400 mt-1">Manage and update {title.toLowerCase()} configurations.</p>
      </div>
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-sm">
         <Settings className="w-16 h-16 text-gray-700 mb-4 animate-[spin_4s_linear_infinite]" />
         <h2 className="text-xl font-bold text-gray-300">Module Available</h2>
         <p className="text-gray-500 max-w-md mt-2">
            Base64 Upload functions and Firestore CRUD operations are configured in backend. Ready to connect to UI.
         </p>
      </div>
    </div>
  );
}
