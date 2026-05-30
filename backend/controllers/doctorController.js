const Doctor = require('../models/Doctor');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const isCloudinaryConfigured = () => (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
);

const getLocalImageUrl = (req) => `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

const uploadToCloudinary = async (filePath, folder) => {
  const result = await cloudinary.uploader.upload(filePath, { folder });
  fs.unlink(filePath, () => {}); // cleanup temp file
  return result.secure_url;
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let query = {};

    if (specialization && specialization !== 'All') {
      query.specialization = specialization;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(query).select('-password -slots_booked');
    res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Doctor login
// @route   POST /api/doctors/login
// @access  Public
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const doctor = await Doctor.findOne({ email }).select('+password');
    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await doctor.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = doctor.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: 'doctor',
        specialization: doctor.specialization,
        image: doctor.image,
        fees: doctor.fees,
        available: doctor.available,
        about: doctor.about,
        address: doctor.address,
        phone: doctor.phone,
        degree: doctor.degree,
        experience: doctor.experience
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor profile
// @route   GET /api/doctors/profile/me
// @access  Private/Doctor
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.userId).select('-password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile/me
// @access  Private/Doctor
exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.userId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const { name, phone, fees, about, available, address } = req.body;

    if (name) doctor.name = name;
    if (phone) doctor.phone = phone;
    if (fees) doctor.fees = Number(fees);
    if (about !== undefined) doctor.about = about;

    // Handle available as string "true"/"false" from form-data
    if (available !== undefined) {
      doctor.available = available === true || available === 'true';
    }

    // Handle address as JSON string or object
    if (address) {
      try {
        doctor.address = typeof address === 'string' ? JSON.parse(address) : address;
      } catch {
        doctor.address = address;
      }
    }

    if (req.file) {
      doctor.image = getLocalImageUrl(req);
      try {
        if (isCloudinaryConfigured()) {
          doctor.image = await uploadToCloudinary(req.file.path, 'doctor-appointment/doctors');
        }
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr.message);
      }
    }

    await doctor.save();
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add doctor (Admin)
// @route   POST /api/doctors
// @access  Private/Admin
exports.addDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, degree, experience, about, fees } = req.body;

    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ success: false, message: 'Doctor with this email already exists' });
    }

    // Parse address from form-data
    let address = { line1: '', line2: '' };
    if (req.body.address) {
      try {
        address = typeof req.body.address === 'string' ? JSON.parse(req.body.address) : req.body.address;
      } catch {
        address = { line1: req.body.addressLine1 || '', line2: req.body.addressLine2 || '' };
      }
    } else {
      address = { line1: req.body.addressLine1 || '', line2: req.body.addressLine2 || '' };
    }

    let imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5f6fff&color=fff&size=200`;

    if (req.file) {
      imageUrl = getLocalImageUrl(req);
      try {
        if (isCloudinaryConfigured()) {
          imageUrl = await uploadToCloudinary(req.file.path, 'doctor-appointment/doctors');
        }
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr.message);
      }
    }

    const doctor = await Doctor.create({
      name, email, password, phone, specialization,
      degree, experience, about,
      fees: Number(fees),
      address,
      image: imageUrl
    });

    // Don't return password
    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    res.status(201).json({ success: true, doctor: doctorObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor (Admin)
// @route   PUT /api/doctors/:id
// @access  Private/Admin
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const { name, email, phone, specialization, degree, experience, about, fees, available, address } = req.body;

    if (name) doctor.name = name;
    if (email && email !== doctor.email) {
      const existingDoctor = await Doctor.findOne({ email });
      if (existingDoctor && existingDoctor._id.toString() !== doctor._id.toString()) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another doctor' });
      }
      doctor.email = email;
    }
    if (phone) doctor.phone = phone;
    if (specialization) doctor.specialization = specialization;
    if (degree) doctor.degree = degree;
    if (experience) doctor.experience = experience;
    if (about !== undefined) doctor.about = about;
    if (fees !== undefined && fees !== '') doctor.fees = Number(fees);
    if (available !== undefined) doctor.available = available === true || available === 'true';

    if (address !== undefined) {
      try {
        doctor.address = typeof address === 'string' ? JSON.parse(address) : address;
      } catch {
        doctor.address = address;
      }
    } else if (req.body.addressLine1 || req.body.addressLine2) {
      doctor.address = {
        line1: req.body.addressLine1 || doctor.address.line1 || '',
        line2: req.body.addressLine2 || doctor.address.line2 || ''
      };
    }

    if (req.file) {
      doctor.image = getLocalImageUrl(req);
      try {
        if (isCloudinaryConfigured()) {
          doctor.image = await uploadToCloudinary(req.file.path, 'doctor-appointment/doctors');
        }
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr.message);
      }
    }

    await doctor.save();
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete doctor (Admin)
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    await doctor.deleteOne();
    res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review to doctor
// @route   POST /api/doctors/:id/reviews
// @access  Private/Patient
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const review = {
      user: req.userId,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    doctor.reviews.push(review);
    doctor.rating = doctor.reviews.reduce((acc, item) => item.rating + acc, 0) / doctor.reviews.length;

    await doctor.save();
    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
