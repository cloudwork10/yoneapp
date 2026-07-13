const mongoose = require('mongoose');

const clubEnrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  cohort: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClubCohort',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active',
  },
  source: {
    type: String,
    enum: ['subscription', 'manual', 'purchase'],
    default: 'subscription',
  },
}, { timestamps: true });

clubEnrollmentSchema.index({ user: 1, cohort: 1 }, { unique: true });

module.exports = mongoose.model('ClubEnrollment', clubEnrollmentSchema);
