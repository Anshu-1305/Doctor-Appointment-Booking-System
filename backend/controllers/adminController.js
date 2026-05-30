const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const jwt = require('jsonwebtoken');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'admin', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(200).json({
        success: true,
        token,
        admin: {
          id: 'admin',
          email: process.env.ADMIN_EMAIL,
          name: 'Admin',
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Registration office login
// @route   POST /api/admin/registration-login
// @access  Public
exports.registrationOfficeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const officeEmail = process.env.REGISTRATION_OFFICE_EMAIL || 'registration@docbook.com';
    const officePassword = process.env.REGISTRATION_OFFICE_PASSWORD || 'Office@123';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (email === officeEmail && password === officePassword) {
      const token = jwt.sign(
        { id: 'registration-office', role: 'registration' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return res.status(200).json({
        success: true,
        token,
        office: {
          id: 'registration-office',
          email: officeEmail,
          name: 'Registration Office',
          role: 'registration'
        }
      });
    }

    res.status(401).json({ success: false, message: 'Invalid registration office credentials' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      payments,
      recentAppointments,
      latestDoctors
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ isCompleted: true }),
      Appointment.countDocuments({ status: 'pending', cancelled: false }),
      Appointment.countDocuments({ cancelled: true }),
      Payment.find({ status: 'completed' }),
      Appointment.find().sort({ createdAt: -1 }).limit(10),
      Doctor.find().sort({ createdAt: -1 }).limit(5).select('-password -slots_booked')
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const cashRevenue = payments
      .filter(p => p.paymentMethod === 'cash')
      .reduce((sum, p) => sum + p.amount, 0);
    const onlineRevenue = totalRevenue - cashRevenue;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        cancelledAppointments,
        totalRevenue,
        cashRevenue,
        onlineRevenue
      },
      recentAppointments,
      latestDoctors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
