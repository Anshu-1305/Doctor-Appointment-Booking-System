import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import {
  FiGrid, FiUsers, FiUserCheck, FiCalendar,
  FiPlusCircle, FiLogOut, FiMenu, FiX, FiHome
} from 'react-icons/fi';

const navItems = [
  { path: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
  { path: '/admin/doctors', icon: FiUserCheck, label: 'Doctors' },
  { path: '/admin/users', icon: FiUsers, label: 'Users' },
  { path: '/admin/appointments', icon: FiCalendar, label: 'Appointments' },
  { path: '/admin/add-doctor', icon: FiPlusCircle, label: 'Add Doctor' }
];

const AdminLayout = ({ children }) => {
  const { logout } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-5 border-b border-slate-700">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">D</span>
          </div>
          <div>
            <span className="text-lg font-bold text-white">DocBook</span>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </Link>
      </div>

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
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm"
        >
          <FiHome size={18} />
          <span>Back to Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-900/40 hover:text-red-400 w-full transition-all text-sm"
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
          <span className="font-bold text-primary">Admin Panel</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
