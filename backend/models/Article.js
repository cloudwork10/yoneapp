const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Article description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  content: {
    type: String,
    required: [true, 'Article content is required']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  readTime: {
    type: String,
    required: [true, 'Read time is required']
  },
  category: {
    type: String,
    required: [true, 'Article category is required'],
    enum: ['programming', 'design', 'marketing', 'freelancing', 'career']
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    required: [true, 'Article image is required']
  },
  icon: {
    type: String,
    default: '📄'
  },
  color: {
    type: String,
    default: '#E50914'
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
articleSchema.index({ title: 'text', description: 'text', content: 'text' });
articleSchema.index({ category: 1 });
articleSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('Article', articleSchema);
