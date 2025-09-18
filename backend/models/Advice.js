const mongoose = require('mongoose');

const adviceSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['career-shift', 'kids', 'motivation', 'success', 'programming', 'business'],
    default: 'motivation'
  },
  author: {
    type: String,
    trim: true,
    default: ''
  },
  duration: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  isRecorded: {
    type: Boolean,
    default: false
  },
  audioUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better search performance
adviceSchema.index({ title: 'text', content: 'text' });
adviceSchema.index({ category: 1 });
adviceSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('Advice', adviceSchema);
