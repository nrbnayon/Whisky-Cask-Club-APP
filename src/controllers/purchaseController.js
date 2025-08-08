const Purchase = require('../models/Purchase');
const Offer = require('../models/Offer');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Referral = require('../models/Referral');

// Create new purchase (Express interest)
const createPurchase = async (req, res) => {
  try {
    const { offer: offerId, personalInfo, investmentAmountNumeric, contactMethod } = req.body;

    // Get offer details
    const offer = await Offer.findById(offerId);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    if (!offer.isActive || offer.expiryDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Offer is no longer available',
      });
    }

    // Create purchase record
    const purchaseData = {
      user: req.user.id,
      offer: offerId,
      title: offer.title,
      type: offer.type,
      image: offer.image,
      location: offer.location,
      rating: offer.rating,
      daysLeft: offer.daysLeft,
      investmentAmount: `$${investmentAmountNumeric.toLocaleString()}`,
      investmentAmountNumeric,
      contactMethod: contactMethod === 'email' ? 'Email' : 'Phone',
      offerId: offer.id,
      personalInfo,
    };

    const purchase = await Purchase.create(purchaseData);

    // Populate user and offer info
    await purchase.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'offer', select: 'title type currentPrice' }
    ]);

    // Update offer interest count
    offer.interests += 1;
    await offer.save();

    // Create activity
    await Activity.createActivity({
      title: 'Investment Interest Submitted',
      subtitle: `Expressed interest in ${offer.title}`,
      type: 'purchase',
      user: req.user.id,
      relatedModel: 'Purchase',
      relatedId: purchase._id,
      amount: investmentAmountNumeric,
      badge: 'Pending',
    });

    // Create notification for user
    await Notification.createNotification({
      title: 'Investment Interest Received',
      message: `We've received your interest in ${offer.title}. Our team will contact you soon.`,
      type: 'portfolio',
      recipient: req.user.id,
      relatedModel: 'Purchase',
      relatedId: purchase._id,
    });

    // Check if this is user's first purchase for referral completion
    const userPurchaseCount = await Purchase.countDocuments({ user: req.user.id });
    if (userPurchaseCount === 1) {
      await Referral.completeReferral(req.user.id, investmentAmountNumeric);
    }

    res.status(201).json({
      success: true,
      message: 'Investment interest submitted successfully',
      data: { purchase },
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit investment interest',
      error: error.message,
    });
  }
};

// Get user purchases
const getUserPurchases = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const type = req.query.type || '';

    // Build query
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    // Get purchases with pagination
    const purchases = await Purchase.find(query)
      .populate('offer', 'title type currentPrice location rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Purchase.countDocuments(query);

    // Get purchase statistics
    const stats = await Purchase.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmountNumeric' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        purchases,
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
    console.error('Get user purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchases',
      error: error.message,
    });
  }
};

// Get all purchases (Admin only)
const getAllPurchases = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const type = req.query.type || '';
    const search = req.query.search || '';

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
      ];
    }

    // Get purchases with pagination
    const purchases = await Purchase.find(query)
      .populate('user', 'firstName lastName email')
      .populate('offer', 'title type currentPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Purchase.countDocuments(query);

    // Get comprehensive statistics
    const stats = await Purchase.aggregate([
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$investmentAmountNumeric' },
              }
            }
          ],
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalAmount: { $sum: '$investmentAmountNumeric' },
              }
            }
          ],
          overall: [
            {
              $group: {
                _id: null,
                totalPurchases: { $sum: 1 },
                totalAmount: { $sum: '$investmentAmountNumeric' },
                avgAmount: { $avg: '$investmentAmountNumeric' },
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        purchases,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        stats: {
          byStatus: stats[0].byStatus,
          byType: stats[0].byType,
          overall: stats[0].overall[0] || { totalPurchases: 0, totalAmount: 0, avgAmount: 0 },
        },
      },
    });
  } catch (error) {
    console.error('Get all purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchases',
      error: error.message,
    });
  }
};

// Get purchase by ID
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findById(id)
      .populate('user', 'firstName lastName email phone')
      .populate('offer', 'title type currentPrice location rating details');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    // Check permissions
    if (purchase.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own purchases.',
      });
    }

    res.status(200).json({
      success: true,
      data: { purchase },
    });
  } catch (error) {
    console.error('Get purchase by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchase',
      error: error.message,
    });
  }
};

