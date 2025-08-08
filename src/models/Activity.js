const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [300, 'Subtitle cannot exceed 300 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['gain', 'offer', 'reward', 'purchase', 'sale', 'referral', 'login', 'profile_update'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  relatedModel: {
    type: String,
    enum: ['Cask', 'Offer', 'Purchase', 'User', 'Payment', 'Referral'],
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  badge: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    min: [0, 'Amount cannot be negative'],
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'GBP', 'EUR'],
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String,
    deviceType: String,
    source: String,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for time ago
activitySchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  
  const minutes = Math.floor(diffTime / (1000 * 60));
  const hours = Math.floor(diffTime / (1000 * 60 * 60));
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
});

// Static method to create activity
activitySchema.statics.createActivity = async function(data) {
  try {
    const activity = new this(data);
    await activity.save();
    return activity;
  } catch (error) {
    throw error;
  }
};

// Static method to get user activities with pagination
activitySchema.statics.getUserActivities = async function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return await this.find({ user: userId, isVisible: true })
    .populate('relatedId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Indexes for performance
activitySchema.index({ user: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ isVisible: 1 });
activitySchema.index({ priority: 1 });

// Compound indexes
activitySchema.index({ user: 1, type: 1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ user: 1, isVisible: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);