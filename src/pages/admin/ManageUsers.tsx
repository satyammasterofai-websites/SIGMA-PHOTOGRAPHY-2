import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching users:", error);
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
      <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="pb-3 font-medium text-sm">Email</th>
                <th className="pb-3 font-medium text-sm">Name</th>
                <th className="pb-3 font-medium text-sm">Role</th>
                <th className="pb-3 font-medium text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-800/50">
                  <td className="py-4 text-sm">{u.email}</td>
                  <td className="py-4 text-sm">{u.name || 'N/A'}</td>
                  <td className="py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => changeRole(u.id, u.role)} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs">
                         Toggle Role
                       </button>
                       <button onClick={() => setDeleteUserId(u.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
