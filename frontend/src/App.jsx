import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AppContextProvider from './context/AppContext';

// Public Pages
import About from './pages/About';
import Contact from './pages/Contact';
import DoctorDetails from './pages/DoctorDetails';
import Doctors from './pages/Doctors';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import MyAppointments from './pages/MyAppointments';
import MyProfile from './pages/MyProfile';

// Admin Pages
import AddDoctor from './pages/admin/AddDoctor';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminUsers from './pages/admin/AdminUsers';
import EditDoctor from './pages/admin/EditDoctor';

// Doctor Pages
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorEarnings from './pages/doctor/DoctorEarnings';
import DoctorProfile from './pages/doctor/DoctorProfile';
import RegistrationDashboard from './pages/registration/RegistrationDashboard';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <AppContextProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<PublicLayout><Doctors /></PublicLayout>} />
          <Route path="/doctors/:id" element={<PublicLayout><DoctorDetails /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

          {/* Patient Routes */}
          <Route path="/my-appointments" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PublicLayout><MyAppointments /></PublicLayout>
            </ProtectedRoute>
          } />
          <Route path="/my-profile" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PublicLayout><MyProfile /></PublicLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDoctors />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAppointments />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-doctor" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddDoctor />
            </ProtectedRoute>
          } />
          <Route path="/admin/edit-doctor/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditDoctor />
            </ProtectedRoute>
          } />

          {/* Registration Office Routes */}
          <Route path="/registration/dashboard" element={
            <ProtectedRoute allowedRoles={['registration']}>
              <RegistrationDashboard />
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/appointments" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorAppointments />
            </ProtectedRoute>
          } />
          <Route path="/doctor/earnings" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorEarnings />
            </ProtectedRoute>
          } />
          <Route path="/doctor/profile" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AppContextProvider>
  );
}

export default App;
