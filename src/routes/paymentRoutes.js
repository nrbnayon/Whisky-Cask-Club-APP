const express = require('express');
const router = express.Router();

const {
  getUserPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  createPaymentIntent,
  getUserPayments,
  requestPayout,
  getUserPayouts,
  getAllPayments,
  getAllPayouts,
  updatePayoutStatus,
  getPaymentAnalytics,
} = require('../controllers/paymentController');

const { authenticate, adminOnly } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Payment methods
router.get('/methods', getUserPaymentMethods);
router.post('/methods', addPaymentMethod);
router.delete('/methods/:id', validateObjectId, removePaymentMethod);
router.patch('/methods/:id/default', validateObjectId, setDefaultPaymentMethod);

// Payments
router.post('/create-intent', createPaymentIntent);
router.get('/my-payments', validatePagination, getUserPayments);

// Payouts
router.post('/payout', requestPayout);
router.get('/my-payouts', validatePagination, getUserPayouts);

// Admin only routes
router.get('/admin/payments', adminOnly, validatePagination, getAllPayments);
router.get('/admin/payouts', adminOnly, validatePagination, getAllPayouts);
router.put('/admin/payouts/:id/status', adminOnly, validateObjectId, updatePayoutStatus);
router.get('/admin/analytics', adminOnly, getPaymentAnalytics);

module.exports = router;