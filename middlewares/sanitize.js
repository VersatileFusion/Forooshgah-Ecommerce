const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../config/logger');

// Sanitize data to prevent NoSQL injection
const sanitizeData = mongoSanitize();

// HTML sanitization for user input
const sanitizeHtml = (req, res, next) => {
  const sanitizeValue = (val) => {
    if (typeof val === 'string') {
      // Basic HTML sanitization - replace < and > with their HTML entities
      return val
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;');
    }
    
    if (val && typeof val === 'object') {
      Object.keys(val).forEach(key => {
        val[key] = sanitizeValue(val[key]);
      });
    }
    
    return val;
  };
  
  // Sanitize body, query, and params
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  
  next();
};

// Log incoming request data for debugging
const logRequestData = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Request ${req.method} ${req.originalUrl}`);
    if (Object.keys(req.body).length > 0) {
      logger.debug(`Request body: ${JSON.stringify(req.body)}`);
    }
  }
  next();
};

module.exports = {
  sanitizeData,
  sanitizeHtml,
  logRequestData
}; 