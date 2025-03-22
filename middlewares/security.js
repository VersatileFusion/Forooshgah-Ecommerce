const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const csrf = require('csurf');
const logger = require('../config/logger');
require('dotenv').config();

/**
 * Configure security middleware
 * @param {Object} app - Express application instance
 */
exports.configureSecurity = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Enable Cross-Origin Resource Sharing
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token'],
    maxAge: 86400 // 24 hours
  };
  app.use(cors(corsOptions));
  logger.info('CORS enabled with options:', corsOptions.origin);

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());
  logger.info('NoSQL sanitization enabled');

  // Data sanitization against XSS
  app.use(xss());
  logger.info('XSS protection enabled');

  // Prevent parameter pollution
  app.use(hpp({
    whitelist: [
      'price',
      'rating',
      'category',
      'brand',
      'discount',
      'sort',
      'fields',
      'limit',
      'page'
    ]
  }));
  logger.info('HTTP Parameter Pollution protection enabled');

  // CSRF protection (only for browser-based requests)
  const csrfProtection = csrf({ 
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  });

  // Apply CSRF protection to all routes that modify state
  const setupCsrf = (app) => {
    // Exclude APIs that may be called by non-browser clients (like mobile apps)
    app.use(/^\/(?!api\/v1\/).*/, csrfProtection);
    
    // Generate CSRF token for browser clients
    app.get('/api/csrf-token', csrfProtection, (req, res) => {
      res.json({ csrfToken: req.csrfToken() });
    });

    // Add middleware to make CSRF token available to views
    app.use((req, res, next) => {
      res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
      next();
    });

    logger.info('CSRF protection enabled');
  };

  // Return CSRF setup function to be applied after session middleware setup
  return { setupCsrf };
}; 