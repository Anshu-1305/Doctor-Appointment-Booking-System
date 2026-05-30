import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { FiGrid, FiCalendar, FiDollarSign, FiUser, FiLogOut, FiMenu, FiHome } from 'react-icons/fi';

const navItems = [
  { path: '/doctor/dashboard', icon: FiGrid, label: 'Dashboard' },
  { path: '/doctor/appointments', icon: FiCalendar, label: 'Appointments' },
  { path: '/doctor/earnings', icon: FiDollarSign, label: 'Earnings' },
  { path: '/doctor/profile', icon: FiUser, label: 'Profile' }
];

const DoctorLayout = ({ children }) => {
  const { user, logout } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">D</span>
          </div>
          <div>
            <span className="text-lg font-bold text-primary">DocBook</span>
            <p className="text-xs text-gray-400">Doctor Panel</p>
          </div>
        </Link>
      </div>

      {user && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'D')}&background=5f6fff&color=fff&size=80`}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'D')}&background=5f6fff&color=fff&size=80`;
              }}
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.specialization}</p>
              <span className={`inline-flex items-center gap-1 text-xs mt-0.5 ${user.available ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${user.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                {user.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-all text-sm"
        >
          <FiHome size={18} />
          <span>Back to Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-all text-sm"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between lg:hidden border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <FiMenu size={20} />
          </button>
          <span className="font-bold text-primary">Doctor Panel</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
