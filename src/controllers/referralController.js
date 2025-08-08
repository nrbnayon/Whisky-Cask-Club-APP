const Referral = require('../models/Referral');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// Get user referral data
const getUserReferralData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's referral code
    const user = await User.findById(userId).select('referralCode totalReferrals totalEarnings');

    // Get referral statistics
    const referralStats = await Referral.getReferralStats(userId);

    // Get detailed referral list
    const referrals = await Referral.find({ referrer: userId })
      .populate('referee', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 });

    // Format referral stats for frontend
    const formattedReferrals = referrals.map(referral => ({
      id: referral._id,
      name: referral.referee.fullName,
      email: referral.referee.email,
      referredDate: referral.createdAt.toISOString().split('T')[0],
      status: referral.status.charAt(0).toUpperCase() + referral.status.slice(1),
      reward: referral.rewardAmount,
    }));

    // Get reward history (activities related to referrals)
    const rewardHistory = await Activity.find({
      user: userId,
      type: 'reward',
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedRewardHistory = rewardHistory.map(activity => ({
      id: activity._id,
      title: activity.title,
      description: activity.subtitle,
      amount: activity.amount || 50,
      status: 'Approved',
      date: activity.createdAt.toISOString().split('T')[0],
    }));

    res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        totalReferrals: referralStats.total,
        completedReferrals: referralStats.completed,
        totalEarned: referralStats.totalEarned,
        referralStats: formattedReferrals,
        rewardHistory: formattedRewardHistory,
      },
    });
  } catch (error) {
    console.error('Get user referral data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral data',
      error: error.message,
    });
  }
};

// Get all referrals (Admin only)
const getAllReferrals = async (req, res) => {
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

    // Get referrals with pagination
    let referralsQuery = Referral.find(query)
      .populate('referrer', 'firstName lastName email referralCode')
      .populate('referee', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add search functionality
    if (search) {
      referralsQuery = Referral.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'referrer',
            foreignField: '_id',
            as: 'referrerInfo'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'referee',
            foreignField: '_id',
            as: 'refereeInfo'
          }
        },
        {
          $match: {
            $or: [
              { 'referrerInfo.firstName': { $regex: search, $options: 'i' } },
              { 'referrerInfo.lastName': { $regex: search, $options: 'i' } },
              { 'referrerInfo.email': { $regex: search, $options: 'i' } },
              { 'refereeInfo.firstName': { $regex: search, $options: 'i' } },
              { 'refereeInfo.lastName': { $regex: search, $options: 'i' } },
              { 'refereeInfo.email': { $regex: search, $options: 'i' } },
              { referralCode: { $regex: search, $options: 'i' } },
            ],
            ...(status && { status }),
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);
    }

    const referrals = await referralsQuery;
    const total = await Referral.countDocuments(query);

    // Get referral statistics
    const stats = await Referral.aggregate([
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalReferrals: { $sum: 1 },
                completedReferrals: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                pendingReferrals: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                totalRewards: { $sum: '$rewardAmount' },
                paidRewards: { $sum: { $cond: ['$rewardPaid', '$rewardAmount', 0] } },
              }
            }
          ],
          topReferrers: [
            {
              $group: {
                _id: '$referrer',
                referralCount: { $sum: 1 },
                completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                totalEarned: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$rewardAmount', 0] } },
              }
            },
            { $sort: { referralCount: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        referrals,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        stats: {
          overall: stats[0].overall[0] || {
            totalReferrals: 0,
            completedReferrals: 0,
            pendingReferrals: 0,
            totalRewards: 0,
            paidRewards: 0,
          },
          topReferrers: stats[0].topReferrers,
        },
      },
    });
  } catch (error) {
    console.error('Get all referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referrals',
      error: error.message,
    });
  }
};

// Update referral status (Admin only)
const updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rewardAmount, notes } = req.body;

    const referral = await Referral.findById(id)
      .populate('referrer', 'firstName lastName email')
      .populate('referee', 'firstName lastName email');
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found',
      });
    }

    const oldStatus = referral.status;
    referral.status = status;
    
    if (rewardAmount) {
      referral.rewardAmount = rewardAmount;
    }
    
    if (notes) {
      referral.notes = notes;
    }

    await referral.save();

    // If status changed to completed, update user earnings and create activity
    if (oldStatus !== 'completed' && status === 'completed') {
      // Update referrer's total earnings
      await User.findByIdAndUpdate(referral.referrer._id, {
        $inc: { totalEarnings: referral.rewardAmount }
      });

      // Create activity for referrer
      await Activity.createActivity({
        title: 'Referral Reward Earned',
        subtitle: `Earned $${referral.rewardAmount} for referring ${referral.referee.fullName}`,
        type: 'reward',
        user: referral.referrer._id,
        relatedModel: 'Referral',
        relatedId: referral._id,
        amount: referral.rewardAmount,
        badge: `+$${referral.rewardAmount}`,
      });

      // Create notification for referrer
      await Notification.createNotification({
        title: 'Referral Reward Earned',
        message: `Congratulations! You've earned $${referral.rewardAmount} for referring ${referral.referee.fullName}`,
        type: 'reward',
        recipient: referral.referrer._id,
        relatedModel: 'Referral',
        relatedId: referral._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Referral status updated successfully',
      data: { referral },
    });
  } catch (error) {
    console.error('Update referral status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update referral status',
      error: error.message,
    });
  }
};

