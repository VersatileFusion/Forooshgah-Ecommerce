const smsir = require('smsir-js');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

// SMS.ir configuration
const SMS_API_KEY = process.env.SMSIR_API_KEY;
const SMS_SECRET_KEY = process.env.SMSIR_SECRET_KEY;
const SMS_LINE_NUMBER = process.env.SMSIR_LINE_NUMBER;

// Initialize SMS client
const smsClient = new smsir.SmsIR(SMS_API_KEY, SMS_SECRET_KEY);

/**
 * Send a simple SMS message to a single recipient
 * @param {string} mobile - Recipient mobile number (e.g., 09123456789)
 * @param {string} message - Message content
 * @returns {Promise<Object>} - API response
 */
const sendSMS = async (mobile, message) => {
    try {
        // Validate mobile number format (simple validation)
        if (!mobile || !mobile.match(/^(09|\+989)\d{9}$/)) {
            throw new Error('شماره موبایل نامعتبر است');
        }

        // Ensure message is not empty
        if (!message || message.trim() === '') {
            throw new Error('متن پیام نمی‌تواند خالی باشد');
        }

        // Format mobile number if needed (remove +98 and add 0)
        let formattedMobile = mobile;
        if (mobile.startsWith('+98')) {
            formattedMobile = '0' + mobile.substring(3);
        }

        logger.info(`Sending SMS to ${formattedMobile}`);
        
        // Call SMS.ir API to send message
        const response = await smsClient.SendSimple(
            formattedMobile, 
            message, 
            SMS_LINE_NUMBER
        );

        logger.info(`SMS sent successfully to ${formattedMobile}, response:`, response);
        return {
            success: true,
            messageId: response.messageId,
            response
        };
    } catch (error) {
        logger.error('Error sending SMS:', error);
        return {
            success: false,
            error: error.message || 'خطا در ارسال پیامک'
        };
    }
};

/**
 * Send verification code using SMS.ir's verification service
 * @param {string} mobile - Recipient mobile number
 * @param {string} templateId - SMS.ir template ID
 * @param {Object} parameters - Template parameters
 * @returns {Promise<Object>} - API response
 */
const sendVerificationCode = async (mobile, code, templateId = 'default') => {
    try {
        // Validate mobile number format
        if (!mobile || !mobile.match(/^(09|\+989)\d{9}$/)) {
            throw new Error('شماره موبایل نامعتبر است');
        }

        // Format mobile number if needed
        let formattedMobile = mobile;
        if (mobile.startsWith('+98')) {
            formattedMobile = '0' + mobile.substring(3);
        }

        logger.info(`Sending verification code to ${formattedMobile}`);
        
        // Prepare verification parameters
        const parameters = {
            'code': code.toString()
        };

        // Call SMS.ir verification API
        const response = await smsClient.VerifyLookup(
            formattedMobile,
            templateId,
            parameters
        );

        logger.info(`Verification SMS sent successfully to ${formattedMobile}`);
        return {
            success: true,
            response
        };
    } catch (error) {
        logger.error('Error sending verification SMS:', error);
        return {
            success: false,
            error: error.message || 'خطا در ارسال کد تایید'
        };
    }
};

/**
 * Send bulk SMS messages to multiple recipients
 * @param {Array<string>} mobiles - Array of mobile numbers
 * @param {string} message - Message content
 * @returns {Promise<Object>} - API response
 */
const sendBulkSMS = async (mobiles, message) => {
    try {
        // Validate input parameters
        if (!Array.isArray(mobiles) || mobiles.length === 0) {
            throw new Error('لیست شماره‌های موبایل نامعتبر است');
        }

        if (!message || message.trim() === '') {
            throw new Error('متن پیام نمی‌تواند خالی باشد');
        }

        // Format mobile numbers if needed
        const formattedMobiles = mobiles.map(mobile => {
            if (mobile.startsWith('+98')) {
                return '0' + mobile.substring(3);
            }
            return mobile;
        });

        logger.info(`Sending bulk SMS to ${formattedMobiles.length} recipients`);
        
        // Call SMS.ir API to send bulk message
        const response = await smsClient.SendBulk(
            formattedMobiles,
            message,
            SMS_LINE_NUMBER
        );

        logger.info(`Bulk SMS sent successfully to ${formattedMobiles.length} recipients`);
        return {
            success: true,
            messageIds: response.messageIds,
            response
        };
    } catch (error) {
        logger.error('Error sending bulk SMS:', error);
        return {
            success: false,
            error: error.message || 'خطا در ارسال پیامک گروهی'
        };
    }
};

/**
 * Send order status notification
 * @param {string} mobile - Customer mobile number
 * @param {string} orderNumber - Order reference number
 * @param {string} status - Order status
 * @returns {Promise<Object>} - API response
 */
const sendOrderStatusNotification = async (mobile, orderNumber, status) => {
    try {
        // Map status to human-readable text
        const statusText = {
            'PENDING': 'در انتظار پرداخت',
            'PAID': 'پرداخت شده',
            'PROCESSING': 'در حال پردازش',
            'SHIPPED': 'ارسال شده',
            'DELIVERED': 'تحویل داده شده',
            'CANCELED': 'لغو شده'
        }[status] || status;

        // Create message text
        const message = `فروشگاه
وضعیت سفارش شما به "${statusText}" تغییر کرد.
شماره سفارش: ${orderNumber}
با تشکر از خرید شما`;

        // Send the SMS
        return await sendSMS(mobile, message);
    } catch (error) {
        logger.error('Error sending order status notification:', error);
        return {
            success: false,
            error: error.message || 'خطا در ارسال اطلاعیه وضعیت سفارش'
        };
    }
};

/**
 * Send payment confirmation notification
 * @param {string} mobile - Customer mobile number
 * @param {string} orderNumber - Order reference number
 * @param {number} amount - Payment amount
 * @returns {Promise<Object>} - API response
 */
const sendPaymentConfirmation = async (mobile, orderNumber, amount) => {
    try {
        // Format amount to Persian currency format
        const formattedAmount = new Intl.NumberFormat('fa-IR').format(amount);
        
        // Create message text
        const message = `فروشگاه
پرداخت شما با موفقیت انجام شد.
شماره سفارش: ${orderNumber}
مبلغ: ${formattedAmount} تومان
با تشکر از خرید شما`;

        // Send the SMS
        return await sendSMS(mobile, message);
    } catch (error) {
        logger.error('Error sending payment confirmation:', error);
        return {
            success: false,
            error: error.message || 'خطا در ارسال تاییدیه پرداخت'
        };
    }
};

/**
 * Get SMS credit balance
 * @returns {Promise<Object>} - Credit balance information
 */
const getCreditBalance = async () => {
    try {
        const response = await smsClient.GetCredit();
        
        return {
            success: true,
            credit: response.credit
        };
    } catch (error) {
        logger.error('Error getting SMS credit balance:', error);
        return {
            success: false,
            error: error.message || 'خطا در دریافت اعتبار پیامک'
        };
    }
};

module.exports = {
    sendSMS,
    sendVerificationCode,
    sendBulkSMS,
    sendOrderStatusNotification,
    sendPaymentConfirmation,
    getCreditBalance
}; 