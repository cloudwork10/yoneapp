const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['monthly', 'quarterly', 'semi-annual', 'annual'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  /** User asked to cancel — access stays until endDate, then cron expires */
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'EGP'
  },
  paymentMethod: {
    type: String,
    enum: ['visa', 'mastercard', 'vodafone_cash', 'fawry', 'valu', 'manual', 'instapay'],
    required: true
  },
  paymobOrderId: {
    type: String,
    required: true
  },
  paymobTransactionId: {
    type: String,
    required: false,
    default: null
  },
  isSubscriptionActive: {
    type: Boolean,
    default: true
  },
  reminders: {
    twoDaysBefore: { type: Boolean, default: false },
    sameDay: { type: Boolean, default: false },
    lockTonight: { type: Boolean, default: false },
    expiredNotified: { type: Boolean, default: false },
  },
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ status: 1, endDate: 1 });

subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

subscriptionSchema.methods.getRemainingDays = function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
