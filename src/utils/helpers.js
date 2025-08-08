const crypto = require('crypto');
const moment = require('moment');

// Generate unique ID
const generateId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Generate referral code
const generateReferralCode = (firstName, lastName) => {
  const base = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return base + random;
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate percentage change
const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

// Format percentage
const formatPercentage = (percentage, showSign = true) => {
  const sign = showSign && percentage > 0 ? '+' : '';
  return `${sign}${percentage.toFixed(1)}%`;
};

// Generate random price within range
const generateRandomPrice = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Generate secure random token
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash string using SHA256
const hashString = (string) => {
  return crypto.createHash('sha256').update(string).digest('hex');
};

// Format date for display
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// Calculate days between dates
const daysBetween = (date1, date2) => {
  return moment(date2).diff(moment(date1), 'days');
};

// Get time ago string
const timeAgo = (date) => {
  return moment(date).fromNow();
};

// Sanitize filename
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Generate slug from string
const generateSlug = (string) => {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Paginate results
const paginate = (page, limit, total) => {
  const currentPage = Math.max(1, page);
  const itemsPerPage = Math.min(100, Math.max(1, limit));
  const totalPages = Math.ceil(total / itemsPerPage);
  const skip = (currentPage - 1) * itemsPerPage;

  return {
    current: currentPage,
    pages: totalPages,
    total,
    limit: itemsPerPage,
    skip,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Remove undefined/null values from object
const cleanObject = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// Generate appreciation data for casks
const generateAppreciationData = (startValue, endValue, months = 6) => {
  const data = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const valueIncrement = (endValue - startValue) / (months - 1);

  for (let i = 0; i < months; i++) {
    const currentMonth = new Date();
    currentMonth.setMonth(currentMonth.getMonth() - (months - 1 - i));
    
    data.push({
      month: monthNames[currentMonth.getMonth()],
      value: Math.round(startValue + (valueIncrement * i)),
    });
  }

  return data;
};

// Generate future forecasts
const generateFutureForecasts = (currentValue, years = 5, growthRate = 0.08) => {
  const forecasts = [];
  const currentYear = new Date().getFullYear();

  for (let i = 1; i <= years; i++) {
    const futureValue = currentValue * Math.pow(1 + growthRate, i);
    forecasts.push({
      year: (currentYear + i).toString(),
      value: formatCurrency(futureValue),
    });
  }

  return forecasts;
};

// Calculate investment metrics
const calculateInvestmentMetrics = (purchasePrice, currentValue, purchaseDate) => {
  const gain = currentValue - purchasePrice;
  const gainPercentage = (gain / purchasePrice) * 100;
  const daysSincePurchase = daysBetween(purchaseDate, new Date());
  const annualizedReturn = (gainPercentage / daysSincePurchase) * 365;

  return {
    gain,
    gainPercentage,
    gainFormatted: formatCurrency(gain),
    gainPercentageFormatted: formatPercentage(gainPercentage),
    daysSincePurchase,
    annualizedReturn,
    annualizedReturnFormatted: formatPercentage(annualizedReturn),
  };
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  const mongoose = require('mongoose');
  return mongoose.Types.ObjectId.isValid(id);
};

// Generate API response
const createResponse = (success, message, data = null, errors = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data) response.data = data;
  if (errors) response.errors = errors;

  return response;
};

// Rate limiting helper
const createRateLimitMessage = (windowMs, max) => {
  const windowMinutes = windowMs / (1000 * 60);
  return `Too many requests. Limit: ${max} requests per ${windowMinutes} minutes.`;
};

module.exports = {
  generateId,
  generateReferralCode,
  formatCurrency,
  calculatePercentageChange,
  formatPercentage,
  generateRandomPrice,
  isValidEmail,
  isValidPhoneNumber,
  generateSecureToken,
  hashString,
  formatDate,
  daysBetween,
  timeAgo,
  sanitizeFilename,
  generateSlug,
  paginate,
  deepClone,
  cleanObject,
  generateAppreciationData,
  generateFutureForecasts,
  calculateInvestmentMetrics,
  isValidObjectId,
  createResponse,
  createRateLimitMessage,
};