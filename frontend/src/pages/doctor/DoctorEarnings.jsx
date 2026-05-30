import { useEffect, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const DoctorEarnings = () => {
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

  const paidAppointments = appointments.filter(a => a.payment && !a.cancelled);
  const cashAppointments = paidAppointments.filter(a => a.paymentMethod === 'cash');
  const totalEarnings = paidAppointments.reduce((sum, a) => sum + a.amount, 0);
  const cashEarnings = cashAppointments.reduce((sum, a) => sum + a.amount, 0);

  const monthlyData = paidAppointments.reduce((acc, apt) => {
    const month = new Date(apt.createdAt).toLocaleString('default', { month: 'short' });
    const existing = acc.find(d => d.month === month);
    if (existing) existing.earnings += apt.amount;
    else acc.push({ month, earnings: apt.amount });
    return acc;
  }, []);

  return (
    <DoctorLayout>
      <h1 className="text-2xl font-bold mb-6">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card text-center">
          <p className="text-gray-500 text-sm mb-1">Total Paid Earnings</p>
          <p className="text-3xl font-bold text-primary">Rs.{totalEarnings}</p>
        </div>
        <div className="dashboard-card text-center">
          <p className="text-gray-500 text-sm mb-1">Paid Appointments</p>
          <p className="text-3xl font-bold text-green-600">{paidAppointments.length}</p>
        </div>
        <div className="dashboard-card text-center">
          <p className="text-gray-500 text-sm mb-1">Cash From Office</p>
          <p className="text-3xl font-bold text-purple-600">Rs.{cashEarnings}</p>
        </div>
      </div>

      <div className="dashboard-card mb-8">
        <h2 className="text-lg font-semibold mb-4">Monthly Earnings</h2>
        {loading ? (
          <div className="flex justify-center py-10"><div className="loader" /></div>
        ) : monthlyData.length === 0 ? (
          <p className="text-center py-10 text-gray-500">No earnings data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5f6fff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5f6fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => [`Rs.${v}`, 'Earnings']} />
              <Area type="monotone" dataKey="earnings" stroke="#5f6fff" fill="url(#earningsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Earnings History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-gray-500">Patient</th>
                <th className="text-left py-3 px-2 text-gray-500">Date</th>
                <th className="text-left py-3 px-2 text-gray-500">Amount</th>
                <th className="text-left py-3 px-2 text-gray-500">Payment</th>
              </tr>
            </thead>
            <tbody>
              {paidAppointments.map((apt) => (
                <tr key={apt._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">{apt.userData?.name}</td>
                  <td className="py-3 px-2">{apt.slotDate}</td>
                  <td className="py-3 px-2 font-medium text-primary">Rs.{apt.amount}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      apt.paymentMethod === 'cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {apt.paymentLabel || 'Paid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paidAppointments.length === 0 && <p className="text-center py-10 text-gray-500">No paid appointments</p>}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorEarnings;
