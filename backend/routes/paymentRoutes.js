const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getAllPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-payment-intent', protect, authorize('patient'), createPaymentIntent);
router.post('/confirm', protect, authorize('patient'), confirmPayment);
router.get('/history', protect, authorize('patient'), getPaymentHistory);
router.get('/', protect, authorize('admin'), getAllPayments);

module.exports = router;
