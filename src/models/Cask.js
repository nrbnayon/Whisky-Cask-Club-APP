const mongoose = require('mongoose');

const appreciationDataSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const forecastDataSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 85,
  },
}, { _id: false });

const caskDetailsSchema = new mongoose.Schema({
  bottle: String,
  packaging: String,
  volume: {
    type: String,
    required: true,
  },
  abv: String,
  years: String,
  warehouseLocation: String,
  certificates: String,
  caskType: String,
  maturationPeriod: String,
}, { _id: false });

const caskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cask name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  distillery: {
    type: String,
    required: [true, 'Distillery name is required'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1800, 'Year must be after 1800'],
    max: [new Date().getFullYear(), 'Year cannot be in the future'],
  },
  volume: {
    type: String,
    required: [true, 'Volume is required'],
  },
  abv: {
    type: String,
    required: [true, 'ABV is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  estimatedValue: {
    type: String,
    required: [true, 'Estimated value is required'],
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0, 'Purchase price cannot be negative'],
  },
  currentValue: {
    type: Number,
    required: [true, 'Current value is required'],
    min: [0, 'Current value cannot be negative'],
  },
  gain: {
    type: String,
    required: true,
  },
  gainPercentage: {
    type: String,
    required: true,
  },
  totalGain: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Ready', 'Maturing', 'Sold', 'Reserved'],
    default: 'Maturing',
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
  },
  images: [{
    type: String,
  }],
  details: {
    type: caskDetailsSchema,
    required: true,
  },
  appreciationData: [appreciationDataSchema],
  currentAppreciation: {
    type: String,
    required: true,
  },
  futureForecasts: [forecastDataSchema],
  projectedAppreciation: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  maturityDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  metadata: {
    source: String,
    importDate: Date,
    lastUpdated: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for calculated gain
caskSchema.virtual('calculatedGain').get(function() {
  return this.currentValue - this.purchasePrice;
});

// Virtual for calculated gain percentage
caskSchema.virtual('calculatedGainPercentage').get(function() {
  if (this.purchasePrice === 0) return 0;
  return ((this.currentValue - this.purchasePrice) / this.purchasePrice * 100).toFixed(2);
});

// Pre-save middleware to update calculated fields
caskSchema.pre('save', function(next) {
  if (this.isModified('currentValue') || this.isModified('purchasePrice')) {
    const gainAmount = this.currentValue - this.purchasePrice;
    const gainPercent = this.purchasePrice > 0 ? 
      ((gainAmount / this.purchasePrice) * 100).toFixed(1) : 0;
    
    this.gain = gainAmount >= 0 ? `+$${gainAmount.toLocaleString()}` : `-$${Math.abs(gainAmount).toLocaleString()}`;
    this.gainPercentage = gainAmount >= 0 ? `+${gainPercent}%` : `-${gainPercent}%`;
  }
  next();
});

// Indexes for performance
caskSchema.index({ owner: 1 });
caskSchema.index({ status: 1 });
caskSchema.index({ distillery: 1 });
caskSchema.index({ year: 1 });
caskSchema.index({ createdAt: -1 });
caskSchema.index({ currentValue: -1 });
caskSchema.index({ 'details.volume': 1 });

// Text search index
caskSchema.index({
  name: 'text',
  distillery: 'text',
  location: 'text',
});

module.exports = mongoose.model('Cask', caskSchema);