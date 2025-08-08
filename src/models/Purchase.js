const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: [true, 'Offer is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
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
  },
  daysLeft: {
    type: Number,
    required: [true, 'Days left is required'],
    min: [0, 'Days left cannot be negative'],
  },
  investmentAmount: {
    type: String,
    required: [true, 'Investment amount is required'],
  },
  investmentAmountNumeric: {
    type: Number,
    required: [true, 'Numeric investment amount is required'],
    min: [0, 'Investment amount cannot be negative'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed', 'Reject', 'Cancelled'],
    default: 'Pending',
  },
  submittedDate: {
    type: Date,
    default: Date.now,
  },
  contactMethod: {
    type: String,
    enum: ['Email', 'Phone', 'Both'],
    default: 'Email',
  },
  expectedReturn: {
    type: String,
    default: '+15-20%',
  },
  offerId: {
    type: String,
    required: true,
  },
  personalInfo: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone'],
      default: 'email',
    },
  },
  paymentInfo: {
    paymentMethod: String,
    transactionId: String,
    paymentDate: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    reason: String,
  }],
  completedDate: Date,
  cancelledDate: Date,
  cancellationReason: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for days since submission
purchaseSchema.virtual('daysSinceSubmission').get(function() {
  const now = new Date();
  const submitted = new Date(this.submittedDate);
  const diffTime = now - submitted;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to add status history
purchaseSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
    });
  }
  next();
});

// Pre-save middleware to set completion/cancellation dates
purchaseSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'Completed' && !this.completedDate) {
      this.completedDate = new Date();
    }
    if (this.status === 'Cancelled' && !this.cancelledDate) {
      this.cancelledDate = new Date();
    }
  }
  next();
});

// Indexes for performance
purchaseSchema.index({ user: 1 });
purchaseSchema.index({ offer: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ type: 1 });
purchaseSchema.index({ submittedDate: -1 });
purchaseSchema.index({ 'paymentInfo.paymentStatus': 1 });

// Compound indexes
purchaseSchema.index({ user: 1, status: 1 });
purchaseSchema.index({ user: 1, type: 1 });
purchaseSchema.index({ status: 1, submittedDate: -1 });

module.exports = mongoose.model('Purchase', purchaseSchema);