const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Private
exports.bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;

    const doctor = await Doctor.findById(docId);
    const user = await User.findById(req.userId);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (!doctor.available) {
      return res.status(400).json({ success: false, message: 'Doctor not available' });
    }

    const slots_booked = doctor.slots_booked || {};

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.status(400).json({ success: false, message: 'Slot not available' });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      dob: user.dob,
      image: user.image
    };

    const docData = {
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      fees: doctor.fees,
      image: doctor.image,
      address: doctor.address
    };

    const appointment = await Appointment.create({
      userId: req.userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: doctor.fees,
      date: Date.now()
    });

    await Doctor.findByIdAndUpdate(docId, { slots_booked });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Book appointment from registration office with cash payment
// @route   POST /api/appointments/registration
// @access  Private/Registration
exports.bookRegistrationAppointment = async (req, res) => {
  try {
    const { patientName, patientEmail, patientPhone, patientGender, patientDob, patientAddress, docId, slotDate, slotTime } = req.body;

    if (!patientName || !patientPhone || !docId || !slotDate || !slotTime) {
      return res.status(400).json({ success: false, message: 'Patient name, phone, doctor, date and time are required' });
    }

    const doctor = await Doctor.findById(docId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (!doctor.available) {
      return res.status(400).json({ success: false, message: 'Doctor not available' });
    }

    const email = patientEmail || `${patientPhone.replace(/\D/g, '') || Date.now()}@offline.docbook.in`;
    let user = await User.findOne({ $or: [{ email }, { phone: patientPhone }] });

    if (!user) {
      user = await User.create({
        name: patientName,
        email,
        phone: patientPhone,
        password: `Office@${Date.now()}`,
        gender: patientGender || 'Other',
        dob: patientDob || null,
        address: patientAddress || ''
      });
    }

    const slots_booked = doctor.slots_booked || {};

    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.status(400).json({ success: false, message: 'Slot not available' });
    }

    if (slots_booked[slotDate]) {
      slots_booked[slotDate].push(slotTime);
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      dob: user.dob,
      image: user.image
    };

    const docData = {
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      fees: doctor.fees,
      image: doctor.image,
      address: doctor.address
    };

    const paymentId = `cash_${Date.now()}`;
    const appointment = await Appointment.create({
      userId: user._id,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: doctor.fees,
      date: Date.now(),
      payment: true,
      paymentId,
      paymentMethod: 'cash',
      paymentLabel: 'Cash at registration office',
      bookedBy: 'registration',
      status: 'confirmed'
    });

    await Payment.create({
      appointmentId: appointment._id,
      userId: user._id,
      docId,
      amount: doctor.fees,
      paymentMethod: 'cash',
      paymentLabel: 'Cash at registration office',
      paymentId,
      status: 'completed',
      collectedBy: 'registration'
    });

    await Doctor.findByIdAndUpdate(docId, { slots_booked });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments/my-appointments
// @access  Private
exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (appointment.cancelled) {
      return res.status(400).json({ success: false, message: 'Appointment already cancelled' });
    }

    appointment.cancelled = true;
    appointment.status = 'cancelled';
    await appointment.save();

    const doctor = await Doctor.findById(appointment.docId);
    let slots_booked = doctor.slots_booked;

    if (slots_booked[appointment.slotDate]) {
      slots_booked[appointment.slotDate] = slots_booked[appointment.slotDate].filter(
        time => time !== appointment.slotTime
      );
    }

    await Doctor.findByIdAndUpdate(appointment.docId, { slots_booked });

    res.status(200).json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor appointments
// @route   GET /api/appointments/doctor-appointments
// @access  Private/Doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ docId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private/Doctor
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.docId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.isCompleted = true;
    appointment.status = 'completed';
    await appointment.save();

    if (appointment.payment) {
      const doctor = await Doctor.findById(req.userId);
      doctor.totalEarnings += appointment.amount;
      await doctor.save();
    }

    res.status(200).json({ success: true, message: 'Appointment completed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments
// @access  Private/Admin
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status (Admin/Doctor)
// @route   PUT /api/appointments/:id/status
// @access  Private/Admin/Doctor
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    if (status === 'completed') {
      appointment.isCompleted = true;
    }
    if (status === 'cancelled') {
      appointment.cancelled = true;
    }

    await appointment.save();

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
