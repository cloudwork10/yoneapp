const express = require('express');
const Podcast = require('../models/Podcast');
const Article = require('../models/Article');
const Roadmap = require('../models/Roadmap');
const CVTemplate = require('../models/CVTemplate');
const Advice = require('../models/Advice');
const ProgrammingTerm = require('../models/ProgrammingTerm');
const ProgrammerThought = require('../models/ProgrammerThought');
const Course = require('../models/Course');
const Challenge = require('../models/Challenge');

const router = express.Router();

// @route   GET /api/public/podcasts
// @desc    Get active podcasts for public use
// @access  Public
router.get('/podcasts', async (req, res) => {
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

// @route   GET /api/public/podcasts/:id
// @desc    Get single podcast by ID for public use
// @access  Public
router.get('/podcasts/:id', async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
      .select('-createdBy -updatedBy -__v');

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
    console.error('Error fetching public podcast:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch podcast'
    });
  }
});

// @route   GET /api/public/articles
// @desc    Get active articles for public use
// @access  Public
router.get('/articles', async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    let filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    res.json({
      status: 'success',
      data: {
        articles
      }
    });
  } catch (error) {
    console.error('Error fetching public articles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch articles'
    });
  }
});

// @route   GET /api/public/articles/:id
// @desc    Get single article by ID for public use
// @access  Public
router.get('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .select('-createdBy -updatedBy -__v');

    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        article
      }
    });
  } catch (error) {
    console.error('Error fetching public article:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch article'
    });
  }
});

// @route   GET /api/public/roadmaps
// @desc    Get active roadmaps for public use
// @access  Public
router.get('/roadmaps', async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    let filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const roadmaps = await Roadmap.find(filter)
      .sort({ createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    res.json({
      status: 'success',
      data: {
        roadmaps
      }
    });
  } catch (error) {
    console.error('Error fetching public roadmaps:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch roadmaps'
    });
  }
});

// @route   GET /api/public/roadmaps/:id
// @desc    Get single roadmap by ID for public use
// @access  Public
router.get('/roadmaps/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id)
      .select('-createdBy -updatedBy -__v');

    if (!roadmap) {
      return res.status(404).json({
        status: 'error',
        message: 'Roadmap not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        roadmap
      }
    });
  } catch (error) {
    console.error('Error fetching public roadmap:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch roadmap'
    });
  }
});

// @route   GET /api/public/cv-templates
// @desc    Get active CV templates for public use
// @access  Public
router.get('/cv-templates', async (req, res) => {
  try {
    const cvTemplates = await CVTemplate.find({ isActive: true })
      .sort({ downloads: -1, createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    res.json({
      status: 'success',
      data: {
        cvTemplates
      }
    });
  } catch (error) {
    console.error('Error fetching public CV templates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch CV templates'
    });
  }
});

// @route   GET /api/public/content/advices
// @desc    Get active advices for public use
// @access  Public
router.get('/content/advices', async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    let filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const advices = await Advice.find(filter)
      .sort({ createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    res.json({
      status: 'success',
      data: {
        advices
      }
    });
  } catch (error) {
    console.error('Error fetching public advices:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch advices'
    });
  }
});

// @route   GET /api/public/programming-terms
// @desc    Get active programming terms for public use
// @access  Public
router.get('/programming-terms', async (req, res) => {
  try {
    const programmingTerms = await ProgrammingTerm.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    res.json({
      status: 'success',
      data: {
        terms: programmingTerms,
        count: programmingTerms.length
      }
    });
  } catch (error) {
    console.error('Error fetching public programming terms:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch programming terms'
    });
  }
});

// ==================== COURSES PUBLIC ROUTES ====================

