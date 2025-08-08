const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('referralCode')
    .optional()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Referral code must be between 6 and 20 characters'),
  
  handleValidationErrors,
];

const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors,
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  handleValidationErrors,
];

// Cask validation rules
const validateCaskCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Cask name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('distillery')
    .trim()
    .notEmpty()
    .withMessage('Distillery name is required'),
  
  body('year')
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Year must be between 1800 and current year'),
  
  body('volume')
    .trim()
    .notEmpty()
    .withMessage('Volume is required'),
  
  body('abv')
    .trim()
    .notEmpty()
    .withMessage('ABV is required'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  
  body('purchasePrice')
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),
  
  body('currentValue')
    .isFloat({ min: 0 })
    .withMessage('Current value must be a positive number'),
  
  handleValidationErrors,
];

// Offer validation rules
const validateOfferCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('type')
    .isIn(['cask', 'bottle', 'experience'])
    .withMessage('Type must be cask, bottle, or experience'),
  
  body('originalPrice')
    .trim()
    .notEmpty()
    .withMessage('Original price is required'),
  
  body('currentPrice')
    .trim()
    .notEmpty()
    .withMessage('Current price is required'),
  
  body('priceNumeric')
    .isFloat({ min: 0 })
    .withMessage('Numeric price must be a positive number'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  
  body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('expiryDate')
    .isISO8601()
    .withMessage('Please provide a valid expiry date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  
  handleValidationErrors,
];

// Purchase validation rules
const validatePurchaseCreation = [
  body('offer')
    .isMongoId()
    .withMessage('Valid offer ID is required'),
  
  body('investmentAmountNumeric')
    .isFloat({ min: 1 })
    .withMessage('Investment amount must be at least 1'),
  
  body('personalInfo.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  
  body('personalInfo.email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('personalInfo.phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('personalInfo.preferredContactMethod')
    .isIn(['email', 'phone'])
    .withMessage('Preferred contact method must be email or phone'),
  
  handleValidationErrors,
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors,
];

// Query validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'name', '-name', 'price', '-price', 'rating', '-rating'])
    .withMessage('Invalid sort parameter'),
  
  handleValidationErrors,
];

// Password reset validation
const validatePasswordReset = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  handleValidationErrors,
];

// Email validation
const validateEmail = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateCaskCreation,
  validateOfferCreation,
  validatePurchaseCreation,
  validateObjectId,
  validatePagination,
  validatePasswordReset,
  validateEmail,
};