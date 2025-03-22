const axios = require('axios');
const dotenv = require('dotenv');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const logger = require('../utils/logger');

dotenv.config();

// ZarinPal configuration
const ZP_API_REQUEST = process.env.NODE_ENV === 'production' 
    ? 'https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json'
    : 'https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json';

const ZP_API_VERIFY = process.env.NODE_ENV === 'production'
    ? 'https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json'
    : 'https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentVerification.json';

const ZP_API_STARTPAY = process.env.NODE_ENV === 'production'
    ? 'https://www.zarinpal.com/pg/StartPay/'
    : 'https://sandbox.zarinpal.com/pg/StartPay/';

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;
const CALLBACK_URL = process.env.NODE_ENV === 'production'
    ? process.env.ZARINPAL_CALLBACK_URL
    : 'http://localhost:3000/api/payments/verify';

/**
 * Request a payment from ZarinPal
 * @param {Object} paymentData - Payment data object
 * @param {number} paymentData.amount - Amount in Tomans
 * @param {string} paymentData.description - Description of the payment
 * @param {string} paymentData.email - Customer email (optional)
 * @param {string} paymentData.mobile - Customer mobile (optional)
 * @param {string} paymentData.orderId - Order ID in our system
 * @param {string} paymentData.userId - User ID making the payment
 * @returns {Promise<Object>} - Returns payment URL and authority
 */
const requestPayment = async (paymentData) => {
    try {
        // Validate amount (minimum 1000 Tomans)
        if (paymentData.amount < 1000) {
            throw new Error('مبلغ پرداخت باید حداقل 1000 تومان باشد');
        }

        // Create request payload
        const requestData = {
            MerchantID: MERCHANT_ID,
            Amount: paymentData.amount,
            Description: paymentData.description || 'پرداخت سفارش',
            Email: paymentData.email || '',
            Mobile: paymentData.mobile || '',
            CallbackURL: CALLBACK_URL
        };
        
        logger.info(`Initiating ZarinPal payment request for order ${paymentData.orderId}`);
        
        // Send request to ZarinPal
        const response = await axios.post(ZP_API_REQUEST, requestData);
        
        if (response.data.Status === 100) {
            // Create a transaction record
            const transaction = new Transaction({
                userId: paymentData.userId,
                orderId: paymentData.orderId,
                amount: paymentData.amount,
                authority: response.data.Authority,
                status: 'PENDING',
                description: paymentData.description || 'پرداخت سفارش'
            });
            
            await transaction.save();
            
            // Return payment URL and authority
            return {
                success: true,
                url: `${ZP_API_STARTPAY}${response.data.Authority}`,
                authority: response.data.Authority
            };
        } else {
            logger.error(`ZarinPal payment request failed: Status ${response.data.Status}`);
            throw new Error(`خطا در درخواست پرداخت: ${getZarinPalError(response.data.Status)}`);
        }
    } catch (error) {
        logger.error('ZarinPal payment request error:', error);
        throw error;
    }
};

/**
 * Verify a payment with ZarinPal
 * @param {string} authority - Payment authority
 * @param {number} amount - Payment amount in Tomans
 * @returns {Promise<Object>} - Returns verification result
 */
const verifyPayment = async (authority, amount) => {
    try {
        // Find the transaction
        const transaction = await Transaction.findOne({ authority });
        
        if (!transaction) {
            throw new Error('تراکنش یافت نشد');
        }
        
        // Verify payment with ZarinPal
        const requestData = {
            MerchantID: MERCHANT_ID,
            Authority: authority,
            Amount: amount || transaction.amount
        };
        
        logger.info(`Verifying ZarinPal payment for authority: ${authority}`);
        
        const response = await axios.post(ZP_API_VERIFY, requestData);
        
        // Update transaction with verification result
        transaction.refId = response.data.RefID || null;
        transaction.verifiedAt = new Date();
        
        if (response.data.Status === 100 || response.data.Status === 101) {
            // Payment successful
            transaction.status = 'SUCCESS';
            await transaction.save();
            
            // Update the order status
            if (transaction.orderId) {
                const order = await Order.findById(transaction.orderId);
                if (order) {
                    order.status = 'PAID';
                    order.paymentDetails = {
                        method: 'ZARINPAL',
                        transactionId: transaction._id,
                        refId: response.data.RefID,
                        paidAt: new Date()
                    };
                    await order.save();
                }
            }
            
            return {
                success: true,
                refId: response.data.RefID,
                message: 'پرداخت با موفقیت انجام شد'
            };
        } else {
            // Payment failed
            transaction.status = 'FAILED';
            transaction.failReason = getZarinPalError(response.data.Status);
            await transaction.save();
            
            return {
                success: false,
                status: response.data.Status,
                error: getZarinPalError(response.data.Status)
            };
        }
    } catch (error) {
        logger.error('ZarinPal verification error:', error);
        throw error;
    }
};

/**
 * Get the payment status for a given authority
 * @param {string} authority - Payment authority
 * @returns {Promise<Object>} - Returns transaction details
 */
const getPaymentStatus = async (authority) => {
    try {
        const transaction = await Transaction.findOne({ authority })
            .populate('orderId', 'orderNumber items totalAmount');
        
        if (!transaction) {
            throw new Error('تراکنش یافت نشد');
        }
        
        return {
            success: true,
            transaction
        };
    } catch (error) {
        logger.error('Error getting payment status:', error);
        throw error;
    }
};

/**
 * Get error message for ZarinPal status codes
 * @param {number} status - ZarinPal status code
 * @returns {string} - Error message
 */
const getZarinPalError = (status) => {
    const errors = {
        '-1': 'اطلاعات ارسال شده ناقص است',
        '-2': 'IP و یا مرچنت کد پذیرنده صحیح نیست',
        '-3': 'با توجه به محدودیت های شاپرک امکان پرداخت با رقم درخواست شده میسر نمی باشد',
        '-4': 'سطح تایید پذیرنده پایین تر از سطح نقره ای است',
        '-11': 'درخواست مورد نظر یافت نشد',
        '-12': 'امکان ویرایش درخواست میسر نمی باشد',
        '-21': 'هیچ نوع عملیات مالی برای این تراکنش یافت نشد',
        '-22': 'تراکنش نا موفق می باشد',
        '-33': 'رقم تراکنش با رقم پرداخت شده مطابقت ندارد',
        '-34': 'سقف تقسیم تراکنش از لحاظ تعداد یا رقم عبور نموده است',
        '-40': 'اجازه دسترسی به متد مربوطه وجود ندارد',
        '-41': 'اطلاعات ارسال شده مربوط به AdditionalData غیرمعتبر می باشد',
        '-42': 'مدت زمان معتبر طول عمر شناسه پرداخت باید بین 30 دقیقه تا 45 روز باشد',
        '-54': 'درخواست مورد نظر آرشیو شده است',
        '101': 'عملیات پرداخت موفق بوده و قبلا PaymentVerification تراکنش انجام شده است'
    };
    
    return errors[status.toString()] || 'خطای ناشناخته در پرداخت';
};

module.exports = {
    requestPayment,
    verifyPayment,
    getPaymentStatus
}; 