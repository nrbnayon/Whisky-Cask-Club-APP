const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/caskController');

const { authenticate, adminOnly, adminOrManager } = require('../middleware/auth');
const { uploadCaskImages, handleUploadError } = require('../middleware/upload');
const {
  validateCaskCreation,
  validateObjectId,
  validatePagination,
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// User routes (own casks)
router.get('/my-casks', validatePagination, getUserCasks);
router.get('/:id', validateObjectId, getCaskById);
router.post('/:id/review', validateObjectId, addCaskReview);

// Admin/Manager routes
router.get('/', adminOrManager, validatePagination, getAllCasks);
router.post('/', adminOnly, uploadCaskImages, handleUploadError, validateCaskCreation, createCask);
router.put('/:id', adminOrManager, validateObjectId, uploadCaskImages, handleUploadError, updateCask);
router.delete('/:id', adminOnly, validateObjectId, deleteCask);
router.put('/:id/appreciation', adminOnly, validateObjectId, updateAppreciationData);
router.get('/:id/analytics', adminOnly, validateObjectId, getCaskAnalytics);
router.post('/bulk-update-values', adminOnly, bulkUpdateCaskValues);

module.exports = router;