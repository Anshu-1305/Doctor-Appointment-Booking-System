const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  docId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  slotDate: {
    type: String,
    required: true
  },
  slotTime: {
    type: String,
    required: true
  },
  userData: {
    name: String,
    email: String,
    phone: String,
    address: String,
    gender: String,
    dob: Date,
    image: String
  },
  docData: {
    name: String,
    email: String,
    specialization: String,
    fees: Number,
    image: String,
    address: Object
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  cancelled: {
    type: Boolean,
    default: false
  },
  payment: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  transactionNo: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cash', 'stripe', 'bank', 'none'],
    default: 'none'
  },
  paymentLabel: {
    type: String,
    default: ''
  },
  bookedBy: {
    type: String,
    enum: ['patient', 'registration'],
    default: 'patient'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
