import { motion } from 'framer-motion';

const About = () => (
  <div className="max-w-5xl mx-auto px-4 py-16">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-4xl font-bold text-center mb-4">About DocBook</h1>
      <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
        We are committed to making healthcare accessible and convenient for everyone.
      </p>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600"
          alt="About"
          className="rounded-2xl shadow-lg"
        />
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            DocBook was founded with a simple mission: to make quality healthcare accessible to everyone.
            We connect patients with the best doctors in their area, making it easy to book appointments
            and manage healthcare needs.
          </p>
          <p className="text-gray-600">
            Our platform features hundreds of verified doctors across multiple specializations,
            ensuring you always find the right specialist for your needs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {[
          { number: '500+', label: 'Verified Doctors' },
          { number: '10,000+', label: 'Happy Patients' },
          { number: '50+', label: 'Specializations' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
            <div className="text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default About;
