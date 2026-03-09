const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Reel = require('../models/Reel');
const User = require('../models/User');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { uploadLimiter, apiLimiter } = require('../middleware/security');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'reel-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// @route   POST /api/reels/upload
// @desc    Upload a new reel (requires approval for non-admin users)
// @access  Private
router.post('/upload', 
  requireAuth,
  uploadLimiter,
  upload.single('video'),
  [
    body('title').optional().trim().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('category').optional().isIn(['programming', 'motivation', 'education', 'entertainment', 'other'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No video file provided'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Admin reels are auto-approved, regular users need approval
      const isAdmin = user.isAdmin && ['super', 'admin'].includes(user.adminLevel);
      const status = isAdmin ? 'approved' : 'pending';

      // Use the same pattern as content.js
      const baseUrl = process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000';
      const videoUrl = `${baseUrl}/uploads/videos/${req.file.filename}`;

      const reelData = {
        title: req.body.title || '',
        description: req.body.description || '',
        videoUrl: videoUrl,
        thumbnail: req.body.thumbnail || '',
        uploadedBy: req.user.id,
        uploadedByName: user.name,
        uploadedByAvatar: user.avatar || '',
        status: status,
        category: req.body.category || 'other',
        approvedBy: isAdmin ? req.user.id : null,
        approvedAt: isAdmin ? new Date() : null
      };

      const reel = await Reel.create(reelData);

      res.status(201).json({
        status: 'success',
        message: isAdmin ? 'Reel uploaded and approved successfully' : 'Reel uploaded successfully. Waiting for admin approval.',
        data: { reel }
      });
    } catch (error) {
      console.error('Error uploading reel:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to upload reel'
      });
    }
  }
);

// @route   GET /api/reels
// @desc    Get all approved reels (public) or from followed users
// @access  Public (or Private for following feed)
router.get('/', apiLimiter, optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const feed = req.query.feed; // 'following' or 'all'

    const query = {
      status: 'approved',
      isActive: true
    };

    // If feed is 'following', show only reels from followed users
    if (feed === 'following' && req.user) {
      const user = await User.findById(req.user.id);
      if (user && user.following && user.following.length > 0) {
        query.uploadedBy = { $in: user.following };
      } else {
        // User is not following anyone, return empty
        return res.json({
          status: 'success',
          data: {
            reels: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0
            }
          }
        });
      }
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const reels = await Reel.find(query)
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reel.countDocuments(query);

    // Add isLiked field for each reel if user is authenticated
    const reelsWithLiked = reels.map(reel => {
      const reelObj = reel.toObject();
      if (req.user) {
        const userId = req.user.id || req.user._id;
        reelObj.isLiked = reel.likedBy && reel.likedBy.some(
          (id) => id.toString() === userId.toString()
        );
      } else {
        reelObj.isLiked = false;
      }
      return reelObj;
    });

    res.json({
      status: 'success',
      data: {
        reels: reelsWithLiked,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reels'
    });
  }
});

// @route   GET /api/reels/pending
// @desc    Get pending reels (admin only)
// @access  Admin
router.get('/pending', requireAuth, requireAdmin, async (req, res) => {
  try {
    const reels = await Reel.find({ status: 'pending' })
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: { reels }
    });
  } catch (error) {
    console.error('Error fetching pending reels:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending reels'
    });
  }
});

// @route   GET /api/reels/my-reels
// @desc    Get user's own reels
// @access  Private
router.get('/my-reels', requireAuth, async (req, res) => {
  try {
    const reels = await Reel.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: { reels }
    });
  } catch (error) {
    console.error('Error fetching user reels:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your reels'
    });
  }
});

// @route   POST /api/reels/:id/approve
// @desc    Approve a reel (admin only)
// @access  Admin
router.post('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({
        status: 'error',
        message: 'Reel not found'
      });
    }

    if (reel.status === 'approved') {
      return res.status(400).json({
        status: 'error',
        message: 'Reel is already approved'
      });
    }

    reel.status = 'approved';
    reel.approvedBy = req.user.id;
    reel.approvedAt = new Date();
    reel.rejectedBy = null;
    reel.rejectedAt = null;
    reel.rejectedReason = '';

    await reel.save();

    res.json({
      status: 'success',
      message: 'Reel approved successfully',
      data: { reel }
    });
  } catch (error) {
    console.error('Error approving reel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve reel'
    });
  }
});

// @route   POST /api/reels/:id/reject
// @desc    Reject a reel (admin only)
// @access  Admin
router.post('/:id/reject', 
  requireAuth, 
  requireAdmin,
  [
    body('reason').optional().trim().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const reel = await Reel.findById(req.params.id);
      
      if (!reel) {
        return res.status(404).json({
          status: 'error',
          message: 'Reel not found'
        });
      }

      if (reel.status === 'rejected') {
        return res.status(400).json({
          status: 'error',
          message: 'Reel is already rejected'
        });
      }

      reel.status = 'rejected';
      reel.rejectedBy = req.user.id;
      reel.rejectedAt = new Date();
      reel.rejectedReason = req.body.reason || 'Rejected by admin';

      await reel.save();

      res.json({
        status: 'success',
        message: 'Reel rejected successfully',
        data: { reel }
      });
    } catch (error) {
      console.error('Error rejecting reel:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to reject reel'
      });
    }
  }
);

// @route   POST /api/reels/:id/like
// @desc    Like/Unlike a reel (toggle)
// @access  Private
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({
        status: 'error',
        message: 'Reel not found'
      });
    }

    const userId = req.user.id || req.user._id;
    const isLiked = reel.likedBy && reel.likedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (isLiked) {
      // Unlike - remove user from likedBy and decrease likes
      reel.likedBy = reel.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      reel.likes = Math.max(0, (reel.likes || 0) - 1);
    } else {
      // Like - add user to likedBy and increase likes
      if (!reel.likedBy) {
        reel.likedBy = [];
      }
      reel.likedBy.push(userId);
      reel.likes = (reel.likes || 0) + 1;
    }

    await reel.save();

    res.json({
      status: 'success',
      message: isLiked ? 'Reel unliked' : 'Reel liked',
      data: { 
        likes: reel.likes,
        isLiked: !isLiked
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle like'
    });
  }
});

// @route   POST /api/reels/:id/view
// @desc    Increment view count
// @access  Public
router.post('/:id/view', apiLimiter, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({
        status: 'error',
        message: 'Reel not found'
      });
    }

    reel.views = (reel.views || 0) + 1;
    await reel.save();

    res.json({
      status: 'success',
      data: { views: reel.views }
    });
  } catch (error) {
    console.error('Error incrementing view:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to increment view'
    });
  }
});

// @route   DELETE /api/reels/:id
// @desc    Delete a reel (owner or admin)
// @access  Private
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({
        status: 'error',
        message: 'Reel not found'
      });
    }

    const user = await User.findById(req.user.id);
    const isAdmin = user.isAdmin && ['super', 'admin'].includes(user.adminLevel);
    const isOwner = reel.uploadedBy.toString() === req.user.id;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this reel'
      });
    }

    // Delete video file if exists
    if (reel.videoUrl) {
      const filename = reel.videoUrl.split('/').pop();
      const filePath = path.join(__dirname, '../uploads/videos', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await reel.deleteOne();

    res.json({
      status: 'success',
      message: 'Reel deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete reel'
    });
  }
});

module.exports = router;

