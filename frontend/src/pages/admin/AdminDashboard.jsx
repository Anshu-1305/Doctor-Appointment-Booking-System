import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FiCalendar, FiDollarSign, FiUserCheck, FiUsers } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
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
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      if (data.success) {
        setStats(data.stats);
        setRecentAppointments(data.recentAppointments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats ? [
    { name: 'Total', value: stats.totalAppointments },
    { name: 'Completed', value: stats.completedAppointments },
    { name: 'Pending', value: stats.pendingAppointments },
    { name: 'Cancelled', value: stats.cancelledAppointments }
  ] : [];

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64"><div className="loader" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={FiUsers} label="Total Patients" value={stats?.totalUsers || 0} color="bg-blue-500" delay={0} />
        <StatCard icon={FiUserCheck} label="Total Doctors" value={stats?.totalDoctors || 0} color="bg-green-500" delay={0.1} />
        <StatCard icon={FiCalendar} label="Appointments" value={stats?.totalAppointments || 0} color="bg-purple-500" delay={0.2} />
        <StatCard icon={FiDollarSign} label="Revenue" value={`Rs.${stats?.totalRevenue || 0}`} color="bg-orange-500" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold mb-4">Appointment Statistics</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#5f6fff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            {[
              { label: 'Completed Appointments', value: stats?.completedAppointments, color: 'bg-green-500' },
              { label: 'Pending Appointments', value: stats?.pendingAppointments, color: 'bg-yellow-500' },
              { label: 'Cancelled Appointments', value: stats?.cancelledAppointments, color: 'bg-red-500' },
              { label: 'Online Revenue', value: `Rs.${stats?.onlineRevenue || 0}`, color: 'bg-blue-500' },
              { label: 'Cash Revenue', value: `Rs.${stats?.cashRevenue || 0}`, color: 'bg-emerald-500' }
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-gray-600">{label}</span>
                </div>
                <span className="font-semibold">{value || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-gray-500">Patient</th>
                <th className="text-left py-3 px-2 text-gray-500">Doctor</th>
                <th className="text-left py-3 px-2 text-gray-500">Date</th>
                <th className="text-left py-3 px-2 text-gray-500">Status</th>
                <th className="text-left py-3 px-2 text-gray-500">Payment</th>
                <th className="text-left py-3 px-2 text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map((apt) => (
                <tr key={apt._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">{apt.userData?.name}</td>
                  <td className="py-3 px-2">{apt.docData?.name}</td>
                  <td className="py-3 px-2">{apt.slotDate}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">{apt.paymentLabel || (apt.payment ? 'Paid' : 'Unpaid')}</td>
                  <td className="py-3 px-2">Rs.{apt.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
