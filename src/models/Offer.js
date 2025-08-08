const mongoose = require('mongoose');

const offerDetailsSchema = new mongoose.Schema({
  distillery: String,
  vintage: String,
  volume: String,
  abv: String,
  maturationPeriod: String,
  caskType: String,
  bottle: String,
  packaging: String,
  certificates: String,
  duration: String,
  tastings: String,
  participants: String,
  includes: String,
}, { _id: false });

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['cask', 'bottle', 'experience'],
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
  },
  images: [{
    type: String,
  }],
  originalPrice: {
    type: String,
    required: [true, 'Original price is required'],
  },
  currentPrice: {
    type: String,
    required: [true, 'Current price is required'],
  },
  priceNumeric: {
    type: Number,
    required: [true, 'Numeric price is required'],
    min: [0, 'Price cannot be negative'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0,
  },
  daysLeft: {
    type: Number,
    required: [true, 'Days left is required'],
    min: [0, 'Days left cannot be negative'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  details: {
    type: offerDetailsSchema,
    required: true,
  },
  badge: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  stock: {
    type: Number,
    default: 1,
    min: [0, 'Stock cannot be negative'],
  },
  category: {
    type: String,
    enum: ['premium', 'rare', 'limited', 'standard'],
    default: 'standard',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  views: {
    type: Number,
    default: 0,
  },
  interests: {
    type: Number,
    default: 0,
  },
  metadata: {
    source: String,
    importDate: Date,
    lastPriceUpdate: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for discount percentage
offerSchema.virtual('discountPercentage').get(function() {
  const original = parseFloat(this.originalPrice.replace(/[^0-9.-]+/g, ''));
  const current = parseFloat(this.currentPrice.replace(/[^0-9.-]+/g, ''));
  
  if (original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
});

// Virtual for time remaining
offerSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Pre-save middleware to update days left
offerSchema.pre('save', function(next) {
  if (this.expiryDate) {
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.daysLeft = Math.max(0, diffDays);
  }
  next();
});

// Indexes for performance
offerSchema.index({ type: 1 });
offerSchema.index({ isActive: 1 });
offerSchema.index({ isFeatured: 1 });
offerSchema.index({ expiryDate: 1 });
offerSchema.index({ priceNumeric: 1 });
offerSchema.index({ rating: -1 });
offerSchema.index({ createdAt: -1 });
offerSchema.index({ views: -1 });
offerSchema.index({ interests: -1 });

// Text search index
offerSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  'details.distillery': 'text',
});

// Compound indexes
offerSchema.index({ type: 1, isActive: 1, expiryDate: 1 });
offerSchema.index({ category: 1, priceNumeric: 1 });

module.exports = mongoose.model('Offer', offerSchema);