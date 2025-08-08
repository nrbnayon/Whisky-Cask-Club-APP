const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Referrer is required'],
  },
  referee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Referee is required'],
  },
  referralCode: {
    type: String,
    required: [true, 'Referral code is required'],
    trim: true,
    uppercase: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  rewardAmount: {
    type: Number,
    default: 50,
    min: [0, 'Reward amount cannot be negative'],
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'GBP', 'EUR'],
  },
  rewardPaid: {
    type: Boolean,
    default: false,
  },
  rewardPaidDate: {
    type: Date,
  },
  completedDate: {
    type: Date,
  },
  firstPurchaseDate: {
    type: Date,
  },
  firstPurchaseAmount: {
    type: Number,
  },
  totalPurchases: {
    type: Number,
    default: 0,
  },
  totalPurchaseAmount: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  metadata: {
    source: String,
    campaign: String,
    medium: String,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for days since referral
referralSchema.virtual('daysSinceReferral').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to set completion date
referralSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  next();
});

// Static method to complete referral
referralSchema.statics.completeReferral = async function(refereeId, purchaseAmount) {
  try {
    const referral = await this.findOne({ 
      referee: refereeId, 
      status: 'pending' 
    }).populate('referrer referee');
    
    if (!referral) return null;
    
    referral.status = 'completed';
    referral.completedDate = new Date();
    referral.firstPurchaseDate = new Date();
    referral.firstPurchaseAmount = purchaseAmount;
    referral.totalPurchases = 1;
    referral.totalPurchaseAmount = purchaseAmount;
    
    await referral.save();
    
    // Update referrer's total referrals and earnings
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(referral.referrer._id, {
      $inc: { 
        totalReferrals: 1,
        totalEarnings: referral.rewardAmount 
      }
    });
    
    return referral;
  } catch (error) {
    throw error;
  }
};

// Static method to get referral stats
referralSchema.statics.getReferralStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { referrer: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalReward: { $sum: '$rewardAmount' },
      }
    }
  ]);
  
  const result = {
    total: 0,
    completed: 0,
    pending: 0,
    totalEarned: 0,
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    if (stat._id === 'completed') {
      result.completed = stat.count;
      result.totalEarned = stat.totalReward;
    } else if (stat._id === 'pending') {
      result.pending = stat.count;
    }
  });
  
  return result;
};

// Indexes for performance
referralSchema.index({ referrer: 1 });
referralSchema.index({ referee: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ createdAt: -1 });
referralSchema.index({ rewardPaid: 1 });

// Compound indexes
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referee: 1, status: 1 });

module.exports = mongoose.model('Referral', referralSchema);