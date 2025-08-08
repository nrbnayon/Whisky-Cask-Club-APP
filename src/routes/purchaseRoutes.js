const express = require('express');
const router = express.Router();

const {
  createPurchase,
  getUserPurchases,
  getAllPurchases,
  getPurchaseById,
  updatePurchaseStatus,
  addPurchaseNote,
  deletePurchase,
  getPurchaseAnalytics,
  bulkUpdatePurchaseStatus,
} = require('../controllers/purchaseController');

const { authenticate, adminOnly, adminOrManager } = require('../middleware/auth');
const {
  validatePurchaseCreation,
  validateObjectId,
  validatePagination,
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/', validatePurchaseCreation, createPurchase);
router.get('/my-purchases', validatePagination, getUserPurchases);
router.get('/:id', validateObjectId, getPurchaseById);
router.delete('/:id', validateObjectId, deletePurchase);

// Admin/Manager routes
router.get('/', adminOrManager, validatePagination, getAllPurchases);
router.put('/:id/status', adminOrManager, validateObjectId, updatePurchaseStatus);
router.post('/:id/note', adminOrManager, validateObjectId, addPurchaseNote);
router.get('/admin/analytics', adminOnly, getPurchaseAnalytics);
router.post('/admin/bulk-update-status', adminOnly, bulkUpdatePurchaseStatus);

module.exports = router;