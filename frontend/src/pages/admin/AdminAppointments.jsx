import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      if (data.success) setAppointments(data.appointments);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
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

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success('Status updated');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">All Appointments</h1>

      {loading ? (
        <div className="flex justify-center py-20"><div className="loader" /></div>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-500">#</th>
                <th className="text-left py-3 px-4 text-gray-500">Patient</th>
                <th className="text-left py-3 px-4 text-gray-500">Doctor</th>
                <th className="text-left py-3 px-4 text-gray-500">Date & Time</th>
                <th className="text-left py-3 px-4 text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 text-gray-500">Payment</th>
                <th className="text-left py-3 px-4 text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, i) => (
                <tr key={apt._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{apt.userData?.name}</p>
                      <p className="text-gray-500 text-xs">{apt.userData?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{apt.docData?.name}</p>
                      <p className="text-gray-500 text-xs">{apt.docData?.specialization}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p>{apt.slotDate}</p>
                    <p className="text-gray-500 text-xs">{apt.slotTime}</p>
                  </td>
                  <td className="py-3 px-4">₹{apt.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${apt.payment ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {apt.payment ? (apt.paymentLabel || 'Paid') : 'Unpaid'}
                    </span>
                    {apt.bookedBy === 'registration' && (
                      <p className="text-xs text-gray-500 mt-1">Registration office</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[apt.status]}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {!apt.cancelled && !apt.isCompleted && (
                      <button
                        onClick={() => handleCancel(apt._id)}
                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <p className="text-center py-10 text-gray-500">No appointments found</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAppointments;
