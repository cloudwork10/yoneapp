const express = require('express');
const Podcast = require('../models/Podcast');
const Article = require('../models/Article');
const Roadmap = require('../models/Roadmap');
const CVTemplate = require('../models/CVTemplate');
const Advice = require('../models/Advice');
const ProgrammingTerm = require('../models/ProgrammingTerm');
const Course = require('../models/Course');

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
        programmingTerms
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
    res.status(500).json({
      status: 'error',
      message: 'Failed to create course'
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
    res.status(500).json({
      status: 'error',
      message: 'Failed to update course'
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

module.exports = router;
