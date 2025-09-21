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
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true
  },
  instructorBio: {
    type: String,
    default: '',
    maxlength: [500, 'Instructor bio cannot be more than 500 characters']
  },
  instructorAvatar: {
    type: String,
    default: '👨‍💻'
  },
  instructorRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.9
  },
  instructorStudents: {
    type: Number,
    default: 25000
  },
  duration: {
    type: String,
    required: [true, 'Course duration is required']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: [true, 'Course level is required']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 15420
  },
  students: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  language: {
    type: String,
    default: 'Arabic'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  // Course sections and lessons
  sections: [{
    title: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    lessons: [{
      title: {
        type: String,
        required: false,
        trim: true,
        default: ''
      },
      description: {
        type: String,
        default: ''
      },
      videoUrl: {
        type: String,
        default: ''
      },
      duration: {
        type: String,
        default: ''
      },
      thumbnail: {
        type: String,
        default: ''
      },
      isCompleted: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    order: {
      type: Number,
      default: 0
    }
  }],
  // Course preview video
  previewVideo: {
    type: String,
    default: ''
  },
  // Course completion certificate
  certificateTemplate: {
    type: String,
    default: ''
  },
  // Course requirements
  requirements: [{
    type: String,
    trim: true
  }],
  // What students will learn
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  lastUpdated: {
    type: String,
    default: '2 weeks ago'
  },
  challenges: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['project', 'quiz', 'coding', 'design', 'research'],
      default: 'project'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy'
    },
    points: {
      type: Number,
      default: 10,
      min: 0
    },
    duration: {
      type: String,
      default: '1 week'
    },
    requirements: [{
      type: String,
      trim: true
    }],
    deliverables: [{
      type: String,
      trim: true
    }],
    guidelines: [{
      type: String,
      trim: true
    }],
    evaluationCriteria: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  }],
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
courseSchema.index({ title: 'text', description: 'text' }, { 
  default_language: 'none',
  language_override: 'none'
});
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('Course', courseSchema);