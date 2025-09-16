const express = require('express');
const Podcast = require('../models/Podcast');
const Article = require('../models/Article');
const Roadmap = require('../models/Roadmap');
const CVTemplate = require('../models/CVTemplate');
const Advice = require('../models/Advice');
const ProgrammingTerm = require('../models/ProgrammingTerm');

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

// @route   GET /api/public/advice
// @desc    Get active advice for public use
// @access  Public
router.get('/advice', async (req, res) => {
  try {
    const advice = await Advice.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    res.json({
      status: 'success',
      data: {
        advice
      }
    });
  } catch (error) {
    console.error('Error fetching public advice:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch advice'
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

module.exports = router;
