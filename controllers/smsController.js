const smsService = require('../services/smsService');
const AppError = require('../utils/appError');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Send verification code for phone number confirmation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.sendVerificationCode = async (req, res, next) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return next(new AppError('شماره تلفن الزامی است', 400));
        }
        
        // Generate a 6-digit random code
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        
        // Store the code in session or database
        // Here we're using user's session but in production you might want
        // to use Redis or other storage for better security and persistence
        req.session.verificationCode = {
            code: verificationCode,
            phone,
            expiresAt: Date.now() + 2 * 60 * 1000 // 2 minutes expiry
        };
        
        // Send SMS
        const result = await smsService.sendVerificationCode(phone, verificationCode);
        
        if (!result.success) {
            return next(new AppError(result.error || 'خطا در ارسال کد تایید', 500));
        }
        
        res.status(200).json({
            status: 'success',
            message: 'کد تایید ارسال شد',
            expiresIn: 120 // seconds
        });
    } catch (error) {
        logger.error('Error in sendVerificationCode:', error);
        next(new AppError(error.message || 'خطا در ارسال کد تایید', 500));
    }
};

/**
 * Verify the SMS code sent to user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.verifyCode = async (req, res, next) => {
    try {
        const { phone, code } = req.body;
        
        if (!phone || !code) {
            return next(new AppError('شماره تلفن و کد تایید الزامی است', 400));
        }
        
        // Get verification code from session
        const verificationData = req.session.verificationCode;
        
        // Check if verification code exists and not expired
        if (!verificationData || 
            verificationData.phone !== phone || 
            verificationData.expiresAt < Date.now()) {
            return next(new AppError('کد تایید منقضی شده یا نامعتبر است', 400));
        }
        
        // Check if code matches
        if (verificationData.code.toString() !== code.toString()) {
            return next(new AppError('کد تایید نادرست است', 400));
        }
        
        // Clear verification code from session
        delete req.session.verificationCode;
        
        // If verification is for registration, mark phone as verified in user model
        if (req.user) {
            await User.findByIdAndUpdate(req.user.id, { 
                phone,
                phoneVerified: true 
            });
        }
        
        res.status(200).json({
            status: 'success',
            message: 'شماره تلفن با موفقیت تایید شد'
        });
    } catch (error) {
        logger.error('Error in verifyCode:', error);
        next(new AppError(error.message || 'خطا در تایید کد', 500));
    }
};

/**
 * Send a manual SMS message (admin only)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.sendManualSMS = async (req, res, next) => {
    try {
        const { recipients, message } = req.body;
        
        if (!recipients || !message) {
            return next(new AppError('گیرندگان و متن پیام الزامی است', 400));
        }
        
        let result;
        
        // If recipients is an array, send bulk SMS
        if (Array.isArray(recipients)) {
            result = await smsService.sendBulkSMS(recipients, message);
        } else {
            // Single recipient
            result = await smsService.sendSMS(recipients, message);
        }
        
        if (!result.success) {
            return next(new AppError(result.error || 'خطا در ارسال پیامک', 500));
        }
        
        res.status(200).json({
            status: 'success',
            message: 'پیامک با موفقیت ارسال شد',
            data: result
        });
    } catch (error) {
        logger.error('Error in sendManualSMS:', error);
        next(new AppError(error.message || 'خطا در ارسال پیامک', 500));
    }
};

/**
 * Get SMS credit balance (admin only)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.getCredit = async (req, res, next) => {
    try {
        const result = await smsService.getCreditBalance();
        
        if (!result.success) {
            return next(new AppError(result.error || 'خطا در دریافت اعتبار پیامک', 500));
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                credit: result.credit
            }
        });
    } catch (error) {
        logger.error('Error in getCredit:', error);
        next(new AppError(error.message || 'خطا در دریافت اعتبار پیامک', 500));
    }
}; 