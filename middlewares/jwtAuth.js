const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user');
const logger = require('../config/logger');
require('dotenv').config();

/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User document from database
 * @returns {String} JWT token
 */
exports.generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    isAdmin: user.isAdmin
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Middleware to protect routes requiring authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) Get token from authorization header or cookie
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      logger.warn('Authentication failed: No token provided');
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }
    
    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      logger.warn(`Authentication failed: User with ID ${decoded.id} no longer exists`);
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }
    
    // 4) Check if user changed password after the token was issued
    if (user.passwordChangedAfter && user.passwordChangedAfter(decoded.iat)) {
      logger.warn(`Authentication failed: User ${user.email} recently changed password`);
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password. Please log in again.'
      });
    }
    
    // 5) Grant access to protected route
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      logger.warn(`Authentication failed: ${err.message}`);
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again.'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      logger.warn('Authentication failed: Token expired');
      return res.status(401).json({
        status: 'fail',
        message: 'Your token has expired. Please log in again.'
      });
    }
    
    logger.error(`JWT authentication error: ${err.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware to restrict access to certain roles
 * @param {...String} roles - Roles allowed to access the route
 * @returns {Function} Middleware function
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Role restriction failed: No user in request');
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated'
      });
    }
    
    // For admin check, we could directly check the isAdmin flag
    if (roles.includes('admin') && req.user.isAdmin) {
      return next();
    }
    
    // For other role-based checks that might be added in the future
    if (!roles.some(role => req.user.role === role)) {
      logger.warn(`Role restriction failed: User ${req.user.email} does not have permission`);
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    
    next();
  };
};

module.exports = {
  generateToken,
  protect,
  restrictTo
}; 