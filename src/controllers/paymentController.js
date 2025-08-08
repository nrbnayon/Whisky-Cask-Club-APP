const { PaymentMethod, Payment, Payout } = require('../models/Payment');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get user payment methods
const getUserPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({
      user: req.user.id,
      isActive: true,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { paymentMethods },
    });
  } catch (error) {
    console.error('Get user payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods',
      error: error.message,
    });
  }
};

// Add payment method
const addPaymentMethod = async (req, res) => {
  try {
    const { cardNumber, expiryMonth, expiryYear, cvc, cardholderName } = req.body;

    // Create payment method with Stripe
    const stripePaymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber.replace(/\s/g, ''),
        exp_month: expiryMonth,
        exp_year: expiryYear,
        cvc: cvc,
      },
      billing_details: {
        name: cardholderName,
      },
    });

    // Check if this is the user's first payment method
    const existingMethodsCount = await PaymentMethod.countDocuments({
      user: req.user.id,
      isActive: true,
    });

    // Save payment method to database
    const paymentMethod = await PaymentMethod.create({
      user: req.user.id,
      stripePaymentMethodId: stripePaymentMethod.id,
      type: stripePaymentMethod.type,
      brand: stripePaymentMethod.card.brand,
      last4: stripePaymentMethod.card.last4,
      expiryMonth: stripePaymentMethod.card.exp_month,
      expiryYear: stripePaymentMethod.card.exp_year,
      cardholderName: cardholderName,
      isDefault: existingMethodsCount === 0, // First card becomes default
    });

    // Create activity
    await Activity.createActivity({
      title: 'Payment Method Added',
      subtitle: `${stripePaymentMethod.card.brand.toUpperCase()} card ending in ${stripePaymentMethod.card.last4}`,
      type: 'profile_update',
      user: req.user.id,
      relatedModel: 'PaymentMethod',
      relatedId: paymentMethod._id,
    });

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: { paymentMethod },
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add payment method',
      error: error.message,
    });
  }
};

// Remove payment method
const removePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);

    // Remove from database
    await PaymentMethod.findByIdAndDelete(id);

    // If this was the default method, make another one default
    if (paymentMethod.isDefault) {
      const nextMethodToMakeDefault = await PaymentMethod.findOne({
        user: req.user.id,
        isActive: true,
      });

      if (nextMethodToMakeDefault) {
        nextMethodToMakeDefault.isDefault = true;
        await nextMethodToMakeDefault.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment method removed successfully',
    });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove payment method',
      error: error.message,
    });
  }
};

// Set default payment method
const setDefaultPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove default from all user's payment methods
    await PaymentMethod.updateMany(
      { user: req.user.id },
      { isDefault: false }
    );

    // Set new default
    const paymentMethod = await PaymentMethod.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { isDefault: true },
      { new: true }
    );

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Default payment method updated successfully',
      data: { paymentMethod },
    });
  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default payment method',
      error: error.message,
    });
  }
};

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'USD', paymentMethodId, purchaseId } = req.body;

    // Validate purchase
    const purchase = await Purchase.findOne({
      _id: purchaseId,
      user: req.user.id,
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    // Validate payment method belongs to user
    const paymentMethod = await PaymentMethod.findOne({
      _id: paymentMethodId,
      user: req.user.id,
      isActive: true,
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method: paymentMethod.stripePaymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
    });

    // Save payment record
    const payment = await Payment.create({
      user: req.user.id,
      purchase: purchaseId,
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency,
      status: paymentIntent.status,
      paymentMethod: paymentMethodId,
      description: `Payment for ${purchase.title}`,
    });

    // Update purchase payment info
    purchase.paymentInfo = {
      paymentMethod: paymentMethod.brand + ' **** ' + paymentMethod.last4,
      transactionId: paymentIntent.id,
      paymentDate: new Date(),
      paymentStatus: paymentIntent.status,
    };
    await purchase.save();

    res.status(201).json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        payment,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      },
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
};

// Get user payments
const getUserPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';

    // Build query
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }

    // Get payments with pagination
    const payments = await Payment.find(query)
      .populate('purchase', 'title type investmentAmount')
      .populate('paymentMethod', 'brand last4 type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    // Get payment statistics
    const stats = await Payment.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        stats,
      },
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message,
    });
  }
};

// Request payout
const requestPayout = async (req, res) => {
  try {
    const { amount, paymentMethodId } = req.body;

    // Check user balance
    const user = await User.findById(req.user.id);
    
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
      });
    }

    // Validate payment method
    const paymentMethod = await PaymentMethod.findOne({
      _id: paymentMethodId,
      user: req.user.id,
      isActive: true,
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    // Create payout with Stripe (in real implementation)
    // For now, we'll simulate the payout
    const mockStripePayoutId = `po_${Date.now()}`;

    // Create payout record
    const payout = await Payout.create({
      user: req.user.id,
      stripePayoutId: mockStripePayoutId,
      amount,
      currency: 'USD',
      status: 'pending',
      paymentMethod: paymentMethodId,
      arrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      description: `Payout to ${paymentMethod.brand} **** ${paymentMethod.last4}`,
    });

    // Deduct from user balance
    user.balance -= amount;
    await user.save();

    // Create activity
    await Activity.createActivity({
      title: 'Payout Requested',
      subtitle: `$${amount} payout to ${paymentMethod.brand} **** ${paymentMethod.last4}`,
      type: 'money',
      user: req.user.id,
      relatedModel: 'Payout',
      relatedId: payout._id,
      amount,
      badge: 'Pending',
    });

    // Create notification
    await Notification.createNotification({
      title: 'Payout Requested',
      message: `Your payout of $${amount} has been requested and will arrive in 1-2 business days`,
      type: 'money',
      recipient: req.user.id,
      relatedModel: 'Payout',
      relatedId: payout._id,
    });

    res.status(201).json({
      success: true,
      message: 'Payout requested successfully',
      data: { payout },
    });
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request payout',
      error: error.message,
    });
  }
};

