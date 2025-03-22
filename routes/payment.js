const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { jwtAuth, restrictTo } = require('../middlewares/auth');

/**
 * @swagger
 * /api/payments/request:
 *   post:
 *     summary: Create a payment request
 *     description: Creates a new payment request and redirects to ZarinPal payment page
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID of the order to pay for
 *     responses:
 *       200:
 *         description: Success, returns redirect URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     redirectUrl:
 *                       type: string
 *                       description: URL to redirect user to ZarinPal payment page
 *                     authority:
 *                       type: string
 *                       description: ZarinPal authority code
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post('/request', jwtAuth, paymentController.createPaymentRequest);

/**
 * @swagger
 * /api/payments/verify:
 *   get:
 *     summary: Verify payment
 *     description: Callback endpoint for ZarinPal to verify payment
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: Authority
 *         schema:
 *           type: string
 *         required: true
 *         description: ZarinPal authority code
 *       - in: query
 *         name: Status
 *         schema:
 *           type: string
 *         required: true
 *         description: Payment status (OK or NOK)
 *     responses:
 *       302:
 *         description: Redirects to success or failure page
 */
router.get('/verify', paymentController.verifyPayment);

/**
 * @swagger
 * /api/payments/transactions:
 *   get:
 *     summary: Get user transactions
 *     description: Retrieves all payment transactions for the authenticated user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   description: Total number of transactions
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/transactions', jwtAuth, paymentController.getUserTransactions);

/**
 * @swagger
 * /api/payments/admin/transactions:
 *   get:
 *     summary: Get all transactions (admin only)
 *     description: Retrieves all payment transactions with filtering and pagination
 *     tags: [Payments, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED, EXPIRED]
 *         description: Filter by transaction status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalSuccessful:
 *                           type: integer
 *                         totalFailed:
 *                           type: integer
 *                         totalPending:
 *                           type: integer
 *                         totalAmount:
 *                           type: integer
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/admin/transactions', jwtAuth, restrictTo('admin'), paymentController.getAllTransactions);

module.exports = router; 