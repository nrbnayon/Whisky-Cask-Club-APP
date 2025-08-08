const express = require('express');
const router = express.Router();

const {
  getUserActivities,
  getAllActivities,
  createActivity,
  deleteActivity,
  getActivityAnalytics,
  bulkDeleteActivities,
} = require('../controllers/activityController');

const { authenticate, adminOnly } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', validatePagination, getUserActivities);
router.delete('/:id', validateObjectId, deleteActivity);

// Admin only routes
router.get('/admin/all', adminOnly, validatePagination, getAllActivities);
router.post('/admin/create', adminOnly, createActivity);
router.get('/admin/analytics', adminOnly, getActivityAnalytics);
router.delete('/admin/bulk-delete', adminOnly, bulkDeleteActivities);

module.exports = router;