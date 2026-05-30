import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave, FiUpload, FiUser } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const SPECIALTIES = [
  'General Physician', 'Gynecologist', 'Dermatologist', 'Pediatricians',
  'Neurologist', 'Gastroenterologist', 'Cardiologist', 'Orthopedic', 'Psychiatrist', 'Dentist'
];

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', specialization: 'General Physician',
    degree: '', experience: '', about: '', fees: '',
    addressLine1: '', addressLine2: '', available: true
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/doctors/${id}`);
        if (data.success) {
          const doctor = data.doctor;
          setForm({
            name: doctor.name || '',
            email: doctor.email || '',
            phone: doctor.phone || '',
            specialization: doctor.specialization || 'General Physician',
            degree: doctor.degree || '',
            experience: doctor.experience || '',
            about: doctor.about || '',
            fees: doctor.fees || '',
            addressLine1: doctor.address?.line1 || '',
            addressLine2: doctor.address?.line2 || '',
            available: doctor.available ?? true
          });
          setPreview(doctor.image || null);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load doctor');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.fees) {
      return toast.error('Please fill all required fields');
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('specialization', form.specialization);
      formData.append('degree', form.degree);
      formData.append('experience', form.experience);
      formData.append('about', form.about);
      formData.append('fees', form.fees);
      formData.append('available', form.available);
      formData.append('addressLine1', form.addressLine1);
      formData.append('addressLine2', form.addressLine2);
      if (image) formData.append('image', image);

      const { data } = await api.put(`/doctors/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        toast.success('Doctor details updated successfully!');
        navigate('/admin/doctors');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Doctor</h1>
        <button onClick={() => navigate('/admin/doctors')} className="btn-secondary text-sm py-2 flex items-center gap-2">
          <FiArrowLeft size={16} /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="dashboard-card max-w-3xl">
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
              <FiUpload size={14} /> Change Photo
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input type="text" name="addressLine1" value={form.addressLine1} onChange={handleChange} className="input-field" placeholder="123 Medical Center Dr" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input type="text" name="addressLine2" value={form.addressLine2} onChange={handleChange} className="input-field" placeholder="City, State" />
          </div>
          <div className="md:col-span-2 flex items-center gap-3 mt-2">
            <input id="available" type="checkbox" name="available" checked={form.available} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">Available for appointments</label>
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
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 flex items-center gap-2">
            <FiSave size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/admin/doctors')} className="btn-secondary flex items-center gap-2">
            <FiArrowLeft size={14} /> Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EditDoctor;
