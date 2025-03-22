const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - user
 *         - amount
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the transaction
 *         transactionCode:
 *           type: string
 *           description: ZarinPal transaction reference code
 *         user:
 *           type: string
 *           description: Reference to the user making the payment
 *         order:
 *           type: string
 *           description: Reference to the order being paid
 *         amount:
 *           type: number
 *           description: Amount of transaction
 *         description:
 *           type: string
 *           description: Payment description
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           description: Status of the transaction
 *         paymentDate:
 *           type: date
 *           description: Date of payment
 *         callbackStatus:
 *           type: string
 *           description: Status returned by ZarinPal
 *         authority:
 *           type: string
 *           description: Authority code from ZarinPal
 *         pid:
 *           type: string
 *           description: Process ID for tracking transaction
 */
const transactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1000
    },
    authority: {
        type: String,
        unique: true,
        sparse: true
    },
    refId: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'],
        default: 'PENDING',
        index: true
    },
    description: {
        type: String,
        default: 'پرداخت سفارش'
    },
    failReason: {
        type: String
    },
    paymentMethod: {
        type: String,
        enum: ['ZARINPAL', 'CASH_ON_DELIVERY', 'WALLET'],
        default: 'ZARINPAL'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    verifiedAt: {
        type: Date
    },
    meta: {
        type: Map,
        of: Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add a compound index for status and createdAt for efficient queries
transactionSchema.index({ status: 1, createdAt: -1 });

// Add text index for searching
transactionSchema.index({ description: 'text', refId: 'text', authority: 'text' });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
    return new Intl.NumberFormat('fa-IR').format(this.amount) + ' تومان';
});

// Static method to find pending transactions that should be expired
transactionSchema.statics.findExpiredTransactions = function(expiryMinutes = 30) {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() - expiryMinutes);
    
    return this.find({
        status: 'PENDING',
        createdAt: { $lt: expiryTime }
    });
};

// Pre-save hook to set default values or perform validations
transactionSchema.pre('save', function(next) {
    // Additional validations or transformations can be done here
    next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 