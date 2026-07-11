import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Edit, MessageSquare, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomerDetail from './CustomerDetail';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
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
      where('sender', '==', 'user'),
      where('read', '==', false)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userId) {
          counts[data.userId] = (counts[data.userId] || 0) + 1;
        }
      });
      setUnreadMap(counts);
    }, (error) => {
      console.error("Error fetching unread chats:", error);
    });
    return () => unsub();
  }, []);

  const changeRole = async (id: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await updateDoc(doc(db, 'users', id), { role: newRole });
      toast.success(`Role updated to ${newRole}`);
    } catch (e) {
      toast.error('Failed to update role');
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
              {users.map(u => {
                const isOnline = u.isOnline && u.lastSeen && (new Date().getTime() - u.lastSeen.toDate().getTime() < 2 * 60 * 1000);
                return (
                <tr key={u.id} className="border-b border-gray-800/50">
                  <td className="py-4 text-sm">{u.email}</td>
                  <td className="py-4 text-sm">{u.name || 'N/A'}</td>
                  <td className="py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
                      {u.role || 'user'}
                    </span>
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
                    <div className="flex justify-end gap-2">
                       <a href={`mailto:${u.email}`} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg" title="Send Email">
                         <Mail className="w-4 h-4" />
                       </a>
                       <button onClick={() => setSelectedUser(u)} className="relative p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg" title="Chat / Orders">
                         <MessageSquare className="w-4 h-4" />
                         {unreadMap[u.id] > 0 && (
                           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                             {unreadMap[u.id]}
                           </span>
                         )}
                       </button>
                       <button onClick={() => changeRole(u.id, u.role)} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs">
                         Toggle Role
                       </button>
                       <button onClick={() => setDeleteUserId(u.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
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
