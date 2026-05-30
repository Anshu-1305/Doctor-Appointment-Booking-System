import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiStar } from 'react-icons/fi';
import api from '../services/api';

const SPECIALTIES = [
  'All', 'General Physician', 'Gynecologist', 'Dermatologist',
  'Pediatricians', 'Neurologist', 'Gastroenterologist',
  'Cardiologist', 'Orthopedic', 'Psychiatrist', 'Dentist'
];

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState(
    searchParams.get('specialization') || 'All'
  );

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSpec !== 'All') params.specialization = selectedSpec;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/doctors', { params });
      if (data.success) setDoctors(data.doctors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSpec, search]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { fetchDoctors(); }, 400);
    return () => clearTimeout(timer);
  }, [fetchDoctors]);

  const handleSpecChange = (spec) => {
    setSelectedSpec(spec);
    if (spec !== 'All') {
      setSearchParams({ specialization: spec });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
        <p className="text-gray-500">Browse through our extensive list of trusted doctors.</p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-lg">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Specialization</h3>
          <div className="space-y-1">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecChange(spec)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                  selectedSpec === spec
                    ? 'bg-primary text-white font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse p-0 overflow-hidden">
                  <div className="w-full h-48 bg-gray-200" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FiSearch size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-xl font-medium">No doctors found</p>
              <p className="text-sm mt-1">Try a different search or specialization</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor, i) => (
                  <motion.div
                    key={doctor._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={`/doctors/${doctor._id}`}
                      className="card block hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden p-0"
                    >
                      <div className="bg-blue-50 h-48 overflow-hidden">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=5f6fff&color=fff&size=200`;
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className={`text-xs font-medium ${doctor.available ? 'text-green-600' : 'text-gray-500'}`}>
                              {doctor.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500 text-xs">
                            <FiStar size={12} />
                            <span>{doctor.rating > 0 ? doctor.rating.toFixed(1) : '4.5'}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-gray-500 text-sm mt-0.5">{doctor.specialization}</p>
                        <p className="text-primary font-semibold text-sm mt-2">₹{doctor.fees} / visit</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
