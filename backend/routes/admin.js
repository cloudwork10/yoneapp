const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { requireSuperAdmin, requireAdmin, requireModerator } = require('../middleware/adminAuth');
const { adminLimiter } = require('../middleware/security');

const router = express.Router();

// Apply rate limiting to all admin routes
router.use(adminLimiter);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Super Admin
router.get('/dashboard', requireSuperAdmin, async (req, res) => {
  try {
    const stats = await User.getUserStats();
    
    // Get recent users (last 30 days)
    const recentUsers = await User.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })
    .select('name email createdAt lastLogin isActive')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get locked accounts
    const lockedAccounts = await User.find({
      lockUntil: { $gt: new Date() }
    })
    .select('name email loginAttempts lockUntil')
    .sort({ lockUntil: -1 });

    // Get daily user registrations for the last 30 days
    const dailyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        recentUsers,
        lockedAccounts,
        dailyRegistrations
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Admin
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, status, adminLevel } = req.query;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'active') {
      filter.lastLogin = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    } else if (status === 'inactive') {
      filter.lastLogin = { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    } else if (status === 'locked') {
      filter.lockUntil = { $gt: new Date() };
    }
    
    if (adminLevel) {
      filter.adminLevel = adminLevel;
    }

    const users = await User.find(filter)
      .select('-password -passwordResetToken -emailVerificationToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

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

// @route   GET /api/admin/users/:id
// @desc    Get detailed user information
// @access  Admin
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('coursesEnrolled', 'title category')
      .populate('coursesCompleted', 'title category')
      .populate('certificates', 'title course date');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user.getAdminProfile()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Admin
router.put('/users/:id/status', [
  requireAdmin,
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
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

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: user.getProfile()
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/admin-level
// @desc    Update user admin level
// @access  Super Admin
router.put('/users/:id/admin-level', [
  requireSuperAdmin,
  body('adminLevel').isIn(['moderator', 'admin', 'super']).withMessage('Invalid admin level')
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

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    user.isAdmin = true;
    user.adminLevel = req.body.adminLevel;
    user.createdBy = req.admin._id;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User admin level updated successfully',
      data: {
        user: user.getProfile()
      }
    });
  } catch (error) {
    console.error('Update admin level error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
// @access  Super Admin
router.delete('/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent deleting super admins
    if (user.adminLevel === 'super') {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot delete super admin accounts'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users/:id/unlock
// @desc    Unlock user account
// @access  Admin
router.post('/users/:id/unlock', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User account unlocked successfully'
    });
  } catch (error) {
    console.error('Unlock user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get content statistics for admin
// @access  Admin
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // Import models dynamically to avoid circular dependencies
    const Course = require('../models/Course');
    const Podcast = require('../models/Podcast');
    const Article = require('../models/Article');
    const Roadmap = require('../models/Roadmap');
    const Advice = require('../models/Advice');
    const ProgrammingTerm = require('../models/ProgrammingTerm');
    const CVTemplate = require('../models/CVTemplate');

    // Get total counts
    const totalCourses = await Course.countDocuments();
    const totalPodcasts = await Podcast.countDocuments();
    const totalArticles = await Article.countDocuments();
    const totalRoadmaps = await Roadmap.countDocuments();
    const totalAdvices = await Advice.countDocuments();
    const totalTerms = await ProgrammingTerm.countDocuments();
    const totalCVTemplates = await CVTemplate.countDocuments();

    // Get active counts
    const activeCourses = await Course.countDocuments({ isActive: true });
    const activePodcasts = await Podcast.countDocuments({ isActive: true });
    const activeArticles = await Article.countDocuments({ isActive: true });
    const activeRoadmaps = await Roadmap.countDocuments({ isActive: true });
    const activeAdvices = await Advice.countDocuments({ isActive: true });
    const activeTerms = await ProgrammingTerm.countDocuments({ isActive: true });
    const activeCVTemplates = await CVTemplate.countDocuments({ isActive: true });

    res.status(200).json({
      status: 'success',
      data: {
        total: {
          courses: totalCourses,
          podcasts: totalPodcasts,
          articles: totalArticles,
          roadmaps: totalRoadmaps,
          advices: totalAdvices,
          terms: totalTerms,
          cvTemplates: totalCVTemplates
        },
        active: {
          courses: activeCourses,
          podcasts: activePodcasts,
          articles: activeArticles,
          roadmaps: activeRoadmaps,
          advices: activeAdvices,
          terms: activeTerms,
          cvTemplates: activeCVTemplates
        }
      }
    });
  } catch (error) {
    console.error('Error fetching content stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
