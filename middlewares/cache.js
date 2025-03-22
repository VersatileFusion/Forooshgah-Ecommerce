const redis = require('../config/redis');
const logger = require('../config/logger');

/**
 * Middleware for caching API responses in Redis
 * @param {Number} duration - Time in seconds to cache the response
 * @returns {Function} Express middleware function
 */
module.exports = (duration = 60) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create a unique cache key based on the request URL and query parameters
    const cacheKey = `api:${req.originalUrl || req.url}`;

    try {
      // Check if we have a cache hit
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        // If data exists in cache, parse and send the cached response
        const parsedData = JSON.parse(cachedData);
        logger.debug(`Cache hit for ${cacheKey}`);
        
        // Return cached response
        return res.json(parsedData);
      }

      // No cache hit, so we continue with request processing
      logger.debug(`Cache miss for ${cacheKey}`);

      // Store the original res.json method
      const originalJson = res.json;

      // Override res.json method to cache the response before sending
      res.json = function(data) {
        // Store data in Redis with expiration
        redis.setex(cacheKey, duration, JSON.stringify(data))
          .catch(err => {
            logger.error(`Redis cache error: ${err.message}`);
          });

        // Call the original json method to send the response
        return originalJson.call(this, data);
      };

      // Continue with the request
      next();
    } catch (err) {
      logger.error(`Cache middleware error: ${err.message}`);
      // If there's an error with caching, just continue with the request
      next();
    }
  };
}; 