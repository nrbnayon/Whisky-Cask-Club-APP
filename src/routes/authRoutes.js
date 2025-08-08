const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  verifyEmail,
  refreshToken,
} = require('../controllers/authController');

const { authenticate } = require('../middleware/auth');
const { uploadAvatar, handleUploadError } = require('../middleware/upload');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordReset,
  validateEmail,
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/forgot-password', validateEmail, forgotPassword);
router.post('/reset-password/:token', validatePasswordReset, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', validateUserUpdate, updateProfile);
router.post('/change-password', changePassword);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

// Avatar upload
router.post('/upload-avatar', uploadAvatar, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const User = require('../models/User');
    const { getFileUrl, deleteFile } = require('../middleware/upload');
    const path = require('path');

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
});

module.exports = router;