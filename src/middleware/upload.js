const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_FOLDER || './uploads';
const createUploadDirs = () => {
  const dirs = [
    path.join(uploadDir, 'users'),
    path.join(uploadDir, 'casks'),
    path.join(uploadDir, 'offers'),
    path.join(uploadDir, 'documents'),
    path.join(uploadDir, 'temp'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'temp';
    
    // Determine folder based on field name or route
    if (file.fieldname === 'avatar' || req.route.path.includes('avatar')) {
      folder = 'users';
    } else if (file.fieldname === 'caskImage' || req.route.path.includes('cask')) {
      folder = 'casks';
    } else if (file.fieldname === 'offerImage' || req.route.path.includes('offer')) {
      folder = 'offers';
    } else if (file.fieldname === 'document') {
      folder = 'documents';
    }
    
    const destinationPath = path.join(uploadDir, folder);
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${extension}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Get allowed file types from environment
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10, // Maximum 10 files per request
  },
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.',
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  
  next(error);
};

// Specific upload configurations
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
const uploadFields = (fields) => upload.fields(fields);

// Avatar upload
const uploadAvatar = uploadSingle('avatar');

// Cask images upload
const uploadCaskImages = uploadMultiple('caskImages', 5);

// Offer images upload
const uploadOfferImages = uploadMultiple('offerImages', 5);

// Document upload
const uploadDocument = uploadSingle('document');

// Multiple field upload for offers
const uploadOfferFiles = uploadFields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 5 },
  { name: 'documents', maxCount: 3 },
]);

// Utility function to get file URL
const getFileUrl = (req, filename, folder = '') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${folder}${folder ? '/' : ''}${filename}`;
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Cleanup old files (can be used in a cron job)
const cleanupOldFiles = (directory, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const files = fs.readdirSync(directory);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadAvatar,
  uploadCaskImages,
  uploadOfferImages,
  uploadDocument,
  uploadOfferFiles,
  handleUploadError,
  getFileUrl,
  deleteFile,
  cleanupOldFiles,
};