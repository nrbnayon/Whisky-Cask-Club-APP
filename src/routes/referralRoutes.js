const express = require('express');
const router = express.Router();

const {
  getUserReferralData,
  getAllReferrals,
  updateReferralStatus,
  payReferralReward,
  validateReferralCode,
  getReferralAnalytics,
  updateReferralReward,
  bulkPayReferralRewards,
} = require('../controllers/referralController');

const { authenticate, adminOnly } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

// Public routes
router.get('/validate/:code', validateReferralCode);

// Protected routes
router.use(authenticate);

// User routes
router.get('/my-referrals', getUserReferralData);

// Admin only routes
router.get('/', adminOnly, validatePagination, getAllReferrals);
router.put('/:id/status', adminOnly, validateObjectId, updateReferralStatus);
router.post('/:id/pay-reward', adminOnly, validateObjectId, payReferralReward);
router.put('/:id/reward', adminOnly, validateObjectId, updateReferralReward);
router.get('/admin/analytics', adminOnly, getReferralAnalytics);
router.post('/admin/bulk-pay-rewards', adminOnly, bulkPayReferralRewards);

module.exports = router;