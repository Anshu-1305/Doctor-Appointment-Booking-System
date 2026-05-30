import { motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCalendar, FiCheckCircle, FiClock, FiCreditCard, FiX } from 'react-icons/fi';
import PaymentModal from '../components/PaymentModal';
import { AppContext } from '../context/AppContext';
import api from '../services/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

const MyAppointments = () => {
  const { user } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentAppointment, setPaymentAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/my-appointments');
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
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="loader" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

      {appointments.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FiCalendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl">No appointments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt, i) => (
            <motion.div
              key={apt._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card flex flex-col md:flex-row gap-4 items-start md:items-center"
            >
              <img
                src={apt.docData?.image || 'https://via.placeholder.com/80'}
                alt={apt.docData?.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{apt.docData?.name}</h3>
                <p className="text-gray-500 text-sm">{apt.docData?.specialization}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FiCalendar /> {apt.slotDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock /> {apt.slotTime}
                  </span>
                  <span className="font-medium text-primary">₹{apt.amount}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                  {apt.status}
                </span>
                <div className="flex gap-2">
                  {!apt.payment && apt.status !== 'cancelled' && apt.status !== 'completed' && (
                    <button
                      onClick={() => setPaymentAppointment(apt)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
                    >
                      <FiCreditCard /> Pay
                    </button>
                  )}
                  {apt.payment && (
                    <div className="text-sm text-green-600">
                      <div className="flex items-center gap-1">
                        <FiCheckCircle /> {apt.paymentLabel || 'Paid'}
                      </div>
                      {apt.transactionNo && (
                        <div className="text-xs text-gray-600 mt-1">
                          Transaction No: <span className="font-medium">{apt.transactionNo}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                    >
                      <FiX /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {paymentAppointment && (
        <PaymentModal
          appointment={paymentAppointment}
          onClose={() => setPaymentAppointment(null)}
          onSuccess={() => { setPaymentAppointment(null); fetchAppointments(); }}
        />
      )}
    </div>
  );
};

export default MyAppointments;
