const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: [
      'Frontend Development',
      'Backend Development',
      'Full Stack Development',
      'Mobile Development',
      'Database',
      'DevOps',
      'UI/UX Design',
      'Programming',
      'Web Development'
    ]
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  duration: {
    type: Number, // in hours
    required: [true, 'Course duration is required']
  },
  price: {
    type: Number,
    default: 0 // Free courses
  },
  thumbnail: {
    type: String,
    default: ''
  },
  videos: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  resources: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'link', 'code'],
      default: 'link'
    }
  }],
  requirements: [{
    type: String
  }],
  learningOutcomes: [{
    type: String
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  studentsEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  studentsCompleted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.studentsEnrolled.length;
});

// Virtual for completion count
courseSchema.virtual('completionCount').get(function() {
  return this.studentsCompleted.length;
});

// Index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
