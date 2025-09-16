const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateTokens, requireAuth, accountLockout } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const { logger } = require('../middleware/security');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Registration attempt with existing email', {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email',
        code: 'USER_EXISTS'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logger.info('User registered successfully', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: user.getProfile(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error('Registration error:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, accountLockout, loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      logger.warn('Login attempt with non-existent email', {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      logger.warn('Login attempt on locked account', {
        userId: user._id,
        email: user.email,
        ip: req.ip,
        lockUntil: user.lockUntil
      });
      
      return res.status(423).json({
        status: 'error',
        message: 'Account temporarily locked due to too many failed login attempts',
        code: 'ACCOUNT_LOCKED',
        lockUntil: user.lockUntil
      });
    }

    // Check if account is active
    if (!user.isActive) {
      logger.warn('Login attempt on inactive account', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });
      
      return res.status(401).json({
        status: 'error',
        message: 'Account has been deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', {
        userId: user._id,
        email: user.email,
        ip: req.ip,
        attempts: user.loginAttempts
      });
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login info
    await user.updateLastActive(req.ip);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logger.info('User logged in successfully', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.getProfile(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', authLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token is required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    logger.info('Token refreshed successfully', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        tokens
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', {
      error: error.message,
      ip: req.ip
    });

    res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', requireAuth, async (req, res) => {
  try {
    logger.info('User logged out', {
      userId: req.user.id,
      email: req.user.email,
      ip: req.ip
    });

    res.json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      status: 'error',
      message: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      status: 'success',
      data: {
        user: user.getProfile()
      }
    });
  } catch (error) {
    logger.error('Get profile error:', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile',
      code: 'PROFILE_ERROR'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', requireAuth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      logger.warn('Password change attempt with invalid current password', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });
      
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info('Password changed successfully', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Password change error:', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to change password',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

module.exports = router;