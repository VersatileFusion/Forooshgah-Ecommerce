const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const { validateCategory } = require('../middlewares/validator');
const { apiAuth, apiAdmin } = require('../middlewares/auth');
const logger = require('../config/logger');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({}).sort('title');
    logger.info('All categories fetched');
    res.json(categories);
  } catch (err) {
    logger.error(`Error fetching categories: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      logger.info(`Category not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Category not found' });
    }
    
    logger.info(`Category fetched: ${category.title}`);
    res.json(category);
  } catch (err) {
    logger.error(`Error fetching category: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', apiAuth, apiAdmin, validateCategory, async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    
    logger.info(`New category created: ${newCategory.title}`);
    res.status(201).json(newCategory);
  } catch (err) {
    logger.error(`Error creating category: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
router.put('/:id', apiAuth, apiAdmin, validateCategory, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      logger.info(`Category not found for update: ${req.params.id}`);
      return res.status(404).json({ message: 'Category not found' });
    }
    
    logger.info(`Category updated: ${category.title}`);
    res.json(category);
  } catch (err) {
    logger.error(`Error updating category: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
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
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router.delete('/:id', apiAuth, apiAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      logger.info(`Category not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: 'Category not found' });
    }
    
    logger.info(`Category deleted: ${category.title}`);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    logger.error(`Error deleting category: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 