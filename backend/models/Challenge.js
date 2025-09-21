const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['project', 'quiz', 'coding', 'design', 'research'],
    required: [true, 'Challenge type is required'],
    default: 'project'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: [true, 'Difficulty level is required'],
    default: 'medium'
  },
  category: {
    type: String,
    required: [true, 'Challenge category is required'],
    enum: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Mobile Development', 'Web Development']
  },
  points: {
    type: Number,
    min: 0,
    max: 1000,
    default: 100
  },
  timeLimit: {
    type: String, // e.g., "2 hours", "1 week", "30 minutes"
    default: ''
  },
  dueDate: {
    type: String, // e.g., "2024-01-15"
    default: ''
  },
  requirements: [{
    type: String,
    trim: true
  }],
  deliverables: [{
    type: String,
    trim: true
  }],
  resources: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['link', 'video', 'document', 'tutorial'],
      default: 'link'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  // Challenge instructions and guidelines
  instructions: {
    type: String,
    default: ''
  },
  guidelines: [{
    type: String,
    trim: true
  }],
  // Evaluation criteria
  evaluationCriteria: [{
    criterion: {
      type: String,
      required: true,
      trim: true
    },
    weight: {
      type: Number,
      min: 0,
      max: 100,
      default: 25
    },
    description: {
      type: String,
      default: ''
    }
  }],
  // Challenge status and settings
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
  // Participation tracking
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['started', 'in_progress', 'submitted', 'completed', 'abandoned'],
      default: 'started'
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    feedback: {
      type: String,
      default: ''
    }
  }],
  // Statistics
  totalParticipants: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  averageScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Creator information
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
challengeSchema.index({ title: 'text', description: 'text' }, { 
  default_language: 'none',
  language_override: 'none'
});
challengeSchema.index({ category: 1, difficulty: 1 });
challengeSchema.index({ type: 1, isActive: 1 });
challengeSchema.index({ isFeatured: 1, isActive: 1 });

// Virtual for completion percentage
challengeSchema.virtual('completionPercentage').get(function() {
  if (this.totalParticipants === 0) return 0;
  const completed = this.participants.filter(p => p.status === 'completed').length;
  return Math.round((completed / this.totalParticipants) * 100);
});

// Static method to get challenge statistics
challengeSchema.statics.getChallengeStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalChallenges: { $sum: 1 },
        activeChallenges: {
          $sum: {
            $cond: ['$isActive', 1, 0]
          }
        },
        featuredChallenges: {
          $sum: {
            $cond: ['$isFeatured', 1, 0]
          }
        },
        totalParticipants: { $sum: '$totalParticipants' },
        averagePoints: { $avg: '$points' }
      }
    }
  ]);
  
  return stats[0] || {
    totalChallenges: 0,
    activeChallenges: 0,
    featuredChallenges: 0,
    totalParticipants: 0,
    averagePoints: 0
  };
};

module.exports = mongoose.model('Challenge', challengeSchema);
