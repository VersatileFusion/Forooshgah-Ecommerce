const logger = require('../config/logger');

module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    logger.info(`Unauthenticated access attempt: ${req.originalUrl}`);
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/users/login');
  },
  
  ensureGuest: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    logger.info(`Authenticated user trying to access guest-only route: ${req.user.email}`);
    res.redirect('/dashboard');
  },
  
  ensureAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    logger.warn(`Non-admin access attempt to admin route: ${req.originalUrl} by ${req.user ? req.user.email : 'unauthenticated user'}`);
    res.status(403).json({ message: 'Access denied' });
  },
  
  // API authentication middleware (for JSON responses)
  apiAuth: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    logger.info(`Unauthenticated API access attempt: ${req.originalUrl}`);
    res.status(401).json({ message: 'Authentication required' });
  },
  
  // API admin authentication middleware (for JSON responses)
  apiAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    logger.warn(`Unauthorized API admin access attempt: ${req.originalUrl} by ${req.user ? req.user.email : 'unauthenticated user'}`);
    res.status(403).json({ message: 'Admin privileges required' });
  }
}; 