// Get user payouts
const getUserPayouts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';

    // Build query
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }

    // Get payouts with pagination
    const payouts = await Payout.find(query)
      .populate('paymentMethod', 'brand last4 type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payout.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payouts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get user payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payouts',
      error: error.message,
    });
  }
};

// Get all payments (Admin only)
const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const search = req.query.search || '';

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }

    // Get payments with pagination
    let paymentsQuery = Payment.find(query)
      .populate('user', 'firstName lastName email')
      .populate('purchase', 'title type')
      .populate('paymentMethod', 'brand last4')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add search functionality
    if (search) {
      paymentsQuery = Payment.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $match: {
            $or: [
              { 'userInfo.firstName': { $regex: search, $options: 'i' } },
              { 'userInfo.lastName': { $regex: search, $options: 'i' } },
              { 'userInfo.email': { $regex: search, $options: 'i' } },
              { stripePaymentIntentId: { $regex: search, $options: 'i' } },
            ],
            ...(status && { status }),
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);
    }

    const payments = await paymentsQuery;
    const total = await Payment.countDocuments(query);

    // Get payment statistics
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        stats,
      },
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message,
    });
  }
};

// Get all payouts (Admin only)
const getAllPayouts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }

    // Get payouts with pagination
    const payouts = await Payout.find(query)
      .populate('user', 'firstName lastName email')
      .populate('paymentMethod', 'brand last4 type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payout.countDocuments(query);

    // Get payout statistics
    const stats = await Payout.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        payouts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        stats,
      },
    });
  } catch (error) {
    console.error('Get all payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payouts',
      error: error.message,
    });
  }
};

// Update payout status (Admin only)
const updatePayoutStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, failureReason } = req.body;

    const payout = await Payout.findById(id)
      .populate('user', 'firstName lastName email balance');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    const oldStatus = payout.status;
    payout.status = status;

    if (failureReason) {
      payout.failureReason = failureReason;
    }

    // If payout failed, refund the amount to user balance
    if (status === 'failed' && oldStatus !== 'failed') {
      await User.findByIdAndUpdate(payout.user._id, {
        $inc: { balance: payout.amount }
      });

      // Create activity for refund
      await Activity.createActivity({
        title: 'Payout Failed - Balance Refunded',
        subtitle: `$${payout.amount} refunded to your balance`,
        type: 'money',
        user: payout.user._id,
        relatedModel: 'Payout',
        relatedId: payout._id,
        amount: payout.amount,
        badge: 'Refunded',
      });

      // Create notification
      await Notification.createNotification({
        title: 'Payout Failed',
        message: `Your payout of $${payout.amount} failed and has been refunded to your balance`,
        type: 'money',
        recipient: payout.user._id,
        relatedModel: 'Payout',
        relatedId: payout._id,
      });
    }

    // If payout completed
    if (status === 'paid' && oldStatus !== 'paid') {
      // Create activity
      await Activity.createActivity({
        title: 'Payout Completed',
        subtitle: `$${payout.amount} payout completed`,
        type: 'money',
        user: payout.user._id,
        relatedModel: 'Payout',
        relatedId: payout._id,
        amount: payout.amount,
        badge: 'Completed',
      });

      // Create notification
      await Notification.createNotification({
        title: 'Payout Completed',
        message: `Your payout of $${payout.amount} has been completed successfully`,
        type: 'money',
        recipient: payout.user._id,
        relatedModel: 'Payout',
        relatedId: payout._id,
      });
    }

    await payout.save();

    res.status(200).json({
      success: true,
      message: 'Payout status updated successfully',
      data: { payout },
    });
  } catch (error) {
    console.error('Update payout status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payout status',
      error: error.message,
    });
  }
};

// Get payment analytics (Admin only)
const getPaymentAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const analytics = await Payment.aggregate([
      {
        $facet: {
          paymentOverview: [
            {
              $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                avgAmount: { $avg: '$amount' },
                succeededPayments: { $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] } },
                failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
                succeededAmount: { $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, '$amount', 0] } },
              }
            }
          ],
          payoutOverview: [
            {
              $lookup: {
                from: 'payouts',
                pipeline: [],
                as: 'payouts'
              }
            },
            { $unwind: '$payouts' },
            {
              $group: {
                _id: null,
                totalPayouts: { $sum: 1 },
                totalPayoutAmount: { $sum: '$payouts.amount' },
                pendingPayouts: { $sum: { $cond: [{ $eq: ['$payouts.status', 'pending'] }, 1, 0] } },
                completedPayouts: { $sum: { $cond: [{ $eq: ['$payouts.status', 'paid'] }, 1, 0] } },
              }
            }
          ],
          recentTrends: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' },
                },
                paymentCount: { $sum: 1 },
                paymentAmount: { $sum: '$amount' },
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments: analytics[0].paymentOverview[0] || {},
        payouts: analytics[0].payoutOverview[0] || {},
        recentTrends: analytics[0].recentTrends,
        period,
      },
    });
  } catch (error) {
    console.error('Get payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment analytics',
      error: error.message,
    });
  }
};

module.exports = {
  getUserPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  createPaymentIntent,
  getUserPayments,
  requestPayout,
  getUserPayouts,
  getAllPayments,
  getAllPayouts,
  updatePayoutStatus,
  getPaymentAnalytics,
};