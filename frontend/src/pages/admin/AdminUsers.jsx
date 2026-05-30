import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      if (data.success) setUsers(data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      {loading ? (
        <div className="flex justify-center py-20"><div className="loader" /></div>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-500">User</th>
                <th className="text-left py-3 px-4 text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 text-gray-500">Gender</th>
                <th className="text-left py-3 px-4 text-gray-500">Joined</th>
                <th className="text-left py-3 px-4 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'P')}&background=5f6fff&color=fff&size=80`;
                        }}
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{user.phone || '—'}</td>
                  <td className="py-3 px-4">{user.gender}</td>
                  <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-700 p-1">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center py-10 text-gray-500">No users found</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
