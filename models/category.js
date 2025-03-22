const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - title
 *         - slug
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the category
 *         title:
 *           type: string
 *           description: Title of the category
 *         slug:
 *           type: string
 *           description: URL-friendly version of the title
 */
const CategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to create slug if not provided
CategorySchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  // Create a slug from the title if not explicitly set
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  
  next();
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category; 