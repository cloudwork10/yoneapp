const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Reel = require('../models/Reel');
const User = require('../models/User');
const Report = require('../models/Report');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { uploadLimiter, apiLimiter } = require('../middleware/security');
const { getUploadRoot } = require('../utils/uploadDirs');
const crypto = require('crypto');

const router = express.Router();
const pendingReelUploads = new Map();

const SAMPLE_VIDEOS = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://download.samplelib.com/mp4/sample-5s.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
];

function sanitizeReelPublic(reelObj) {
  reelObj.title = String(reelObj.title || '').replace(/\n?\[\[YONE_LINK\|[^\]]+\]\]/g, '').trim();
  reelObj.description = String(reelObj.description || '').replace(/\n?\[\[YONE_LINK\|[^\]]+\]\]/g, '').trim();
  if (reelObj.uploadedBy && typeof reelObj.uploadedBy === 'object') {
    reelObj.uploadedBy = {
      _id: reelObj.uploadedBy._id,
      name: reelObj.uploadedBy.name,
      avatar: reelObj.uploadedBy.avatar || '',
    };
  }
  return reelObj;
}

function resolveReelVideoUrl(reel, index = 0) {
  const url = reel.videoUrl || '';
  if (!url) {
    return SAMPLE_VIDEOS[index % SAMPLE_VIDEOS.length];
  }

  // External URLs are fine as-is
  if (!url.includes('/uploads/videos/')) {
    return url;
  }

  const filename = url.split('/').pop();
  const filePath = path.join(getUploadRoot(), 'videos', filename || '');
  if (filename && fs.existsSync(filePath)) {
    const baseUrl = process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl.replace(/\/$/, '')}/uploads/videos/${filename}`;
  }

  // Local upload file is missing (common after zip/download) — use a playable sample
  return SAMPLE_VIDEOS[index % SAMPLE_VIDEOS.length];
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(getUploadRoot(), 'videos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname || '') || '.mp4';
    cb(null, 'reel-' + uniqueSuffix + ext);
  }
});

const MAX_REEL_BYTES = 500 * 1024 * 1024;

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: MAX_REEL_BYTES
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

function cleanupPendingUpload(uploadId) {
  const pending = pendingReelUploads.get(uploadId);
  if (!pending) return;
  try {
    fs.rmSync(pending.tmpDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
  pendingReelUploads.delete(uploadId);
}

async function createReelFromUpload({ user, filename, body }) {
  const isAdmin = user.isAdmin && ['super', 'admin'].includes(user.adminLevel);
  const status = isAdmin ? 'approved' : 'pending';
  const baseUrl = process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000';
  const linkType = ['course', 'thought', 'podcast', 'roadmap', 'article', 'news'].includes(body.linkType)
    ? body.linkType
    : 'none';
  const linkId = linkType === 'none' ? '' : String(body.linkId || '').trim();

  return Reel.create({
    title: body.title || '',
    description: body.description || '',
    videoUrl: `${baseUrl}/uploads/videos/${filename}`,
    thumbnail: body.thumbnail || '',
    uploadedBy: user._id,
    uploadedByName: user.name,
    uploadedByAvatar: user.avatar || '',
    status,
    category: body.category || 'other',
    linkType: linkId ? linkType : 'none',
    linkId,
    linkLabel: body.linkLabel || '',
    approvedBy: isAdmin ? user._id : null,
    approvedAt: isAdmin ? new Date() : null,
  });
}

const handleReelUpload = (req, res, next) => {
  req.setTimeout(10 * 60 * 1000);
  res.setTimeout(10 * 60 * 1000);
  upload.single('video')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        status: 'error',
        message: 'الفيديو كبير أوي بعد التجهيز. حاول تاني أو اختار نسخة أخف.'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message || 'فشل رفع الفيديو'
    });
  });
};

// @route   POST /api/reels/upload
// @desc    Upload a new reel (requires approval for non-admin users)
// @access  Private
router.post('/upload', 
  requireAuth,
  uploadLimiter,
  handleReelUpload,
  [
    body('title').optional().trim().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('category').optional().isIn(['programming', 'motivation', 'education', 'entertainment', 'other']),
    body('linkType').optional().isIn(['none', 'course', 'thought', 'podcast', 'roadmap', 'article', 'news']),
    body('linkId').optional().trim().isLength({ max: 50 }),
    body('linkLabel').optional().trim().isLength({ max: 80 })
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

      const reel = await createReelFromUpload({
        user,
        filename: req.file.filename,
        body: req.body,
      });

      res.status(201).json({
        status: 'success',
        message: (user.isAdmin && ['super', 'admin'].includes(user.adminLevel))
          ? 'Reel uploaded and approved successfully'
          : 'Reel uploaded successfully. Waiting for admin approval.',
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

router.post('/upload/init', requireAuth, uploadLimiter, async (req, res) => {
  try {
    const totalChunks = Number(req.body.totalChunks);
    if (!Number.isInteger(totalChunks) || totalChunks < 1 || totalChunks > 400) {
      return res.status(400).json({ status: 'error', message: 'Invalid chunk count' });
    }

    const uploadId = crypto.randomBytes(16).toString('hex');
    const tmpDir = path.join(getUploadRoot(), 'tmp', `reel-${uploadId}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    pendingReelUploads.set(uploadId, {
      userId: String(req.user.id),
      tmpDir,
      totalChunks,
      received: new Set(),
      createdAt: Date.now(),
    });

    setTimeout(() => cleanupPendingUpload(uploadId), 60 * 60 * 1000);

    res.json({ status: 'success', data: { uploadId, totalChunks } });
  } catch (error) {
    console.error('Reel upload init error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to start upload' });
  }
});

const chunkUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

router.post('/upload/chunk', requireAuth, (req, res, next) => {
  chunkUpload.single('chunk')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message || 'Chunk too large' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const uploadId = String(req.body.uploadId || '');
    const pending = pendingReelUploads.get(uploadId);
    if (!pending || pending.userId !== String(req.user.id)) {
      return res.status(404).json({ status: 'error', message: 'Upload session not found' });
    }

    const chunkIndex = Number(req.body.index);
    if (!Number.isInteger(chunkIndex) || chunkIndex < 0 || chunkIndex >= pending.totalChunks) {
      return res.status(400).json({ status: 'error', message: 'Invalid chunk index' });
    }
    if (!req.file?.buffer?.length) {
      return res.status(400).json({ status: 'error', message: 'Missing chunk data' });
    }

    fs.writeFileSync(path.join(pending.tmpDir, `${chunkIndex}.part`), req.file.buffer);
    pending.received.add(chunkIndex);
    res.json({ status: 'success', data: { received: pending.received.size, totalChunks: pending.totalChunks } });
  } catch (error) {
    console.error('Reel chunk upload error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to upload chunk' });
  }
});

router.post('/upload/complete', requireAuth, async (req, res) => {
  try {
    const { uploadId } = req.body;
    const pending = pendingReelUploads.get(uploadId);
    if (!pending || pending.userId !== String(req.user.id)) {
      return res.status(404).json({ status: 'error', message: 'Upload session not found' });
    }
    if (pending.received.size !== pending.totalChunks) {
      return res.status(400).json({
        status: 'error',
        message: `Missing chunks (${pending.received.size}/${pending.totalChunks})`,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const filename = `reel-${Date.now()}-${Math.round(Math.random() * 1e9)}.mp4`;
    const finalPath = path.join(getUploadRoot(), 'videos', filename);
    const output = fs.createWriteStream(finalPath);
    for (let i = 0; i < pending.totalChunks; i += 1) {
      output.write(fs.readFileSync(path.join(pending.tmpDir, `${i}.part`)));
    }
    await new Promise((resolve, reject) => {
      output.end((err) => (err ? reject(err) : resolve()));
    });

    cleanupPendingUpload(uploadId);
    const reel = await createReelFromUpload({ user, filename, body: req.body });

    res.status(201).json({
      status: 'success',
      message: (user.isAdmin && ['super', 'admin'].includes(user.adminLevel))
        ? 'Reel uploaded and approved successfully'
        : 'Reel uploaded successfully. Waiting for admin approval.',
      data: { reel },
    });
  } catch (error) {
    console.error('Reel upload complete error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to finish upload' });
  }
});

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

    // Blocking must actually hide content, not just mute notifications.
    if (req.user) {
      const me = await User.findById(req.user.id).select('blockedUsers');
      if (me?.blockedUsers?.length) {
        query.uploadedBy = { $nin: me.blockedUsers };
      }
    }

    // If feed is 'following', show only reels from followed users
    if (feed === 'following' && req.user) {
      const user = await User.findById(req.user.id);
      if (user && user.following && user.following.length > 0) {
        // Keep the blocked-user exclusion when narrowing to followed users.
        query.uploadedBy = { ...(query.uploadedBy || {}), $in: user.following };
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

    // Add isLiked / isReposted / commentsCount for each reel
    const reelsWithLiked = reels.map((reel, index) => {
      const reelObj = reel.toObject();
      reelObj.videoUrl = resolveReelVideoUrl(reelObj, index);
      reelObj.commentsCount = Array.isArray(reel.comments) ? reel.comments.length : 0;
      if (req.user) {
        const userId = req.user.id || req.user._id;
        reelObj.isLiked = reel.likedBy && reel.likedBy.some(
          (id) => id.toString() === userId.toString()
        );
        reelObj.isReposted = reel.repostedBy && reel.repostedBy.some(
          (id) => id.toString() === userId.toString()
        );
      } else {
        reelObj.isLiked = false;
        reelObj.isReposted = false;
      }
      return sanitizeReelPublic(reelObj);
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
      data: { reels: reels.map((reel) => sanitizeReelPublic(reel.toObject())) }
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
// @desc    Get user's own reels + reposts
// @access  Private
router.get('/my-reels', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const ownReels = await Reel.find({ uploadedBy: userId }).sort({ createdAt: -1 });
    const reposted = await Reel.find({
      repostedBy: userId,
      status: 'approved',
      isActive: true,
      uploadedBy: { $ne: userId },
    }).populate('uploadedBy', 'name avatar').sort({ createdAt: -1 });

    const mapReel = (reel, index, isRepost = false) => {
      const reelObj = reel.toObject();
      reelObj.videoUrl = resolveReelVideoUrl(reelObj, index);
      reelObj.commentsCount = Array.isArray(reel.comments) ? reel.comments.length : 0;
      reelObj.isLiked = reel.likedBy && reel.likedBy.some((id) => id.toString() === userId.toString());
      reelObj.isReposted = reel.repostedBy && reel.repostedBy.some((id) => id.toString() === userId.toString());
      reelObj.isRepostItem = isRepost;
      return sanitizeReelPublic(reelObj);
    };

    const reels = [
      ...ownReels.map((r, i) => mapReel(r, i, false)),
      ...reposted.map((r, i) => mapReel(r, i + ownReels.length, true)),
    ];

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

// @route   PATCH /api/reels/:id/link
// @desc    Attach a promo link to an existing reel
// @access  Owner or admin
router.patch('/:id/link', requireAuth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ status: 'error', message: 'Reel not found' });
    }

    const user = await User.findById(req.user.id);
    const isOwner = reel.uploadedBy.toString() === String(req.user.id);
    const isAdminUser = user?.isAdmin && ['super', 'admin'].includes(user.adminLevel);
    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ status: 'error', message: 'Not allowed' });
    }

    const linkType = ['course', 'thought', 'podcast', 'roadmap', 'article', 'news'].includes(req.body.linkType)
      ? req.body.linkType
      : 'none';
    const linkId = linkType === 'none' ? '' : String(req.body.linkId || '').trim();

    reel.linkType = linkId ? linkType : 'none';
    reel.linkId = linkId;
    reel.linkLabel = String(req.body.linkLabel || '').trim().slice(0, 80);
    await reel.save();

    res.json({
      status: 'success',
      data: { reel },
    });
  } catch (error) {
    console.error('Error updating reel link:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update reel link' });
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

// @route   POST /api/reels/:id/repost
// @desc    Repost/Unrepost a reel to your profile
// @access  Private
router.post('/:id/repost', requireAuth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ status: 'error', message: 'Reel not found' });
    }

    const userId = req.user.id || req.user._id;
    if (!reel.repostedBy) reel.repostedBy = [];

    const already = reel.repostedBy.some((id) => id.toString() === userId.toString());
    if (already) {
      reel.repostedBy = reel.repostedBy.filter((id) => id.toString() !== userId.toString());
      reel.reposts = Math.max(0, (reel.reposts || 0) - 1);
    } else {
      reel.repostedBy.push(userId);
      reel.reposts = (reel.reposts || 0) + 1;
    }

    await reel.save();

    res.json({
      status: 'success',
      message: already ? 'Repost removed' : 'Reposted to your profile',
      data: {
        reposts: reel.reposts,
        isReposted: !already,
      }
    });
  } catch (error) {
    console.error('Error toggling repost:', error);
    res.status(500).json({ status: 'error', message: 'Failed to toggle repost' });
  }
});

