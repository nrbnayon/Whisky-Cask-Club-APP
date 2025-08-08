const User = require('../models/User');
const Cask = require('../models/Cask');
const Purchase = require('../models/Purchase');
const Activity = require('../models/Activity');
const Referral = require('../models/Referral');
const { getFileUrl, deleteFile } = require('../middleware/upload');
const path = require('path');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.isActive = status === 'active';
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .populate('referredBy', 'firstName lastName referralCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Get user statistics
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
          totalBalance: { $sum: '$balance' },
          totalEarnings: { $sum: '$totalEarnings' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        stats: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          verifiedUsers: 0,
          totalBalance: 0,
          totalEarnings: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password')
      .populate('referredBy', 'firstName lastName referralCode');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's portfolio summary
    const portfolioStats = await Cask.aggregate([
      { $match: { owner: user._id } },
      {
        $group: {
          _id: null,
          totalCasks: { $sum: 1 },
          totalValue: { $sum: '$currentValue' },
          totalGain: { $sum: { $subtract: ['$currentValue', '$purchasePrice'] } },
        }
      }
    ]);

    // Get user's purchase summary
    const purchaseStats = await Purchase.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmountNumeric' },
        }
      }
    ]);

    // Get referral stats
    const referralStats = await Referral.getReferralStats(user._id);

    res.status(200).json({
      success: true,
      data: {
        user,
        portfolio: portfolioStats[0] || { totalCasks: 0, totalValue: 0, totalGain: 0 },
        purchases: purchaseStats,
        referrals: referralStats,
      },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message,
    });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role; // Role should be updated separately
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create activity
    await Activity.createActivity({
      title: 'Profile Updated by Admin',
      subtitle: `Profile updated by ${req.user.fullName}`,
      type: 'profile_update',
      user: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'manager'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, admin, or manager',
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create activity
    await Activity.createActivity({
      title: 'Role Updated',
      subtitle: `Role changed to ${role} by ${req.user.fullName}`,
      type: 'profile_update',
      user: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message,
    });
  }
};

// Deactivate/Activate user (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Toggle status
    user.isActive = !user.isActive;
    await user.save();

    // Create activity
    await Activity.createActivity({
      title: `Account ${user.isActive ? 'Activated' : 'Deactivated'}`,
      subtitle: `Account ${user.isActive ? 'activated' : 'deactivated'} by ${req.user.fullName}`,
      type: 'profile_update',
      user: user._id,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user },
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};

// Upload user avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(process.env.UPLOAD_FOLDER || './uploads', 'users', path.basename(user.avatar));
      deleteFile(oldAvatarPath);
    }

    // Update user with new avatar URL
    const avatarUrl = getFileUrl(req, req.file.filename, 'users');
    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl },
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message,
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user',
        });
      }
    }

    // Soft delete by deactivating instead of hard delete
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// Get user dashboard stats
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get portfolio stats
    const portfolioStats = await Cask.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: null,
          totalCasks: { $sum: 1 },
          totalValue: { $sum: '$currentValue' },
          totalGain: { $sum: { $subtract: ['$currentValue', '$purchasePrice'] } },
          readyCasks: { $sum: { $cond: [{ $eq: ['$status', 'Ready'] }, 1, 0] } },
          maturingCasks: { $sum: { $cond: [{ $eq: ['$status', 'Maturing'] }, 1, 0] } },
        }
      }
    ]);

    // Get recent activities
    const recentActivities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get purchase stats
    const purchaseStats = await Purchase.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmountNumeric' },
        }
      }
    ]);

    // Get referral stats
    const referralStats = await Referral.getReferralStats(userId);

    res.status(200).json({
      success: true,
      data: {
        portfolio: portfolioStats[0] || {
          totalCasks: 0,
          totalValue: 0,
          totalGain: 0,
          readyCasks: 0,
          maturingCasks: 0,
        },
        recentActivities,
        purchases: purchaseStats,
        referrals: referralStats,
      },
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  toggleUserStatus,
  uploadAvatar,
  deleteUser,
  getUserDashboard,
};