import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'registration') return '/registration/dashboard';
    if (user?.role === 'doctor') return '/doctor/dashboard';
    return '/my-appointments';
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}`;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-primary">DocBook</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/doctors" className={navLinkClass}>Doctors</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=5f6fff&color=fff`}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-primary/30"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiUser size={15} /> Dashboard
                      </Link>
                      {user.role === 'patient' && (
                        <Link
                          to="/my-profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowDropdown(false)}
                        >
                          <FiCalendar size={15} /> My Profile
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FiLogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden text-gray-600 focus:outline-none p-1"
          >
            {showMenu ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/doctors', label: 'Doctors' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' }
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="block text-gray-700 hover:text-primary font-medium"
                  onClick={() => setShowMenu(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="border-t pt-3">
                {user ? (
                  <>
                    <Link
                      to={getDashboardLink()}
                      className="block text-gray-700 hover:text-primary font-medium mb-2"
                      onClick={() => setShowMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setShowMenu(false); }}
                      className="block text-red-600 font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" className="btn-secondary text-sm py-2 px-4" onClick={() => setShowMenu(false)}>Login</Link>
                    <Link to="/register" className="btn-primary text-sm py-2 px-4" onClick={() => setShowMenu(false)}>Register</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
