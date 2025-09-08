const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Super admin authentication (highest level)
exports.requireSuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Super admin token required.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isAdmin || user.adminLevel !== 'super') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Super admin privileges required.'
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid super admin token.'
    });
  }
};

// Admin authentication (admin or super admin)
exports.requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Admin token required.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isAdmin || !['admin', 'super'].includes(user.adminLevel)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid admin token.'
    });
  }
};

// Moderator or higher authentication
exports.requireModerator = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Moderator token required.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isAdmin || !['moderator', 'admin', 'super'].includes(user.adminLevel)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Moderator privileges required.'
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid moderator token.'
    });
  }
};
