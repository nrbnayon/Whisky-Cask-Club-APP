const Cask = require('../models/Cask');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { getFileUrl, deleteFile } = require('../middleware/upload');
const path = require('path');

// Get all casks for a user
const getUserCasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const sortBy = req.query.sort || '-createdAt';

    // Build query
    const query = { owner: req.user.id };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { distillery: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status && status !== 'All Casks') {
      query.status = status;
    }

    // Get casks with pagination
    const casks = await Cask.find(query)
      .populate('owner', 'firstName lastName email')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const total = await Cask.countDocuments(query);

    // Get portfolio summary
    const portfolioSummary = await Cask.aggregate([
      { $match: { owner: req.user.id } },
      {
        $group: {
          _id: null,
          totalCasks: { $sum: 1 },
          totalValue: { $sum: '$currentValue' },
          totalGain: { $sum: { $subtract: ['$currentValue', '$purchasePrice'] } },
          avgRating: { $avg: '$rating' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        casks,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        summary: portfolioSummary[0] || {
          totalCasks: 0,
          totalValue: 0,
          totalGain: 0,
          avgRating: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get user casks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get casks',
      error: error.message,
    });
  }
};

// Get all casks (Admin only)
const getAllCasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const distillery = req.query.distillery || '';
    const sortBy = req.query.sort || '-createdAt';

    // Build query
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (distillery) {
      query.distillery = { $regex: distillery, $options: 'i' };
    }

    // Get casks with pagination
    const casks = await Cask.find(query)
      .populate('owner', 'firstName lastName email')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const total = await Cask.countDocuments(query);

    // Get overall statistics
    const stats = await Cask.aggregate([
      {
        $group: {
          _id: null,
          totalCasks: { $sum: 1 },
          totalValue: { $sum: '$currentValue' },
          avgValue: { $avg: '$currentValue' },
          totalGain: { $sum: { $subtract: ['$currentValue', '$purchasePrice'] } },
          readyCasks: { $sum: { $cond: [{ $eq: ['$status', 'Ready'] }, 1, 0] } },
          maturingCasks: { $sum: { $cond: [{ $eq: ['$status', 'Maturing'] }, 1, 0] } },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        casks,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        stats: stats[0] || {
          totalCasks: 0,
          totalValue: 0,
          avgValue: 0,
          totalGain: 0,
          readyCasks: 0,
          maturingCasks: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get all casks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get casks',
      error: error.message,
    });
  }
};

// Get cask by ID
const getCaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const cask = await Cask.findById(id)
      .populate('owner', 'firstName lastName email')
      .populate('reviews.user', 'firstName lastName avatar');

    if (!cask) {
      return res.status(404).json({
        success: false,
        message: 'Cask not found',
      });
    }

    // Check if user owns this cask or is admin
    if (cask.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own casks.',
      });
    }

    res.status(200).json({
      success: true,
      data: { cask },
    });
  } catch (error) {
    console.error('Get cask by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cask',
      error: error.message,
    });
  }
};

// Create new cask (Admin only)
const createCask = async (req, res) => {
  try {
    const caskData = {
      ...req.body,
      createdBy: req.user.id,
    };

    // Handle image upload
    if (req.file) {
      caskData.image = getFileUrl(req, req.file.filename, 'casks');
    }

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      caskData.images = req.files.map(file => getFileUrl(req, file.filename, 'casks'));
    }

    const cask = await Cask.create(caskData);

    // Populate owner info
    await cask.populate('owner', 'firstName lastName email');

    // Create activity for the owner
    await Activity.createActivity({
      title: 'New Cask Added',
      subtitle: `${cask.name} added to your portfolio`,
      type: 'gain',
      user: cask.owner._id,
      relatedModel: 'Cask',
      relatedId: cask._id,
      badge: 'New',
    });

    // Create notification for the owner
    await Notification.createNotification({
      title: 'New Cask Added',
      message: `${cask.name} has been added to your portfolio`,
      type: 'cask',
      recipient: cask.owner._id,
      relatedModel: 'Cask',
      relatedId: cask._id,
    });

    res.status(201).json({
      success: true,
      message: 'Cask created successfully',
      data: { cask },
    });
  } catch (error) {
    console.error('Create cask error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create cask',
      error: error.message,
    });
  }
};

// Update cask
const updateCask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const cask = await Cask.findById(id);
    
    if (!cask) {
      return res.status(404).json({
        success: false,
        message: 'Cask not found',
      });
    }

    // Check permissions
    if (cask.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own casks.',
      });
    }

    // Handle image upload
    if (req.file) {
      // Delete old image
      if (cask.image) {
        const oldImagePath = path.join(process.env.UPLOAD_FOLDER || './uploads', 'casks', path.basename(cask.image));
        deleteFile(oldImagePath);
      }
      updates.image = getFileUrl(req, req.file.filename, 'casks');
    }

    // Update cask
    const updatedCask = await Cask.findByIdAndUpdate(
      id,
      { ...updates, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email');

    // Create activity if value changed significantly
    if (updates.currentValue && Math.abs(updates.currentValue - cask.currentValue) > 100) {
      const gainLoss = updates.currentValue > cask.currentValue ? 'increased' : 'decreased';
      const amount = Math.abs(updates.currentValue - cask.currentValue);
      
      await Activity.createActivity({
        title: `${cask.name} value ${gainLoss}`,
        subtitle: `Value ${gainLoss} by $${amount.toLocaleString()}`,
        type: 'gain',
        user: cask.owner._id,
        relatedModel: 'Cask',
        relatedId: cask._id,
        amount,
        badge: gainLoss === 'increased' ? '+' + ((amount / cask.currentValue) * 100).toFixed(1) + '%' : '-' + ((amount / cask.currentValue) * 100).toFixed(1) + '%',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cask updated successfully',
      data: { cask: updatedCask },
    });
  } catch (error) {
    console.error('Update cask error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cask',
      error: error.message,
    });
  }
};

