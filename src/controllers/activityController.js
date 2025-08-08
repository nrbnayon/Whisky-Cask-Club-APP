const Activity = require('../models/Activity');
const User = require('../models/User');

// Get user activities
const getUserActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || '';

    // Build query
    const query = { user: req.user.id, isVisible: true };
    
    if (type) {
      query.type = type;
    }

    // Get activities using the static method
    const activities = await Activity.getUserActivities(req.user.id, page, limit);
    
    // Get total count for pagination
    const total = await Activity.countDocuments(query);

    // Get activity statistics
    const stats = await Activity.aggregate([
      { $match: { user: req.user.id, isVisible: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        activities,
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
    console.error('Get user activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activities',
      error: error.message,
    });
  }
};

// Get all activities (Admin only)
const getAllActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type || '';
    const userId = req.query.userId || '';
    const search = req.query.search || '';

    // Build query
    const query = { isVisible: true };
    
    if (type) {
      query.type = type;
    }
    
    if (userId) {
      query.user = userId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
      ];
    }

    // Get activities with pagination
    const activities = await Activity.find(query)
      .populate('user', 'firstName lastName email avatar')
      .populate('relatedId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments(query);

    // Get comprehensive statistics
    const stats = await Activity.aggregate([
      {
        $facet: {
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              }
            }
          ],
          byUser: [
            {
              $group: {
                _id: '$user',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              }
            },
            { $sort: { count: -1 } },
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
          recentTrends: [
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
            { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
            { $limit: 30 }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        stats: {
          byType: stats[0].byType,
          byUser: stats[0].byUser,
          recentTrends: stats[0].recentTrends,
        },
      },
    });
  } catch (error) {
    console.error('Get all activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activities',
      error: error.message,
    });
  }
};

// Create activity (Admin only)
const createActivity = async (req, res) => {
  try {
    const { title, subtitle, description, type, user, relatedModel, relatedId, badge, amount } = req.body;

    const activityData = {
      title,
      subtitle,
      description,
      type,
      user,
      badge,
      amount,
    };

    if (relatedModel && relatedId) {
      activityData.relatedModel = relatedModel;
      activityData.relatedId = relatedId;
    }

    const activity = await Activity.createActivity(activityData);

    // Populate user info
    await activity.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: { activity },
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity',
      error: error.message,
    });
  }
};

// Delete activity
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    // Check permissions
    if (activity.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own activities.',
      });
    }

    await Activity.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: error.message,
    });
  }
};

// Get activity analytics (Admin only)
const getActivityAnalytics = async (req, res) => {
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

    const analytics = await Activity.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalActivities: { $sum: 1 },
                uniqueUsers: { $addToSet: '$user' },
                totalAmount: { $sum: '$amount' },
              }
            },
            {
              $project: {
                totalActivities: 1,
                uniqueUsers: { $size: '$uniqueUsers' },
                totalAmount: 1,
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
                amount: { $sum: '$amount' },
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
          ],
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                avgAmount: { $avg: '$amount' },
              }
            },
            { $sort: { count: -1 } }
          ],
          topUsers: [
            {
              $group: {
                _id: '$user',
                activityCount: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              }
            },
            { $sort: { activityCount: -1 } },
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
        overview: analytics[0].overview[0] || { totalActivities: 0, uniqueUsers: 0, totalAmount: 0 },
        recentTrends: analytics[0].recentTrends,
        byType: analytics[0].byType,
        topUsers: analytics[0].topUsers,
        period,
      },
    });
  } catch (error) {
    console.error('Get activity analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity analytics',
      error: error.message,
    });
  }
};

// Bulk delete activities (Admin only)
const bulkDeleteActivities = async (req, res) => {
  try {
    const { activityIds } = req.body;

    if (!Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Activity IDs array is required',
      });
    }

    const result = await Activity.deleteMany({
      _id: { $in: activityIds }
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} activities deleted successfully`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error('Bulk delete activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activities',
      error: error.message,
    });
  }
};

module.exports = {
  getUserActivities,
  getAllActivities,
  createActivity,
  deleteActivity,
  getActivityAnalytics,
  bulkDeleteActivities,
};