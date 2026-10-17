import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Edit, MessageSquare, Mail, Search, Palette, ShieldCheck, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomerDetail from './CustomerDetail';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching users:", error);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('read', '==', false)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.sender === 'user' && data.userId) {
          counts[data.userId] = (counts[data.userId] || 0) + 1;
        }
      });
      setUnreadMap(counts);
    }, (error) => {
      console.error("Error fetching unread chats:", error);
    });
    return () => unsub();
  }, []);

  const changeUserRole = async (user: any, targetRole: 'user' | 'designer' | 'admin') => {
    try {
      const now = new Date().toISOString();
      const userRef = doc(db, 'users', user.id);

      if (targetRole === 'designer') {
        const designerPayload = {
          role: 'designer',
          status: 'approved',
          active: true,
          updatedAt: now,
          approvedAt: now
        };
        await updateDoc(userRef, designerPayload);

        const cleanPhone = (user.whatsapp || user.phone || '').replace(/\D/g, '');
        const fullDesignerData = {
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

        // Mirror to designers and content/designers/items collections
        await setDoc(doc(db, 'designers', user.id), fullDesignerData, { merge: true }).catch(console.warn);
        await setDoc(doc(db, 'content', 'designers', 'items', user.id), fullDesignerData, { merge: true }).catch(console.warn);

        toast.success(`${user.name || user.email} is now an Approved Designer! 🎨`);
      } else {
        await updateDoc(userRef, { role: targetRole, updatedAt: now });

        if (user.role === 'designer') {
          // Deactivate designer record
          const deact = { active: false, status: 'inactive', updatedAt: now };
          await updateDoc(doc(db, 'designers', user.id), deact).catch(() => {});
          await updateDoc(doc(db, 'content', 'designers', 'items', user.id), deact).catch(() => {});
        }

        toast.success(`Role updated to ${targetRole}`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to change role: ' + (e.message || ''));
    }
  };

  const deleteUserRecord = async () => {
    if (!deleteUserId) return;
    try {
      await deleteDoc(doc(db, 'users', deleteUserId));
      toast.success('User deleted');
      setDeleteUserId(null);
    } catch (e) {
      toast.error('Failed to delete user');
      setDeleteUserId(null);
    }
  };

  return (
    <div className="w-full">
      {selectedUser ? (
        <CustomerDetail user={selectedUser} onBack={() => setSelectedUser(null)} />
      ) : (
        <>
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-2">Delete User</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this user record from DB? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteUserId(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={deleteUserRecord}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
            <h1 className="text-2xl font-bold text-brand-navy mb-6">Customers Management</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
          />
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="pb-3 font-medium text-sm">Email</th>
                <th className="pb-3 font-medium text-sm">Name</th>
                <th className="pb-3 font-medium text-sm">Role</th>
                <th className="pb-3 font-medium text-sm">Status</th>
                <th className="pb-3 font-medium text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => {
                const searchLower = (searchQuery || '').toLowerCase();
                return searchQuery === '' || 
                  (u.name || '').toLowerCase().includes(searchLower) ||
                  (u.email || '').toLowerCase().includes(searchLower) ||
                  (u.role || 'user').toLowerCase().includes(searchLower);
              }).map(u => {
                const isOnline = u.isOnline && u.lastSeen && (new Date().getTime() - u.lastSeen.toDate().getTime() < 2 * 60 * 1000);
                return (
                <tr key={u.id} className="border-b border-gray-800/50">
                  <td className="py-4 text-sm">{u.email}</td>
                  <td className="py-4 text-sm">{u.name || 'N/A'}</td>
                  <td className="py-4 text-sm">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" /> Admin
                      </span>
                    ) : u.role === 'designer' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        <Palette className="w-3.5 h-3.5 text-amber-300" /> Designer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                        User
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-sm">
                    {isOnline ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">Offline</span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {/* Switch to Designer Quick Action */}
                       {u.role !== 'designer' ? (
                         <button
                           onClick={() => changeUserRole(u, 'designer')}
                           className="px-2.5 py-1 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-90 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                           title="Switch this registered user to an Approved Designer"
                         >
                           <Palette className="w-3.5 h-3.5" />
                           <span>Make Designer</span>
                         </button>
                       ) : (
                         <button
                           onClick={() => changeUserRole(u, 'user')}
                           className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                           title="Revert back to regular user"
                         >
                           <span>Revert to User</span>
                         </button>
                       )}

                       {/* Role dropdown for Admin toggle */}
                       <select
                         value={u.role || 'user'}
                         onChange={(e) => changeUserRole(u, e.target.value as any)}
                         className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
                       >
                         <option value="user">User</option>
                         <option value="designer">Designer</option>
                         <option value="admin">Admin</option>
                       </select>

                       <a href={`mailto:${u.email}`} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg" title="Send Email">
                         <Mail className="w-4 h-4" />
                       </a>
                       <button onClick={() => setSelectedUser(u)} className="relative p-1.5 text-indigo-400 hover:bg-indigo-400/10 rounded-lg" title="Chat / Orders">
                         <MessageSquare className="w-4 h-4" />
                         {unreadMap[u.id] > 0 && (
                           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                             {unreadMap[u.id]}
                           </span>
                         )}
                       </button>
                       <button onClick={() => setDeleteUserId(u.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg" title="Delete User">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
