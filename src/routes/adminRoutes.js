const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getSystemHealth,
  getRecentActivities,
  getPendingActions,
  bulkOperations,
  exportData,
  getAuditLogs,
  performMaintenance,
} = require('../controllers/adminController');

const { authenticate, adminOnly } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

// All routes require admin authentication
router.use(authenticate);
router.use(adminOnly);

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/system-health', getSystemHealth);
router.get('/recent-activities', getRecentActivities);
router.get('/pending-actions', getPendingActions);

// Bulk operations
router.post('/bulk-operations', bulkOperations);

// Data export
router.get('/export', exportData);

// Audit logs
router.get('/audit-logs', validatePagination, getAuditLogs);

// System maintenance
router.post('/maintenance', performMaintenance);

module.exports = router;