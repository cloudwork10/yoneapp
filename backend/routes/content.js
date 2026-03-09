const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const Podcast = require('../models/Podcast');
const Article = require('../models/Article');
const Roadmap = require('../models/Roadmap');
const Advice = require('../models/Advice');
const ProgrammingTerm = require('../models/ProgrammingTerm');
const CVTemplate = require('../models/CVTemplate');
// const { requireAuth  } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/security');
const { apiLimiter } = require('../middleware/security');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    if (file.fieldname === 'image') {
      uploadPath = path.join(__dirname, '../uploads/images');
    } else if (file.fieldname === 'video') {
      uploadPath = path.join(__dirname, '../uploads/videos');
    } else if (file.fieldname === 'audio') {
      uploadPath = path.join(__dirname, '../uploads/audios');
    } else {
      uploadPath = path.join(__dirname, '../uploads/images');
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image, video, and audio files are allowed!'), false);
    }
  }
});

// ==================== IMAGE UPLOAD ====================

// @route   POST /api/admin/content/upload-image
// @desc    Upload image for content
// @access  Public (for testing)
router.post('/upload-image', uploadLimiter, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    const baseUrl = process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/uploads/images/${req.file.filename}`;
    
    res.json({
      status: 'success',
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload image'
    });
  }
});

// @route   POST /api/admin/content/upload-video
// @desc    Upload video for content
// @access  Admin
router.post('/upload-video', uploadLimiter, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No video file provided'
      });
    }

    const baseUrl = process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000';
    const videoUrl = `${baseUrl}/uploads/videos/${req.file.filename}`;

    res.json({
      status: 'success',
      data: {
        videoUrl: videoUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload video'
    });
  }
});

// @route   POST /api/admin/content/upload-audio
// @desc    Upload audio for content
// @access  Public (for testing)
router.post('/upload-audio', uploadLimiter, (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'File too large. Maximum size is 100MB.'
        });
      }
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File upload error'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('🎤 Audio upload request received');
    console.log('🎤 Request headers:', req.headers);
    console.log('🎤 Request body keys:', Object.keys(req.body || {}));
    console.log('🎤 Request file:', req.file);
    
    if (!req.file) {
      console.error('❌ No audio file provided in request');
      return res.status(400).json({
        status: 'error',
        message: 'No audio file provided'
      });
    }

    console.log('✅ Audio file received:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const baseUrl = process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000';
    const audioUrl = `${baseUrl}/uploads/audios/${req.file.filename}`;

    console.log('✅ Audio uploaded successfully, URL:', audioUrl);

    res.json({
      status: 'success',
      data: {
        audioUrl: audioUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('❌ Error uploading audio:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload audio',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Simple audio upload route for testing
router.post('/upload-audio-simple', async (req, res) => {
  try {
    console.log('🎤 Simple audio upload request received');
    console.log('🎤 Content-Type:', req.get('Content-Type'));
    console.log('🎤 Request body type:', typeof req.body);
    console.log('🎤 Request body length:', req.body ? Object.keys(req.body).length : 'no body');
    
    // For testing - just return success
    res.json({
      status: 'success',
      message: 'Simple audio upload endpoint working',
      data: {
        audioUrl: `${process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000'}/uploads/audios/test-audio.m4a`,
        filename: 'test-audio.m4a'
      }
    });
  } catch (error) {
    console.error('❌ Simple audio upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Simple audio upload failed',
      details: error.message
    });
  }
});

// ==================== COURSES ====================

