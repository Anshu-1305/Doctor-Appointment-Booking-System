import { useEffect, useState, useContext } from 'react';
import DoctorLayout from './DoctorLayout';
import { AppContext } from '../../context/AppContext';
import { FiCalendar, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';
import { motion } from 'framer-motion';

const DoctorDashboard = () => {
  const { user } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/doctor-appointments');
      if (data.success) setAppointments(data.appointments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.isCompleted).length,
    pending: appointments.filter(a => a.status === 'pending').length,
    earnings: appointments.filter(a => a.payment && !a.cancelled).reduce((sum, a) => sum + a.amount, 0)
  };

  const statCards = [
    { icon: FiCalendar, label: 'Total Appointments', value: stats.total, color: 'bg-blue-500' },
    { icon: FiCheckCircle, label: 'Completed', value: stats.completed, color: 'bg-green-500' },
    { icon: FiClock, label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
    { icon: FiDollarSign, label: 'Total Earnings', value: `₹${stats.earnings}`, color: 'bg-purple-500' }
  ];

  return (
    <DoctorLayout>
      <h1 className="text-2xl font-bold mb-6">Welcome, Dr. {user?.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="dashboard-card flex items-center gap-4"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="text-white" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
        {loading ? (
          <div className="flex justify-center py-10"><div className="loader" /></div>
        ) : appointments.length === 0 ? (
          <p className="text-center py-10 text-gray-500">No appointments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-gray-500">Patient</th>
                  <th className="text-left py-3 px-2 text-gray-500">Date</th>
                  <th className="text-left py-3 px-2 text-gray-500">Time</th>
                  <th className="text-left py-3 px-2 text-gray-500">Amount</th>
                  <th className="text-left py-3 px-2 text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((apt) => (
                  <tr key={apt._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <img src={apt.userData?.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <span>{apt.userData?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">{apt.slotDate}</td>
                    <td className="py-3 px-2">{apt.slotTime}</td>
                    <td className="py-3 px-2">₹{apt.amount}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        apt.isCompleted ? 'bg-green-100 text-green-700' :
                        apt.cancelled ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {apt.isCompleted ? 'Completed' : apt.cancelled ? 'Cancelled' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