// Delete cask
const deleteCask = async (req, res) => {
  try {
    const { id } = req.params;

    const cask = await Cask.findById(id);
    
    if (!cask) {
      return res.status(404).json({
        success: false,
        message: 'Cask not found',
      });
    }

    // Check permissions
    if (cask.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own casks.',
      });
    }

    // Delete associated images
    if (cask.image) {
      const imagePath = path.join(process.env.UPLOAD_FOLDER || './uploads', 'casks', path.basename(cask.image));
      deleteFile(imagePath);
    }

    if (cask.images && cask.images.length > 0) {
      cask.images.forEach(imageUrl => {
        const imagePath = path.join(process.env.UPLOAD_FOLDER || './uploads', 'casks', path.basename(imageUrl));
        deleteFile(imagePath);
      });
    }

    await Cask.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Cask deleted successfully',
    });
  } catch (error) {
    console.error('Delete cask error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cask',
      error: error.message,
    });
  }
};

// Add cask review
const addCaskReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const cask = await Cask.findById(id);
    
    if (!cask) {
      return res.status(404).json({
        success: false,
        message: 'Cask not found',
      });
    }

    // Check if user already reviewed this cask
    const existingReview = cask.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this cask',
      });
    }

    // Add review
    cask.reviews.push({
      user: req.user.id,
      rating,
      comment,
    });

    // Update average rating
    const totalRating = cask.reviews.reduce((sum, review) => sum + review.rating, 0);
    cask.rating = totalRating / cask.reviews.length;

    await cask.save();

    // Populate the new review
    await cask.populate('reviews.user', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { cask },
    });
  } catch (error) {
    console.error('Add cask review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message,
    });
  }
};

// Update cask appreciation data
const updateAppreciationData = async (req, res) => {
  try {
    const { id } = req.params;
    const { appreciationData, currentAppreciation, futureForecasts, projectedAppreciation } = req.body;

    const cask = await Cask.findById(id);
    
    if (!cask) {
      return res.status(404).json({
        success: false,
        message: 'Cask not found',
      });
    }

    // Update appreciation data
    if (appreciationData) cask.appreciationData = appreciationData;
    if (currentAppreciation) cask.currentAppreciation = currentAppreciation;
    if (futureForecasts) cask.futureForecasts = futureForecasts;
    if (projectedAppreciation) cask.projectedAppreciation = projectedAppreciation;

    await cask.save();

    // Create activity for significant appreciation changes
    if (currentAppreciation) {
      await Activity.createActivity({
        title: `${cask.name} appreciation updated`,
        subtitle: `Current appreciation: ${currentAppreciation}`,
        type: 'gain',
        user: cask.owner,
        relatedModel: 'Cask',
        relatedId: cask._id,
        badge: currentAppreciation,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appreciation data updated successfully',
      data: { cask },
    });
  } catch (error) {
    console.error('Update appreciation data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appreciation data',
      error: error.message,
    });
  }
};

// Get cask analytics (Admin only)
const getCaskAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const analytics = await Cask.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'activities',
          localField: '_id',
          foreignField: 'relatedId',
          as: 'activities'
        }
      },
      {
        $project: {
          name: 1,
          distillery: 1,
          currentValue: 1,
          purchasePrice: 1,
          appreciationData: 1,
          totalActivities: { $size: '$activities' },
          gainAmount: { $subtract: ['$currentValue', '$purchasePrice'] },
          gainPercentage: {
            $multiply: [
              { $divide: [{ $subtract: ['$currentValue', '$purchasePrice'] }, '$purchasePrice'] },
              100
            ]
          },
        }
      }
    ]);

    if (!analytics.length) {
      return res.status(404).json({
        success: false,
        message: 'Cask not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { analytics: analytics[0] },
    });
  } catch (error) {
    console.error('Get cask analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cask analytics',
      error: error.message,
    });
  }
};

// Bulk update cask values (Admin only)
const bulkUpdateCaskValues = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, currentValue }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required',
      });
    }

    const results = [];
    
    for (const update of updates) {
      try {
        const cask = await Cask.findByIdAndUpdate(
          update.id,
          { currentValue: update.currentValue },
          { new: true, runValidators: true }
        );
        
        if (cask) {
          results.push({ id: update.id, success: true, cask });
          
          // Create activity
          await Activity.createActivity({
            title: `${cask.name} value updated`,
            subtitle: `Value updated to $${update.currentValue.toLocaleString()}`,
            type: 'gain',
            user: cask.owner,
            relatedModel: 'Cask',
            relatedId: cask._id,
          });
        } else {
          results.push({ id: update.id, success: false, error: 'Cask not found' });
        }
      } catch (error) {
        results.push({ id: update.id, success: false, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk update completed',
      data: { results },
    });
  } catch (error) {
    console.error('Bulk update cask values error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update cask values',
      error: error.message,
    });
  }
};

module.exports = {
  getUserCasks,
  getAllCasks,
  getCaskById,
  createCask,
  updateCask,
  deleteCask,
  addCaskReview,
  updateAppreciationData,
  getCaskAnalytics,
  bulkUpdateCaskValues,
};