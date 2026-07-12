const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logger } = require('./security');

// JWT Token Generation
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    isAdmin: user.isAdmin,
    isActive: user.isActive
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'yone-app',
    audience: 'yone-users'
  });

  const refreshToken = jwt.sign(
    { id: user._id, type: 'refresh' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'yone-app',
      audience: 'yone-users'
    }
  );

  return { accessToken, refreshToken };
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'yone-app',
      audience: 'yone-users'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      logger.error('Token verification failed:', error.message);
    }
    throw new Error('Invalid or expired token');
  }
};

// Authentication Middleware
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      logger.warn('Authentication failed: User not found', {
        userId: decoded.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({
        status: 'error',
        message: 'User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      logger.warn('Authentication failed: User account deactivated', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });
      return res.status(401).json({
        status: 'error',
        message: 'Account has been deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Add user to request object
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      isActive: user.isActive
    };

    logger.info('User authenticated successfully', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    next();
  } catch (error) {
    logger.error('Authentication error:', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl
    });

    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
      code: 'INVALID_TOKEN'
    });
  }
};

// Admin Authorization Middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isAdmin) {
    logger.warn('Authorization failed: Admin privileges required', {
      userId: req.user.id,
      email: req.user.email,
      ip: req.ip,
      url: req.originalUrl
    });
    
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

// Super Admin Authorization Middleware
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isAdmin || !req.user.isSuperAdmin) {
    logger.warn('Authorization failed: Super admin privileges required', {
      userId: req.user.id,
      email: req.user.email,
      ip: req.ip,
      url: req.originalUrl
    });
    
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Super admin privileges required.',
      code: 'SUPER_ADMIN_REQUIRED'
    });
  }

  next();
};

// Optional Authentication Middleware (for public routes that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user context
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isActive) {
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        isActive: user.isActive
      };
    }

    next();
  } catch (error) {
    // Token invalid, continue without user context
    next();
  }
};

// Rate Limiting for Auth Routes
const authRateLimit = (req, res, next) => {
  // This will be combined with the authLimiter from security middleware
  next();
};

// Account Lockout Protection
const accountLockout = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (email) {
      const user = await User.findOne({ email });
      
      if (user && user.loginAttempts >= 5 && user.lockUntil > Date.now()) {
        logger.warn('Account locked due to too many failed attempts', {
          email: user.email,
          ip: req.ip,
          lockUntil: user.lockUntil
        });
        
        return res.status(423).json({
          status: 'error',
          message: 'Account temporarily locked due to too many failed login attempts. Please try again later.',
          code: 'ACCOUNT_LOCKED',
          lockUntil: user.lockUntil
        });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Account lockout check error:', error);
    next();
  }
};

// Session Management
const sessionManagement = (req, res, next) => {
  // Add session tracking
  req.sessionId = req.header('X-Session-ID') || 'anonymous';
  next();
};

// IP Whitelist (for admin routes)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      logger.warn('IP not in whitelist', {
        ip: clientIP,
        allowedIPs,
        url: req.originalUrl
      });
      
      return res.status(403).json({
        status: 'error',
        message: 'Access denied from this IP address.',
        code: 'IP_NOT_ALLOWED'
      });
    }
    
    next();
  };
};

module.exports = {
  generateTokens,
  verifyToken,
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  optionalAuth,
  authRateLimit,
  accountLockout,
  sessionManagement,
  ipWhitelist
};