// @route   GET /api/admin/content/courses
// @desc    Get all courses with pagination and filtering
// @access  Admin
router.get('/courses', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, category, level, status } = req.query;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (level) {
      filter.level = level;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const courses = await Course.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/content/courses
// @desc    Create a new course
// @access  Admin
router.post('/courses', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('instructor').trim().isLength({ min: 1 }).withMessage('Instructor name is required'),
  body('duration').trim().isLength({ min: 1 }).withMessage('Duration is required'),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),
  body('category').isIn(['Programming', 'Design', 'Business', 'Marketing', 'Data Science']).withMessage('Invalid category'),
  body('thumbnail').isURL().withMessage('Valid thumbnail URL is required')
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

    const courseData = {
      ...req.body,
      createdBy: null
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/content/courses/:id
// @desc    Update a course
// @access  Admin
router.put('/courses/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }),
  body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('category').optional().isIn(['Programming', 'Design', 'Business', 'Marketing', 'Data Science'])
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

    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: null
    };

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/content/courses/:id
// @desc    Delete a course
// @access  Admin
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== PODCASTS ====================

// @route   GET /api/admin/content/podcasts
// @desc    Get all podcasts with pagination and filtering
// @access  Admin
router.get('/podcasts',  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, category, status } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { host: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const podcasts = await Podcast.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Podcast.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        podcasts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get podcasts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== ARTICLES ====================

// @route   GET /api/admin/content/articles
// @desc    Get all articles with pagination and filtering
// @access  Admin
router.get('/articles',  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, category, status } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const articles = await Article.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== ROADMAPS ====================

// @route   GET /api/admin/content/roadmaps
// @desc    Get all roadmaps with pagination and filtering
// @access  Admin
router.get('/roadmaps',  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, category, difficulty, status } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const roadmaps = await Roadmap.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Roadmap.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        roadmaps,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== ADVICES ====================

// @route   GET /api/admin/content/advices
// @desc    Get all advices with pagination and filtering
// @access  Admin
router.get('/advices',  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, category, status } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const advices = await Advice.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Advice.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        advices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get advices error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/content/advices
// @desc    Create new advice
// @access  Admin
router.post('/advices',  async (req, res) => {
  try {
    // Remove _id from req.body to prevent duplicate key error
    const { _id, ...bodyData } = req.body;
    
    const adviceData = {
      ...bodyData,
      createdBy: (req.user && req.user.id) || null
    };

    const advice = await Advice.create(adviceData);

    res.status(201).json({
      status: 'success',
      data: advice
    });
  } catch (error) {
    console.error('Create advice error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create advice'
    });
  }
});

// @route   PUT /api/admin/content/advices/:id
// @desc    Update advice
// @access  Admin
router.put('/advices/:id',  async (req, res) => {
  try {
    // Remove _id from req.body to prevent issues
    const { _id, ...bodyData } = req.body;
    
    const adviceData = {
      ...bodyData,
      updatedBy: (req.user && req.user.id) || null
    };

    const advice = await Advice.findByIdAndUpdate(
      req.params.id,
      adviceData,
      { new: true, runValidators: true }
    );

    if (!advice) {
      return res.status(404).json({
        status: 'error',
        message: 'Advice not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: advice
    });
  } catch (error) {
    console.error('Update advice error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update advice'
    });
  }
});

// @route   DELETE /api/admin/content/advices/:id
// @desc    Delete advice
// @access  Admin
router.delete('/advices/:id',  async (req, res) => {
  try {
    console.log('🗑️ Delete advice request:', {
      id: req.params.id,
      user: req.user?.id,
      method: req.method,
      url: req.originalUrl
    });

    const advice = await Advice.findByIdAndDelete(req.params.id);

    if (!advice) {
      console.log('❌ Advice not found:', req.params.id);
      return res.status(404).json({
        status: 'error',
        message: 'Advice not found'
      });
    }

    console.log('✅ Advice deleted successfully:', req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Advice deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete advice error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete advice'
    });
  }
});

// ==================== PROGRAMMING TERMS ====================

// @route   GET /api/admin/content/programming-terms
// @desc    Get all programming terms with pagination and filtering
// @access  Admin
router.get('/programming-terms', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, language, category, status } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { term: { $regex: search, $options: 'i' } },
        { definition: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (language) {
      filter.language = language;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const terms = await ProgrammingTerm.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ProgrammingTerm.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        terms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get programming terms error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== CV TEMPLATES ====================

// @route   GET /api/admin/content/cv-templates
// @desc    Get all CV templates with pagination and filtering
// @access  Admin
router.get('/cv-templates',  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, category, status } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const cvTemplates = await CVTemplate.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CVTemplate.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        cvTemplates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get CV templates error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/content/cv-templates
// @desc    Create a new CV template
// @access  Admin
router.post('/cv-templates', async (req, res) => {
  try {
    console.log('📝 CV Template POST request received');
    console.log('🔐 User:', req.user?.email);
    console.log('📊 Body:', req.body);

    const cvTemplateData = {
      ...req.body,
      createdBy: (req.user && req.user.id) || null,
      downloads: 0,
      rating: 5.0
    };

    const cvTemplate = await CVTemplate.create(cvTemplateData);

    res.status(201).json({
      status: 'success',
      message: 'CV template created successfully',
      data: { cvTemplate }
    });
  } catch (error) {
    console.error('Create CV template error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/content/cv-templates/:id
// @desc    Update a CV template
// @access  Admin
router.put('/cv-templates/:id', [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('title').optional().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ min: 1, max: 500 }),
    body('experience').optional().trim().isLength({ max: 50 }),
    body('education').optional().trim().isLength({ max: 200 }),
    body('skills').optional().isArray(),
    body('downloadUrl').optional(),
    body('fileType').optional().isIn(['link', 'pdf'])
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

    const cvTemplate = await CVTemplate.findById(req.params.id);
    
    if (!cvTemplate) {
      return res.status(404).json({
        status: 'error',
        message: 'CV template not found'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: null
    };

    const updatedCVTemplate = await CVTemplate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'CV template updated successfully',
      data: { cvTemplate: updatedCVTemplate }
    });
  } catch (error) {
    console.error('Update CV template error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/content/cv-templates/:id
// @desc    Delete a CV template
// @access  Admin
router.delete('/cv-templates/:id', async (req, res) => {
  try {
    const cvTemplate = await CVTemplate.findById(req.params.id);
    
    if (!cvTemplate) {
      return res.status(404).json({
        status: 'error',
        message: 'CV template not found'
      });
    }

    await CVTemplate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'CV template deleted successfully'
    });
  } catch (error) {
    console.error('Delete CV template error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== PUBLIC CV TEMPLATES ====================

// @route   GET /api/content/cv-templates
// @desc    Get all active CV templates for public use
// @access  Public
router.get('/public/cv-templates', apiLimiter, async (req, res) => {
  try {
    const cvTemplates = await CVTemplate.find({ isActive: true })
      .sort({ downloads: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { cvTemplates }
    });
  } catch (error) {
    console.error('Get public CV templates error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== CONTENT STATISTICS ====================

// @route   GET /api/admin/content/statistics
// @desc    Get content statistics
// @access  Admin
router.get('/statistics', async (req, res) => {
  try {
    const [
      totalCourses,
      totalPodcasts,
      totalArticles,
      totalRoadmaps,
      totalAdvices,
      totalTerms,
      totalCVTemplates,
      activeCourses,
      activePodcasts,
      activeArticles,
      activeRoadmaps,
      activeAdvices,
      activeTerms,
      activeCVTemplates
    ] = await Promise.all([
      Course.countDocuments(),
      Podcast.countDocuments(),
      Article.countDocuments(),
      Roadmap.countDocuments(),
      Advice.countDocuments(),
      ProgrammingTerm.countDocuments(),
      CVTemplate.countDocuments(),
      Course.countDocuments({ isActive: true }),
      Podcast.countDocuments({ isActive: true }),
      Article.countDocuments({ isActive: true }),
      Roadmap.countDocuments({ isActive: true }),
      Advice.countDocuments({ isActive: true }),
      ProgrammingTerm.countDocuments({ isActive: true }),
      CVTemplate.countDocuments({ isActive: true })
    ]);

    const statistics = {
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
      },
      inactive: {
        courses: totalCourses - activeCourses,
        podcasts: totalPodcasts - activePodcasts,
        articles: totalArticles - activeArticles,
        roadmaps: totalRoadmaps - activeRoadmaps,
        advices: totalAdvices - activeAdvices,
        terms: totalTerms - activeTerms,
        cvTemplates: totalCVTemplates - activeCVTemplates
      }
    };

    res.status(200).json({
      status: 'success',
      data: { statistics }
    });
  } catch (error) {
    console.error('Get content statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== ARTICLES ====================

// @route   GET /api/admin/content/articles
// @desc    Get all articles with pagination and filtering
// @access  Admin
router.get('/articles',  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, category, status } = req.query;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const articles = await Article.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        articles,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/content/articles
// @desc    Create a new article
// @access  Admin
router.post('/articles', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('author').trim().isLength({ min: 1, max: 50 }).withMessage('Author is required and must be less than 50 characters'),
  body('readTime').trim().isLength({ min: 1, max: 20 }).withMessage('Read time is required'),
  body('category').isIn(['programming', 'design', 'marketing', 'freelancing', 'career']).withMessage('Valid category is required'),
  body('image').optional().trim(),
  body('icon').optional().trim(),
  body('color').optional().trim()
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

    const articleData = {
      ...req.body,
      createdBy: null,
      views: 0,
      likes: 0
    };

    const article = await Article.create(articleData);

    res.status(201).json({
      status: 'success',
      message: 'Article created successfully',
      data: { article }
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/content/articles/:id
// @desc    Update an article
// @access  Admin
router.put('/articles/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }),
  body('content').optional().trim().isLength({ min: 1 }),
  body('author').optional().trim().isLength({ min: 1, max: 50 }),
  body('readTime').optional().trim().isLength({ min: 1, max: 20 }),
  body('category').optional().isIn(['programming', 'design', 'marketing', 'freelancing', 'career']),
  body('image').optional().trim(),
  body('icon').optional().trim(),
  body('color').optional().trim()
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

    const articleData = {
      ...req.body,
      updatedBy: null
    };

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      articleData,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Article updated successfully',
      data: { article }
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/content/articles/:id
// @desc    Delete an article
// @access  Admin
router.delete('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== PUBLIC ARTICLES ====================

// @route   GET /api/content/public/articles
// @desc    Get all active articles for public use
// @access  Public
router.get('/public/articles', apiLimiter, async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    const filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const articles = await Article.find(filter)
      .select('title description author readTime category views likes image icon color createdAt')
      .sort({ isFeatured: -1, views: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { articles }
    });
  } catch (error) {
    console.error('Get public articles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/content/public/articles/:id
// @desc    Get a single article by ID for public use
// @access  Public
router.get('/public/articles/:id', apiLimiter, async (req, res) => {
  try {
    const article = await Article.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).select('title description content author readTime category views likes image icon color createdAt');

    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
    }

    // Increment view count
    await Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.status(200).json({
      status: 'success',
      data: { article }
    });
  } catch (error) {
    console.error('Get single article error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== ROADMAPS ROUTES ====================

// @route   GET /api/admin/content/roadmaps
// @desc    Get all roadmaps for admin
// @access  Admin
router.get('/roadmaps',  async (req, res) => {
  try {
    const roadmaps = await Roadmap.find()
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { roadmaps }
    });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/content/roadmaps
// @desc    Create a new roadmap
// @access  Admin
router.post('/roadmaps', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('category').isIn(['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Data Science', 'AI/ML']).withMessage('Valid category is required'),
  body('difficulty').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Valid difficulty level is required'),
  body('duration').trim().isLength({ min: 1 }).withMessage('Duration is required'),
  body('steps').optional().isArray(),
  body('image').optional().trim(),
  body('icon').optional().trim(),
  body('color').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean()
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

    const roadmapData = {
      ...req.body,
      createdBy: req.user?.id || null
    };

    const roadmap = new Roadmap(roadmapData);
    await roadmap.save();

    await roadmap.populate('createdBy', 'name email');

    res.status(201).json({
      status: 'success',
      data: { roadmap }
    });
  } catch (error) {
    console.error('Create roadmap error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/content/roadmaps/:id
// @desc    Update a roadmap
// @access  Admin
router.put('/roadmaps/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be less than 100 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').optional().isIn(['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Data Science', 'AI/ML']).withMessage('Valid category is required'),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Valid difficulty level is required'),
  body('duration').optional().trim().isLength({ min: 1 }).withMessage('Duration is required'),
  body('steps').optional().isArray(),
  body('image').optional().trim(),
  body('icon').optional().trim(),
  body('color').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean()
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

    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({
        status: 'error',
        message: 'Roadmap not found'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user?.id || null
    };

    const updatedRoadmap = await Roadmap.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email').populate('updatedBy', 'name email');

    res.status(200).json({
      status: 'success',
      data: { roadmap: updatedRoadmap }
    });
  } catch (error) {
    console.error('Update roadmap error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/content/roadmaps/:id
// @desc    Delete a roadmap
// @access  Admin
router.delete('/roadmaps/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({
        status: 'error',
        message: 'Roadmap not found'
      });
    }

    await Roadmap.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Roadmap deleted successfully'
    });
  } catch (error) {
    console.error('Delete roadmap error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/content/public/roadmaps
// @desc    Get all active roadmaps for public use
// @access  Public
router.get('/public/roadmaps', apiLimiter, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ isActive: true })
      .select('title description category difficulty duration steps image icon color isFeatured createdAt')
      .sort({ isFeatured: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { roadmaps }
    });
  } catch (error) {
    console.error('Get public roadmaps error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/content/public/roadmaps/:id
// @desc    Get a single roadmap by ID for public use
// @access  Public
router.get('/public/roadmaps/:id', apiLimiter, async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).select('title description category difficulty duration steps image icon color isFeatured createdAt');

    if (!roadmap) {
      return res.status(404).json({
        status: 'error',
        message: 'Roadmap not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { roadmap }
    });
  } catch (error) {
    console.error('Get single roadmap error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// ==================== PODCASTS ====================

// @route   GET /api/admin/content/podcasts
// @desc    Get all podcasts for admin
// @access  Admin
router.get('/podcasts',  async (req, res) => {
  try {
    const podcasts = await Podcast.find()
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: {
        podcasts
      }
    });
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch podcasts'
    });
  }
});

// @route   GET /api/admin/content/podcasts/:id
// @desc    Get single podcast by ID
// @access  Admin
router.get('/podcasts/:id', async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!podcast) {
      return res.status(404).json({
        status: 'error',
        message: 'Podcast not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        podcast
      }
    });
  } catch (error) {
    console.error('Error fetching podcast:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch podcast'
    });
  }
});

// @route   POST /api/admin/content/podcasts
// @desc    Create new podcast
// @access  Admin
router.post('/podcasts', async (req, res) => {
  try {
    console.log('🎧 Creating podcast with data:', req.body);
    console.log('🎬 Video URL:', req.body.videoUrl);
    console.log('🎬 Intro Video:', req.body.introVideo);
    console.log('🎬 Episodes:', req.body.episodes);

    // Simple podcast creation - no validation, no required fields
    const podcast = await Podcast.create({
      title: req.body.title || 'My Podcast',
      description: req.body.description || 'Great podcast episode',
      host: req.body.host || 'Host Name',
      duration: req.body.duration || '30:00',
      category: req.body.category || 'Technology',
      rating: req.body.rating || 4,
      totalListeners: req.body.totalListeners || 100,
      thumbnail: req.body.thumbnail || '',
      videoUrl: req.body.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      introVideo: req.body.introVideo || '',
      episodes: req.body.episodes || [],
      isActive: true,
      isFeatured: false
    });

    console.log('✅ Podcast created:', podcast);

    res.json({
      status: 'success',
      data: { podcast }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @route   PUT /api/admin/content/podcasts/:id
// @desc    Update podcast
// @access  Admin
router.put('/podcasts/:id', async (req, res) => {
  try {
    console.log('🎧 Updating podcast with data:', req.body);
    console.log('🎬 Video URL:', req.body.videoUrl);
    console.log('🎬 Intro Video:', req.body.introVideo);
    console.log('🎬 Episodes:', req.body.episodes);
    
    const updateData = {
      ...req.body,
      updatedBy: req.user?.id || null
    };

    console.log('🎧 Update data:', updateData);
    
    const podcast = await Podcast.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('✅ Podcast updated:', podcast);

    if (!podcast) {
      return res.status(404).json({
        status: 'error',
        message: 'Podcast not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        podcast
      }
    });
  } catch (error) {
    console.error('Error updating podcast:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update podcast'
    });
  }
});

// @route   DELETE /api/admin/content/podcasts/:id
// @desc    Delete podcast
// @access  Admin
router.delete('/podcasts/:id', async (req, res) => {
  try {
    const podcast = await Podcast.findByIdAndDelete(req.params.id);

    if (!podcast) {
      return res.status(404).json({
        status: 'error',
        message: 'Podcast not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Podcast deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete podcast'
    });
  }
});

// ==================== PUBLIC PODCASTS ====================

// @route   GET /api/content/public/podcasts
// @desc    Get active podcasts for public
// @access  Public
router.get('/public/podcasts', async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    let filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const podcasts = await Podcast.find(filter)
      .sort({ createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    res.json({
      status: 'success',
      data: {
        podcasts
      }
    });
  } catch (error) {
    console.error('Error fetching public podcasts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch podcasts'
    });
  }
});

// Simple test route for podcast creation
router.post('/test-podcast', async (req, res) => {
  try {
    console.log('🧪 Test route called');
    const podcast = await Podcast.create({
      title: 'Test Podcast',
      description: 'Test Description',
      host: 'Test Host',
      duration: '30:00',
      category: 'Technology',
      rating: 4,
      totalListeners: 100,
      thumbnail: '',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isActive: true,
      isFeatured: false
    });

    console.log('✅ Test podcast created:', podcast);
    res.json({
      status: 'success',
      data: { podcast }
    });
  } catch (error) {
    console.error('❌ Test route error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ==================== COURSES MANAGEMENT ====================

// TEST ROUTE
router.get('/test-courses', async (req, res) => {
  res.json({ status: 'success', message: 'Course routes working!' });
});

// @route   GET /api/admin/content/courses
// @desc    Get all courses for admin management
// @access  Admin
router.get('/courses', async (req, res) => {
  try {
    console.log('📚 GET /courses route hit with auth!');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, category, level, status } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (level) {
      filter.level = level;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const courses = await Course.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/content/courses/:id
// @desc    Get single course by ID for admin
// @access  Admin
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/content/courses
// @desc    Create new course
// @access  Admin
router.post('/courses', async (req, res) => {
  try {
    console.log('📚 Creating course with data:', req.body);
    
    const courseData = {
      ...req.body,
      createdBy: (req.user && req.user.id) || null,
      sections: req.body.sections || [],
      requirements: req.body.requirements || [],
      learningOutcomes: req.body.learningOutcomes || []
    };

    const course = await Course.create(courseData);

    console.log('✅ Course created:', course);
    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create course'
    });
  }
});

// @route   PUT /api/admin/content/courses/:id
// @desc    Update course
// @access  Admin
router.put('/courses/:id',  async (req, res) => {
  try {
    console.log('📚 Updating course with data:', req.body);
    
    const courseData = {
      ...req.body,
      updatedBy: (req.user && req.user.id) || null,
      sections: req.body.sections || [],
      requirements: req.body.requirements || [],
      learningOutcomes: req.body.learningOutcomes || []
    };

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      courseData,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    console.log('✅ Course updated:', course);
    res.status(200).json({
      status: 'success',
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update course'
    });
  }
});

// @route   DELETE /api/admin/content/courses/:id
// @desc    Delete course
// @access  Admin
router.delete('/courses/:id',  async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete course'
    });
  }
});

// ==================== PUBLIC ROUTES ====================

// @route   GET /api/public/content/articles
// @desc    Get all active articles for public viewing
// @access  Public
router.get('/public/articles', async (req, res) => {
  try {
    console.log('📰 Public: Fetching articles...');
    
    const articles = await Article.find({ isActive: true })
      .select('-createdBy -updatedBy')
      .sort({ createdAt: -1 });

    console.log('📰 Public: Found articles:', articles.length);
    console.log('📰 Public: Articles data:', articles);

    res.status(200).json({
      status: 'success',
      data: { articles }
    });
  } catch (error) {
    console.error('Public articles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch articles'
    });
  }
});

// @route   GET /api/public/content/advices
// @desc    Get all active advices for public viewing
// @access  Public
router.get('/public/advices', async (req, res) => {
  try {
    console.log('💡 Public: Fetching advices...');
    
    const advices = await Advice.find({ isActive: true })
      .select('-createdBy -updatedBy')
      .sort({ createdAt: -1 });

    console.log('💡 Public: Found advices:', advices.length);
    console.log('💡 Public: Advices data:', advices);

    res.status(200).json({
      status: 'success',
      data: { advices }
    });
  } catch (error) {
    console.error('Public advices error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch advices'
    });
  }
});

// @route   GET /api/public/content/roadmaps
// @desc    Get all active roadmaps for public viewing
// @access  Public
router.get('/public/roadmaps', async (req, res) => {
  try {
    console.log('🗺️ Public: Fetching roadmaps...');
    
    const roadmaps = await Roadmap.find({ isActive: true })
      .select('-createdBy -updatedBy')
      .sort({ createdAt: -1 });

    console.log('🗺️ Public: Found roadmaps:', roadmaps.length);
    console.log('🗺️ Public: Roadmaps data:', roadmaps);

    res.status(200).json({
      status: 'success',
      data: { roadmaps }
    });
  } catch (error) {
    console.error('Public roadmaps error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch roadmaps'
    });
  }
});

module.exports = router;
