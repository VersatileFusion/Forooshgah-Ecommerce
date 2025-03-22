const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - user
 *         - cart
 *         - address
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the order
 *         user:
 *           type: string
 *           description: Reference to the user who placed the order
 *         cart:
 *           type: object
 *           description: Cart information at time of order
 *         address:
 *           type: string
 *           description: Shipping address
 *         paymentId:
 *           type: string
 *           description: Payment reference ID
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date when the order was placed
 *         delivered:
 *           type: boolean
 *           description: Whether the order has been delivered
 */
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        qty: {
          type: Number,
          default: 0
        },
        price: {
          type: Number,
          default: 0
        },
        title: {
          type: String
        },
        productCode: {
          type: String
        }
      }
    ],
    totalQty: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    }
  },
  address: {
    type: String,
    required: true
  },
  paymentId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  delivered: {
    type: Boolean,
    default: false
  }
});

// Virtual property for order status
OrderSchema.virtual('status').get(function() {
  return this.delivered ? 'Delivered' : 'Processing';
});

// Method to mark order as delivered
OrderSchema.methods.markAsDelivered = function() {
  this.delivered = true;
  return this.save();
};

// Add indexes for frequently queried fields
OrderSchema.index({ user: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ delivered: 1 });
OrderSchema.index({ 'cart.totalCost': -1 });
// Compound indexes for common queries
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ user: 1, delivered: 1 });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order; 