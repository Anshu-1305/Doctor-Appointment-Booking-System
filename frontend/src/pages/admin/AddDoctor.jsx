import { useState } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiUser } from 'react-icons/fi';

const SPECIALTIES = [
  'General Physician', 'Gynecologist', 'Dermatologist', 'Pediatricians',
  'Neurologist', 'Gastroenterologist', 'Cardiologist', 'Orthopedic', 'Psychiatrist', 'Dentist'
];

const AddDoctor = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: 'General Physician',
    degree: '', experience: '', about: '', fees: '',
    addressLine1: '', addressLine2: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone || !form.fees) {
      return toast.error('Please fill all required fields');
    }

    try {
      setLoading(true);
      const formData = new FormData();

      // Append all text fields
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('phone', form.phone);
      formData.append('specialization', form.specialization);
      formData.append('degree', form.degree);
      formData.append('experience', form.experience);
      formData.append('about', form.about);
      formData.append('fees', form.fees);
      formData.append('addressLine1', form.addressLine1);
      formData.append('addressLine2', form.addressLine2);

      if (image) formData.append('image', image);

      const { data } = await api.post('/doctors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        toast.success('Doctor added successfully!');
        navigate('/admin/doctors');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Doctor</h1>
        <button onClick={() => navigate('/admin/doctors')} className="btn-secondary text-sm py-2">
          ← Back to Doctors
        </button>
      </div>

      <form onSubmit={handleSubmit} className="dashboard-card max-w-3xl">
        {/* Image Upload */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b">
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <FiUser className="text-gray-400 mx-auto mb-1" size={24} />
                <span className="text-xs text-gray-400">Photo</span>
              </div>
            )}
          </div>
          <div>
            <label className="btn-secondary cursor-pointer text-sm inline-flex items-center gap-2">
              <FiUpload size={14} /> Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 5MB (optional)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" name="name" required value={form.name} onChange={handleChange} className="input-field" placeholder="Dr. John Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} className="input-field" placeholder="doctor@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input type="password" name="password" required value={form.password} onChange={handleChange} className="input-field" placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input type="tel" name="phone" required value={form.phone} onChange={handleChange} className="input-field" placeholder="+1-555-0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
            <select name="specialization" value={form.specialization} onChange={handleChange} className="input-field">
              {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
            <input type="text" name="degree" required value={form.degree} onChange={handleChange} className="input-field" placeholder="MBBS, MD" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
            <input type="text" name="experience" required value={form.experience} onChange={handleChange} className="input-field" placeholder="5 Years" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fees (₹) *</label>
            <input type="number" name="fees" required min="0" value={form.fees} onChange={handleChange} className="input-field" placeholder="500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input type="text" name="addressLine1" value={form.addressLine1} onChange={handleChange} className="input-field" placeholder="123 Medical Center Dr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input type="text" name="addressLine2" value={form.addressLine2} onChange={handleChange} className="input-field" placeholder="City, State" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">About Doctor</label>
          <textarea
            name="about"
            value={form.about}
            onChange={handleChange}
            rows={4}
            className="input-field"
            placeholder="Brief description about the doctor's expertise and experience..."
          />
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50 flex items-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Adding Doctor...
              </>
            ) : 'Add Doctor'}
          </button>
          <button type="button" onClick={() => navigate('/admin/doctors')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AddDoctor;