// @route   GET /api/reels/:id/comments
// @desc    Get comments for a reel
// @access  Public
router.get('/:id/comments', apiLimiter, optionalAuth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('comments.user', 'name avatar');

    if (!reel) {
      return res.status(404).json({ status: 'error', message: 'Reel not found' });
    }

    // A blocked user's comments must disappear too, not just their reels.
    let blocked = [];
    if (req.user) {
      const me = await User.findById(req.user.id).select('blockedUsers');
      blocked = (me?.blockedUsers || []).map((id) => String(id));
    }

    const comments = (reel.comments || [])
      .filter((c) => !(c.user && blocked.includes(String(c.user._id || c.user))))
      .slice()
      .reverse()
      .map((c) => ({
        _id: c._id,
        text: c.text,
        createdAt: c.createdAt,
        user: c.user
          ? { _id: c.user._id, name: c.user.name, avatar: c.user.avatar || '' }
          : { _id: null, name: 'User', avatar: '' },
      }));

    res.json({
      status: 'success',
      data: { comments, count: comments.length }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch comments' });
  }
});

// @route   POST /api/reels/:id/comments
// @desc    Add a comment to a reel
// @access  Private
router.post('/:id/comments', requireAuth, [
  body('text').trim().notEmpty().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment text is required',
        errors: errors.array(),
      });
    }

    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ status: 'error', message: 'Reel not found' });
    }

    const userId = req.user.id || req.user._id;
    reel.comments.push({
      user: userId,
      text: req.body.text.trim(),
      createdAt: new Date(),
    });
    await reel.save();

    await reel.populate('comments.user', 'name avatar');
    const last = reel.comments[reel.comments.length - 1];

    res.status(201).json({
      status: 'success',
      message: 'Comment added',
      data: {
        comment: {
          _id: last._id,
          text: last.text,
          createdAt: last.createdAt,
          user: last.user
            ? { _id: last.user._id, name: last.user.name, avatar: last.user.avatar || '' }
            : { _id: userId, name: 'User', avatar: '' },
        },
        commentsCount: reel.comments.length,
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add comment' });
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

// @route   POST /api/reels/:id/report
// @desc    Report a reel or one of its comments (App Store guideline 1.2)
// @access  Private
router.post('/:id/report', requireAuth, [
  body('reason').isIn(['spam', 'harassment', 'hate', 'violence', 'sexual', 'copyright', 'other']),
  body('details').optional().trim().isLength({ max: 500 }),
  body('commentId').optional().isMongoId(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'A valid reason is required',
        errors: errors.array(),
      });
    }

    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ status: 'error', message: 'Reel not found' });
    }

    const { commentId } = req.body;
    let targetType = 'reel';
    let reportedUser = reel.uploadedBy || null;

    if (commentId) {
      const comment = reel.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ status: 'error', message: 'Comment not found' });
      }
      targetType = 'comment';
      reportedUser = comment.user || null;
    }

    const userId = req.user.id || req.user._id;

    try {
      await Report.create({
        reportedBy: userId,
        targetType,
        reel: reel._id,
        commentId: commentId || null,
        reportedUser,
        reason: req.body.reason,
        details: (req.body.details || '').trim(),
      });
    } catch (err) {
      // Duplicate key = already reported by this user; treat as success so the
      // client shows the same confirmation either way.
      if (err && err.code === 11000) {
        return res.json({
          status: 'success',
          message: 'You have already reported this content. Our team is reviewing it.',
        });
      }
      throw err;
    }

    res.status(201).json({
      status: 'success',
      message: 'Thanks — our team will review this content within 24 hours.',
    });
  } catch (error) {
    console.error('Error reporting content:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit report' });
  }
});

// @route   GET /api/reels/admin/reports
// @desc    Moderation queue
// @access  Admin
router.get('/admin/reports', requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const reports = await Report.find({ status })
      .populate('reportedBy', 'name email')
      .populate('reportedUser', 'name email')
      .populate('reel', 'title videoUrl uploadedByName')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ status: 'success', data: { reports } });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch reports' });
  }
});

module.exports = router;

