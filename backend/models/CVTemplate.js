const mongoose = require('mongoose');

const cvTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'CV template name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  title: {
    type: String,
    required: [true, 'CV template title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'CV template description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    default: 'General',
    enum: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'DevOps Engineer', 'Data Scientist', 'UI/UX Designer', 'Product Manager', 'General']
  },
  experience: {
    type: String,
    default: 'Not specified'
  },
  skills: [{
    type: String,
    trim: true
  }],
  education: {
    type: String,
    default: 'Not specified'
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  price: {
    type: String,
    enum: ['Free', 'Premium'],
    default: 'Free'
  },
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/300x400/1a1a1a/E50914?text=CV+Template'
  },
  downloadUrl: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    enum: ['link', 'pdf'],
    default: 'link'
  },
  previewImages: [{
    type: String
  }],
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
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better search performance
cvTemplateSchema.index({ name: 'text', title: 'text', description: 'text' });
cvTemplateSchema.index({ category: 1 });
cvTemplateSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('CVTemplate', cvTemplateSchema);
