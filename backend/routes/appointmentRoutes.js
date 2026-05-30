const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  bookRegistrationAppointment,
  getUserAppointments,
  cancelAppointment,
  getDoctorAppointments,
  completeAppointment,
  getAllAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// IMPORTANT: named routes before /:id param routes
router.get('/my-appointments', protect, authorize('patient'), getUserAppointments);
router.get('/doctor-appointments', protect, authorize('doctor'), getDoctorAppointments);
router.get('/', protect, authorize('admin', 'registration'), getAllAppointments);
router.post('/registration', protect, authorize('registration'), bookRegistrationAppointment);
router.post('/', protect, authorize('patient'), bookAppointment);

router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/complete', protect, authorize('doctor'), completeAppointment);
router.put('/:id/status', protect, authorize('admin', 'doctor'), updateAppointmentStatus);

module.exports = router;
