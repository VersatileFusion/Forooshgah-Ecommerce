const smsService = require('../services/smsService');

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return next(new AppError('وضعیت سفارش الزامی است', 400));
        }
        
        const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'];
        if (!validStatuses.includes(status)) {
            return next(new AppError('وضعیت سفارش نامعتبر است', 400));
        }
        
        const order = await Order.findById(id);
        
        if (!order) {
            return next(new AppError('سفارش یافت نشد', 404));
        }
        
        // Update order status
        order.status = status;
        await order.save();
        
        // Find the user to get phone number
        const user = await User.findById(order.userId);
        
        // Send SMS notification if user has a phone number
        if (user && user.phone) {
            await smsService.sendOrderStatusNotification(
                user.phone,
                order.orderNumber,
                status
            );
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        next(new AppError(error.message, 500));
    }
}; 