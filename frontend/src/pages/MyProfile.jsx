import { useState, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { FiEdit2, FiSave, FiCamera, FiX } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const MyProfile = () => {
  const { user, setUser } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    gender: user?.gender || 'Male',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.put('/users/profile', form);
      if (data.success) {
        setUser({ ...data.user, role: 'patient' });
        setEditing(false);
        toast.success('Profile updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      gender: user?.gender || 'Male',
      dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
    });
    setEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setUser({ ...data.user, role: 'patient' });
        toast.success('Profile photo updated!');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
            <FiEdit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b">
          <div className="relative">
            <img
              src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=5f6fff&color=fff&size=200`}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=5f6fff&color=fff&size=200`;
              }}
            />
            <button
              onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 shadow-md"
            >
              <FiCamera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', name: 'name', type: 'text' },
            { label: 'Phone', name: 'phone', type: 'tel' },
            { label: 'Date of Birth', name: 'dob', type: 'date' },
            { label: 'Address', name: 'address', type: 'text' }
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                disabled={!editing}
                className={`input-field ${!editing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={!editing}
              className={`input-field ${!editing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        {editing && (
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <FiSave size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={handleCancel} className="btn-secondary flex items-center gap-2">
              <FiX size={14} /> Cancel
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyProfile;
