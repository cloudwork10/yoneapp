const mongoose = require('mongoose');

const contentWatchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  kind: {
    type: String,
    enum: ['course_lesson', 'podcast_episode'],
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  itemKey: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    default: '',
    trim: true,
  },
  parentTitle: {
    type: String,
    default: '',
    trim: true,
  },
  notified: {
    type: Boolean,
    default: false,
  },
  notifiedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

contentWatchSchema.index(
  { user: 1, kind: 1, parentId: 1, itemKey: 1 },
  { unique: true }
);

module.exports = mongoose.model('ContentWatch', contentWatchSchema);
