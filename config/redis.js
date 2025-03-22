const redis = require('redis');
const { promisify } = require('util');
const logger = require('./logger');
require('dotenv').config();

// Create Redis client
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || '',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis max retry attempts reached');
        return new Error('Redis max retry attempts reached');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Handle Redis client errors
redisClient.on('error', (err) => {
  logger.error(`Redis error: ${err.message}`);
});

// Handle Redis client connection
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

// Initialize Redis connection
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error(`Redis connection error: ${err.message}`);
  }
})();

// Helper functions using promises
/**
 * Get value from Redis cache
 * @param {String} key - Cache key
 * @returns {Promise<Object>} Parsed JSON data
 */
const get = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.error(`Redis get error: ${err.message}`);
    throw err;
  }
};

/**
 * Set value in Redis cache with expiration
 * @param {String} key - Cache key
 * @param {Object} value - Data to cache
 * @param {Number} duration - Time in seconds
 * @returns {Promise<String>} Redis response
 */
const setex = async (key, duration, value) => {
  try {
    return await redisClient.setEx(key, duration, JSON.stringify(value));
  } catch (err) {
    logger.error(`Redis set error: ${err.message}`);
    throw err;
  }
};

/**
 * Delete value from Redis cache
 * @param {String} key - Cache key
 * @returns {Promise<Number>} Number of keys removed
 */
const del = async (key) => {
  try {
    return await redisClient.del(key);
  } catch (err) {
    logger.error(`Redis delete error: ${err.message}`);
    throw err;
  }
};

/**
 * Clear entire Redis cache
 * @returns {Promise<String>} Redis response
 */
const flushall = async () => {
  try {
    return await redisClient.flushAll();
  } catch (err) {
    logger.error(`Redis flush error: ${err.message}`);
    throw err;
  }
};

/**
 * Clear cache for a specific pattern (e.g., all product-related keys)
 * @param {String} pattern - Pattern to match
 */
const clearPattern = async (pattern) => {
  try {
    // Get all keys matching pattern
    const keys = await redisClient.keys(pattern);
    
    // Delete all matched keys
    if (keys.length > 0) {
      await Promise.all(keys.map(key => del(key)));
      logger.info(`Cleared ${keys.length} cache keys matching pattern: ${pattern}`);
    }
    
    return keys.length;
  } catch (err) {
    logger.error(`Redis clear pattern error: ${err.message}`);
    throw err;
  }
};

module.exports = {
  redisClient,
  get,
  setex,
  del,
  flushall,
  clearPattern
}; 