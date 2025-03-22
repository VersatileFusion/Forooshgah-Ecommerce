const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Render payment page with order details
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.getPaymentPage = async (req, res, next) => {
    try {
        const { orderId } = req.query;
        let orderDetails = null;
        let recentTransactions = [];
        
        // If user is logged in, get their recent transactions
        if (req.user) {
            recentTransactions = await Transaction.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .limit(5);
                
            // If order ID is provided, get order details
            if (orderId) {
                orderDetails = await Order.findById(orderId);
                
                // Verify order belongs to current user
                if (orderDetails && orderDetails.userId.toString() !== req.user.id) {
                    orderDetails = null;
                }
            }
        }
        
        res.render('payment/index', {
            title: 'پرداخت',
            orderDetails,
            recentTransactions,
            user: req.user
        });
    } catch (error) {
        logger.error('Error rendering payment page:', error);
        res.status(500).render('error', {
            message: 'خطا در بارگذاری صفحه پرداخت',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

/**
 * Render payment success page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.getPaymentSuccessPage = (req, res) => {
    const { refId } = req.query;
    res.render('payment/success', {
        title: 'پرداخت موفق',
        refId,
        user: req.user
    });
};

/**
 * Render payment failure page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.getPaymentFailurePage = (req, res) => {
    const { error } = req.query;
    res.render('payment/failed', {
        title: 'پرداخت ناموفق',
        error,
        user: req.user
    });
}; 