import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-2xl font-bold">DocBook</span>
            </div>
            <p className="text-gray-400">
              Your trusted platform for booking appointments with top healthcare professionals.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link to="/doctors" className="text-gray-400 hover:text-white transition">Doctors</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Specialties</h3>
            <ul className="space-y-2 text-gray-400">
              <li>General Physician</li>
              <li>Gynecologist</li>
              <li>Dermatologist</li>
              <li>Pediatricians</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiFacebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiTwitter size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiInstagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 DocBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
