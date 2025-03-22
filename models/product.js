const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - productCode
 *         - title
 *         - price
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the product
 *         productCode:
 *           type: string
 *           description: Unique product code
 *         title:
 *           type: string
 *           description: Title of the product
 *         imagePath:
 *           type: string
 *           description: Path to the product image
 *         description:
 *           type: string
 *           description: Detailed description of the product
 *         price:
 *           type: number
 *           description: Price of the product
 *         category:
 *           type: string
 *           description: Reference to the category ID
 *         manufacturer:
 *           type: string
 *           description: Name of the manufacturer
 *         available:
 *           type: boolean
 *           description: Whether the product is available for purchase
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date when the product was added
 */
const ProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    default: '/images/default-product.jpg'
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a text index for search functionality
ProductSchema.index({
  title: 'text',
  description: 'text',
  manufacturer: 'text',
  productCode: 'text'
});

// Add indexes for frequently queried fields
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ available: 1 });
ProductSchema.index({ manufacturer: 1 });
ProductSchema.index({ createdAt: -1 });

// Compound indexes for common queries
ProductSchema.index({ category: 1, available: 1 });
ProductSchema.index({ available: 1, price: 1 });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product; 