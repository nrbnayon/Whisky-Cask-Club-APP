const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const { authenticate, adminOnly } = require('../middleware/auth');
const { 
  uploadSingle, 
  uploadMultiple, 
  handleUploadError, 
  getFileUrl, 
  deleteFile 
} = require('../middleware/upload');

// All routes require authentication
router.use(authenticate);

// Single file upload
router.post('/single', uploadSingle('file'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const fileUrl = getFileUrl(req, req.file.filename, 'temp');

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error('Single file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message,
    });
  }
});

// Multiple files upload
router.post('/multiple', uploadMultiple('files', 5), handleUploadError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: getFileUrl(req, file.filename, 'temp'),
    }));

    res.status(200).json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: { files: uploadedFiles },
    });
  } catch (error) {
    console.error('Multiple files upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message,
    });
  }
});

// Delete file (Admin only)
router.delete('/:filename', adminOnly, (req, res) => {
  try {
    const { filename } = req.params;
    const { folder = 'temp' } = req.query;

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename',
      });
    }

    const filePath = path.join(process.env.UPLOAD_FOLDER || './uploads', folder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const deleted = deleteFile(filePath);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message,
    });
  }
});

// Get file info
router.get('/info/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { folder = 'temp' } = req.query;

    // Validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename',
      });
    }

    const filePath = path.join(process.env.UPLOAD_FOLDER || './uploads', folder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const stats = fs.statSync(filePath);
    const fileUrl = getFileUrl(req, filename, folder);

    res.status(200).json({
      success: true,
      data: {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file info',
      error: error.message,
    });
  }
});

// List files in directory (Admin only)
router.get('/list/:folder?', adminOnly, (req, res) => {
  try {
    const { folder = 'temp' } = req.params;
    const dirPath = path.join(process.env.UPLOAD_FOLDER || './uploads', folder);

    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({
        success: false,
        message: 'Directory not found',
      });
    }

    const files = fs.readdirSync(dirPath).map(filename => {
      const filePath = path.join(dirPath, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: getFileUrl(req, filename, folder),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        folder,
        count: files.length,
        files,
      },
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files',
      error: error.message,
    });
  }
});

module.exports = router;