const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  stripePaymentMethodId: {
    type: String,
    required: [true, 'Stripe payment method ID is required'],
  },
  type: {
    type: String,
    enum: ['card', 'bank_account'],
    required: [true, 'Payment method type is required'],
  },
  brand: {
    type: String,
    trim: true,
  },
  last4: {
    type: String,
    required: [true, 'Last 4 digits are required'],
    length: 4,
  },
  expiryMonth: {
    type: Number,
    min: 1,
    max: 12,
  },
  expiryYear: {
    type: Number,
    min: new Date().getFullYear(),
  },
  cardholderName: {
    type: String,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
  },
  stripePaymentIntentId: {
    type: String,
    required: [true, 'Stripe payment intent ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['USD', 'GBP', 'EUR'],
    default: 'USD',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    required: [true, 'Payment method is required'],
  },
  description: {
    type: String,
    trim: true,
  },
  receiptUrl: {
    type: String,
  },
  failureReason: {
    type: String,
    trim: true,
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative'],
  },
  refundReason: {
    type: String,
    trim: true,
  },
  refundDate: {
    type: Date,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: String,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const payoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  stripePayoutId: {
    type: String,
    required: [true, 'Stripe payout ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['USD', 'GBP', 'EUR'],
    default: 'USD',
  },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'paid', 'failed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    required: [true, 'Payment method is required'],
  },
  arrivalDate: {
    type: Date,
  },
  description: {
    type: String,
    trim: true,
  },
  failureReason: {
    type: String,
    trim: true,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: String,
  },
}, {
  timestamps: true,
});

// Indexes for PaymentMethod
paymentMethodSchema.index({ user: 1 });
paymentMethodSchema.index({ stripePaymentMethodId: 1 });
paymentMethodSchema.index({ isDefault: 1 });
paymentMethodSchema.index({ isActive: 1 });

// Indexes for Payment
paymentSchema.index({ user: 1 });
paymentSchema.index({ purchase: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Indexes for Payout
payoutSchema.index({ user: 1 });
payoutSchema.index({ stripePayoutId: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ createdAt: -1 });

// Compound indexes
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Payout = mongoose.model('Payout', payoutSchema);

module.exports = {
  PaymentMethod,
  Payment,
  Payout,
};