// @route   GET /api/public/courses
// @desc    Get all courses for public use
// @access  Public
router.get('/courses', async (req, res) => {
  try {
    console.log('📚 Public courses route hit!');
    const courses = await Course.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: {
        courses
      }
    });
  } catch (error) {
    console.error('Get public courses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/public/courses/:id
// @desc    Get single course by ID for public use
// @access  Public
router.get('/courses/:id', async (req, res) => {
  try {
    console.log('📚 Public course details route hit!', req.params.id);
    const course = await Course.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('Get public course details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/public/courses
// @desc    Create course for testing
// @access  Public
router.post('/courses', async (req, res) => {
  try {
    console.log('📚 Creating course with data:', req.body);
    
    const courseData = {
      ...req.body,
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
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Course with this title already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create course',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/public/courses/:id
// @desc    Update course for testing
// @access  Public
router.put('/courses/:id', async (req, res) => {
  try {
    console.log('📚 Updating course with data:', req.body);
    
    const courseData = {
      ...req.body,
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
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Course with this title already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update course',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/public/courses/:id
// @desc    Delete course for testing
// @access  Public
router.delete('/courses/:id', async (req, res) => {
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

// ==================== CHALLENGES ROUTES ====================

// @route   GET /api/public/challenges
// @desc    Get active challenges for public use
// @access  Public
router.get('/challenges', async (req, res) => {
  try {
    const { category, difficulty, type, featured } = req.query;
    
    let filter = { isActive: true, isPublic: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }
    
    if (type && type !== 'All') {
      filter.type = type;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const challenges = await Challenge.find(filter)
      .sort({ createdAt: -1 })
      .select('-participants -createdBy -updatedBy -__v');

    res.json({
      status: 'success',
      data: {
        challenges,
        count: challenges.length
      }
    });
  } catch (error) {
    console.error('Error fetching public challenges:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch challenges'
    });
  }
});

// @route   GET /api/public/challenges/:id
// @desc    Get single challenge by ID for public use
// @access  Public
router.get('/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .select('-participants -createdBy -updatedBy -__v');

    if (!challenge) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Error fetching public challenge:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch challenge'
    });
  }
});

// @route   POST /api/public/challenges
// @desc    Create challenge for testing
// @access  Public
router.post('/challenges', async (req, res) => {
  try {
    console.log('🏆 Creating challenge with data:', req.body);
    
    const challengeData = {
      ...req.body,
      requirements: req.body.requirements || [],
      deliverables: req.body.deliverables || [],
      resources: req.body.resources || [],
      guidelines: req.body.guidelines || [],
      evaluationCriteria: req.body.evaluationCriteria || [],
      tags: req.body.tags || [],
      participants: []
    };

    const challenge = await Challenge.create(challengeData);

    console.log('✅ Challenge created:', challenge);
    res.status(201).json({
      status: 'success',
      message: 'Challenge created successfully',
      data: challenge
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Challenge with this title already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create challenge',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/public/challenges/:id
// @desc    Update challenge for testing
// @access  Public
router.put('/challenges/:id', async (req, res) => {
  try {
    console.log('🏆 Updating challenge with data:', req.body);
    
    const challengeData = {
      ...req.body,
      requirements: req.body.requirements || [],
      deliverables: req.body.deliverables || [],
      resources: req.body.resources || [],
      guidelines: req.body.guidelines || [],
      evaluationCriteria: req.body.evaluationCriteria || [],
      tags: req.body.tags || []
    };

    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      challengeData,
      { new: true, runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }

    console.log('✅ Challenge updated:', challenge);
    res.status(200).json({
      status: 'success',
      message: 'Challenge updated successfully',
      data: challenge
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Challenge with this title already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update challenge',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/public/challenges/:id
// @desc    Delete challenge for testing
// @access  Public
router.delete('/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete challenge'
    });
  }
});

// ==================== PROGRAMMING TERMS ROUTES ====================

// @route   GET /api/public/programming-terms
// @desc    Get active programming terms for public use
// @access  Public
router.get('/programming-terms', async (req, res) => {
  try {
    const { language, category, difficulty, featured } = req.query;
    
    let filter = { isActive: true };
    
    if (language && language !== 'All') {
      filter.language = language;
    }
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const terms = await ProgrammingTerm.find(filter)
      .sort({ createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    res.json({
      status: 'success',
      data: {
        terms,
        count: terms.length
      }
    });
  } catch (error) {
    console.error('Error fetching programming terms:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch programming terms'
    });
  }
});

// @route   GET /api/public/programming-terms/:id
// @desc    Get single programming term by ID for public use
// @access  Public
router.get('/programming-terms/:id', async (req, res) => {
  try {
    const term = await ProgrammingTerm.findById(req.params.id)
      .select('-createdBy -updatedBy -__v');

    if (!term) {
      return res.status(404).json({
        status: 'error',
        message: 'Programming term not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        term
      }
    });
  } catch (error) {
    console.error('Error fetching programming term:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch programming term'
    });
  }
});

// @route   POST /api/public/programming-terms
// @desc    Create programming term for testing
// @access  Public
router.post('/programming-terms', async (req, res) => {
  try {
    console.log('⚡ Creating programming term with data:', req.body);
    
    const termData = {
      ...req.body,
      examples: req.body.examples || [],
      relatedTerms: req.body.relatedTerms || []
    };

    const term = await ProgrammingTerm.create(termData);

    console.log('✅ Programming term created:', term);
    res.status(201).json({
      status: 'success',
      message: 'Programming term created successfully',
      data: term
    });
  } catch (error) {
    console.error('Create programming term error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Programming term with this name already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create programming term',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/public/programming-terms/:id
// @desc    Update programming term for testing
// @access  Public
router.put('/programming-terms/:id', async (req, res) => {
  try {
    console.log('⚡ Updating programming term with data:', req.body);
    
    const termData = {
      ...req.body,
      examples: req.body.examples || [],
      relatedTerms: req.body.relatedTerms || []
    };

    const term = await ProgrammingTerm.findByIdAndUpdate(
      req.params.id,
      termData,
      { new: true, runValidators: true }
    );

    if (!term) {
      return res.status(404).json({
        status: 'error',
        message: 'Programming term not found'
      });
    }

    console.log('✅ Programming term updated:', term);
    res.status(200).json({
      status: 'success',
      message: 'Programming term updated successfully',
      data: term
    });
  } catch (error) {
    console.error('Update programming term error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Programming term with this name already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update programming term',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/public/programming-terms/:id
// @desc    Delete programming term for testing
// @access  Public
router.delete('/programming-terms/:id', async (req, res) => {
  try {
    const term = await ProgrammingTerm.findByIdAndDelete(req.params.id);

    if (!term) {
      return res.status(404).json({
        status: 'error',
        message: 'Programming term not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Programming term deleted successfully'
    });
  } catch (error) {
    console.error('Delete programming term error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete programming term'
    });
  }
});

// ==================== PROGRAMMER THOUGHTS ROUTES ====================

// @route   GET /api/public/programmer-thoughts
// @desc    Get active programmer thoughts for public use
// @access  Public
router.get('/programmer-thoughts', async (req, res) => {
  try {
    const { category, season, featured } = req.query;
    
    let filter = { isActive: true, isPublic: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (season && season !== 'All') {
      filter.season = parseInt(season);
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const thoughts = await ProgrammerThought.find(filter)
      .sort({ season: -1, episodeNumber: -1 })
      .select('-createdBy -updatedBy -__v');

    res.json({
      status: 'success',
      data: {
        thoughts,
        count: thoughts.length
      }
    });
  } catch (error) {
    console.error('Error fetching programmer thoughts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch programmer thoughts'
    });
  }
});

// @route   GET /api/public/programmer-thoughts/:id
// @desc    Get single programmer thought by ID for public use
// @access  Public
router.get('/programmer-thoughts/:id', async (req, res) => {
  try {
    const thought = await ProgrammerThought.findById(req.params.id)
      .select('-createdBy -updatedBy -__v');

    if (!thought) {
      return res.status(404).json({
        status: 'error',
        message: 'Programmer thought not found'
      });
    }

    // Increment views
    await ProgrammerThought.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      status: 'success',
      data: {
        thought
      }
    });
  } catch (error) {
    console.error('Error fetching programmer thought:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch programmer thought'
    });
  }
});

// @route   POST /api/public/programmer-thoughts
// @desc    Create programmer thought for testing
// @access  Public
router.post('/programmer-thoughts', async (req, res) => {
  try {
    console.log('💭 Creating programmer thought with data:', req.body);
    
    const thoughtData = {
      ...req.body,
      keyPoints: req.body.keyPoints || [],
      resources: req.body.resources || [],
      tags: req.body.tags || []
    };

    const thought = await ProgrammerThought.create(thoughtData);

    console.log('✅ Programmer thought created:', thought);
    res.status(201).json({
      status: 'success',
      message: 'Programmer thought created successfully',
      data: thought
    });
  } catch (error) {
    console.error('Create programmer thought error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Episode with this number already exists for this season'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create programmer thought',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/public/programmer-thoughts/:id
// @desc    Update programmer thought for testing
// @access  Public
router.put('/programmer-thoughts/:id', async (req, res) => {
  try {
    console.log('💭 Updating programmer thought with data:', req.body);
    
    const thoughtData = {
      ...req.body,
      keyPoints: req.body.keyPoints || [],
      resources: req.body.resources || [],
      tags: req.body.tags || []
    };

    const thought = await ProgrammerThought.findByIdAndUpdate(
      req.params.id,
      thoughtData,
      { new: true, runValidators: true }
    );

    if (!thought) {
      return res.status(404).json({
        status: 'error',
        message: 'Programmer thought not found'
      });
    }

    console.log('✅ Programmer thought updated:', thought);
    res.status(200).json({
      status: 'success',
      message: 'Programmer thought updated successfully',
      data: thought
    });
  } catch (error) {
    console.error('Update programmer thought error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Episode with this number already exists for this season'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update programmer thought',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/public/programmer-thoughts/:id
// @desc    Delete programmer thought for testing
// @access  Public
router.delete('/programmer-thoughts/:id', async (req, res) => {
  try {
    const thought = await ProgrammerThought.findByIdAndDelete(req.params.id);

    if (!thought) {
      return res.status(404).json({
        status: 'error',
        message: 'Programmer thought not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Programmer thought deleted successfully'
    });
  } catch (error) {
    console.error('Delete programmer thought error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete programmer thought'
    });
  }
});

module.exports = router;
