const mongoose = require('mongoose');

const adviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Advice title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Advice content is required']
  },
  category: {
    type: String,
    required: [true, 'Advice category is required'],
    enum: ['career-shift', 'kids', 'motivation', 'success', 'programming', 'business']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Reading duration is required']
  },
  likes: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    required: [true, 'Advice thumbnail is required']
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
    ref: 'User',
    required: true
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
