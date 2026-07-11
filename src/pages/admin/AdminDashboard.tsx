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
import ManageCustomServices from './ManageCustomServices';
import ManageSplashVideo from './ManageSplashVideo';
import CleanupDuplicates from '../../components/CleanupDuplicates';
import { useChatStore } from '../../store/useChatStore';

export default function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useChatStore();

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
    { name: 'Splash Video', path: '/admin/splash-video', icon: Images },
    { name: 'Services', path: '/admin/services', icon: LayoutDashboard },
    { name: 'Banners', path: '/admin/banners', icon: Images },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'FAQ', path: '/admin/faq', icon: HelpCircle },
    { name: 'Announcements', path: '/admin/notifications', icon: Bell },
    { name: 'Customers', path: '/admin/users', icon: Users },
    { name: 'Site Content', path: '/admin/content', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB] flex font-sans text-brand-navy">
      <CleanupDuplicates />
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
                  {item.name === 'Customers' && unreadCount > 0 && (
                    <span className="ml-auto bg-brand-rose text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
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
              <Route path="/splash-video" element={<ManageSplashVideo />} />
              <Route path="/services" element={<ManageCustomServices />} />
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

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const formatDate = (val: any) => {
     if (!val) return new Date().toLocaleDateString();
     if (val.toMillis) return new Date(val.toMillis()).toLocaleDateString();
     if (val.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
     return new Date(val).toLocaleDateString();
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, ordersSnap, tmplSnap] = await Promise.all([
           getDocs(collection(db, 'users')),
           getDocs(collection(db, 'orders')),
           getDocs(collection(db, 'templates'))
        ]);
        
        const ordersData: any[] = ordersSnap.docs.map(d=>({ ...d.data(), id: d.id })).filter((o: any) => o.type !== "service_enquiry");
        const usersData: any[] = usersSnap.docs.map(d=>({ ...d.data(), id: d.id }));

        let revenue = 0;
        let pending = 0;
        let completed = 0;
        ordersData.forEach(o => {
           revenue += Number(o.price) || 0;
           if (o.status === 'Pending' || o.status === 'Processing') pending++;
           if (o.status === 'Completed' || o.status === 'Delivered') completed++;
        });

        const getMs = (val: any) => {
           if (!val) return 0;
           if (val.toMillis) return val.toMillis();
           if (val.seconds) return val.seconds * 1000;
           return new Date(val).getTime() || 0;
        };

        const sortedOrders = [...ordersData].sort((a,b) => {
           const d1 = getMs(a.createdAt);
           const d2 = getMs(b.createdAt);
           return d2 - d1;
        }).slice(0, 5);

        const sortedUsers = [...usersData].sort((a,b) => {
           const d1 = getMs(a.createdAt || a.joinedAt || a.lastLogin);
           const d2 = getMs(b.createdAt || b.joinedAt || b.lastLogin);
           return d2 - d1;
        }).slice(0, 5);

        setStats({
           users: usersSnap.size,
           orders: ordersData.length,
           pending,
           completed,
           templates: tmplSnap.size,
           revenue
        });

        setRecentOrders(sortedOrders);
        setRecentUsers(sortedUsers);

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
             {recentUsers.length > 0 ? (
               <div className="space-y-4">
                 {recentUsers.map(u => (
                   <div key={u.id} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple overflow-hidden">
                         {u.photoURL ? <img src={u.photoURL} alt="avatar" /> : <Users className="w-5 h-5" />}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-900">{u.displayName || 'Unknown User'}</p>
                         <p className="text-xs text-gray-500">{u.email || 'No email provided'}</p>
                       </div>
                     </div>
                     <p className="text-xs text-gray-400 whitespace-nowrap">
                       {formatDate(u.createdAt || u.joinedAt || u.lastLogin)}
                     </p>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="flex items-center justify-center h-[200px] text-brand-slate text-sm">
                   No recent registrations
                </div>
             )}
         </div>
         <div className="bg-white/80 backdrop-blur-sm border border-brand-purple/10 rounded-2xl p-6 shadow-sm min-h-[300px]">
             <h3 className="text-lg font-bold text-brand-navy mb-4">Recent Orders</h3>
             {recentOrders.length > 0 ? (
               <div className="space-y-4">
                 {recentOrders.map(o => (
                   <div key={o.id} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                         <ShoppingBag className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-900 truncate max-w-[150px] md:max-w-[200px]">{o.templateName || o.templateTitle || 'Order'}</p>
                         <p className="text-xs text-gray-500">{o.customerName || (o.customData && o.customData.customerName) || 'Customer'}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className="text-[10px] uppercase tracking-wider font-bold text-brand-purple bg-brand-purple/10 px-2 py-1 rounded-full">{o.status || 'Pending'}</span>
                       <p className="text-xs text-gray-400 mt-2">{formatDate(o.createdAt)}</p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="flex items-center justify-center h-[200px] text-brand-slate text-sm border-2 border-dashed border-brand-purple/20 rounded-xl">
                   No recent orders found
                </div>
             )}
         </div>
      </div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
       <div className="mb-8">
         <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-navy">{title}</h1>
         <p className="text-brand-slate mt-1">Manage and update {title.toLowerCase()} configurations.</p>
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
