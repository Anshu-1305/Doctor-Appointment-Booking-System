import { useEffect, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/doctor-appointments');
      if (data.success) setAppointments(data.appointments);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/appointments/${id}/complete`);
      toast.success('Appointment marked as completed');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  return (
    <DoctorLayout>
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      {loading ? (
        <div className="flex justify-center py-20"><div className="loader" /></div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No appointments yet</div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt._id} className="dashboard-card flex flex-col md:flex-row gap-4 items-start md:items-center">
              <img
                src={apt.userData?.image || 'https://via.placeholder.com/60'}
                alt={apt.userData?.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{apt.userData?.name}</h3>
                <p className="text-gray-500 text-sm">{apt.userData?.email}</p>
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                  <span>📅 {apt.slotDate}</span>
                  <span>🕐 {apt.slotTime}</span>
                  <span className="text-primary font-medium">₹{apt.amount}</span>
                  <span className={apt.payment ? 'text-green-600' : 'text-red-500'}>
                    {apt.payment ? '✓ Paid' : '✗ Unpaid'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {!apt.isCompleted && !apt.cancelled && (
                  <>
                    <button
                      onClick={() => handleComplete(apt._id)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100"
                    >
                      <FiCheckCircle /> Complete
                    </button>
                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                    >
                      <FiX /> Cancel
                    </button>
                  </>
                )}
                {apt.isCompleted && <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">Completed</span>}
                {apt.cancelled && <span className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm">Cancelled</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </DoctorLayout>
  );
};

export default DoctorAppointments;
