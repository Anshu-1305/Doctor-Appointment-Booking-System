const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide doctor name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number']
  },
  specialization: {
    type: String,
    required: [true, 'Please provide specialization'],
    enum: ['General Physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist', 'Cardiologist', 'Orthopedic', 'Psychiatrist', 'Dentist']
  },
  degree: {
    type: String,
    required: [true, 'Please provide degree']
  },
  experience: {
    type: String,
    required: [true, 'Please provide experience']
  },
  about: {
    type: String,
    default: ''
  },
  fees: {
    type: Number,
    required: [true, 'Please provide consultation fees'],
    default: 500
  },
  address: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' }
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  available: {
    type: Boolean,
    default: true
  },
  slots_booked: {
    type: Object,
    default: {}
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  totalEarnings: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    default: 'doctor'
  }
}, {
  timestamps: true
});

doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

doctorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

doctorSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = mongoose.model('Doctor', doctorSchema);
