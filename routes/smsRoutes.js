const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');
const { jwtAuth, restrictTo } = require('../middlewares/auth');

/**
 * @swagger
 * /api/sms/send-verification:
 *   post:
 *     summary: Send verification code
 *     description: Sends a verification code to the provided phone number
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone number to send verification code to
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/send-verification', smsController.sendVerificationCode);

/**
 * @swagger
 * /api/sms/verify-code:
 *   post:
 *     summary: Verify code
 *     description: Verifies the code sent to the phone number
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone number that received the code
 *               code:
 *                 type: string
 *                 description: Verification code
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/verify-code', smsController.verifyCode);

/**
 * @swagger
 * /api/sms/verify-phone:
 *   post:
 *     summary: Verify user's phone number
 *     description: Sends a verification code to verify a user's phone number
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone number to verify
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/verify-phone', jwtAuth, smsController.sendVerificationCode);

/**
 * @swagger
 * /api/sms/confirm-phone:
 *   post:
 *     summary: Confirm user's phone number
 *     description: Confirms the user's phone number with the verification code
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone number to confirm
 *               code:
 *                 type: string
 *                 description: Verification code
 *     responses:
 *       200:
 *         description: Phone number confirmed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/confirm-phone', jwtAuth, smsController.verifyCode);

/**
 * @swagger
 * /api/sms/admin/send:
 *   post:
 *     summary: Send manual SMS (admin only)
 *     description: Sends SMS messages to one or more recipients
 *     tags: [SMS, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipients
 *               - message
 *             properties:
 *               recipients:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *                 description: Phone number(s) to send SMS to
 *               message:
 *                 type: string
 *                 description: SMS content
 *     responses:
 *       200:
 *         description: SMS sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/admin/send', jwtAuth, restrictTo('admin'), smsController.sendManualSMS);

/**
 * @swagger
 * /api/sms/admin/credit:
 *   get:
 *     summary: Get SMS credit balance (admin only)
 *     description: Retrieves the current SMS credit balance
 *     tags: [SMS, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credit balance retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/admin/credit', jwtAuth, restrictTo('admin'), smsController.getCredit);

module.exports = router; 