import { useState, useContext, useRef } from 'react';
import DoctorLayout from './DoctorLayout';
import { AppContext } from '../../context/AppContext';
import { FiEdit2, FiSave, FiCamera, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const { user, setUser } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    fees: user?.fees || '',
    about: user?.about || '',
    available: user?.available ?? true,
    addressLine1: user?.address?.line1 || '',
    addressLine2: user?.address?.line2 || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Send as JSON (not FormData) so booleans are preserved
      const { data } = await api.put('/doctors/profile/me', {
        name: form.name,
        phone: form.phone,
        fees: Number(form.fees),
        about: form.about,
        available: form.available,
        address: { line1: form.addressLine1, line2: form.addressLine2 }
      });
      if (data.success) {
        setUser({ ...data.doctor, role: 'doctor' });
        setEditing(false);
        toast.success('Profile updated successfully!');
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
      fees: user?.fees || '',
      about: user?.about || '',
      available: user?.available ?? true,
      addressLine1: user?.address?.line1 || '',
      addressLine2: user?.address?.line2 || ''
    });
    setEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.put('/doctors/profile/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setUser({ ...data.doctor, role: 'doctor' });
        toast.success('Photo updated!');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  return (
    <DoctorLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
            <FiEdit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      <div className="dashboard-card max-w-3xl">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b">
          <div className="relative">
            <img
              src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'D')}&background=5f6fff&color=fff&size=200`}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'D')}&background=5f6fff&color=fff&size=200`;
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
            <p className="text-gray-500">{user?.specialization}</p>
            <p className="text-gray-400 text-sm">{user?.degree} · {user?.experience}</p>
            <span className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              user?.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${user?.available ? 'bg-green-500' : 'bg-gray-400'}`} />
              {user?.available ? 'Available' : 'Not Available'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', name: 'name', type: 'text' },
            { label: 'Phone', name: 'phone', type: 'tel' },
            { label: 'Consultation Fees (₹)', name: 'fees', type: 'number' },
            { label: 'Address Line 1', name: 'addressLine1', type: 'text' },
            { label: 'Address Line 2', name: 'addressLine2', type: 'text' }
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

          <div className="flex items-center gap-3 mt-2">
            <div
              onClick={() => editing && setForm({ ...form, available: !form.available })}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                form.available ? 'bg-primary' : 'bg-gray-300'
              } ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                form.available ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </div>
            <label className="text-sm font-medium text-gray-700">
              Available for appointments
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
          <textarea
            name="about"
            value={form.about}
            onChange={handleChange}
            disabled={!editing}
            rows={4}
            className={`input-field ${!editing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
            placeholder="Brief description about yourself..."
          />
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
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;
