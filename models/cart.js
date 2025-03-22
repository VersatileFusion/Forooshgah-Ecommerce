const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: Reference to the product
 *         qty:
 *           type: number
 *           description: Quantity of the product
 *         price:
 *           type: number
 *           description: Price of the product
 *         title:
 *           type: string
 *           description: Title of the product
 *         productCode:
 *           type: string
 *           description: Product code
 *
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the cart
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalQty:
 *           type: number
 *           description: Total quantity of items in the cart
 *         totalCost:
 *           type: number
 *           description: Total cost of items in the cart
 *         user:
 *           type: string
 *           description: Reference to the user who owns the cart
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date when the cart was created
 */
const CartSchema = new mongoose.Schema({
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
    default: 0,
    required: true
  },
  totalCost: {
    type: Number,
    default: 0,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to add item to cart
CartSchema.methods.addItem = function(product, id) {
  let storedItem = this.items.findIndex(item => {
    return item.productId.toString() === id.toString();
  });

  if (storedItem >= 0) {
    // Item exists, increase quantity
    this.items[storedItem].qty++;
    this.items[storedItem].price = this.items[storedItem].qty * product.price;
    this.totalQty++;
    this.totalCost += product.price;
  } else {
    // Add new item
    this.items.push({
      productId: id,
      qty: 1,
      price: product.price,
      title: product.title,
      productCode: product.productCode
    });
    this.totalQty++;
    this.totalCost += product.price;
  }

  return this;
};

// Method to reduce item quantity
CartSchema.methods.reduceByOne = function(id) {
  const storedItem = this.items.findIndex(item => {
    return item.productId.toString() === id.toString();
  });
  
  if (storedItem >= 0) {
    this.items[storedItem].qty--;
    this.items[storedItem].price -= this.items[storedItem].price / (this.items[storedItem].qty + 1);
    this.totalQty--;
    this.totalCost -= this.items[storedItem].price / this.items[storedItem].qty;
    
    if (this.items[storedItem].qty <= 0) {
      this.items.splice(storedItem, 1);
    }
    
    return true;
  }
  
  return false;
};

// Method to remove item
CartSchema.methods.removeItem = function(id) {
  const storedItem = this.items.findIndex(item => {
    return item.productId.toString() === id.toString();
  });
  
  if (storedItem >= 0) {
    this.totalQty -= this.items[storedItem].qty;
    this.totalCost -= this.items[storedItem].price;
    this.items.splice(storedItem, 1);
    return true;
  }
  
  return false;
};

// Method to empty cart
CartSchema.methods.emptyCart = function() {
  this.items = [];
  this.totalQty = 0;
  this.totalCost = 0;
  
  return this;
};

// Add indexes for frequently queried fields
CartSchema.index({ user: 1 }, { unique: true });
CartSchema.index({ createdAt: -1 });
CartSchema.index({ totalCost: -1 });
CartSchema.index({ 'items.productId': 1 });

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart; 