// Update purchase status (Admin only)
const updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const purchase = await Purchase.findById(id)
      .populate('user', 'firstName lastName email');
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    const oldStatus = purchase.status;
    purchase.status = status;
    
    // Add to status history
    purchase.statusHistory.push({
      status,
      changedBy: req.user.id,
      reason,
    });

    await purchase.save();

    // Create activity for user
    await Activity.createActivity({
      title: `Investment Status Updated`,
      subtitle: `${purchase.title} status changed to ${status}`,
      type: 'purchase',
      user: purchase.user._id,
      relatedModel: 'Purchase',
      relatedId: purchase._id,
      badge: status,
    });

    // Create notification for user
    let notificationMessage = '';
    switch (status) {
      case 'Active':
        notificationMessage = `Your investment in ${purchase.title} is now active!`;
        break;
      case 'Completed':
        notificationMessage = `Your investment in ${purchase.title} has been completed successfully.`;
        break;
      case 'Reject':
        notificationMessage = `Your investment interest in ${purchase.title} has been declined.`;
        break;
      default:
        notificationMessage = `Your investment in ${purchase.title} status has been updated to ${status}.`;
    }

    await Notification.createNotification({
      title: 'Investment Status Update',
      message: notificationMessage,
      type: 'portfolio',
      recipient: purchase.user._id,
      relatedModel: 'Purchase',
      relatedId: purchase._id,
    });

    res.status(200).json({
      success: true,
      message: 'Purchase status updated successfully',
      data: { purchase },
    });
  } catch (error) {
    console.error('Update purchase status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update purchase status',
      error: error.message,
    });
  }
};

// Add note to purchase (Admin only)
const addPurchaseNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const purchase = await Purchase.findById(id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    purchase.notes.push({
      content,
      addedBy: req.user.id,
    });

    await purchase.save();

    // Populate the new note
    await purchase.populate('notes.addedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: { purchase },
    });
  } catch (error) {
    console.error('Add purchase note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message,
    });
  }
};

// Delete purchase
const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findById(id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    // Check permissions
    if (purchase.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own purchases.',
      });
    }

    // Only allow deletion if status is Pending or Reject
    if (!['Pending', 'Reject'].includes(purchase.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete purchase with current status',
      });
    }

    await Purchase.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Purchase deleted successfully',
    });
  } catch (error) {
    console.error('Delete purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete purchase',
      error: error.message,
    });
  }
};

// Get purchase analytics (Admin only)
const getPurchaseAnalytics = async (req, res) => {
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

    const analytics = await Purchase.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalPurchases: { $sum: 1 },
                totalAmount: { $sum: '$investmentAmountNumeric' },
                avgAmount: { $avg: '$investmentAmountNumeric' },
                pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
                activeCount: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
                completedCount: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
                rejectedCount: { $sum: { $cond: [{ $eq: ['$status', 'Reject'] }, 1, 0] } },
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
                amount: { $sum: '$investmentAmountNumeric' },
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
          ],
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalAmount: { $sum: '$investmentAmountNumeric' },
                avgAmount: { $avg: '$investmentAmountNumeric' },
              }
            }
          ],
          topOffers: [
            {
              $group: {
                _id: '$offer',
                count: { $sum: 1 },
                totalAmount: { $sum: '$investmentAmountNumeric' },
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'offers',
                localField: '_id',
                foreignField: '_id',
                as: 'offerDetails'
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
        byType: analytics[0].byType,
        topOffers: analytics[0].topOffers,
        period,
      },
    });
  } catch (error) {
    console.error('Get purchase analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchase analytics',
      error: error.message,
    });
  }
};

// Bulk update purchase statuses (Admin only)
const bulkUpdatePurchaseStatus = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, status, reason }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required',
      });
    }

    const results = [];
    
    for (const update of updates) {
      try {
        const purchase = await Purchase.findById(update.id)
          .populate('user', 'firstName lastName email');
        
        if (purchase) {
          purchase.status = update.status;
          purchase.statusHistory.push({
            status: update.status,
            changedBy: req.user.id,
            reason: update.reason,
          });
          
          await purchase.save();
          
          // Create notification
          await Notification.createNotification({
            title: 'Investment Status Update',
            message: `Your investment in ${purchase.title} status has been updated to ${update.status}`,
            type: 'portfolio',
            recipient: purchase.user._id,
            relatedModel: 'Purchase',
            relatedId: purchase._id,
          });
          
          results.push({ id: update.id, success: true, purchase });
        } else {
          results.push({ id: update.id, success: false, error: 'Purchase not found' });
        }
      } catch (error) {
        results.push({ id: update.id, success: false, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk status update completed',
      data: { results },
    });
  } catch (error) {
    console.error('Bulk update purchase status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update purchase statuses',
      error: error.message,
    });
  }
};

module.exports = {
  createPurchase,
  getUserPurchases,
  getAllPurchases,
  getPurchaseById,
  updatePurchaseStatus,
  addPurchaseNote,
  deletePurchase,
  getPurchaseAnalytics,
  bulkUpdatePurchaseStatus,
};