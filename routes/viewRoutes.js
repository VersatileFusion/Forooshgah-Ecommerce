const viewController = require('../controllers/viewController');
const { jwtAuth } = require('../middlewares/auth');

// Payment views
router.get('/views/payment', jwtAuth, viewController.getPaymentPage);
router.get('/views/payment/success', viewController.getPaymentSuccessPage);
router.get('/views/payment/failed', viewController.getPaymentFailurePage); 