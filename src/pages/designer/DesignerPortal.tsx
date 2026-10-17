import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Palette, Lock, User, Mail, Phone, ExternalLink, CheckCircle2, Clock, 
  AlertCircle, ShieldCheck, LogOut, Sparkles, Send, Eye, EyeOff, Search,
  ArrowRight, Video, FileText, Check, MessageSquare, RefreshCw, UploadCloud,
  ChevronRight, Award, Layers
} from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  addDoc
} from 'firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import DesignerPasscodeModal, { isDesignerGateUnlocked } from '../../components/DesignerPasscodeModal';
import { FormatOrderData } from '../../components/FormatOrderData';
import VideoModal from '../../components/VideoModal';

const DEFAULT_SKILLS = [
  'Wedding Video Invitations',
  '3D Caricature Invitations',
  'E-Cards & Posters',
  'Website Invitations',
  'Adobe Premiere Pro',
  'Adobe After Effects',
  'DaVinci Resolve',
  'Typography & Motion',
  'Sound Design & Audio Sync',
  'Royal & Traditional Themes'
];

export default function DesignerPortal() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  
  // Gate Unlock State
  const [isGateUnlocked, setIsGateUnlocked] = useState(isDesignerGateUnlocked());
  const [showPasscodeModal, setShowPasscodeModal] = useState(!isDesignerGateUnlocked());

  // Portal State
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [designerDoc, setDesignerDoc] = useState<any>(null);
  const [fetchingDoc, setFetchingDoc] = useState(true);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Wedding Video Invitations',
    'Adobe Premiere Pro'
  ]);
  const [customSkill, setCustomSkill] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Dashboard Orders State
  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'All' | 'In Progress' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Delivery Submission State (per order)
  const [deliveryLinks, setDeliveryLinks] = useState<Record<string, string>>({});
  const [designerNotes, setDesignerNotes] = useState<Record<string, string>>({});
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  // Keep Gate in sync
  useEffect(() => {
    if (!isDesignerGateUnlocked()) {
      setShowPasscodeModal(true);
    } else {
      setIsGateUnlocked(true);
    }
  }, []);

  // Fetch designer doc whenever user changes
  useEffect(() => {
    if (!user) {
      setDesignerDoc(null);
      setFetchingDoc(false);
      return;
    }

    setFetchingDoc(true);
    // Listen directly to doc in 'users' collection (where user has guaranteed owner read permission)
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDesignerDoc({
          id: docSnap.id,
          name: data.displayName || data.name || user.displayName || 'Designer',
          email: data.email || user.email,
          whatsapp: data.whatsapp || '',
          skills: data.skills || [],
          portfolioUrl: data.portfolioUrl || '',
          experience: data.experience || '',
          status: data.role === 'admin' ? 'approved' : (data.status || 'pending'),
          active: data.active !== false,
          role: data.role
        });
      } else {
        // Fallback: check designers and content/designers/items
        getDoc(doc(db, 'designers', user.uid)).then(dSnap => {
          if (dSnap.exists()) {
            setDesignerDoc({ id: dSnap.id, ...dSnap.data() });
          } else {
            getDoc(doc(db, 'content', 'designers', 'items', user.uid)).then(cSnap => {
              if (cSnap.exists()) {
                setDesignerDoc({ id: cSnap.id, ...cSnap.data() });
              } else {
                setDesignerDoc({
                  id: user.uid,
                  name: user.displayName || 'Designer',
                  email: user.email,
                  whatsapp: '',
                  status: 'pending',
                  role: 'designer'
                });
              }
            }).catch(() => {
              setDesignerDoc({
                id: user.uid,
                name: user.displayName || 'Designer',
                email: user.email,
                whatsapp: '',
                status: 'pending',
                role: 'designer'
              });
            });
          }
        }).catch(() => {});
      }
      setFetchingDoc(false);
    }, (err) => {
      console.warn('Users doc notice:', err?.message);
      // Fallback: check designers and content/designers/items
      getDoc(doc(db, 'designers', user.uid)).then(dSnap => {
        if (dSnap.exists()) {
          setDesignerDoc({ id: dSnap.id, ...dSnap.data() });
        } else {
          getDoc(doc(db, 'content', 'designers', 'items', user.uid)).then(cSnap => {
            if (cSnap.exists()) {
              setDesignerDoc({ id: cSnap.id, ...cSnap.data() });
            } else {
              setDesignerDoc({
                id: user.uid,
                name: user.displayName || 'Designer',
                email: user.email,
                whatsapp: '',
                status: 'pending',
                role: 'designer'
              });
            }
          }).catch(() => {
            setDesignerDoc({
              id: user.uid,
              name: user.displayName || 'Designer',
              email: user.email,
              whatsapp: '',
              status: 'pending',
              role: 'designer'
            });
          });
        }
      }).catch(() => {}).finally(() => {
        setFetchingDoc(false);
      });
    });

    return () => unsub();
  }, [user]);

  // Real-time listener for orders assigned to this designer
  useEffect(() => {
    if (!user || !designerDoc || designerDoc.status !== 'approved') {
      setAssignedOrders([]);
      return;
    }

    setOrdersLoading(true);

    // 1. Listen to content/assigned_orders/items (public read, zero permission errors)
    const unsubContent = onSnapshot(collection(db, 'content', 'assigned_orders', 'items'), (snapshot) => {
      const list = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() as any }))
        .filter(o => o.assignedDesignerId === user.uid);
      
      if (list.length > 0) {
        list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setAssignedOrders(prev => {
          const map = new Map();
          prev.forEach(item => map.set(item.id, item));
          list.forEach(item => map.set(item.id, { ...map.get(item.id), ...item }));
          return Array.from(map.values()).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        });
        setOrdersLoading(false);
      }
    }, (err) => {
      console.warn('Reading content/assigned_orders/items:', err);
    });

    // 2. Also listen for orders where assignedDesignerId == user.uid
    const q = query(
      collection(db, 'orders'),
      where('assignedDesignerId', '==', user.uid)
    );

    const unsubOrders = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      setAssignedOrders(prev => {
        const map = new Map();
        prev.forEach(item => map.set(item.id, item));
        list.forEach(item => map.set(item.id, { ...map.get(item.id), ...item }));
        return Array.from(map.values()).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      });
      
      const initialLinks: Record<string, string> = {};
      const initialNotes: Record<string, string> = {};
      list.forEach((o: any) => {
        if (o.designerDeliveryLink) initialLinks[o.id] = o.designerDeliveryLink;
        if (o.designerNotes) initialNotes[o.id] = o.designerNotes;
      });
      setDeliveryLinks(prev => ({ ...initialLinks, ...prev }));
      setDesignerNotes(prev => ({ ...initialNotes, ...prev }));
      setOrdersLoading(false);
    }, (err) => {
      console.warn('Orders query permission warning (normal for non-admin):', err?.message);
      // Fallback
      setOrdersLoading(false);
    });

    return () => {
      unsubContent();
      unsubOrders();
    };
  }, [user, designerDoc]);

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success('Signed in successfully!');
      
      // Check doc status in users collection
      const uSnap = await getDoc(doc(db, 'users', cred.user.uid));
      if (uSnap.exists()) {
        const uData = uSnap.data();
        if (uData.status === 'pending') {
          toast('Your account is awaiting admin approval', { icon: '⏳' });
        } else if (uData.status === 'rejected' || uData.status === 'inactive') {
          toast.error('Account is inactive. Please contact admin.');
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter your full name');
    if (!whatsapp.trim()) return toast.error('Please enter your WhatsApp number');
    if (!email.trim()) return toast.error('Please enter your email address');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    // Clean whatsapp number
    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return toast.error('Please enter a valid 10-digit WhatsApp phone number');
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });

      const now = new Date().toISOString();
      const designerData = {
        uid: cred.user.uid,
        name: name.trim(),
        displayName: name.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: cleanPhone,
        skills: selectedSkills,
        portfolioUrl: portfolioUrl.trim(),
        experience: experience.trim(),
        role: 'designer',
        status: 'pending', // Requires admin approval
        active: false,
        assignedTemplates: [],
        createdAt: now,
        updatedAt: now
      };

      // 1. Save directly to users collection (where user has verified owner write permission)
      await setDoc(doc(db, 'users', cred.user.uid), designerData, { merge: true });

      // 2. Also mirror write to designers and content/designers/items
      setDoc(doc(db, 'designers', cred.user.uid), designerData, { merge: true }).catch(() => {});
      setDoc(doc(db, 'content', 'designers', 'items', cred.user.uid), designerData, { merge: true }).catch(() => {});

      // 3. Notify admin in notifications collection
      try {
        await addDoc(collection(db, 'notifications'), {
          type: 'designer_registration',
          title: 'New Designer Registration',
          message: `${name.trim()} (${cleanPhone}) has registered as a designer and is awaiting your approval.`,
          designerId: cred.user.uid,
          createdAt: now,
          read: false
        });
      } catch (notifErr) {
        console.warn('Could not write admin notification doc:', notifErr);
      }

      toast.success('Registration submitted! Awaiting admin approval.', {
        duration: 6000,
        icon: '🎉'
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null, null);
      toast.success('Logged out successfully');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  // Password reset handler
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email in the field above');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success('Password reset email dispatched! Please check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email');
    }
  };

  // Update order delivery link & status
  const handleUpdateOrder = async (orderId: string, newStatus: 'In Progress' | 'Completed') => {
    setSavingOrderId(orderId);
    try {
      const link = deliveryLinks[orderId] || '';
      const notes = designerNotes[orderId] || '';
      const now = new Date().toISOString();

      const updatePayload: any = {
        designerStatus: newStatus,
        designerDeliveryLink: link,
        designerNotes: notes,
        designerUpdatedAt: now
      };

      if (newStatus === 'Completed') {
        updatePayload.designerCompletedAt = now;
        if (link && !updatePayload.downloadUrl) {
          updatePayload.downloadUrl = link;
        }
      }

      // 1. Update in content/assigned_orders/items (guaranteed accessible)
      await setDoc(doc(db, 'content', 'assigned_orders', 'items', orderId), updatePayload, { merge: true }).catch(console.warn);

      // 2. Try updating in orders
      await updateDoc(doc(db, 'orders', orderId), updatePayload).catch(console.warn);

      toast.success(`Order updated to "${newStatus}"!`);
    } catch (err: any) {
      console.error('Failed to update order:', err);
      toast.error('Failed to update order');
    } finally {
      setSavingOrderId(null);
    }
  };

  // Share delivery via WhatsApp with Admin
  const handleShareWithAdmin = (order: any) => {
    const link = deliveryLinks[order.id] || order.designerDeliveryLink || '';
    const notes = designerNotes[order.id] || order.designerNotes || '';
    
    const adminPhone = '919162478070'; // Sigma official phone
    const msg = [
      `🎨 *SIGMA PHOTOGRAPHY - DESIGNER ORDER UPDATE* 🎨`,
      ``,
      `Hello Admin, I have an update on my assigned order:`,
      `📋 *Order ID:* #${order.displayId || order.id.slice(-8)}`,
      `✨ *Template:* ${order.templateName || 'Custom'}`,
      `👤 *Customer:* ${order.customerName || 'N/A'}`,
      `⚡ *Status:* ${order.designerStatus || 'In Progress'}`,
      link ? `🔗 *Delivery / Demo Link:*\n${link}` : `🔗 *Delivery Link:* (Pending upload)`,
      notes ? `📝 *Designer Notes:*\n${notes}` : '',
      ``,
      `Sent by Designer: ${designerDoc?.name || user?.displayName || 'Registered Designer'} (${designerDoc?.whatsapp || ''})`
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // If gate is not unlocked, show gate modal only
  if (!isGateUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#180F1E] via-[#120B17] to-[#0A050D] flex items-center justify-center p-6 text-white font-sans">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-600/40 ring-4 ring-rose-500/20">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-3">
            Designer Portal Locked
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            This workspace is reserved for authorized Sigma Photography invitation video editors and template creators.
          </p>
          <button
            onClick={() => setShowPasscodeModal(true)}
            className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <ShieldCheck className="w-5 h-5" />
            Enter Authorized Passcode
          </button>
          <div className="mt-6">
            <Link to="/" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
              ← Return to Main Website
            </Link>
          </div>
        </div>

        <DesignerPasscodeModal
          isOpen={showPasscodeModal}
          onClose={() => {
            if (!isDesignerGateUnlocked()) {
              navigate('/');
            } else {
              setShowPasscodeModal(false);
            }
          }}
          onSuccess={() => {
            setIsGateUnlocked(true);
            setShowPasscodeModal(false);
          }}
        />
      </div>
    );
  }

  // Filter orders by tab & search query
  const filteredOrders = assignedOrders.filter(o => {
    const qLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (o.displayId || '').toLowerCase().includes(qLower) ||
      (o.templateName || '').toLowerCase().includes(qLower) ||
      (o.customerName || '').toLowerCase().includes(qLower) ||
      (o.customerPhone || '').toLowerCase().includes(qLower);

    if (!matchesSearch) return false;
    if (orderFilter === 'All') return true;
    if (orderFilter === 'In Progress') return o.designerStatus === 'In Progress' || o.designerStatus === 'Assigned' || !o.designerStatus;
    if (orderFilter === 'Completed') return o.designerStatus === 'Completed';
    return true;
  });

  const inProgressCount = assignedOrders.filter(o => o.designerStatus === 'In Progress' || o.designerStatus === 'Assigned' || !o.designerStatus).length;
  const completedCount = assignedOrders.filter(o => o.designerStatus === 'Completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#180E1C] via-[#120A17] to-[#0A050D] text-gray-100 font-sans selection:bg-rose-500 selection:text-white">
      {previewVideoUrl && (
        <VideoModal url={previewVideoUrl} onClose={() => setPreviewVideoUrl(null)} />
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#160D1A]/80 backdrop-blur-xl border-b border-rose-500/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 ring-2 ring-amber-400/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-tight text-white">
                  SIGMA<span className="text-rose-400 font-light">DESIGNER</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  Portal
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Order Fulfilment & Production Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-medium text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              Main Site
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3.5 py-1.5 rounded-xl transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Unauthenticated View: Login or Register */}
        {!user && (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Verified Creator Network
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
                Designer Workspace & Orders
              </h1>
              <p className="text-sm text-gray-300 max-w-md mx-auto">
                Sign in to manage your assigned video invitation orders, download client assets, and upload finished deliverables.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mb-8 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Designer Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Join as Designer
              </button>
            </div>

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form 
                onSubmit={handleLogin}
                className="bg-[#1C1224]/80 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-8 shadow-2xl space-y-5"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="designer@sigmaphotography.in"
                      className="w-full bg-white/5 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl pl-12 pr-4 py-3.5 text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl pl-12 pr-12 py-3.5 text-sm transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Designer Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  Don't have a designer account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Register here for approval
                  </button>
                </p>
              </form>
            )}

            {/* REGISTRATION FORM */}
            {activeTab === 'register' && (
              <form 
                onSubmit={handleRegister}
                className="bg-[#1C1224]/80 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-8 shadow-2xl space-y-5"
              >
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong className="text-amber-300 font-semibold block mb-0.5">Admin Approval Required</strong>
                    Once you submit your registration, the Sigma Photography administrator will review your profile and activate your account before you can receive customer orders.
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-white/5 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl pl-12 pr-4 py-3.5 text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                {/* WhatsApp & Email in 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                      WhatsApp Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="10-digit WhatsApp (e.g. 9162478070)"
                        className="w-full bg-white/5 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl pl-12 pr-4 py-3.5 text-sm transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-white/5 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl pl-12 pr-4 py-3.5 text-sm transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                      Password (min 6 characters) *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl px-4 py-3.5 text-sm transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl px-4 py-3.5 text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Skills / Specialization */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                    Design Skills & Software Expertise
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DEFAULT_SKILLS.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-semibold'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add custom skill */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                      placeholder="Add another skill / tool..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Portfolio / Drive Link */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                    Portfolio / Sample Work Link
                  </label>
                  <div className="relative">
                    <ExternalLink className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="Google Drive folder, Behance, YouTube, or Instagram link"
                      className="w-full bg-white/5 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl pl-12 pr-4 py-3.5 text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Experience / Notes */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                    Experience / Bio (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Briefly describe your video editing / design experience..."
                    className="w-full bg-white/5 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl p-4 text-sm transition-all outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Submit Designer Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            )}
          </div>
        )}

        {/* Authenticated: Checking status */}
        {user && fetchingDoc && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-sm">Verifying designer credentials...</p>
          </div>
        )}

        {/* Authenticated: Account Pending Approval */}
        {user && !fetchingDoc && designerDoc?.status === 'pending' && (
          <div className="max-w-xl mx-auto py-12 animate-fadeIn text-center">
            <div className="bg-[#1C1224]/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-8 shadow-2xl">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/10">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>
              
              <div className="inline-block px-3 py-1 mb-3 text-xs font-bold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Application Status: Pending Review
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome, {designerDoc?.name || user.displayName}!
              </h2>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                Your designer registration has been received and is currently waiting for admin authorization. Once approved, you will be able to receive and fulfill customer orders.
              </p>

              <div className="bg-white/5 rounded-2xl p-4 text-left border border-white/5 mb-6 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Registered Email:</span>
                  <span className="text-white font-mono">{designerDoc?.email || user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">WhatsApp:</span>
                  <span className="text-emerald-400 font-mono">{designerDoc?.whatsapp || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Registration Date:</span>
                  <span className="text-gray-300">{new Date(designerDoc?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Quick WhatsApp message to admin to expedite */}
              <div className="space-y-3">
                <a
                  href={`https://wa.me/919162478070?text=${encodeURIComponent(
                    `Hello Sigma Photography Admin, I have registered on the Designer Portal as ${designerDoc?.name || user.displayName} (${designerDoc?.whatsapp}). Kindly review and approve my account so I can receive orders. Thank you!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Notify Admin on WhatsApp to Expedite</span>
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-2xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Authenticated: Account Rejected or Inactive */}
        {user && !fetchingDoc && (designerDoc?.status === 'rejected' || designerDoc?.status === 'inactive') && (
          <div className="max-w-md mx-auto py-12 text-center animate-fadeIn">
            <div className="bg-[#1C1224]/90 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account Not Active</h2>
              <p className="text-xs text-gray-300 mb-6">
                Your designer account is currently marked as {designerDoc.status}. If you believe this is an error, please reach out directly to the administrator.
              </p>
              <div className="space-y-3">
                <a
                  href="https://wa.me/919162478070"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact Admin Support
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-xs text-gray-400 hover:text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Authenticated & Approved: FULL DESIGNER DASHBOARD */}
        {user && !fetchingDoc && designerDoc?.status === 'approved' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Designer Header Banner */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-950/70 via-purple-950/70 to-amber-950/50 border border-rose-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-rose-600/30 ring-4 ring-amber-400/20">
                    {(designerDoc?.name || user.displayName || 'D').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        {designerDoc?.name || user.displayName}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Designer
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                      <span className="flex items-center gap-1.5 text-emerald-300">
                        <Phone className="w-3.5 h-3.5" />
                        {designerDoc?.whatsapp || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Mail className="w-3.5 h-3.5" />
                        {designerDoc?.email || user.email}
                      </span>
                      {designerDoc?.portfolioUrl && (
                        <a
                          href={designerDoc.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-amber-400 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick actions for designer */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://wa.me/919162478070"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Admin</span>
                  </a>
                </div>
              </div>

              {/* Skills tags */}
              {designerDoc?.skills && designerDoc.skills.length > 0 && (
                <div className="mt-5 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium mr-1">Skills:</span>
                  {designerDoc.skills.map((s: string) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 text-rose-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-[#1C1224]/80 border border-rose-500/20 backdrop-blur-md shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Total Assigned Orders
                  </p>
                  <h3 className="text-3xl font-extrabold text-white">
                    {assignedOrders.length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1C1224]/80 border border-amber-500/20 backdrop-blur-md shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    In Progress / Pending
                  </p>
                  <h3 className="text-3xl font-extrabold text-amber-400">
                    {inProgressCount}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1C1224]/80 border border-emerald-500/20 backdrop-blur-md shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Completed Deliveries
                  </p>
                  <h3 className="text-3xl font-extrabold text-emerald-400">
                    {completedCount}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Filter bar & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1C1224]/80 border border-rose-500/10 p-4 rounded-2xl">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {(['All', 'In Progress', 'Completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setOrderFilter(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      orderFilter === tab
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab}
                    {tab === 'In Progress' && inProgressCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-400/30 text-amber-200 text-[10px]">
                        {inProgressCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by order ID, name..."
                  className="w-full bg-white/5 border border-white/10 focus:border-rose-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
                <p className="text-sm">Fetching assigned orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#1C1224]/50 border border-dashed border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 mx-auto mb-4">
                  <Palette className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No Orders Assigned Yet</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
                  {searchQuery 
                    ? 'No orders matched your search criteria.' 
                    : 'When the admin assigns new invitation orders to you, they will appear here with full customer requirements.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-amber-400 underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const isCompleted = order.designerStatus === 'Completed';
                  const deliveryLink = deliveryLinks[order.id] !== undefined ? deliveryLinks[order.id] : (order.designerDeliveryLink || '');
                  const notes = designerNotes[order.id] !== undefined ? designerNotes[order.id] : (order.designerNotes || '');

                  return (
                    <div
                      key={order.id}
                      className="bg-[#1C1224]/90 rounded-3xl border border-rose-500/20 overflow-hidden shadow-xl hover:border-rose-500/40 transition-all"
                    >
                      {/* Order Header */}
                      <div className="p-6 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
                            #{order.displayId || order.id.slice(-8)}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">
                              {order.templateName || 'Custom Video Invitation'}
                            </h3>
                            <p className="text-xs text-gray-400">
                              Order placed: {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {order.designerStatus || 'In Progress'}
                          </span>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Template Details & Preview */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-amber-400" />
                            Template Asset Reference
                          </h4>

                          {order.thumbnailBase64 && (
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 group aspect-video bg-black/40">
                              <img
                                src={order.thumbnailBase64}
                                alt={order.templateName}
                                className="w-full h-full object-cover"
                              />
                              {order.videoUrl && (
                                <button
                                  onClick={() => setPreviewVideoUrl(order.videoUrl)}
                                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold gap-2"
                                >
                                  <Video className="w-5 h-5 text-amber-400" />
                                  Watch Template Demo
                                </button>
                              )}
                            </div>
                          )}

                          {order.videoUrl && (
                            <button
                              onClick={() => setPreviewVideoUrl(order.videoUrl)}
                              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 flex items-center justify-center gap-2 transition-colors"
                            >
                              <Video className="w-4 h-4" />
                              <span>Play Reference Video Demo</span>
                            </button>
                          )}

                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Customer Name:</span>
                              <span className="text-white font-medium">{order.customerName || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Customer Phone:</span>
                              <span className="text-emerald-400 font-mono font-medium">{order.customerPhone || 'N/A'}</span>
                            </div>
                            {order.designerPayout && (
                              <div className="flex justify-between items-center pt-1 border-t border-white/5">
                                <span className="text-gray-400">Designer Fee / Payout:</span>
                                <span className="text-amber-300 font-bold font-mono">₹{order.designerPayout}</span>
                              </div>
                            )}
                            {order.filesCount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Client Photos/Files:</span>
                                <span className="text-amber-400 font-bold">{order.filesCount} file(s) attached</span>
                              </div>
                            )}
                          </div>

                          {/* Customer Uploaded Shadi Ka Card / Hard Copy Card */}
                          {(order.hasUploadedInvitationCard || order.invitationCardUrl || (order.invitationCardUrls && order.invitationCardUrls.length > 0)) && (
                            <div className="p-3 bg-rose-950/40 rounded-2xl border border-rose-500/30 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                                  <span className="text-xs font-bold text-rose-300">
                                    💌 Uploaded Shadi Ka Card {order.invitationCardCount ? `(${order.invitationCardCount} Photos)` : ""}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  Attached
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-300 leading-snug">
                                Customer attached photos of their physical invitation card. Please refer to these photos for full names, dates, and event details.
                              </p>
                              {/* Photos Gallery */}
                              {order.invitationCardUrls && order.invitationCardUrls.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                  {order.invitationCardUrls.map((url: string, pIdx: number) => (
                                    <a
                                      key={pIdx}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-rose-900/30 border border-rose-500/40 hover:border-rose-400 block transition"
                                    >
                                      <img
                                        src={url}
                                        alt={`Card Photo ${pIdx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ExternalLink className="w-4 h-4 text-white" />
                                      </div>
                                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                                        Photo #{pIdx + 1}
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              ) : order.invitationCardUrl ? (
                                <a
                                  href={order.invitationCardUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 shadow-md transition-colors"
                                >
                                  <span>Open & View Uploaded Card</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : null}
                            </div>
                          )}
                        </div>

                        {/* Middle Column: Customer Customization Requirements */}
                        <div className="space-y-4 lg:col-span-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-amber-400" />
                            Customer Event Details & Text
                          </h4>

                          {order.customData && Object.keys(order.customData).length > 0 ? (
                            <div className="bg-black/30 rounded-2xl p-4 border border-white/10 max-h-96 overflow-y-auto text-xs space-y-3">
                              <FormatOrderData
                                data={order.customData}
                                theme="dark"
                                templateId={order.templateId}
                              />
                            </div>
                          ) : (
                            <div className="bg-white/5 rounded-2xl p-6 text-center text-xs text-gray-400 border border-white/5">
                              No special custom form data provided for this order. Check customer phone or reference files.
                            </div>
                          )}
                        </div>

                        {/* Right Column: Designer Delivery & Submission */}
                        <div className="space-y-4 lg:col-span-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5 mb-3">
                              <UploadCloud className="w-4 h-4 text-amber-400" />
                              Fulfilment & Delivery Link
                            </h4>

                            {/* Status Selector */}
                            <div className="mb-4">
                              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Order Work Status
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrder(order.id, 'In Progress')}
                                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                    order.designerStatus !== 'Completed'
                                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                  }`}
                                >
                                  In Progress
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrder(order.id, 'Completed')}
                                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                    order.designerStatus === 'Completed'
                                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                  }`}
                                >
                                  Completed ✓
                                </button>
                              </div>
                            </div>

                            {/* Delivery Link Input */}
                            <div className="mb-4">
                              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Output Video / Design Link (Drive/Dropbox/YouTube)
                              </label>
                              <input
                                type="url"
                                value={deliveryLink}
                                onChange={(e) => setDeliveryLinks({
                                  ...deliveryLinks,
                                  [order.id]: e.target.value
                                })}
                                placeholder="https://drive.google.com/..."
                                className="w-full bg-white/5 border border-white/10 focus:border-rose-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                              />
                              {order.designerDeliveryLink && (
                                <a
                                  href={order.designerDeliveryLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline mt-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Test Uploaded Link
                                </a>
                              )}
                            </div>

                            {/* Designer Notes */}
                            <div className="mb-4">
                              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Notes for Admin / Revision Details
                              </label>
                              <textarea
                                rows={2}
                                value={notes}
                                onChange={(e) => setDesignerNotes({
                                  ...designerNotes,
                                  [order.id]: e.target.value
                                })}
                                placeholder="e.g. Exported 1080p 60fps, song matched as requested."
                                className="w-full bg-white/5 border border-white/10 focus:border-rose-400 rounded-xl p-3 text-xs text-white outline-none resize-none"
                              />
                            </div>
                          </div>

                          {/* Save & WhatsApp buttons */}
                          <div className="space-y-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateOrder(order.id, isCompleted ? 'Completed' : 'In Progress')}
                              disabled={savingOrderId === order.id}
                              className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                              {savingOrderId === order.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>Save Link & Update Status</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleShareWithAdmin(order)}
                              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-2 transition-all"
                            >
                              <MessageSquare className="w-4 h-4 text-emerald-400" />
                              <span>Notify Admin on WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
