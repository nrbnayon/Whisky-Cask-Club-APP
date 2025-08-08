const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/offerController');

const { authenticate, adminOnly, optionalAuth } = require('../middleware/auth');
const { uploadOfferFiles, handleUploadError } = require('../middleware/upload');
const {
  validateOfferCreation,
  validateObjectId,
  validatePagination,
} = require('../middleware/validation');

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, validatePagination, getAllOffers);
router.get('/featured', optionalAuth, getFeaturedOffers);
router.get('/:id', optionalAuth, validateObjectId, getOfferById);

// Protected routes
router.use(authenticate);

// User routes
router.post('/:id/express-interest', validateObjectId, expressInterest);

// Admin only routes
router.post('/', adminOnly, uploadOfferFiles, handleUploadError, validateOfferCreation, createOffer);
router.put('/:id', adminOnly, validateObjectId, uploadOfferFiles, handleUploadError, updateOffer);
router.delete('/:id', adminOnly, validateObjectId, deleteOffer);
router.patch('/:id/toggle-featured', adminOnly, validateObjectId, toggleFeaturedStatus);
router.get('/admin/statistics', adminOnly, getOfferStatistics);
router.get('/admin/expired', adminOnly, validatePagination, getExpiredOffers);
router.post('/admin/bulk-update-prices', adminOnly, bulkUpdatePrices);

module.exports = router;