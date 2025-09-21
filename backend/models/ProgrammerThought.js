const mongoose = require('mongoose');

const programmerThoughtSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Episode title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Episode description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  duration: {
    type: String,
    required: false,
    default: '15:00'
  },
  thumbnail: {
    type: String,
    required: false,
    default: ''
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  category: {
    type: String,
    required: [true, 'Episode category is required'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  episodeNumber: {
    type: Number,
    required: true,
    min: 1
  },
  season: {
    type: Number,
    default: 1,
    min: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
  transcript: {
    type: String,
    default: ''
  },
  keyPoints: [{
    type: String,
    trim: true
  }],
  resources: [{
    title: { type: String, trim: true },
    url: { type: String, trim: true }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Index for better search performance
// Using 'none' language for text index to avoid language override issues
programmerThoughtSchema.index({ title: 'text', description: 'text' }, { 
  default_language: 'none',
  language_override: 'none'
});
programmerThoughtSchema.index({ category: 1, season: 1, episodeNumber: 1 });
programmerThoughtSchema.index({ isActive: 1, isFeatured: 1, isPublic: 1 });
programmerThoughtSchema.index({ publishDate: -1 });

module.exports = mongoose.model('ProgrammerThought', programmerThoughtSchema);
