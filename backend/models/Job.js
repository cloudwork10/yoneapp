const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 120,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 100,
    },
    companyLogo: { type: String, default: '' },
    companyEmail: { type: String, default: '', trim: true, lowercase: true },
    companyWebsite: { type: String, default: '', trim: true },
    location: { type: String, default: 'Egypt', trim: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'freelance'],
      default: 'full-time',
    },
    workMode: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      default: 'remote',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 8000,
    },
    requirements: { type: String, default: '', maxlength: 4000 },
    salaryRange: { type: String, default: '', trim: true },
    applyType: {
      type: String,
      enum: ['internal', 'external'],
      default: 'internal',
    },
    applyUrl: { type: String, default: '', trim: true },
    accessType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    // Who created it
    source: {
      type: String,
      enum: ['admin', 'company'],
      default: 'admin',
    },
    // Company posts need admin approval
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    applicationsCount: { type: Number, default: 0 },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', companyName: 'text', description: 'text' });
jobSchema.index({ approvalStatus: 1, isActive: 1, createdAt: -1 });
jobSchema.index({ type: 1, workMode: 1 });

module.exports = mongoose.model('Job', jobSchema);
