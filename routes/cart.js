const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const { apiAuth } = require('../middlewares/auth');
const logger = require('../config/logger');

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart details
 *       404:
 *         description: Cart not found
 */
router.get('/', apiAuth, async (req, res) => {
  try {
    // Find cart for current user or create a new one
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalQty: 0,
        totalCost: 0
      });
      await cart.save();
      logger.info(`New cart created for user: ${req.user.email}`);
    } else {
      logger.info(`Cart fetched for user: ${req.user.email}`);
    }
    
    res.json(cart);
  } catch (err) {
    logger.error(`Error fetching cart: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/cart/add/{productId}:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item added to cart
 *       404:
 *         description: Product not found
 */
router.post('/add/:productId', apiAuth, async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      logger.info(`Product not found for adding to cart: ${productId}`);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalQty: 0,
        totalCost: 0
      });
    }
    
    // Add item to cart
    cart.addItem(product, productId);
    await cart.save();
    
    logger.info(`Product added to cart: ${product.title} for user: ${req.user.email}`);
    res.json(cart);
  } catch (err) {
    logger.error(`Error adding item to cart: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/cart/reduce/{productId}:
 *   post:
 *     summary: Reduce item quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item quantity reduced
 *       404:
 *         description: Cart or item not found
 */
router.post('/reduce/:productId', apiAuth, async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      logger.info(`Cart not found for user when reducing item: ${req.user.email}`);
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Reduce item quantity
    const result = cart.reduceByOne(productId);
    if (!result) {
      logger.info(`Item not found in cart: ${productId}`);
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    await cart.save();
    
    logger.info(`Item quantity reduced in cart for user: ${req.user.email}`);
    res.json(cart);
  } catch (err) {
    logger.error(`Error reducing item quantity: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/cart/remove/{productId}:
 *   post:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Cart or item not found
 */
router.post('/remove/:productId', apiAuth, async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      logger.info(`Cart not found for user when removing item: ${req.user.email}`);
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Remove item
    const result = cart.removeItem(productId);
    if (!result) {
      logger.info(`Item not found in cart: ${productId}`);
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    await cart.save();
    
    logger.info(`Item removed from cart for user: ${req.user.email}`);
    res.json(cart);
  } catch (err) {
    logger.error(`Error removing item from cart: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/cart/clear:
 *   post:
 *     summary: Clear the entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       404:
 *         description: Cart not found
 */
router.post('/clear', apiAuth, async (req, res) => {
  try {
    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      logger.info(`Cart not found for user when clearing: ${req.user.email}`);
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Clear cart
    cart.emptyCart();
    await cart.save();
    
    logger.info(`Cart cleared for user: ${req.user.email}`);
    res.json(cart);
  } catch (err) {
    logger.error(`Error clearing cart: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 