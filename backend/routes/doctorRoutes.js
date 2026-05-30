const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctor,
  loginDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  addReview
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// IMPORTANT: specific routes must be defined BEFORE /:id param routes
router.post('/login', loginDoctor);
router.get('/profile/me', protect, authorize('doctor'), getDoctorProfile);
router.put('/profile/me', protect, authorize('doctor'), upload.single('image'), updateDoctorProfile);

router.get('/', getAllDoctors);
router.post('/', protect, authorize('admin'), upload.single('image'), addDoctor);

router.get('/:id', getDoctor);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);
router.post('/:id/reviews', protect, authorize('patient'), addReview);

module.exports = router;
