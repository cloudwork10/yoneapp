const mongoose = require('mongoose');

const courseProjectSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 80,
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    liveUrl: {
      type: String,
      default: '',
      trim: true,
    },
    videoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    extraUrl: {
      type: String,
      default: '',
      trim: true,
    },
    note: {
      type: String,
      default: '',
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNote: {
      type: String,
      default: '',
      maxlength: 500,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate',
      default: null,
    },
  },
  { timestamps: true }
);

courseProjectSubmissionSchema.index({ user: 1, course: 1 }, { unique: true });
courseProjectSubmissionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('CourseProjectSubmission', courseProjectSubmissionSchema);
