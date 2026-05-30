import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiActivity,
  FiCalendar,
  FiClock,
  FiDroplet,
  FiHeart,
  FiShield,
  FiSmile,
  FiUser,
  FiUsers,
  FiZap,
  FiArrowRight
} from 'react-icons/fi';

const SPECIALTIES = [
  { name: 'General Physician', emoji: '🩺' },
  { name: 'Gynecologist', emoji: '👩‍⚕️' },
  { name: 'Dermatologist', emoji: '🧴' },
  { name: 'Pediatricians', emoji: '👶' },
  { name: 'Neurologist', emoji: '🧠' },
  { name: 'Gastroenterologist', emoji: '🫀' }
];

const SPECIALTY_ICONS = {
  'General Physician': FiActivity,
  Gynecologist: FiUser,
  Dermatologist: FiDroplet,
  Pediatricians: FiSmile,
  Neurologist: FiZap,
  Gastroenterologist: FiHeart
};

const FEATURES = [
  { icon: FiCalendar, title: 'Easy Booking', desc: 'Book appointments in just a few clicks with real-time slot availability' },
  { icon: FiUsers, title: 'Expert Doctors', desc: 'Connect with verified, experienced healthcare professionals' },
  { icon: FiShield, title: 'Secure & Private', desc: 'Your health data is protected with enterprise-grade security' },
  { icon: FiClock, title: '24/7 Support', desc: 'Get help and manage appointments anytime, anywhere' }
];

const Home = () => {
  const { doctors, fetchDoctors } = useContext(AppContext);

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-blue-700 text-white py-20 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                🏥 Trusted by 10,000+ patients
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Book Appointment With <span className="text-yellow-300">Trusted Doctors</span>
              </h1>
              <p className="text-lg mb-8 text-blue-100">
                Browse through our extensive list of trusted doctors, schedule your appointment hassle-free and get the care you deserve.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/doctors"
                  className="bg-white text-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  Book Appointment <FiArrowRight />
                </Link>
                <Link
                  to="/about"
                  className="border border-white/40 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden md:block"
            >
              <img
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80"
                alt="Doctors"
                className="rounded-2xl shadow-2xl w-full object-cover"
                style={{ maxHeight: '420px' }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Find by Speciality</h2>
          <p className="text-gray-500">Simply browse through our extensive list of trusted doctors.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SPECIALTIES.map((spec, i) => {
            const Icon = SPECIALTY_ICONS[spec.name];

            return (
              <motion.div
                key={spec.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/doctors?specialization=${encodeURIComponent(spec.name)}`}
                  className="card min-h-36 flex flex-col items-center justify-center text-center hover:border-primary hover:border-2 border-2 border-transparent transition-all group"
                >
                  <span className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon size={26} />
                  </span>
                  <p className="font-medium text-gray-700 text-sm leading-snug group-hover:text-primary transition-colors">{spec.name}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Top Doctors */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Top Doctors to Book</h2>
            <p className="text-gray-500">Simply browse through our extensive list of trusted doctors.</p>
          </div>
          {doctors.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {doctors.slice(0, 8).map((doctor, i) => (
                <motion.div
                  key={doctor._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/doctors/${doctor._id}`}
                    className="card block hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden p-0"
                  >
                    <div className="bg-blue-50 h-48 overflow-hidden">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=5f6fff&color=fff&size=200`;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <div className={`w-2 h-2 rounded-full mr-2 ${doctor.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className={`text-xs font-medium ${doctor.available ? 'text-green-600' : 'text-gray-500'}`}>
                          {doctor.available ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{doctor.specialization}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/doctors" className="btn-primary inline-flex items-center gap-2">
              View All Doctors <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Why Choose DocBook</h2>
          <p className="text-gray-500">We provide the best healthcare booking experience.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Appointment?</h2>
          <p className="text-blue-100 mb-8">Join thousands of patients who trust DocBook for their healthcare needs.</p>
          <Link to="/register" className="bg-white text-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition inline-block">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
