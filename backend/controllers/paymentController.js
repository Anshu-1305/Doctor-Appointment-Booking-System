const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');

// @desc    Create payment intent (Stripe)
// @route   POST /api/payments/create-payment-intent
// @access  Private/Patient
exports.createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key') {
      return res.status(200).json({ success: false, demo: true, message: 'Stripe is not configured' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: appointment.amount * 100,
      currency: 'inr', // Change to 'usd' if INR is not supported in your region
      metadata: {
        appointmentId: appointment._id.toString(),
        userId: req.userId
      }
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private/Patient
exports.confirmPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      paymentId,
      paymentMethod = 'card',
      paymentLabel = 'Card',
      transactionNo
    } = req.body;

    if (!appointmentId || !paymentId) {
      return res.status(400).json({ success: false, message: 'appointmentId and paymentId are required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.payment) {
      return res.status(400).json({ success: false, message: 'Appointment already paid' });
    }

    appointment.payment = true;
    appointment.paymentId = paymentId;
    appointment.transactionNo = transactionNo || paymentId;
    appointment.paymentMethod = paymentMethod;
    appointment.paymentLabel = paymentLabel;
    appointment.status = 'confirmed';
    await appointment.save();

    const payment = await Payment.create({
      appointmentId,
      userId: appointment.userId,
      docId: appointment.docId,
      amount: appointment.amount,
      paymentMethod,
      paymentLabel,
      paymentId,
      transactionNo: transactionNo || paymentId,
      status: 'completed',
      collectedBy: 'patient'
    });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      appointment,
      payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history for patient
// @route   GET /api/payments/history
// @access  Private/Patient
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('docId', 'name specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
