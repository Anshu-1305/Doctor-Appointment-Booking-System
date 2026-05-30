import { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // tracks initial auth check

  // Fetch profile on mount if token exists
  useEffect(() => {
    if (token) {
      fetchUserProfile(role);
    } else {
      setAuthLoading(false);
    }
  }, []); // only on mount

  const fetchUserProfile = useCallback(async (userRole) => {
    try {
      setAuthLoading(true);
      if (userRole === 'admin') {
        // Admin has no DB profile — reconstruct from stored data
        setUser({ id: 'admin', name: 'Admin', email: localStorage.getItem('adminEmail') || '', role: 'admin' });
        return;
      }
      if (userRole === 'registration') {
        setUser({
          id: 'registration-office',
          name: 'Registration Office',
          email: localStorage.getItem('registrationEmail') || '',
          role: 'registration'
        });
        return;
      }
      const endpoint = userRole === 'doctor' ? '/doctors/profile/me' : '/users/profile';
      const { data } = await api.get(endpoint);
      if (data.success) {
        const profile = data.user || data.doctor;
        setUser({ ...profile, role: userRole });
      }
    } catch (error) {
      // Token invalid — clear everything
      clearAuth();
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('registrationEmail');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  const fetchDoctors = async (params = {}) => {
    try {
      const { data } = await api.get('/doctors', { params });
      if (data.success) setDoctors(data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const login = async (email, password, loginRole = 'patient') => {
    try {
      setLoading(true);
      const endpointMap = {
        doctor: '/doctors/login',
        admin: '/admin/login',
        registration: '/admin/registration-login',
        patient: '/users/login'
      };
      const { data } = await api.post(endpointMap[loginRole], { email, password });

      if (data.success) {
        const userData = data.user || data.doctor || data.admin || data.office;
        const resolvedRole = userData?.role || loginRole;

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', resolvedRole);
        if (resolvedRole === 'admin') {
          localStorage.setItem('adminEmail', email);
        }
        if (resolvedRole === 'registration') {
          localStorage.setItem('registrationEmail', email);
        }

        setToken(data.token);
        setRole(resolvedRole);
        setUser({ ...userData, role: resolvedRole });
        toast.success('Login successful!');
        return { success: true, role: resolvedRole };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const { data } = await api.post('/users/register', { name, email, password });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'patient');
        setToken(data.token);
        setRole('patient');
        setUser({ ...data.user, role: 'patient' });
        toast.success('Registration successful!');
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    setUser,
    token,
    role,
    doctors,
    setDoctors,
    fetchDoctors,
    login,
    register,
    logout,
    loading,
    authLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
