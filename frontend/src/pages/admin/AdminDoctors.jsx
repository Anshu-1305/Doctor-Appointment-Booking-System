import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlusCircle, FiSearch, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/doctors');
      if (data.success) setDoctors(data.doctors);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete Dr. ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const handleToggleAvailability = async (doctor) => {
    try {
      await api.put(`/doctors/${doctor._id}`, { available: !doctor.available });
      toast.success(`Dr. ${doctor.name} marked as ${!doctor.available ? 'available' : 'unavailable'}`);
      fetchDoctors();
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const navigate = useNavigate();

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Manage Doctors</h1>
        <Link to="/admin/add-doctor" className="btn-primary flex items-center gap-2 text-sm py-2 w-fit">
          <FiPlusCircle size={16} /> Add New Doctor
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10 py-2 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="loader" /></div>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">#</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Doctor</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Specialization</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Experience</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Fees</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Available</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doctor, i) => (
                <motion.tr
                  key={doctor._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=5f6fff&color=fff&size=40`;
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-gray-400 text-xs">{doctor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{doctor.specialization}</td>
                  <td className="py-3 px-4 text-gray-600">{doctor.experience}</td>
                  <td className="py-3 px-4 font-medium text-primary">₹{doctor.fees}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleAvailability(doctor)}
                      title={doctor.available ? 'Click to mark unavailable' : 'Click to mark available'}
                      className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                    >
                      {doctor.available ? (
                        <>
                          <FiToggleRight className="text-green-500" size={22} />
                          <span className="text-xs text-green-600 font-medium">Yes</span>
                        </>
                      ) : (
                        <>
                          <FiToggleLeft className="text-gray-400" size={22} />
                          <span className="text-xs text-gray-500">No</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/edit-doctor/${doctor._id}`)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit doctor"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(doctor._id, doctor.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete doctor"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium">No doctors found</p>
              <p className="text-sm mt-1">
                {search ? 'Try a different search term' : 'Add your first doctor to get started'}
              </p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDoctors;
