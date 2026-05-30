import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const { login, loading, token, user, role: storedRole, authLoading } = useContext(AppContext);
  const navigate = useNavigate();

  const getRedirectPath = (userRole) => {
    const redirectMap = {
      admin: '/admin/dashboard',
      registration: '/registration/dashboard',
      doctor: '/doctor/dashboard',
      patient: '/'
    };
    return redirectMap[userRole] || '/';
  };

  useEffect(() => {
    if (!authLoading && token) {
      navigate(getRedirectPath(user?.role || storedRole), { replace: true });
    }
  }, [authLoading, token, user?.role, storedRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password, role);
    if (result?.success) {
      navigate(getRedirectPath(result.role), { replace: true });
    }
  };

  if (authLoading || token) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign In to DocBook</h2>
          <p className="text-sm text-gray-600 mt-1">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex rounded-lg border border-gray-200 p-1 mb-6 bg-gray-50">
          {['patient', 'doctor', 'admin', 'registration'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-md capitalize text-sm font-medium transition-all ${
                role === r
                  ? 'bg-white text-primary shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r === 'registration' ? 'Office' : r}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700 mb-2">Demo Credentials:</p>
          <p>Office: <span className="font-mono">registration@docbook.com</span> / <span className="font-mono">Office@123</span></p>
          <p>🔑 Admin: <span className="font-mono">admin@docbook.com</span> / <span className="font-mono">Admin@123</span></p>
          <p>👨‍⚕️ Doctor: <span className="font-mono">sarah.johnson@docbook.com</span> / <span className="font-mono">password123</span></p>
          <p>🧑 Patient: Register a new account at /register</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
