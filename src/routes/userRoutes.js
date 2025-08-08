const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getUserDashboard,
} = require('../controllers/userController');

const { authenticate, adminOnly, adminOrManager } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// User dashboard (own data)
router.get('/dashboard', getUserDashboard);

// Admin/Manager only routes
router.get('/', adminOrManager, validatePagination, getAllUsers);
router.get('/:id', adminOrManager, validateObjectId, getUserById);
router.put('/:id', adminOnly, validateObjectId, updateUser);
router.put('/:id/role', adminOnly, validateObjectId, updateUserRole);
router.patch('/:id/toggle-status', adminOnly, validateObjectId, toggleUserStatus);
router.delete('/:id', adminOnly, validateObjectId, deleteUser);

module.exports = router;