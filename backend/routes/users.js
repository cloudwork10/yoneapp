const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Reel = require('../models/Reel');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/security');
const { getUploadRoot } = require('../utils/uploadDirs');

const router = express.Router();

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(getUploadRoot(), 'images');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

function buildUploadUrl(req, folder, filename) {
  const host = req.get('host');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const baseUrl = host
    ? `${proto}://${host}`
    : (process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000');
  return `${baseUrl.replace(/\/$/, '')}/uploads/${folder}/${filename}`;
}

function tryDeleteLocalUpload(url) {
  if (!url || typeof url !== 'string' || !url.includes('/uploads/images/')) return;
  try {
    const filename = url.split('/uploads/images/').pop()?.split('?')[0];
    if (!filename || filename.includes('..')) return;
    const filePath = path.join(getUploadRoot(), 'images', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore cleanup errors
  }
}

// @route   POST /api/users/push-token
// @desc    Save Expo push token for the logged-in user
// @access  Private
router.post('/push-token', requireAuth, async (req, res) => {
  try {
    const token = String(req.body?.pushToken || req.body?.token || '').trim();
    if (!token || token.length < 20) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid pushToken is required',
      });
    }

    await User.findByIdAndUpdate(req.user.id, {
      pushToken: token,
      lastSeenAt: new Date(),
    });

    res.json({ status: 'success', message: 'Push token saved' });
  } catch (error) {
    console.error('Save push token error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save push token' });
  }
});

// @route   POST /api/users/heartbeat
// @desc    Mark user as currently online in the app
// @access  Private
router.post('/heartbeat', requireAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastSeenAt: new Date() });
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Heartbeat failed' });
  }
});

// @route   POST /api/users/avatar
// @desc    Upload / update current user profile photo
// @access  Private
router.post('/avatar', requireAuth, uploadLimiter, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const previousAvatar = user.avatar;
    const avatarUrl = buildUploadUrl(req, 'images', req.file.filename);
    user.avatar = avatarUrl;
    await user.save();

    if (previousAvatar && previousAvatar !== avatarUrl) {
      tryDeleteLocalUpload(previousAvatar);
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile photo updated successfully',
      data: {
        avatar: avatarUrl,
        user: user.getProfile(),
      },
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload profile photo',
    });
  }
});

