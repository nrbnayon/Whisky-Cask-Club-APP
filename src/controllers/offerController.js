const Offer = require('../models/Offer');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { getFileUrl, deleteFile } = require('../middleware/upload');
const path = require('path');

// Get all offers (Public with optional auth)
const getAllOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const type = req.query.type || '';
    const category = req.query.category || '';
    const sortBy = req.query.sort || '-createdAt';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (type && type !== 'All') {
      query.type = type.toLowerCase();
    }
    
    if (category) {
      query.category = category;
    }

    if (minPrice !== null || maxPrice !== null) {
      query.priceNumeric = {};
      if (minPrice !== null) query.priceNumeric.$gte = minPrice;
      if (maxPrice !== null) query.priceNumeric.$lte = maxPrice;
    }

    // Only show non-expired offers
    query.expiryDate = { $gt: new Date() };

    // Get offers with pagination
    const offers = await Offer.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const total = await Offer.countDocuments(query);

    // Get offer statistics
    const stats = await Offer.aggregate([
      { $match: { isActive: true, expiryDate: { $gt: new Date() } } },
      {
        $group: {
          _id: null,
          totalOffers: { $sum: 1 },
          avgPrice: { $avg: '$priceNumeric' },
          avgRating: { $avg: '$rating' },
          totalViews: { $sum: '$views' },
          totalInterests: { $sum: '$interests' },
        }
      }
    ]);

    // Get offers by type
    const offersByType = await Offer.aggregate([
      { $match: { isActive: true, expiryDate: { $gt: new Date() } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$priceNumeric' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        offers,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        stats: stats[0] || {
          totalOffers: 0,
          avgPrice: 0,
          avgRating: 0,
          totalViews: 0,
          totalInterests: 0,
        },
        offersByType,
      },
    });
  } catch (error) {
    console.error('Get all offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get offers',
      error: error.message,
    });
  }
};

// Get offer by ID
const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id)
      .populate('createdBy', 'firstName lastName email');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    // Check if offer is active and not expired
    if (!offer.isActive || offer.expiryDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Offer is no longer available',
      });
    }

    // Increment view count
    offer.views += 1;
    await offer.save();

    res.status(200).json({
      success: true,
      data: { offer },
    });
  } catch (error) {
    console.error('Get offer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get offer',
      error: error.message,
    });
  }
};

// Create new offer (Admin only)
const createOffer = async (req, res) => {
  try {
    const offerData = {
      ...req.body,
      createdBy: req.user.id,
    };

    // Handle main image upload
    if (req.files && req.files.image && req.files.image[0]) {
      offerData.image = getFileUrl(req, req.files.image[0].filename, 'offers');
    }

    // Handle additional images
    if (req.files && req.files.images && req.files.images.length > 0) {
      offerData.images = req.files.images.map(file => 
        getFileUrl(req, file.filename, 'offers')
      );
    }

    const offer = await Offer.create(offerData);

    // Populate creator info
    await offer.populate('createdBy', 'firstName lastName email');

    // Create global notification for new offer
    if (offer.isFeatured) {
      // In a real app, you might want to notify all users or specific segments
      await Notification.createNotification({
        title: 'New Featured Offer Available',
        message: `${offer.title} is now available for investment`,
        type: 'offer',
        isGlobal: true,
        relatedModel: 'Offer',
        relatedId: offer._id,
        recipient: req.user.id, // Placeholder - in real app, create for all users
      });
    }

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: { offer },
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create offer',
      error: error.message,
    });
  }
};

// Update offer (Admin only)
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedBy: req.user.id };

    const offer = await Offer.findById(id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    // Handle image uploads
    if (req.files && req.files.image && req.files.image[0]) {
      // Delete old main image
      if (offer.image) {
        const oldImagePath = path.join(process.env.UPLOAD_FOLDER || './uploads', 'offers', path.basename(offer.image));
        deleteFile(oldImagePath);
      }
      updates.image = getFileUrl(req, req.files.image[0].filename, 'offers');
    }

    if (req.files && req.files.images && req.files.images.length > 0) {
      // Delete old additional images
      if (offer.images && offer.images.length > 0) {
        offer.images.forEach(imageUrl => {
          const imagePath = path.join(process.env.UPLOAD_FOLDER || './uploads', 'offers', path.basename(imageUrl));
          deleteFile(imagePath);
        });
      }
      updates.images = req.files.images.map(file => 
        getFileUrl(req, file.filename, 'offers')
      );
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Offer updated successfully',
      data: { offer: updatedOffer },
    });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update offer',
      error: error.message,
    });
  }
};

