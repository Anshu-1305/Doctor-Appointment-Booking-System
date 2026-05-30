const express = require('express');
const router = express.Router();
const { adminLogin, registrationOfficeLogin, getDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', adminLogin);
router.post('/registration-login', registrationOfficeLogin);
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

module.exports = router;
