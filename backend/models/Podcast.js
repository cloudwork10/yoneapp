const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
  title: {
    type: String,
    default: '',
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  host: {
    type: String,
    default: '',
    trim: true
  },
  highlights: [{
    icon: { type: String, default: '🚀', trim: true },
    text: { type: String, default: '', trim: true }
  }],
  formatItems: [{
    icon: { type: String, default: '🎙️', trim: true },
    label: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true }
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  hosts: [{
    name: { type: String, default: '', trim: true },
    title: { type: String, default: '', trim: true },
    bio: { type: String, default: '', trim: true },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['host', 'guest'],
      default: 'host'
    },
    episodesCount: { type: String, default: '' },
    listenersCount: { type: String, default: '' },
    rating: { type: String, default: '' }
  }],
  duration: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Technology',
    enum: ['Technology', 'Programming', 'Business', 'Design', 'Career']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalListeners: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  videoUrl: {
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
  // Dynamic content fields
  introVideo: {
    type: String,
    default: ''
  },
  accessType: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  episodes: [{
    title: {
      type: String,
      default: ''
    },
    duration: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    thumbnail: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    accessType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'premium'
    },
    comingSoon: {
      type: Boolean,
      default: false
    },
    releaseDate: {
      type: Date,
      default: null
    },
    category: {
      type: String,
      default: 'Episode'
    }
  }],
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
podcastSchema.index({ title: 'text', description: 'text' });
podcastSchema.index({ category: 1 });
podcastSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('Podcast', podcastSchema);
