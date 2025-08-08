const User = require('../models/User');
const Cask = require('../models/Cask');
const Offer = require('../models/Offer');
const Purchase = require('../models/Purchase');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Referral = require('../models/Referral');
const { Payment, Payout } = require('../models/Payment');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
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

    // Get comprehensive dashboard statistics using aggregation
    const stats = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $facet: {
            overview: [
              {
                $group: {
                  _id: null,
                  totalUsers: { $sum: 1 },
                  activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
                  verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
                  totalBalance: { $sum: '$balance' },
                  totalEarnings: { $sum: '$totalEarnings' },
                }
              }
            ],
            newUsers: [
              { $match: { createdAt: { $gte: startDate } } },
              {
                $group: {
                  _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                  },
                  count: { $sum: 1 },
                }
              },
              { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ],
            byRole: [
              {
                $group: {
                  _id: '$role',
                  count: { $sum: 1 },
                }
              }
            ]
          }
        }
      ]),

      // Cask statistics
      Cask.aggregate([
        {
          $group: {
            _id: null,
            totalCasks: { $sum: 1 },
            totalValue: { $sum: '$currentValue' },
            totalGain: { $sum: { $subtract: ['$currentValue', '$purchasePrice'] } },
            readyCasks: { $sum: { $cond: [{ $eq: ['$status', 'Ready'] }, 1, 0] } },
            maturingCasks: { $sum: { $cond: [{ $eq: ['$status', 'Maturing'] }, 1, 0] } },
            avgRating: { $avg: '$rating' },
          }
        }
      ]),

      // Offer statistics
      Offer.aggregate([
        {
          $group: {
            _id: null,
            totalOffers: { $sum: 1 },
            activeOffers: { $sum: { $cond: ['$isActive', 1, 0] } },
            expiredOffers: { $sum: { $cond: [{ $lte: ['$expiryDate', new Date()] }, 1, 0] } },
            totalViews: { $sum: '$views' },
            totalInterests: { $sum: '$interests' },
            avgPrice: { $avg: '$priceNumeric' },
          }
        }
      ]),

      // Purchase statistics
      Purchase.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$investmentAmountNumeric' },
          }
        }
      ]),

      // Payment statistics
      Payment.aggregate([
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, '$amount', 0] } },
            succeededPayments: { $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] } },
            failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          }
        }
      ]),

      // Recent activity summary
      Activity.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          }
        }
      ]),
    ]);

    // Format response
    const dashboardData = {
      users: stats[0][0]?.overview[0] || {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        totalBalance: 0,
        totalEarnings: 0,
      },
      userGrowth: stats[0][0]?.newUsers || [],
      usersByRole: stats[0][0]?.byRole || [],
      
      casks: stats[1][0] || {
        totalCasks: 0,
        totalValue: 0,
        totalGain: 0,
        readyCasks: 0,
        maturingCasks: 0,
        avgRating: 0,
      },
      
      offers: stats[2][0] || {
        totalOffers: 0,
        activeOffers: 0,
        expiredOffers: 0,
        totalViews: 0,
        totalInterests: 0,
        avgPrice: 0,
      },
      
      purchases: stats[3] || [],
      
      payments: stats[4][0] || {
        totalPayments: 0,
        totalRevenue: 0,
        succeededPayments: 0,
        failedPayments: 0,
      },
      
      recentActivity: stats[5] || [],
      period,
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message,
    });
  }
};

// Get system health
const getSystemHealth = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get collection stats
    const collections = await Promise.all([
      User.countDocuments(),
      Cask.countDocuments(),
      Offer.countDocuments(),
      Purchase.countDocuments(),
      Activity.countDocuments(),
      Notification.countDocuments(),
      Referral.countDocuments(),
    ]);

    // Check for any critical issues
    const criticalIssues = [];
    
    // Check for expired offers that are still active
    const expiredActiveOffers = await Offer.countDocuments({
      isActive: true,
      expiryDate: { $lte: new Date() }
    });
    
    if (expiredActiveOffers > 0) {
      criticalIssues.push(`${expiredActiveOffers} expired offers are still marked as active`);
    }

    // Check for pending purchases older than 7 days
    const oldPendingPurchases = await Purchase.countDocuments({
      status: 'Pending',
      createdAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    if (oldPendingPurchases > 0) {
      criticalIssues.push(`${oldPendingPurchases} purchases have been pending for more than 7 days`);
    }

    const healthData = {
      status: dbStatus === 'connected' && criticalIssues.length === 0 ? 'healthy' : 'warning',
      database: {
        status: dbStatus,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      collections: {
        users: collections[0],
        casks: collections[1],
        offers: collections[2],
        purchases: collections[3],
        activities: collections[4],
        notifications: collections[5],
        referrals: collections[6],
      },
      criticalIssues,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system health',
      error: error.message,
    });
  }
};

// Get recent activities across all users (Admin only)
const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const activities = await Activity.find({ isVisible: true })
      .populate('user', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: { activities },
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activities',
      error: error.message,
    });
  }
};