// Pay referral reward (Admin only)
const payReferralReward = async (req, res) => {
  try {
    const { id } = req.params;

    const referral = await Referral.findById(id)
      .populate('referrer', 'firstName lastName email balance');
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found',
      });
    }

    if (referral.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Referral must be completed before paying reward',
      });
    }

    if (referral.rewardPaid) {
      return res.status(400).json({
        success: false,
        message: 'Reward has already been paid',
      });
    }

    // Update referral as paid
    referral.rewardPaid = true;
    referral.rewardPaidDate = new Date();
    await referral.save();

    // Update user balance
    await User.findByIdAndUpdate(referral.referrer._id, {
      $inc: { balance: referral.rewardAmount }
    });

    // Create activity
    await Activity.createActivity({
      title: 'Referral Reward Paid',
      subtitle: `$${referral.rewardAmount} added to your balance`,
      type: 'reward',
      user: referral.referrer._id,
      relatedModel: 'Referral',
      relatedId: referral._id,
      amount: referral.rewardAmount,
      badge: 'Paid',
    });

    // Create notification
    await Notification.createNotification({
      title: 'Referral Reward Paid',
      message: `$${referral.rewardAmount} has been added to your account balance`,
      type: 'money',
      recipient: referral.referrer._id,
      relatedModel: 'Referral',
      relatedId: referral._id,
    });

    res.status(200).json({
      success: true,
      message: 'Referral reward paid successfully',
      data: { referral },
    });
  } catch (error) {
    console.error('Pay referral reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pay referral reward',
      error: error.message,
    });
  }
};

// Validate referral code
const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.params;

    const referrer = await User.findOne({ 
      referralCode: code.toUpperCase(),
      isActive: true 
    }).select('firstName lastName referralCode');

    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Valid referral code',
      data: {
        referrer: {
          name: referrer.fullName,
          code: referrer.referralCode,
        },
      },
    });
  } catch (error) {
    console.error('Validate referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate referral code',
      error: error.message,
    });
  }
};

// Get referral analytics (Admin only)
const getReferralAnalytics = async (req, res) => {
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

    const analytics = await Referral.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalReferrals: { $sum: 1 },
                completedReferrals: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                pendingReferrals: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                totalRewards: { $sum: '$rewardAmount' },
                paidRewards: { $sum: { $cond: ['$rewardPaid', '$rewardAmount', 0] } },
                unpaidRewards: { $sum: { $cond: ['$rewardPaid', 0, '$rewardAmount'] } },
                avgReward: { $avg: '$rewardAmount' },
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
                count: { $sum: 1 },
                completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                rewardAmount: { $sum: '$rewardAmount' },
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
          ],
          topReferrers: [
            {
              $group: {
                _id: '$referrer',
                totalReferrals: { $sum: 1 },
                completedReferrals: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                totalEarned: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$rewardAmount', 0] } },
                conversionRate: {
                  $multiply: [
                    { $divide: [
                      { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                      { $sum: 1 }
                    ]},
                    100
                  ]
                }
              }
            },
            { $sort: { totalReferrals: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
              }
            }
          ],
          conversionFunnel: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: analytics[0].overview[0] || {},
        recentTrends: analytics[0].recentTrends,
        topReferrers: analytics[0].topReferrers,
        conversionFunnel: analytics[0].conversionFunnel,
        period,
      },
    });
  } catch (error) {
    console.error('Get referral analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral analytics',
      error: error.message,
    });
  }
};

// Update referral reward amount (Admin only)
const updateReferralReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { rewardAmount } = req.body;

    const referral = await Referral.findByIdAndUpdate(
      id,
      { rewardAmount },
      { new: true, runValidators: true }
    ).populate('referrer referee', 'firstName lastName email');

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Referral reward updated successfully',
      data: { referral },
    });
  } catch (error) {
    console.error('Update referral reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update referral reward',
      error: error.message,
    });
  }
};

// Bulk pay referral rewards (Admin only)
const bulkPayReferralRewards = async (req, res) => {
  try {
    const { referralIds } = req.body;

    if (!Array.isArray(referralIds) || referralIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Referral IDs array is required',
      });
    }

    const results = [];
    
    for (const referralId of referralIds) {
      try {
        const referral = await Referral.findById(referralId)
          .populate('referrer', 'firstName lastName email balance');
        
        if (referral && referral.status === 'completed' && !referral.rewardPaid) {
          // Update referral as paid
          referral.rewardPaid = true;
          referral.rewardPaidDate = new Date();
          await referral.save();

          // Update user balance
          await User.findByIdAndUpdate(referral.referrer._id, {
            $inc: { balance: referral.rewardAmount }
          });

          // Create activity
          await Activity.createActivity({
            title: 'Referral Reward Paid',
            subtitle: `$${referral.rewardAmount} added to your balance`,
            type: 'reward',
            user: referral.referrer._id,
            relatedModel: 'Referral',
            relatedId: referral._id,
            amount: referral.rewardAmount,
            badge: 'Paid',
          });

          results.push({ id: referralId, success: true, amount: referral.rewardAmount });
        } else {
          results.push({ 
            id: referralId, 
            success: false, 
            error: 'Referral not found, not completed, or already paid' 
          });
        }
      } catch (error) {
        results.push({ id: referralId, success: false, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk reward payment completed',
      data: { results },
    });
  } catch (error) {
    console.error('Bulk pay referral rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk pay referral rewards',
      error: error.message,
    });
  }
};

module.exports = {
  getUserReferralData,
  getAllReferrals,
  updateReferralStatus,
  payReferralReward,
  validateReferralCode,
  getReferralAnalytics,
  updateReferralReward,
  bulkPayReferralRewards,
};