// @route   GET /api/users/:id/profile
// @desc    Get user profile with their reels (public or admin)
// @access  Public (or Admin for any user)
// NOTE: This route must come BEFORE /profile to avoid route conflicts
router.get('/:id/profile', optionalAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user; // May be undefined if not logged in

    // Validate userId format (MongoDB ObjectId is 24 characters)
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    // A block must actually stop the viewer from reaching the blocked
    // account's profile, not just filter it out of the feed.
    if (requestingUser) {
      const me = await User.findById(requestingUser.id).select('blockedUsers');
      if (me?.blockedUsers?.some((id) => id.toString() === userId.toString())) {
        return res.status(403).json({
          status: 'error',
          code: 'USER_BLOCKED',
          message: 'You have blocked this account.'
        });
      }
    }

    // Check if requesting user is admin
    let user;
    if (requestingUser) {
      const adminUser = await User.findById(requestingUser.id);
      const isAdmin = adminUser && adminUser.isAdmin && ['super', 'admin'].includes(adminUser.adminLevel);
      
      if (isAdmin || requestingUser.id.toString() === userId.toString()) {
        // Admin can see any profile, user can see their own
        user = await User.findById(userId).select('-password');
      } else {
        // Regular users can see public profiles
        user = await User.findById(userId).select('-password -email');
      }
    } else {
      // Not logged in - public profile only
      user = await User.findById(userId).select('-password -email');
    }

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get user's approved reels
    const reels = await Reel.find({
      uploadedBy: userId,
      status: 'approved',
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get user stats
    const totalReels = await Reel.countDocuments({
      uploadedBy: userId,
      status: 'approved',
      isActive: true
    });

    const totalLikes = await Reel.aggregate([
      {
        $match: {
          uploadedBy: user._id,
          status: 'approved',
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);

    const totalViews = await Reel.aggregate([
      {
        $match: {
          uploadedBy: user._id,
          status: 'approved',
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    // Check if current user is following this user
    let isFollowing = false;
    if (requestingUser && requestingUser.id !== userId) {
      const currentUser = await User.findById(requestingUser.id);
      isFollowing = currentUser && currentUser.following && currentUser.following.some(
        (id) => id.toString() === userId
      ) || false;
    }

    // Get followers and following count
    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          email: requestingUser && (requestingUser.id.toString() === userId.toString() || (await User.findById(requestingUser.id))?.isAdmin) ? user.email : undefined,
          createdAt: user.createdAt,
          isAdmin: user.isAdmin,
          adminLevel: user.adminLevel
        },
        stats: {
          totalReels,
          totalLikes: totalLikes[0]?.totalLikes || 0,
          totalViews: totalViews[0]?.totalViews || 0,
          followersCount,
          followingCount
        },
        isFollowing,
        reels
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('coursesEnrolled', 'title category duration')
      .populate('coursesCompleted', 'title category duration')
      .populate('certificates', 'title course date');

    res.status(200).json({
      status: 'success',
      data: {
        user: user.getProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  requireAuth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
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

    const { name, email, preferences } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is already taken'
        });
      }
      
      updateData.email = email;
    }
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: user.getProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
  requireAuth,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('coursesEnrolled', 'title category duration rating')
      .populate('coursesCompleted', 'title category duration')
      .populate('certificates', 'title course date');

    const dashboardData = {
      totalCourses: user.coursesEnrolled.length,
      completedCourses: user.coursesCompleted.length,
      inProgressCourses: user.coursesEnrolled.length - user.coursesCompleted.length,
      totalHours: user.learningStats.totalHours,
      currentStreak: user.learningStats.currentStreak,
      longestStreak: user.learningStats.longestStreak,
      certificates: user.certificates.length,
      recentCourses: user.coursesEnrolled.slice(-5),
      recentCertificates: user.certificates.slice(-3)
    };

    res.status(200).json({
      status: 'success',
      data: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', requireAuth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot follow yourself'
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if already following
    const isAlreadyFollowing = currentUser.following?.some(
        (id) => id.toString() === targetUserId
    );

    if (isAlreadyFollowing) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already following this user'
      });
    }

    // Add to following list
    if (!currentUser.following) {
      currentUser.following = [];
    }
    currentUser.following.push(targetUserId);
    await currentUser.save();

    // Add to target user's followers list
    if (!targetUser.followers) {
      targetUser.followers = [];
    }
    targetUser.followers.push(currentUserId);
    await targetUser.save();

    res.status(200).json({
      status: 'success',
      message: 'User followed successfully',
      data: {
        followersCount: targetUser.followers.length,
        followingCount: currentUser.following.length
      }
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/:id/unfollow
// @desc    Unfollow a user
// @access  Private
router.post('/:id/unfollow', requireAuth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot unfollow yourself'
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if following
    const isFollowing = currentUser.following?.some(
        (id) => id.toString() === targetUserId
    );

    if (!isFollowing) {
      return res.status(400).json({
        status: 'error',
        message: 'You are not following this user'
      });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
    );
    await currentUser.save();

    // Remove from target user's followers list
    targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId
    );
    await targetUser.save();

    res.status(200).json({
      status: 'success',
      message: 'User unfollowed successfully',
      data: {
        followersCount: targetUser.followers.length,
        followingCount: currentUser.following.length
      }
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get user's followers list
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate('followers', 'name avatar _id')
      .select('followers');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        followers: user.followers || []
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get user's following list
// @access  Public
router.get('/:id/following', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate('following', 'name avatar _id')
      .select('following');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        following: user.following || []
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/block/:userId
// @desc    Block a user — hides their reels and comments (App Store 1.2)
// @access  Private
router.post('/block/:userId', requireAuth, async (req, res) => {
  try {
    const meId = String(req.user.id || req.user._id);
    const targetId = String(req.params.userId);

    if (meId === targetId) {
      return res.status(400).json({ status: 'error', message: 'You cannot block yourself' });
    }

    const target = await User.findById(targetId).select('_id name');
    if (!target) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    await User.findByIdAndUpdate(meId, { $addToSet: { blockedUsers: target._id } });

    res.json({
      status: 'success',
      message: `You will no longer see content from ${target.name || 'this user'}.`,
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to block user' });
  }
});

// @route   POST /api/users/unblock/:userId
// @desc    Unblock a previously blocked user
// @access  Private
router.post('/unblock/:userId', requireAuth, async (req, res) => {
  try {
    const meId = req.user.id || req.user._id;
    await User.findByIdAndUpdate(meId, { $pull: { blockedUsers: req.params.userId } });
    res.json({ status: 'success', message: 'User unblocked' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to unblock user' });
  }
});

// @route   GET /api/users/blocked
// @desc    List blocked users so they can be managed/unblocked
// @access  Private
router.get('/blocked', requireAuth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id || req.user._id)
      .select('blockedUsers')
      .populate('blockedUsers', 'name avatar');
    res.json({ status: 'success', data: { blockedUsers: me?.blockedUsers || [] } });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch blocked users' });
  }
});

module.exports = router;
