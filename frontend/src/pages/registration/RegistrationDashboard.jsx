import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiLogOut, FiRefreshCw, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';

const initialForm = {
  patientName: '',
  patientPhone: '',
  patientEmail: '',
  patientGender: 'Other',
  patientDob: '',
  patientAddress: '',
  docId: '',
  slotDate: '',
  slotTime: ''
};

const RegistrationDashboard = () => {
  const { logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorRes, appointmentRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/appointments')
      ]);

      if (doctorRes.data.success) setDoctors(doctorRes.data.doctors);
      if (appointmentRes.data.success) setAppointments(appointmentRes.data.appointments);
    } catch (err) {
      toast.error('Failed to load registration office data');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find((doctor) => doctor._id === form.docId);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { data } = await api.post('/appointments/registration', form);
      if (data.success) {
        toast.success('Cash appointment booked');
        setForm(initialForm);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cashAppointments = appointments.filter((apt) => apt.bookedBy === 'registration' && !apt.cancelled);
  const cashTotal = cashAppointments.reduce((sum, apt) => sum + (apt.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registration Office</h1>
            <p className="text-sm text-gray-500">Book appointments and collect cash for walk-in patients</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 py-2 px-4">
            <FiLogOut /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="dashboard-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center">
              <FiCalendar size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cash Bookings</p>
              <p className="text-2xl font-bold">{cashAppointments.length}</p>
            </div>
          </div>
          <div className="dashboard-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center">
              <FiDollarSign size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cash Collected</p>
              <p className="text-2xl font-bold">Rs.{cashTotal}</p>
            </div>
          </div>
          <button onClick={fetchData} className="dashboard-card flex items-center gap-4 text-left hover:border-primary">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
              <FiRefreshCw size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Refresh</p>
              <p className="text-lg font-semibold">Latest appointments</p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="dashboard-card lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FiUserPlus className="text-primary" />
              <h2 className="text-lg font-semibold">Walk-in Booking</h2>
            </div>

            <input className="input-field" required placeholder="Patient name" value={form.patientName} onChange={(e) => updateForm('patientName', e.target.value)} />
            <input className="input-field" required placeholder="Phone number" value={form.patientPhone} onChange={(e) => updateForm('patientPhone', e.target.value)} />
            <input className="input-field" type="email" placeholder="Email optional" value={form.patientEmail} onChange={(e) => updateForm('patientEmail', e.target.value)} />
            <select className="input-field" value={form.patientGender} onChange={(e) => updateForm('patientGender', e.target.value)}>
              <option>Other</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            <input className="input-field" type="date" value={form.patientDob} onChange={(e) => updateForm('patientDob', e.target.value)} />
            <textarea className="input-field min-h-24" placeholder="Address optional" value={form.patientAddress} onChange={(e) => updateForm('patientAddress', e.target.value)} />

            <select className="input-field" required value={form.docId} onChange={(e) => updateForm('docId', e.target.value)}>
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization} - Rs.{doctor.fees}
                </option>
              ))}
            </select>
            <input className="input-field" required type="date" value={form.slotDate} onChange={(e) => updateForm('slotDate', e.target.value)} />
            <input className="input-field" required type="time" value={form.slotTime} onChange={(e) => updateForm('slotTime', e.target.value)} />

            <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-sm text-green-800">
              Cash to collect: <span className="font-bold">Rs.{selectedDoctor?.fees || 0}</span>
            </div>

            <button type="submit" disabled={submitting} className="w-full btn-primary disabled:opacity-50">
              {submitting ? 'Booking...' : 'Book and Mark Cash Paid'}
            </button>
          </form>

          <div className="dashboard-card lg:col-span-2 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">Recent Office Bookings</h2>
            {loading ? (
              <div className="flex justify-center py-20"><div className="loader" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-gray-500">Patient</th>
                    <th className="text-left py-3 px-2 text-gray-500">Doctor</th>
                    <th className="text-left py-3 px-2 text-gray-500">Date</th>
                    <th className="text-left py-3 px-2 text-gray-500">Amount</th>
                    <th className="text-left py-3 px-2 text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cashAppointments.slice(0, 12).map((apt) => (
                    <tr key={apt._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <p className="font-medium">{apt.userData?.name}</p>
                        <p className="text-xs text-gray-500">{apt.userData?.phone}</p>
                      </td>
                      <td className="py-3 px-2">{apt.docData?.name}</td>
                      <td className="py-3 px-2">{apt.slotDate} {apt.slotTime}</td>
                      <td className="py-3 px-2 font-medium">Rs.{apt.amount}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Cash paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && cashAppointments.length === 0 && (
              <p className="text-center py-10 text-gray-500">No office bookings yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationDashboard;
