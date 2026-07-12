const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateTokens, requireAuth, accountLockout } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const { logger } = require('../middleware/security');

const router = express.Router();

// @route   GET /api/auth/verify
// @desc    Verify token validity
// @access  Private
router.get('/verify', requireAuth, async (req, res) => {
  try {
    // If middleware passes, token is valid
    res.json({
      status: 'success',
      message: 'Token is valid',
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        isAdmin: req.user.isAdmin,
        adminLevel: req.user.adminLevel
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Token verification failed'
    });
  }
});

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

    // Get user profile and ensure admin status is correct
    const userProfile = user.getProfile();
    
    // Ensure admin status is properly set
    if (user.role === 'admin') {
      userProfile.isAdmin = true;
      userProfile.adminLevel = user.adminLevel || 'admin';
    }

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userProfile,
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

    // Verify refresh token (same issuer/audience as minting)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET, {
        issuer: 'yone-app',
        audience: 'yone-users',
      });
    } catch (err) {
      // Fallback for older tokens minted without issuer/audience
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    }
    
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
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: errors.array()[0]?.msg || 'Validation failed',
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

    if (currentPassword === newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be different from current password',
        code: 'SAME_PASSWORD'
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

// @route   POST /api/auth/forgot-password
// @desc    Request a password reset code
// @access  Public
router.post('/forgot-password', authLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email',
        errors: errors.array()
      });
    }

    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });

    // Always return success shape to avoid email enumeration
    if (!user) {
      return res.json({
        status: 'success',
        message: 'If an account exists for this email, a reset code has been sent.',
        data: { sent: false }
      });
    }

    const resetCode = user.createPasswordResetCode();
    await user.save({ validateBeforeSave: false });

    logger.info('Password reset code generated', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    // No SMTP configured yet — return code to the app so reset still works locally.
    // When email is added later, remove resetCode from the response.
    console.log(`🔐 Password reset code for ${email}: ${resetCode}`);

    res.json({
      status: 'success',
      message: 'Reset code generated. Enter it to set a new password.',
      data: {
        sent: true,
        expiresInMinutes: 15,
        resetCode
      }
    });
  } catch (error) {
    logger.error('Forgot password error:', {
      error: error.message,
      ip: req.ip
    });
    res.status(500).json({
      status: 'error',
      message: 'Failed to process password reset request',
      code: 'FORGOT_PASSWORD_ERROR'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using email + code
// @access  Public
router.post('/reset-password', authLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('code')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Reset code must be 6 digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: errors.array()[0]?.msg || 'Validation failed',
        errors: errors.array()
      });
    }

    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    const { newPassword } = req.body;

    const hashedCode = require('crypto')
      .createHash('sha256')
      .update(code)
      .digest('hex');

    const user = await User.findOne({
      email,
      passwordResetToken: hashedCode,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset code',
        code: 'INVALID_RESET_CODE'
      });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    logger.info('Password reset successfully', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.json({
      status: 'success',
      message: 'Password reset successfully. You can now sign in.'
    });
  } catch (error) {
    logger.error('Reset password error:', {
      error: error.message,
      ip: req.ip
    });
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password',
      code: 'RESET_PASSWORD_ERROR'
    });
  }
});

// @route   POST /api/auth/delete-account
// @desc    Permanently delete the authenticated user's account
// @access  Private
router.post('/delete-account', requireAuth, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete your account')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const userId = req.user.id;
    const { password } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.adminLevel === 'super') {
      return res.status(403).json({
        status: 'error',
        message: 'Super admin accounts cannot be deleted from the app',
        code: 'SUPER_ADMIN_PROTECTED'
      });
    }

    const passwordValid = await user.comparePassword(password);
    if (!passwordValid) {
      logger.warn('Account delete attempt with invalid password', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });
      return res.status(400).json({
        status: 'error',
        message: 'Incorrect password',
        code: 'INVALID_PASSWORD'
      });
    }

    // Best-effort cleanup of related data
    try {
      const Reel = require('../models/Reel');
      const fs = require('fs');
      const path = require('path');

      const reels = await Reel.find({ uploadedBy: userId }).select('videoUrl');
      for (const reel of reels) {
        const url = reel.videoUrl || '';
        if (url.includes('/uploads/videos/')) {
          const filename = url.split('/').pop()?.split('?')[0];
          if (filename) {
            const filePath = path.join(__dirname, '../uploads/videos', filename);
            if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
              } catch (_) {
                // ignore file delete errors
              }
            }
          }
        }
      }
      await Reel.deleteMany({ uploadedBy: userId });

      await User.updateMany(
        { followers: userId },
        { $pull: { followers: userId } }
      );
      await User.updateMany(
        { following: userId },
        { $pull: { following: userId } }
      );
    } catch (cleanupError) {
      logger.warn('Account delete cleanup warning:', {
        error: cleanupError.message,
        userId
      });
    }

    await User.findByIdAndDelete(userId);

    logger.info('User account deleted', {
      userId,
      email: user.email,
      ip: req.ip
    });

    res.json({
      status: 'success',
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Account delete error:', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete account',
      code: 'ACCOUNT_DELETE_ERROR'
    });
  }
});

module.exports = router;