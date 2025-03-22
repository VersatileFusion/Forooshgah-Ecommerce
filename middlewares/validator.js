const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.info(`Validation error: ${JSON.stringify(errors.array())}`);
    
    // For API requests (expecting JSON)
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // For form submissions (expecting HTML)
    req.flash('error_msg', 'Please correct the errors in the form');
    return res.render(req.validationRedirect || 'back', {
      errors: errors.array(),
      ...req.body // Pass back the form data
    });
  }
  next();
};

// Validation rules for different entities
module.exports = {
  // User validation
  validateUserRegistration: [
    body('username', 'Username is required').notEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    handleValidationErrors
  ],
  
  validateLogin: [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').notEmpty(),
    handleValidationErrors
  ],
  
  // Product validation
  validateProduct: [
    body('title', 'Title is required').notEmpty().trim().escape(),
    body('productCode', 'Product code is required').notEmpty().trim().escape(),
    body('price', 'Price must be a positive number').isFloat({ min: 0 }),
    body('description', 'Description is required').notEmpty().trim(),
    body('category', 'Category is required').notEmpty(),
    body('manufacturer', 'Manufacturer is required').notEmpty().trim().escape(),
    handleValidationErrors
  ],
  
  // Category validation
  validateCategory: [
    body('title', 'Title is required').notEmpty().trim().escape(),
    body('slug', 'Slug is required').notEmpty().trim().escape(),
    handleValidationErrors
  ],
  
  // Order validation
  validateOrder: [
    body('address', 'Address is required').notEmpty().trim(),
    handleValidationErrors
  ],
  
  // Contact form validation
  validateContactForm: [
    body('name', 'Name is required').notEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('subject', 'Subject is required').notEmpty().trim().escape(),
    body('message', 'Message is required').notEmpty().trim(),
    handleValidationErrors
  ],
  
  // Custom validator function for reuse in routes
  handleValidationErrors
}; 