import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { auth, db } from "../lib/firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  Camera,
  LayoutDashboard,
  ShoppingBag,
  Download,
  Play,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

import SupportChat from "./user/SupportChat";
import UserNotifications from "../components/UserNotifications";
import { useChatStore } from '../store/useChatStore';

export default function DashboardLayout() {
  

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useChatStore();

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
              toast.success(`Order ${id.slice(0, 6)} status updated to ${currentOrders[id]}!`);
            }
          });
        }
        return currentOrders;
      });
    });
    return unsub;
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out");
      navigate("/");
    } catch (e) {
      toast.error("Failed to log out");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Orders", path: "/dashboard/orders", icon: ShoppingBag },
    { name: "Downloads", path: "/dashboard/downloads", icon: Download },
    { name: "Support Chat", path: "/dashboard/chat", icon: MessageSquare },
    { name: "Profile", path: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between px-6 mb-8">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-white shadow-lg">
                <Camera className="w-4 h-4 absolute z-10" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                SIGMA<span className="text-brand-purple font-light">PRO</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-purple/10 text-brand-purple"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${active ? "text-brand-purple" : "text-gray-400"}`}
                  />
                  {item.name}
                  {item.name === 'Support Chat' && unreadCount > 0 && (
                    <span className="ml-auto bg-brand-rose text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 mt-6">
            <Link
              to="/"
              className="flex w-full items-center gap-3 px-3 py-2.5 mb-2 rounded-xl text-sm font-medium text-brand-purple hover:bg-brand-purple/10 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-brand-purple" />
              Go Back to Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-white shadow-lg">
              <Camera className="w-4 h-4 absolute z-10" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              SIGMAPRO
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UserNotifications />
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -mr-2 text-gray-600 rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="hidden lg:flex justify-end p-4 border-b border-gray-200 bg-white/50 sticky top-0 z-10">
          <UserNotifications />
        </div>
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/chat" element={<SupportChat />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardHome() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ pending: 0, total: 0, downloads: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (sn) => {
        const ordersList = sn.docs.map((doc) => doc.data()).filter(o => o.type !== "service_enquiry");
        const orders = ordersList;
        setRecentOrders(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3));
        setStats({
          total: orders.length,
          pending: orders.filter(
            (o) => o.status === "Pending" || o.status === "Processing",
          ).length,
          downloads: orders.filter((o) => o.downloadUrl).length,
        });
      },
      (err) => {
        console.error(err);
      },
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Welcome back, {user?.displayName || "User"}!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/orders"
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-brand-purple hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </Link>
        <Link
          to="/dashboard/orders"
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-brand-purple hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-brand-purple" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Link>
        <Link
          to="/dashboard/downloads"
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-brand-purple hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <Download className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Downloads</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.downloads}
            </p>
          </div>
        </Link>
      </div>

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
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Processing"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "Delivered"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          Create New Application
        </h2>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Browse our premium templates and start crafting your masterpiece
          today.
        </p>
        <Link
          to="/gallery"
          className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-brand-purple hover:bg-brand-indigo transition-colors gap-2"
        >
          Browse Templates
        </Link>
      </div>
    </div>
  );
}

function MyOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (sn) => {
        const list = sn.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        })).filter(o => o.type !== "service_enquiry");
        // Sort locally
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setOrders(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="text-gray-500 mt-1">You haven't placed any orders.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col"
            >
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {order.thumbnailBase64 && (
                    <div className="w-24 max-h-32 rounded overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center bg-gray-50">
                      <img
                        src={order.thumbnailBase64}
                        alt="Thumbnail"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {order.templateName || "Order"}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>
                        Order ID:{" "}
                        <span className="font-mono text-xs">{order.id}</span>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>₹{order.price}</span>
                      {(order.advancePayment > 0 ||
                        order.advancePaymentStatus) && (
                        <>
                          <span>•</span>
                          <span
                            className={`font-medium ${order.advancePaymentStatus === "Received" ? "text-green-600" : order.advancePaymentStatus === "Pending" ? "text-orange-600" : "text-gray-500"}`}
                          >
                            Advance: ₹{order.advancePayment || 0} (
                            {order.advancePaymentStatus || "Pending"})
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Processing"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "Delivered"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>

                  {order.downloadUrl && (
                    <a
                      href={order.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm font-medium text-brand-purple hover:underline bg-brand-purple/5 px-4 py-2 rounded-xl"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                  )}
                </div>
              </div>

              {(order.customData && Object.keys(order.customData).length > 0) ||
              order.customerPhone ? (
                <div className="bg-gray-50/50 p-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  {(order.paymentStatus === "Received" ||
                    order.advancePaymentStatus === "Received" ||
                    order.status === "Processing") && (
                    <div className="md:col-span-2 mb-2 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                      <div className="mt-0.5">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-blue-800">
                          Payment Received & Processing
                        </h5>
                        <p className="text-xs text-blue-600 mt-0.5">
                          We have received your payment/advance. Your video
                          creation is currently under process. You will be
                          notified once it's complete.
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Order Details
                    </h4>
                    <div className="space-y-2">
                      {order.customerPhone && (
                        <div className="flex">
                          <span className="w-1/3 text-sm text-gray-500">
                            Phone:
                          </span>
                          <span className="w-2/3 text-sm font-medium text-gray-900">
                            {order.customerPhone}
                          </span>
                        </div>
                      )}
                      {order.customData &&
                        Object.entries(order.customData).map(([k, v]) => {
                          if (typeof v === "boolean") v = v ? "Yes" : "No";
                          return (
                            <div key={k} className="flex">
                              <span className="w-1/3 text-sm text-gray-500 capitalize">
                                {k.replace(/_/g, " ")}:
                              </span>
                              <span className="w-2/3 text-sm font-medium text-gray-900 border-l border-gray-200 pl-2 ml-2">
                                {String(v || "N/A")}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Payment Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="w-1/3 text-gray-500">Method:</span>
                        <span className="w-2/3 font-medium text-gray-900">
                          {order.viaMethod || "WhatsApp"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-1/3 text-gray-500">Status:</span>
                        <span className="w-2/3 font-medium text-gray-900">
                          {order.paymentStatus || "Pending"}
                        </span>
                      </div>
                      {(order.advancePayment > 0 ||
                        order.advancePaymentStatus) && (
                        <div className="flex">
                          <span className="w-1/3 text-gray-500">Advance:</span>
                          <span
                            className={`w-2/3 font-medium ${order.advancePaymentStatus === "Received" ? "text-green-600" : "text-gray-900"}`}
                          >
                            ₹{order.advancePayment || 0} (
                            {order.advancePaymentStatus || "Pending"})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Downloads() {
  const { user } = useAuthStore();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (sn) => {
        const list = sn.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
          .filter((o: any) => o.downloadUrl);
        setDownloads(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Downloads</h1>
      {downloads.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
          <Download className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No downloads available
          </h3>
          <p className="text-gray-500 mt-1">
            Your completed invitation videos will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((d) => (
            <div
              key={d.id}
              className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                {d.templateName || "Custom Template"}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {new Date(d.createdAt).toLocaleDateString()} • Order #
                {d.id.slice(-6)}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setPreviewVideoUrl(d.downloadUrl)}
                  className="w-full flex justify-center items-center gap-2 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-sm font-bold transition-colors"
                >
                  <Play className="w-4 h-4" /> Preview Video
                </button>
                <a
                  href={d.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex justify-center items-center gap-2 py-2 bg-brand-purple hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Original
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Profile() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden max-w-2xl">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-400 m-auto mt-7" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.displayName || "User"}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                Active Account
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-200 font-mono select-all">
                  {user?.uid}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Role
                </label>
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-200 capitalize">
                  User
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