// Delete offer (Admin only)
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    // Delete associated images
    if (offer.image) {
      const imagePath = path.join(process.env.UPLOAD_FOLDER || './uploads', 'offers', path.basename(offer.image));
      deleteFile(imagePath);
    }

    if (offer.images && offer.images.length > 0) {
      offer.images.forEach(imageUrl => {
        const imagePath = path.join(process.env.UPLOAD_FOLDER || './uploads', 'offers', path.basename(imageUrl));
        deleteFile(imagePath);
      });
    }

    await Offer.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Offer deleted successfully',
    });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete offer',
      error: error.message,
    });
  }
};

// Express interest in offer
const expressInterest = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    
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

    // Increment interest count
    offer.interests += 1;
    await offer.save();

    // Create activity
    await Activity.createActivity({
      title: 'Expressed Interest',
      subtitle: `Interested in ${offer.title}`,
      type: 'offer',
      user: req.user.id,
      relatedModel: 'Offer',
      relatedId: offer._id,
      badge: 'Interest',
    });

    res.status(200).json({
      success: true,
      message: 'Interest expressed successfully',
      data: { offer },
    });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to express interest',
      error: error.message,
    });
  }
};

// Get featured offers
const getFeaturedOffers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const offers = await Offer.find({
      isActive: true,
      isFeatured: true,
      expiryDate: { $gt: new Date() },
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: { offers },
    });
  } catch (error) {
    console.error('Get featured offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured offers',
      error: error.message,
    });
  }
};

// Get offer statistics (Admin only)
const getOfferStatistics = async (req, res) => {
  try {
    const stats = await Offer.aggregate([
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalOffers: { $sum: 1 },
                activeOffers: { $sum: { $cond: ['$isActive', 1, 0] } },
                expiredOffers: { $sum: { $cond: [{ $lte: ['$expiryDate', new Date()] }, 1, 0] } },
                totalViews: { $sum: '$views' },
                totalInterests: { $sum: '$interests' },
                avgPrice: { $avg: '$priceNumeric' },
                avgRating: { $avg: '$rating' },
              }
            }
          ],
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                avgPrice: { $avg: '$priceNumeric' },
                totalViews: { $sum: '$views' },
                totalInterests: { $sum: '$interests' },
              }
            }
          ],
          byCategory: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
                avgPrice: { $avg: '$priceNumeric' },
              }
            }
          ],
          recentActivity: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
              $project: {
                title: 1,
                type: 1,
                currentPrice: 1,
                views: 1,
                interests: 1,
                createdAt: 1,
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0].overall[0] || {},
        byType: stats[0].byType,
        byCategory: stats[0].byCategory,
        recentActivity: stats[0].recentActivity,
      },
    });
  } catch (error) {
    console.error('Get offer statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get offer statistics',
      error: error.message,
    });
  }
};

// Toggle offer featured status (Admin only)
const toggleFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    offer.isFeatured = !offer.isFeatured;
    offer.updatedBy = req.user.id;
    await offer.save();

    res.status(200).json({
      success: true,
      message: `Offer ${offer.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: { offer },
    });
  } catch (error) {
    console.error('Toggle featured status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
      error: error.message,
    });
  }
};

// Bulk update offer prices (Admin only)
const bulkUpdatePrices = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, currentPrice, priceNumeric }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required',
      });
    }

    const results = [];
    
    for (const update of updates) {
      try {
        const offer = await Offer.findByIdAndUpdate(
          update.id,
          { 
            currentPrice: update.currentPrice,
            priceNumeric: update.priceNumeric,
            updatedBy: req.user.id,
            'metadata.lastPriceUpdate': new Date(),
          },
          { new: true, runValidators: true }
        );
        
        if (offer) {
          results.push({ id: update.id, success: true, offer });
        } else {
          results.push({ id: update.id, success: false, error: 'Offer not found' });
        }
      } catch (error) {
        results.push({ id: update.id, success: false, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk price update completed',
      data: { results },
    });
  } catch (error) {
    console.error('Bulk update prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update prices',
      error: error.message,
    });
  }
};

// Get expired offers (Admin only)
const getExpiredOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const offers = await Offer.find({
      expiryDate: { $lte: new Date() },
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ expiryDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Offer.countDocuments({
      expiryDate: { $lte: new Date() },
    });

    res.status(200).json({
      success: true,
      data: {
        offers,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get expired offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expired offers',
      error: error.message,
    });
  }
};

module.exports = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  expressInterest,
  getFeaturedOffers,
  getOfferStatistics,
  toggleFeaturedStatus,
  bulkUpdatePrices,
  getExpiredOffers,
};