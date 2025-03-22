const zarinpalService = require('../services/zarinpalService');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const User = require('../models/User');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { paginateResults } = require('../utils/pagination');
const smsService = require('../services/smsService');

/**
 * Create a payment request to ZarinPal
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.createPaymentRequest = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return next(new AppError('شناسه سفارش الزامی است', 400));
        }
        
        // Fetch the order
        const order = await Order.findById(orderId);
        
        if (!order) {
            return next(new AppError('سفارش مورد نظر یافت نشد', 404));
        }
        
        // Check if order belongs to current user
        if (order.userId.toString() !== req.user.id) {
            return next(new AppError('شما مجاز به پرداخت این سفارش نیستید', 403));
        }
        
        // Check if order has already been paid
        if (order.status === 'PAID') {
            return next(new AppError('این سفارش قبلاً پرداخت شده است', 400));
        }
        
        // Prepare payment data
        const paymentData = {
            userId: req.user.id,
            orderId: order._id,
            amount: order.totalAmount,
            description: `پرداخت سفارش شماره ${order.orderNumber}`,
            email: req.user.email,
            mobile: req.user.phone
        };
        
        // Request payment
        const result = await zarinpalService.requestPayment(paymentData);
        
        // Update order status to PENDING_PAYMENT
        order.status = 'PENDING_PAYMENT';
        await order.save();
        
        res.status(200).json({
            status: 'success',
            data: {
                redirectUrl: result.url,
                authority: result.authority
            }
        });
    } catch (error) {
        logger.error('Error creating payment request:', error);
        next(new AppError(error.message || 'خطا در ایجاد درخواست پرداخت', 500));
    }
};

/**
 * Verify a payment from ZarinPal
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.verifyPayment = async (req, res, next) => {
    try {
        const { Authority, Status } = req.query;
        
        if (!Authority) {
            return next(new AppError('اطلاعات تراکنش ناقص است', 400));
        }
        
        // Find transaction
        const transaction = await Transaction.findOne({ authority: Authority });
        
        if (!transaction) {
            logger.error(`Transaction not found for authority: ${Authority}`);
            return res.redirect('/views/payment/failed?error=تراکنش مورد نظر یافت نشد');
        }
        
        // If payment was canceled by user
        if (Status !== 'OK') {
            transaction.status = 'FAILED';
            transaction.failReason = 'پرداخت توسط کاربر لغو شد';
            await transaction.save();
            
            logger.info(`Payment canceled by user for transaction: ${transaction._id}`);
            return res.redirect('/views/payment/failed?error=پرداخت توسط کاربر لغو شد');
        }
        
        // Verify payment with ZarinPal
        const verifyResult = await zarinpalService.verifyPayment(Authority, transaction.amount);
        
        if (verifyResult.success) {
            // Find the user and order to send SMS notification
            const user = await User.findById(transaction.userId);
            const order = await Order.findById(transaction.orderId);
            
            // Send SMS notification if user has a phone number
            if (user && user.phone && order) {
                await smsService.sendPaymentConfirmation(
                    user.phone, 
                    order.orderNumber, 
                    transaction.amount
                );
            }
            
            // Redirect to success page
            return res.redirect(`/views/payment/success?refId=${verifyResult.refId}`);
        } else {
            // Redirect to failed page with error
            return res.redirect(`/views/payment/failed?error=${encodeURIComponent(verifyResult.error)}`);
        }
    } catch (error) {
        logger.error('Error verifying payment:', error);
        return res.redirect(`/views/payment/failed?error=${encodeURIComponent('خطا در تایید پرداخت')}`);
    }
};

/**
 * Get all user's payment transactions
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.getUserTransactions = async (req, res, next) => {
    try {
        const query = {
            userId: req.user.id
        };
        
        const options = {
            page: parseInt(req.query.page, 10) || 1,
            limit: parseInt(req.query.limit, 10) || 10,
            sort: { createdAt: -1 },
            populate: {
                path: 'orderId',
                select: 'orderNumber totalAmount items status'
            }
        };
        
        const result = await paginateResults(Transaction, query, options);
        
        res.status(200).json({
            status: 'success',
            results: result.totalDocs,
            data: {
                transactions: result.docs,
                pagination: {
                    totalPages: result.totalPages,
                    currentPage: result.page,
                    hasNextPage: result.hasNextPage,
                    hasPrevPage: result.hasPrevPage
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching user transactions:', error);
        next(new AppError(error.message || 'خطا در دریافت تراکنش‌ها', 500));
    }
};

/**
 * Get all transactions (admin only)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.getAllTransactions = async (req, res, next) => {
    try {
        // Build query based on filter parameters
        const query = {};
        
        if (req.query.status) {
            query.status = req.query.status;
        }
        
        if (req.query.startDate && req.query.endDate) {
            query.createdAt = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }
        
        const options = {
            page: parseInt(req.query.page, 10) || 1,
            limit: parseInt(req.query.limit, 10) || 20,
            sort: { createdAt: -1 },
            populate: [
                {
                    path: 'userId',
                    select: 'name email phone'
                },
                {
                    path: 'orderId',
                    select: 'orderNumber totalAmount status'
                }
            ]
        };
        
        const result = await paginateResults(Transaction, query, options);
        
        // Calculate totals for dashboard
        const totalSuccessful = await Transaction.countDocuments({ status: 'SUCCESS' });
        const totalFailed = await Transaction.countDocuments({ status: 'FAILED' });
        const totalPending = await Transaction.countDocuments({ status: 'PENDING' });
        
        // Calculate total amount of successful transactions
        const totalAmount = await Transaction.aggregate([
            { $match: { status: 'SUCCESS' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        res.status(200).json({
            status: 'success',
            results: result.totalDocs,
            data: {
                transactions: result.docs,
                summary: {
                    totalSuccessful,
                    totalFailed,
                    totalPending,
                    totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0
                },
                pagination: {
                    totalPages: result.totalPages,
                    currentPage: result.page,
                    hasNextPage: result.hasNextPage,
                    hasPrevPage: result.hasPrevPage
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching all transactions:', error);
        next(new AppError(error.message || 'خطا در دریافت تراکنش‌ها', 500));
    }
}; 