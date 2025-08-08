const express = require('express');
const router = express.Router();

const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  getAllNotifications,
  deleteNotification,
  getNotificationStats,
} = require('../controllers/notificationController');

const { authenticate, adminOnly } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', validatePagination, getUserNotifications);
router.patch('/:id/read', validateObjectId, markAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/:id', validateObjectId, deleteNotification);

// Admin only routes
router.post('/', adminOnly, createNotification);
router.get('/admin/all', adminOnly, validatePagination, getAllNotifications);
router.get('/admin/stats', adminOnly, getNotificationStats);

module.exports = router;