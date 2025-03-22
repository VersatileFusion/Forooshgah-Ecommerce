require('dotenv').config();

module.exports = {
  // ZarinPal API configuration
  merchantId: process.env.ZARINPAL_MERCHANT_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  // Set to 'https://www.zarinpal.com/pg/services/WebGate/wsdl' for production
  apiUrl: process.env.ZARINPAL_API_URL || 'https://sandbox.zarinpal.com/pg/services/WebGate/wsdl',
  // Set to 'https://www.zarinpal.com/pg/StartPay/' for production
  paymentUrl: process.env.ZARINPAL_PAYMENT_URL || 'https://sandbox.zarinpal.com/pg/StartPay/',
  // The callback URL that ZarinPal will redirect to after payment
  callbackUrl: process.env.ZARINPAL_CALLBACK_URL || 'http://localhost:5000/api/payments/verify'
}; 