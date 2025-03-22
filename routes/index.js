const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns welcome message
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/', (req, res) => {
  logger.info('Home page accessed');
  res.json({ 
    message: 'Welcome to the E-commerce API',
    documentation: '/api-docs',
    status: 'Server is running'
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 time:
 *                   type: string
 *                 uptime:
 *                   type: number
 */
router.get('/health', (req, res) => {
  logger.info('Health check performed');
  res.json({
    status: 'OK',
    time: new Date(),
    uptime: process.uptime()
  });
});

module.exports = router; 