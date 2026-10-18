import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  setDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Palette, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Phone, 
  Mail, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Layers, 
  Plus, 
  Sparkles, 
  Check, 
  X, 
  MessageSquare, 
  RefreshCw,
  ShieldCheck,
  Power,
  ChevronRight,
  Filter,
  AlertTriangle,
  UserCheck,
  UserPlus,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageDesigners() {
  const [designers, setDesigners] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Inactive'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editingDesigner, setEditingDesigner] = useState<any | null>(null);
  const [assigningDesigner, setAssigningDesigner] = useState<any | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Real-time listener for designers from users and content/designers/items
  useEffect(() => {
    setLoading(true);

    const mergeAndSetDesigners = (usersList: any[], contentList: any[], directDesignersList: any[] = []) => {
      const map = new Map();
      usersList.forEach(u => map.set(u.id, u));
      contentList.forEach(c => {
        if (map.has(c.id)) {
          map.set(c.id, { ...map.get(c.id), ...c });
        } else {
          map.set(c.id, c);
        }
      });
      directDesignersList.forEach(d => {
        if (map.has(d.id)) {
          map.set(d.id, { ...map.get(d.id), ...d });
        } else {
          map.set(d.id, d);
        }
      });
      const combined = Array.from(map.values());
      combined.sort((a: any, b: any) => new Date(b.createdAt || b.approvalRequestedAt || 0).getTime() - new Date(a.createdAt || a.approvalRequestedAt || 0).getTime());
      setDesigners(combined);
      setLoading(false);
    };

    let latestUsers: any[] = [];
    let latestContent: any[] = [];
    let latestDirect: any[] = [];

    // 1. Listen to users collection
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const allDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
      setAllUsers(allDocs);
      latestUsers = allDocs.filter(u => 
        u.role === 'designer' || 
        u.status === 'pending' || 
        u.status === 'approved' || 
        u.approvalRequested === true || 
        u.skills || 
        u.isDesigner
      );
      mergeAndSetDesigners(latestUsers, latestContent, latestDirect);
    }, (err) => {
      console.warn('Users collection query note:', err?.message);
      setLoading(false);
    });

    // 2. Listen to content/designers/items (public read, zero permission errors)
    const unsubContent = onSnapshot(collection(db, 'content', 'designers', 'items'), (snapshot) => {
      latestContent = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
      mergeAndSetDesigners(latestUsers, latestContent, latestDirect);
    }, (err) => {
      console.warn('content/designers/items query note:', err?.message);
    });

    // 3. Listen to designers collection directly
    const unsubDesigners = onSnapshot(collection(db, 'designers'), (snapshot) => {
      latestDirect = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
      mergeAndSetDesigners(latestUsers, latestContent, latestDirect);
    }, (err) => {
      console.warn('designers collection query note:', err?.message);
    });

    // Fetch templates for assignment
    const unsubTemplates = onSnapshot(collection(db, 'templates'), (snapshot) => {
      const tList = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setTemplates(tList);
    });

    // Fetch orders to calculate stats
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const oList = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setOrders(oList);
    }, () => {});

    return () => {
      unsubUsers();
      unsubContent();
      unsubDesigners();
      unsubTemplates();
      unsubOrders();
    };
  }, []);

  // Switch already registered user to approved designer
  const handlePromoteUserToDesigner = async (user: any) => {
    try {
      const now = new Date().toISOString();
      const cleanPhone = (user.whatsapp || user.phone || '').replace(/\D/g, '');
      const updateData = {
        role: 'designer',
        status: 'approved',
        active: true,
        approvedAt: now,
        updatedAt: now
      };

      await updateDoc(doc(db, 'users', user.id), updateData).catch(console.warn);

      const fullData = {
        id: user.id,
        uid: user.id,
        name: user.displayName || user.name || 'Designer',
        displayName: user.displayName || user.name || 'Designer',
        email: user.email || '',
        whatsapp: cleanPhone,
        skills: user.skills || ['Video Editing', 'Wedding Invitations'],
        portfolioUrl: user.portfolioUrl || '',
        experience: user.experience || 'Professional Designer',
        role: 'designer',
        status: 'approved',
        active: true,
        assignedTemplates: user.assignedTemplates || [],
        approvedAt: now,
        updatedAt: now
      };

      await setDoc(doc(db, 'content', 'designers', 'items', user.id), fullData, { merge: true }).catch(console.warn);
      await setDoc(doc(db, 'designers', user.id), fullData, { merge: true }).catch(console.warn);

      toast.success(`${user.displayName || user.name || user.email} is now an Approved Designer! 🎨`);
      setShowPromoteModal(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to switch user to designer');
    }
  };

  // Approve designer
  const handleApprove = async (designer: any) => {
    try {
      const now = new Date().toISOString();
      const updateData = {
        role: 'designer',
        status: 'approved',
        active: true,
        approvedAt: now,
        updatedAt: now
      };

      await updateDoc(doc(db, 'users', designer.id), updateData).catch(console.warn);

      const fullData = {
        id: designer.id,
        name: designer.name || designer.displayName || 'Designer',
        email: designer.email || '',
        whatsapp: designer.whatsapp || '',
        skills: designer.skills || [],
        portfolioUrl: designer.portfolioUrl || '',
        experience: designer.experience || '',
        ...updateData
      };

      await setDoc(doc(db, 'content', 'designers', 'items', designer.id), fullData, { merge: true }).catch(console.warn);
      await setDoc(doc(db, 'designers', designer.id), fullData, { merge: true }).catch(console.warn);

      toast.success(`${designer.name} approved successfully!`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to approve designer');
    }
  };

  // Reject designer
  const handleReject = async (designer: any) => {
    try {
      const now = new Date().toISOString();
      const updateData = {
        status: 'rejected',
        active: false,
        rejectedAt: now,
        updatedAt: now
      };

      await updateDoc(doc(db, 'users', designer.id), updateData).catch(console.warn);
      await setDoc(doc(db, 'content', 'designers', 'items', designer.id), updateData, { merge: true }).catch(console.warn);
      await setDoc(doc(db, 'designers', designer.id), updateData, { merge: true }).catch(console.warn);

      toast.success(`${designer.name} registration rejected`);
    } catch (e) {
      toast.error('Failed to reject registration');
    }
  };

  // Toggle active/inactive
  const handleToggleActive = async (designer: any) => {
    try {
      const newActive = !designer.active;
      const newStatus = newActive ? 'approved' : 'inactive';
      const updateData = {
        active: newActive,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', designer.id), updateData).catch(console.warn);
      await setDoc(doc(db, 'content', 'designers', 'items', designer.id), updateData, { merge: true }).catch(console.warn);
      await setDoc(doc(db, 'designers', designer.id), updateData, { merge: true }).catch(console.warn);

      toast.success(`Designer marked as ${newActive ? 'Active' : 'Inactive'}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  // Delete designer
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'users', deleteConfirmId)).catch(console.warn);
      await deleteDoc(doc(db, 'content', 'designers', 'items', deleteConfirmId)).catch(console.warn);
      await deleteDoc(doc(db, 'designers', deleteConfirmId)).catch(console.warn);
      toast.success('Designer deleted');
      setDeleteConfirmId(null);
    } catch (e) {
      toast.error('Failed to delete designer');
    }
  };

  // Open Template Assignment Modal
  const openAssignModal = (designer: any) => {
    setAssigningDesigner(designer);
    setSelectedTemplateIds(designer.assignedTemplates || []);
    setTemplateSearchQuery('');
  };

  // Save Template Assignments
  const handleSaveAssignments = async () => {
    if (!assigningDesigner) return;
    try {
      const now = new Date().toISOString();
      
      // Update in users and content
      await updateDoc(doc(db, 'users', assigningDesigner.id), {
        assignedTemplates: selectedTemplateIds,
        updatedAt: now
      }).catch(console.warn);

      await setDoc(doc(db, 'content', 'designers', 'items', assigningDesigner.id), {
        assignedTemplates: selectedTemplateIds,
        updatedAt: now
      }, { merge: true }).catch(console.warn);

      await setDoc(doc(db, 'designers', assigningDesigner.id), {
        assignedTemplates: selectedTemplateIds,
        updatedAt: now
      }, { merge: true }).catch(console.warn);

      // Update each template
      const updatePromises = templates.map(async (t) => {
        const isSelected = selectedTemplateIds.includes(t.id);
        const wasAssignedToThis = t.assignedDesignerId === assigningDesigner.id;

        if (isSelected && !wasAssignedToThis) {
          await updateDoc(doc(db, 'templates', t.id), {
            assignedDesignerId: assigningDesigner.id,
            assignedDesignerName: assigningDesigner.name,
            assignedDesignerPhone: assigningDesigner.whatsapp
          });
        } else if (!isSelected && wasAssignedToThis) {
          await updateDoc(doc(db, 'templates', t.id), {
            assignedDesignerId: null,
            assignedDesignerName: null,
            assignedDesignerPhone: null
          });
        }
      });

      await Promise.all(updatePromises);
      toast.success('Templates assigned successfully!');
      setAssigningDesigner(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save template assignments');
    }
  };

  // Save Edit Details
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesigner) return;
    try {
      const cleanPhone = (editingDesigner.whatsapp || '').replace(/\D/g, '');
      const skillsArray = typeof editingDesigner.skills === 'string'
        ? editingDesigner.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : editingDesigner.skills;

      const updatePayload = {
        name: editingDesigner.name,
        displayName: editingDesigner.name,
        email: editingDesigner.email,
        whatsapp: cleanPhone,
        status: editingDesigner.status,
        active: editingDesigner.status === 'approved',
        portfolioUrl: editingDesigner.portfolioUrl || '',
        experience: editingDesigner.experience || '',
        skills: skillsArray,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', editingDesigner.id), updatePayload).catch(console.warn);
      await setDoc(doc(db, 'content', 'designers', 'items', editingDesigner.id), updatePayload, { merge: true }).catch(console.warn);
      await setDoc(doc(db, 'designers', editingDesigner.id), updatePayload, { merge: true }).catch(console.warn);

      toast.success('Designer details updated');
      setEditingDesigner(null);
    } catch (e) {
      toast.error('Failed to update details');
    }
  };

  // WhatsApp chat with designer
  const openWhatsAppChat = (designer: any) => {
    const cleanPhone = (designer.whatsapp || '').replace(/\D/g, '');
    if (!cleanPhone) {
      toast.error('No valid phone number for this designer');
      return;
    }
    const msg = `Hello ${designer.name}, this is Sigma Photography Admin. Reaching out regarding your invitation template orders.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filtered designers
  const filteredDesigners = designers.filter((d) => {
    const qLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (d.name || '').toLowerCase().includes(qLower) ||
      (d.email || '').toLowerCase().includes(qLower) ||
      (d.whatsapp || '').includes(qLower) ||
      (Array.isArray(d.skills) && d.skills.some((s: string) => s.toLowerCase().includes(qLower)));

    if (!matchesSearch) return false;
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return d.status === 'pending';
    if (activeTab === 'Approved') return d.status === 'approved' && d.active !== false;
    if (activeTab === 'Inactive') return d.status === 'inactive' || d.status === 'rejected' || d.active === false;
    return true;
  });

  const pendingCount = designers.filter(d => d.status === 'pending').length;
  const approvedCount = designers.filter(d => d.status === 'approved' && d.active !== false).length;
  const inactiveCount = designers.filter(d => d.status === 'inactive' || d.status === 'rejected' || d.active === false).length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-brand-navy">Designer Portal Management</h1>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full animate-bounce">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-sm text-brand-slate">
            Authorize designers, assign invitation templates, and track assigned orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setUserSearchQuery('');
              setShowPromoteModal(true);
            }}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-md shadow-rose-900/10 flex items-center gap-2 transition-all shrink-0 active:scale-95"
            title="Convert any registered user from your website directly into an approved designer"
          >
            <UserPlus className="w-4 h-4 text-amber-200" />
            <span>Switch User to Designer</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-brand-purple/10 shadow-sm">
          <p className="text-xs font-semibold text-brand-slate uppercase tracking-wider mb-1">
            Total Registered
          </p>
          <h3 className="text-2xl font-bold text-brand-navy">{designers.length}</h3>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm ${
          pendingCount > 0 
            ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20' 
            : 'bg-white/70 backdrop-blur-md border-brand-purple/10'
        }`}>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            Pending Approval
          </p>
          <h3 className="text-2xl font-bold text-amber-600">{pendingCount}</h3>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-brand-purple/10 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            Active & Approved
          </p>
          <h3 className="text-2xl font-bold text-emerald-600">{approvedCount}</h3>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-brand-purple/10 shadow-sm">
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-wider mb-1">
            Total Assigned Orders
          </p>
          <h3 className="text-2xl font-bold text-brand-purple">
            {orders.filter(o => o.assignedDesignerId).length}
          </h3>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-brand-purple/10">
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Pending', 'Approved', 'Inactive'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'text-brand-slate hover:text-brand-navy hover:bg-white/50'
              }`}
            >
              {tab}
              {tab === 'Pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-brand-navy text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-brand-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, skills..."
            className="w-full bg-white border border-brand-purple/15 focus:border-brand-purple rounded-xl pl-10 pr-4 py-2 text-xs text-brand-navy outline-none"
          />
        </div>
      </div>

      {/* Designers List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-brand-slate space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-purple" />
          <p className="text-sm">Loading registered designers...</p>
        </div>
      ) : filteredDesigners.length === 0 ? (
        <div className="bg-white/50 rounded-3xl p-12 text-center border border-dashed border-brand-purple/20">
          <Palette className="w-12 h-12 text-brand-slate/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-brand-navy mb-1">No Designers Found</h3>
          <p className="text-xs text-brand-slate max-w-sm mx-auto">
            {searchQuery 
              ? 'No registered designers matched your search query.' 
              : 'Designers who register via the Designer Portal will appear here for admin approval.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDesigners.map((designer) => {
            const isApproved = designer.status === 'approved' && designer.active !== false;
            const isPending = designer.status === 'pending';
            const assignedOrdersCount = orders.filter(o => o.assignedDesignerId === designer.id).length;
            const templateCount = (designer.assignedTemplates || []).length;

            return (
              <div
                key={designer.id}
                className={`bg-white/80 backdrop-blur-md rounded-3xl p-6 border shadow-sm transition-all hover:shadow-md ${
                  isPending 
                    ? 'border-amber-400/60 ring-2 ring-amber-400/20' 
                    : isApproved
                    ? 'border-brand-purple/15'
                    : 'border-gray-200 opacity-80'
                }`}
              >
                {/* Designer Card Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-rose-900/10">
                      {(designer.name || 'D').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-brand-navy">
                          {designer.name || 'Unnamed Designer'}
                        </h3>
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Approved & Active
                          </span>
                        )}
                        {!isApproved && !isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                            {designer.status || 'Inactive'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-slate">
                        Registered: {new Date(designer.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Quick toggle active button */}
                  {isApproved && (
                    <button
                      onClick={() => handleToggleActive(designer)}
                      className="p-1.5 text-emerald-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deactivate account"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Contact info row */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4 p-3 bg-brand-purple/5 rounded-xl border border-brand-purple/5">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-brand-navy font-mono font-medium truncate">
                      {designer.whatsapp || 'No Phone'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                    <span className="text-brand-slate truncate">
                      {designer.email || 'No Email'}
                    </span>
                  </div>
                </div>

                {/* Skills tags */}
                {designer.skills && designer.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-1.5">
                      Specialization / Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {designer.skills.map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-brand-purple border border-brand-purple/15 shadow-2xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio / Link & Experience */}
                <div className="text-xs text-brand-slate space-y-1 mb-4">
                  {designer.portfolioUrl && (
                    <a
                      href={designer.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-purple hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Portfolio / Work Samples
                    </a>
                  )}
                  {designer.experience && (
                    <p className="italic line-clamp-2 text-brand-slate/80">
                      "{designer.experience}"
                    </p>
                  )}
                </div>

                {/* Stats row: Templates assigned + Orders count */}
                <div className="flex items-center justify-between text-xs py-2.5 px-3 mb-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-500">Assigned Templates: </span>
                    <strong className="text-brand-navy">{templateCount}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Orders Handled: </span>
                    <strong className="text-brand-purple">{assignedOrdersCount}</strong>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-purple/10">
                  {/* Approve / Reject buttons if pending */}
                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleApprove(designer)}
                        className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Designer</span>
                      </button>

                      <button
                        onClick={() => handleReject(designer)}
                        className="py-2 px-3 rounded-xl font-bold text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Assign Templates */}
                      <button
                        onClick={() => openAssignModal(designer)}
                        className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Assign Templates ({templateCount})</span>
                      </button>

                      {/* WhatsApp Chat */}
                      <button
                        onClick={() => openWhatsAppChat(designer)}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={() => setEditingDesigner({ ...designer })}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmId(designer.id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Designer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ASSIGN TEMPLATES TO DESIGNER */}
      {assigningDesigner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-bold text-lg text-brand-navy">
                  Assign Templates to {assigningDesigner.name}
                </h3>
                <p className="text-xs text-brand-slate">
                  Select which video or e-card templates this designer is responsible for.
                </p>
              </div>
              <button
                onClick={() => setAssigningDesigner(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template search */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={templateSearchQuery}
                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                placeholder="Search templates by title or category..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-brand-navy outline-none focus:border-brand-purple"
              />
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-6">
              {templates
                .filter(t => 
                  !templateSearchQuery || 
                  (t.title || '').toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                  (t.category || '').toLowerCase().includes(templateSearchQuery.toLowerCase())
                )
                .map((template) => {
                  const isChecked = selectedTemplateIds.includes(template.id);
                  const isAssignedToOther = template.assignedDesignerId && template.assignedDesignerId !== assigningDesigner.id;

                  return (
                    <label
                      key={template.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-brand-purple/5 border-brand-purple text-brand-navy'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedTemplateIds(selectedTemplateIds.filter(id => id !== template.id));
                            } else {
                              setSelectedTemplateIds([...selectedTemplateIds, template.id]);
                            }
                          }}
                          className="w-4 h-4 text-brand-purple rounded border-gray-300 focus:ring-brand-purple"
                        />

                        {template.thumbnailBase64 && (
                          <img
                            src={template.thumbnailBase64}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                          />
                        )}

                        <div>
                          <div className="font-semibold text-xs text-brand-navy">
                            {template.title}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {template.category} • ₹{template.discountPrice || template.price || 0}
                          </div>
                        </div>
                      </div>

                      {isAssignedToOther && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                          Assigned to: {template.assignedDesignerName}
                        </span>
                      )}
                    </label>
                  );
                })}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {selectedTemplateIds.length} template(s) selected
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningDesigner(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignments}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-purple hover:bg-brand-purple/90 text-white shadow-sm"
                >
                  Save Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DESIGNER */}
      {editingDesigner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="font-bold text-lg text-brand-navy">Edit Designer Details</h3>
              <button
                onClick={() => setEditingDesigner(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingDesigner.name || ''}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-brand-navy outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  value={editingDesigner.whatsapp || ''}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, whatsapp: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-brand-navy outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingDesigner.email || ''}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-brand-navy outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Account Status</label>
                <select
                  value={editingDesigner.status || 'pending'}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, status: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-brand-navy outline-none focus:border-brand-purple"
                >
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved & Active</option>
                  <option value="inactive">Inactive / Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Portfolio Link</label>
                <input
                  type="url"
                  value={editingDesigner.portfolioUrl || ''}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, portfolioUrl: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-brand-navy outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editingDesigner.skills) ? editingDesigner.skills.join(', ') : editingDesigner.skills || ''}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, skills: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-brand-navy outline-none focus:border-brand-purple"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingDesigner(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-brand-purple hover:bg-brand-purple/90 text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-1">Delete Designer?</h3>
            <p className="text-xs text-gray-500 mb-6">
              This action cannot be undone. Orders previously fulfilled will still retain historical data.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROMOTE REGISTERED USER TO DESIGNER */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-brand-purple/15 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-brand-navy">Switch User to Designer</h3>
                  <p className="text-xs text-brand-slate">Choose any registered user to authorize as an official designer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search registered users by name or email..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-purple"
              />
            </div>

            {/* Users list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {allUsers
                .filter(u => {
                  const q = userSearchQuery.toLowerCase();
                  return (
                    (u.displayName || u.name || '').toLowerCase().includes(q) ||
                    (u.email || '').toLowerCase().includes(q)
                  );
                })
                .map((user) => {
                  const isAlreadyDesigner = designers.some(d => d.id === user.id && d.status === 'approved' && d.active !== false);

                  return (
                    <div
                      key={user.id}
                      className="p-3.5 rounded-2xl border border-gray-100 hover:border-brand-purple/20 bg-gray-50/60 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-sm shrink-0">
                          {(user.displayName || user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-brand-navy truncate">
                            {user.displayName || user.name || 'Unnamed User'}
                          </p>
                          <p className="text-[11px] text-brand-slate truncate">{user.email || 'No email'}</p>
                          {user.whatsapp || user.phone ? (
                            <p className="text-[10px] text-emerald-600 font-mono">📱 {user.whatsapp || user.phone}</p>
                          ) : null}
                        </div>
                      </div>

                      {isAlreadyDesigner ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Already Designer
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePromoteUserToDesigner(user)}
                          className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-95 text-white shadow-sm flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Make Designer</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              {allUsers.length === 0 && (
                <div className="py-12 text-center text-xs text-gray-400">
                  No registered users found.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
