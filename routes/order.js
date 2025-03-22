const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Cart = require('../models/cart');
const { validateOrder } = require('../middlewares/validator');
const { apiAuth, apiAdmin } = require('../middlewares/auth');
const logger = require('../config/logger');

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.get('/', apiAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    
    logger.info(`Orders fetched for user: ${req.user.email}`);
    res.json(orders);
  } catch (err) {
    logger.error(`Error fetching orders: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', apiAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      logger.info(`Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order belongs to user or user is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      logger.warn(`Unauthorized order access attempt by user: ${req.user.email}`);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    logger.info(`Order fetched: ${order._id}`);
    res.json(order);
  } catch (err) {
    logger.error(`Error fetching order: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               paymentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: No items in cart
 */
router.post('/', apiAuth, validateOrder, async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart || cart.items.length === 0) {
      logger.info(`Order creation attempt with empty cart: ${req.user.email}`);
      return res.status(400).json({ message: 'Your cart is empty' });
    }
    
    // Create new order
    const newOrder = new Order({
      user: req.user._id,
      cart: {
        items: cart.items,
        totalQty: cart.totalQty,
        totalCost: cart.totalCost
      },
      address: req.body.address,
      paymentId: req.body.paymentId
    });
    
    await newOrder.save();
    
    // Empty cart after order creation
    cart.emptyCart();
    await cart.save();
    
    logger.info(`New order created: ${newOrder._id} by user: ${req.user.email}`);
    res.status(201).json(newOrder);
  } catch (err) {
    logger.error(`Error creating order: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}/deliver:
 *   patch:
 *     summary: Mark an order as delivered
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order marked as delivered
 *       404:
 *         description: Order not found
 */
router.patch('/:id/deliver', apiAuth, apiAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      logger.info(`Order not found for delivery update: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Mark as delivered
    order.delivered = true;
    await order.save();
    
    logger.info(`Order marked as delivered: ${order._id}`);
    res.json(order);
  } catch (err) {
    logger.error(`Error updating order delivery status: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *       403:
 *         description: Not authorized
 */
router.get('/admin/all', apiAuth, apiAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'username email').sort('-createdAt');
    
    logger.info(`All orders fetched by admin: ${req.user.email}`);
    res.json(orders);
  } catch (err) {
    logger.error(`Error fetching all orders: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 