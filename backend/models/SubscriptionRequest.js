const mongoose = require('mongoose');

const subscriptionRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi-annual', 'annual'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'EGP',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    receiptUrl: {
      type: String,
      required: true,
    },
    receiptHash: {
      type: String,
      default: '',
      index: true,
    },
    referenceCode: {
      type: String,
      required: true,
      unique: true,
    },
    userNote: {
      type: String,
      default: '',
      maxlength: 500,
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
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
  },
  { timestamps: true }
);

subscriptionRequestSchema.index({ user: 1, status: 1 });
subscriptionRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SubscriptionRequest', subscriptionRequestSchema);
