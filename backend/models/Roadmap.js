const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Roadmap title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Roadmap description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Roadmap category is required'],
    enum: ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Data Science', 'AI/ML']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: [true, 'Difficulty level is required']
  },
  duration: {
    type: String,
    required: [true, 'Roadmap duration is required']
  },
  steps: [{
    title: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    },
    resources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['course', 'article', 'video', 'documentation', 'tool']
      }
    }],
    completed: {
      type: Boolean,
      default: false
    }
  }],
  image: {
    type: String,
    required: [true, 'Roadmap image is required']
  },
  icon: {
    type: String,
    default: '🗺️'
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
    required: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better search performance
roadmapSchema.index({ title: 'text', description: 'text' });
roadmapSchema.index({ category: 1, difficulty: 1 });
roadmapSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('Roadmap', roadmapSchema);
