const Notification = require('../models/Notification');
const User = require('../models/User');

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type || '';
    const isRead = req.query.isRead;

    // Build query
    const query = { 
      $or: [
        { recipient: req.user.id },
        { isGlobal: true }
      ]
    };
    
    if (type) {
      query.type = type;
    }
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    // Only show non-expired notifications
    query.$or.push({ expiresAt: { $exists: false } });
    query.$or.push({ expiresAt: { $gt: new Date() } });

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName avatar')
      .populate('relatedId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message,
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.markAsRead(id, req.user.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        recipient: req.user.id, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
};

// Create notification (Admin only)
const createNotification = async (req, res) => {
  try {
    const { title, message, type, recipient, isGlobal, priority, expiresAt } = req.body;

    const notificationData = {
      title,
      message,
      type,
      sender: req.user.id,
      priority: priority || 'medium',
    };

    if (isGlobal) {
      notificationData.isGlobal = true;
      notificationData.recipient = req.user.id; // Placeholder for global notifications
    } else if (recipient) {
      notificationData.recipient = recipient;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Recipient is required for non-global notifications',
      });
    }

    if (expiresAt) {
      notificationData.expiresAt = new Date(expiresAt);
    }

    const notification = await Notification.createNotification(notificationData);

    // If global notification, create for all active users
    if (isGlobal) {
      const activeUsers = await User.find({ isActive: true }).select('_id');
      
      const globalNotifications = activeUsers.map(user => ({
        ...notificationData,
        recipient: user._id,
        isGlobal: false, // Individual copies are not global
      }));

      await Notification.insertMany(globalNotifications);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification },
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message,
    });
  }
};

// Get all notifications (Admin only)
const getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type || '';
    const priority = req.query.priority || '';

    // Build query
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .populate('recipient', 'firstName lastName email')
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    // Get notification statistics
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: 1 },
          unreadCount: { $sum: { $cond: ['$isRead', 0, 1] } },
          readCount: { $sum: { $cond: ['$isRead', 1, 0] } },
        }
      }
    ]);

    // Get notifications by type
    const byType = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: { $sum: { $cond: ['$isRead', 0, 1] } },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        stats: stats[0] || { totalNotifications: 0, unreadCount: 0, readCount: 0 },
        byType,
      },
    });
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message,
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Check permissions
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own notifications.',
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message,
    });
  }
};

// Get notification statistics (Admin only)
const getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                unread: { $sum: { $cond: ['$isRead', 0, 1] } },
                read: { $sum: { $cond: ['$isRead', 1, 0] } },
              }
            }
          ],
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                unreadCount: { $sum: { $cond: ['$isRead', 0, 1] } },
              }
            }
          ],
          byPriority: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 },
              }
            }
          ],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users',
                localField: 'recipient',
                foreignField: '_id',
                as: 'recipientInfo'
              }
            },
            {
              $project: {
                title: 1,
                type: 1,
                isRead: 1,
                createdAt: 1,
                'recipientInfo.firstName': 1,
                'recipientInfo.lastName': 1,
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0].overall[0] || { total: 0, unread: 0, read: 0 },
        byType: stats[0].byType,
        byPriority: stats[0].byPriority,
        recent: stats[0].recent,
      },
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification statistics',
      error: error.message,
    });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  getAllNotifications,
  deleteNotification,
  getNotificationStats,
};