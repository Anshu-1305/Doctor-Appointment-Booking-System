import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user, authLoading } = useContext(AppContext);

  // Wait for initial auth check to complete
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user loaded and role doesn't match, redirect
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const redirectMap = {
      admin: '/admin/dashboard',
      registration: '/registration/dashboard',
      doctor: '/doctor/dashboard',
      patient: '/'
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
