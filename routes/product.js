const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { validateProduct } = require('../middlewares/validator');
const { apiAuth, apiAdmin } = require('../middlewares/auth');
const logger = require('../config/logger');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ID to filter by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for text search
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Only show available products
    query.available = true;
    
    // Text search if provided
    let products;
    if (req.query.search) {
      products = await Product.find(
        { $text: { $search: req.query.search }, ...query }
      ).populate('category');
      
      logger.info(`Product search for: ${req.query.search}`);
    } else {
      products = await Product.find(query).populate('category');
      logger.info('All products fetched');
    }
    
    res.json(products);
  } catch (err) {
    logger.error(`Error fetching products: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    
    if (!product) {
      logger.info(`Product not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    logger.info(`Product fetched: ${product.title}`);
    res.json(product);
  } catch (err) {
    logger.error(`Error fetching product: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', apiAuth, apiAdmin, validateProduct, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    
    logger.info(`New product created: ${newProduct.title}`);
    res.status(201).json(newProduct);
  } catch (err) {
    logger.error(`Error creating product: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put('/:id', apiAuth, apiAdmin, validateProduct, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      logger.info(`Product not found for update: ${req.params.id}`);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    logger.info(`Product updated: ${product.title}`);
    res.json(product);
  } catch (err) {
    logger.error(`Error updating product: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
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
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', apiAuth, apiAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      logger.info(`Product not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    logger.info(`Product deleted: ${product.title}`);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    logger.error(`Error deleting product: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 