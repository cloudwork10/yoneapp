const mongoose = require('mongoose');

/**
 * User reports on user-generated content (reels and comments).
 *
 * App Store guideline 1.2 requires apps with UGC to offer a way to report
 * objectionable content and to block abusive users. Blocking lives on
 * User.blockedUsers; this model is the reporting half, and gives admins a
 * queue to act on.
 */
const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['reel', 'comment'],
    required: true
  },
  /** The reel being reported, or the reel containing the reported comment. */
  reel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel',
    required: true
  },
  /** Set when targetType is 'comment'. */
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  /** Author of the reported content, kept for admin review. */
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'hate', 'violence', 'sexual', 'copyright', 'other'],
    required: true
  },
  details: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'actioned', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  adminNote: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

reportSchema.index({ status: 1, createdAt: -1 });
// One report per user per piece of content.
reportSchema.index(
  { reportedBy: 1, targetType: 1, reel: 1, commentId: 1 },
  { unique: true }
);

module.exports = mongoose.model('Report', reportSchema);
