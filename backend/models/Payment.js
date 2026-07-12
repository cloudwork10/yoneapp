const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'EGP'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['visa', 'mastercard', 'vodafone_cash', 'fawry', 'valu'],
    required: true
  },
  paymobOrderId: {
    type: String,
    required: true
  },
  paymobTransactionId: {
    type: String,
    required: true
  },
  paymobPaymentKey: {
    type: String,
    required: true
  },
  paymobResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  failureReason: {
    type: String,
    default: null
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ paymobOrderId: 1 });
paymentSchema.index({ paymobTransactionId: 1 });

// Method to check if payment is successful
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'completed';
};

// Method to check if payment is pending
paymentSchema.methods.isPending = function() {
  return this.status === 'pending';
};

// Method to check if payment failed
paymentSchema.methods.isFailed = function() {
  return this.status === 'failed';
};

module.exports = mongoose.model('Payment', paymentSchema);



