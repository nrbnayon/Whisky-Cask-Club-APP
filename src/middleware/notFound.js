const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message,
    availableRoutes: {
      auth: '/api/auth',
      users: '/api/users',
      casks: '/api/casks',
      offers: '/api/offers',
      purchases: '/api/purchases',
      notifications: '/api/notifications',
      activities: '/api/activities',
      referrals: '/api/referrals',
      payments: '/api/payments',
      admin: '/api/admin',
      upload: '/api/upload',
    },
  });
};

module.exports = notFound;