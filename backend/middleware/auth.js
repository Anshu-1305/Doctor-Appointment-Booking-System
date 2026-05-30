const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const decodedRole = decoded.role || decoded.userRole;
    const decodedId = decoded.id || decoded.userId;

    req.userId = decodedId;
    req.userRole = decodedRole;

    // Admin is not stored in DB — skip DB lookup
    if (decodedRole === 'admin') {
      req.user = { id: 'admin', role: 'admin', email: process.env.ADMIN_EMAIL };
      return next();
    }

    if (decodedRole === 'registration') {
      req.user = {
        id: 'registration-office',
        role: 'registration',
        email: process.env.REGISTRATION_OFFICE_EMAIL || 'registration@docbook.com'
      };
      return next();
    }

    if (decodedRole === 'doctor') {
      req.user = await Doctor.findById(decodedId).select('-password');
    } else {
      req.user = await User.findById(decodedId).select('-password');
    }

    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    const role = req.userRole || req.user?.role;

    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${role}' is not authorized for this route`
      });
    }
    next();
  };
};
