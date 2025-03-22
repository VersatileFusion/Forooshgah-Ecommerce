const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');
require('dotenv').config();

// Window time in milliseconds and max requests per window
const windowMs = process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000; // 15 minutes by default
const max = process.env.RATE_LIMIT_MAX || 100; // 100 requests per windowMs by default

// Create a standard rate limiter
const standardLimiter = rateLimit({
  windowMs,
  max,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
  headers: true,
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

// Authentication rate limiter (more strict)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again after an hour.',
  },
  headers: true,
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

// API rate limiter (can be adjusted based on roles)
const apiLimiter = (reqsPerMin = 60) => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: reqsPerMin,
    message: {
      status: 'error',
      message: 'Too many API requests, please try again later.',
    },
    headers: true,
    handler: (req, res, next, options) => {
      logger.warn(`API rate limit exceeded for IP: ${req.ip}, User: ${req.user ? req.user.email : 'anonymous'}`);
      res.status(429).json(options.message);
    },
    // Skip rate limiting for premium users or admins (if needed)
    skip: (req, res) => {
      return req.user && (req.user.isPremium || req.user.isAdmin);
    }
  });
};

module.exports = {
  standardLimiter,
  authLimiter,
  apiLimiter
}; 