// Get pending actions (Admin only)
const getPendingActions = async (req, res) => {
  try {
    // Get all pending items that need admin attention
    const pendingData = await Promise.all([
      // Pending purchases
      Purchase.find({ status: 'Pending' })
        .populate('user', 'firstName lastName email')
        .populate('offer', 'title type')
        .sort({ createdAt: -1 })
        .limit(20),

      // Pending referrals
      Referral.find({ status: 'pending' })
        .populate('referrer referee', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(20),

      // Failed payments
      Payment.find({ status: 'failed' })
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(10),

      // Pending payouts
      Payout.find({ status: 'pending' })
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      data: {
        pendingPurchases: pendingData[0],
        pendingReferrals: pendingData[1],
        failedPayments: pendingData[2],
        pendingPayouts: pendingData[3],
      },
    });
  } catch (error) {
    console.error('Get pending actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending actions',
      error: error.message,
    });
  }
};

// Bulk operations for admin efficiency
const bulkOperations = async (req, res) => {
  try {
    const { operation, model, ids, data } = req.body;

    if (!operation || !model || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Operation, model, and IDs array are required',
      });
    }

    let Model;
    switch (model) {
      case 'User':
        Model = User;
        break;
      case 'Cask':
        Model = Cask;
        break;
      case 'Offer':
        Model = Offer;
        break;
      case 'Purchase':
        Model = Purchase;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid model specified',
        });
    }

    let result;
    
    switch (operation) {
      case 'delete':
        result = await Model.deleteMany({ _id: { $in: ids } });
        break;
      case 'update':
        result = await Model.updateMany(
          { _id: { $in: ids } },
          data,
          { runValidators: true }
        );
        break;
      case 'activate':
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { isActive: false }
        );
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation specified',
        });
    }

    res.status(200).json({
      success: true,
      message: `Bulk ${operation} completed successfully`,
      data: {
        modifiedCount: result.modifiedCount || result.deletedCount,
        operation,
        model,
      },
    });
  } catch (error) {
    console.error('Bulk operations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation',
      error: error.message,
    });
  }
};

// Export data (Admin only)
const exportData = async (req, res) => {
  try {
    const { model, format = 'json' } = req.query;

    if (!model) {
      return res.status(400).json({
        success: false,
        message: 'Model parameter is required',
      });
    }

    let Model;
    let populateFields = '';
    
    switch (model) {
      case 'users':
        Model = User;
        populateFields = 'referredBy';
        break;
      case 'casks':
        Model = Cask;
        populateFields = 'owner';
        break;
      case 'offers':
        Model = Offer;
        populateFields = 'createdBy';
        break;
      case 'purchases':
        Model = Purchase;
        populateFields = 'user offer';
        break;
      case 'referrals':
        Model = Referral;
        populateFields = 'referrer referee';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid model specified',
        });
    }

    const data = await Model.find({})
      .populate(populateFields)
      .sort({ createdAt: -1 });

    // Set appropriate headers for download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${model}_export_${timestamp}.${format}`;
    
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');

    if (format === 'json') {
      res.status(200).json({
        success: true,
        exportDate: new Date().toISOString(),
        model,
        count: data.length,
        data,
      });
    } else {
      // For CSV format, you would implement CSV conversion here
      res.status(400).json({
        success: false,
        message: 'CSV export not implemented yet',
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message,
    });
  }
};

// Get audit logs (Admin only)
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const type = req.query.type || '';
    const userId = req.query.userId || '';

    // Build query for activities that represent audit events
    const query = {
      type: { $in: ['profile_update', 'login', 'purchase', 'reward'] }
    };
    
    if (type) {
      query.type = type;
    }
    
    if (userId) {
      query.user = userId;
    }

    const auditLogs = await Activity.find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: error.message,
    });
  }
};

// System maintenance operations
const performMaintenance = async (req, res) => {
  try {
    const { operation } = req.body;

    let result = {};

    switch (operation) {
      case 'cleanup_expired_offers':
        // Deactivate expired offers
        const expiredOffers = await Offer.updateMany(
          { 
            isActive: true,
            expiryDate: { $lte: new Date() }
          },
          { isActive: false }
        );
        result.expiredOffers = expiredOffers.modifiedCount;
        break;

      case 'cleanup_old_notifications':
        // Delete read notifications older than 30 days
        const oldNotifications = await Notification.deleteMany({
          isRead: true,
          createdAt: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        result.deletedNotifications = oldNotifications.deletedCount;
        break;

      case 'update_cask_values':
        // Recalculate all cask gain values
        const casks = await Cask.find({});
        let updatedCasks = 0;
        
        for (const cask of casks) {
          const gainAmount = cask.currentValue - cask.purchasePrice;
          const gainPercent = cask.purchasePrice > 0 ? 
            ((gainAmount / cask.purchasePrice) * 100).toFixed(1) : 0;
          
          cask.gain = gainAmount >= 0 ? `+$${gainAmount.toLocaleString()}` : `-$${Math.abs(gainAmount).toLocaleString()}`;
          cask.gainPercentage = gainAmount >= 0 ? `+${gainPercent}%` : `-${gainPercent}%`;
          
          await cask.save();
          updatedCasks++;
        }
        result.updatedCasks = updatedCasks;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid maintenance operation',
        });
    }

    res.status(200).json({
      success: true,
      message: `Maintenance operation '${operation}' completed successfully`,
      data: result,
    });
  } catch (error) {
    console.error('Perform maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform maintenance operation',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getSystemHealth,
  getRecentActivities,
  getPendingActions,
  bulkOperations,
  exportData,
  getAuditLogs,
  performMaintenance,
};