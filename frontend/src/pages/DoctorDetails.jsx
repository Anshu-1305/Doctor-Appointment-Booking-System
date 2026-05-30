import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { FiStar, FiMapPin, FiDollarSign, FiBriefcase } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const generateSlots = () => {
  const slots = [];
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const times = [];
    for (let h = 9; h <= 17; h++) {
      times.push(`${h.toString().padStart(2, '0')}:00`);
      times.push(`${h.toString().padStart(2, '0')}:30`);
    }
    slots.push({ date: dateStr, label: date.toDateString(), times });
  }
  return slots;
};

const DoctorDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booking, setBooking] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const slots = generateSlots();

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const { data } = await api.get(`/doctors/${id}`);
      if (data.success) setDoctor(data.doctor);
    } catch (err) {
      toast.error('Doctor not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!user) return navigate('/login');
    if (!selectedDate || !selectedTime) return toast.error('Please select a date and time');

    try {
      setBooking(true);
      const { data } = await api.post('/appointments', {
        docId: id,
        slotDate: selectedDate,
        slotTime: selectedTime
      });
      if (data.success) {
        toast.success('Appointment booked!');
        navigate('/my-appointments');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await api.post(`/doctors/${id}/reviews`, review);
      toast.success('Review submitted!');
      fetchDoctor();
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="loader" />
    </div>
  );

  if (!doctor) return <div className="text-center py-20">Doctor not found</div>;

  const bookedSlots = doctor.slots_booked || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Doctor Info */}
        <div className="card flex flex-col md:flex-row gap-8 mb-8">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-48 h-48 object-cover rounded-xl shrink-0"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=5f6fff&color=fff&size=240`;
            }}
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{doctor.name}</h1>
            <p className="text-gray-500 mb-3">{doctor.degree} — {doctor.specialization}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1"><FiBriefcase /> {doctor.experience} experience</span>
              <span className="flex items-center gap-1"><FiDollarSign /> ₹{doctor.fees} per visit</span>
              <span className="flex items-center gap-1">
                <FiStar className="text-yellow-500" /> {doctor.rating?.toFixed(1) || '4.5'} ({doctor.reviews?.length || 0} reviews)
              </span>
            </div>
            {doctor.address?.line1 && (
              <p className="flex items-center gap-1 text-gray-600 text-sm mb-4">
                <FiMapPin /> {doctor.address.line1}, {doctor.address.line2}
              </p>
            )}
            <p className="text-gray-700">{doctor.about}</p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-6">Book an Appointment</h2>

          {/* Date Selection */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
            {slots.map((slot) => (
              <button
                key={slot.date}
                onClick={() => { setSelectedDate(slot.date); setSelectedTime(null); }}
                className={`shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  selectedDate === slot.date
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div>{slot.label.split(' ')[0]}</div>
                <div className="text-xs">{slot.label.split(' ').slice(1, 3).join(' ')}</div>
              </button>
            ))}
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="flex flex-wrap gap-3 mb-6">
              {slots.find(s => s.date === selectedDate)?.times.map((time) => {
                const isBooked = bookedSlots[selectedDate]?.includes(time);
                return (
                  <button
                    key={time}
                    disabled={isBooked}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isBooked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : selectedTime === time
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={handleBook}
            disabled={booking || !selectedDate || !selectedTime}
            className="btn-primary disabled:opacity-50"
          >
            {booking ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>

        {/* Reviews */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-6">Patient Reviews</h2>
          {doctor.reviews?.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {doctor.reviews?.map((r, i) => (
                <div key={i} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{r.name}</span>
                    <div className="flex text-yellow-500">
                      {[...Array(r.rating)].map((_, j) => <FiStar key={j} />)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {user && user.role === 'patient' && (
            <form onSubmit={handleReview} className="mt-6 space-y-3">
              <h3 className="font-semibold">Leave a Review</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReview({ ...review, rating: n })}
                    className={`text-2xl ${n <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Write your review..."
                required
              />
              <button type="submit" className="btn-primary">Submit Review</button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorDetails;
