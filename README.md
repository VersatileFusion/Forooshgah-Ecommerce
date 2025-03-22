# Forooshgah E-commerce Platform | پلتفرم فروشگاه آنلاین

## English

### Introduction
Forooshgah is a comprehensive e-commerce platform built with Node.js, Express, and MongoDB. It provides a robust solution for online businesses with features for both customers and administrators.

### Features
- User authentication and authorization
- Product catalog with categories
- Shopping cart functionality
- Order management
- Payment processing (ZarinPal integration)
- SMS notifications (SMS.ir integration)
- Admin dashboard
- RESTful API
- Robust error handling
- Performance optimization (caching, rate limiting)
- Security enhancements

### Technologies
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport
- **Payment Gateway**: ZarinPal
- **SMS Service**: SMS.ir
- **Documentation**: Swagger
- **Caching**: Redis
- **Security**: Helmet, CSRF protection, rate limiting

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/Forooshgah-Ecommerce.git
cd Forooshgah-Ecommerce
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/forooshgah
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_CALLBACK_URL=http://yourdomain.com/api/payments/verify
SMSIR_API_KEY=your-api-key
SMSIR_SECRET_KEY=your-secret-key
SMSIR_LINE_NUMBER=your-line-number
```

4. Start the development server
```bash
npm run dev
```

### API Documentation
API documentation is available at `/api-docs` when the server is running.

### License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## فارسی

### معرفی
فروشگاه یک پلتفرم جامع تجارت الکترونیک است که با Node.js، Express و MongoDB ساخته شده است. این پلتفرم راه‌حلی قدرتمند برای کسب‌وکارهای آنلاین با قابلیت‌هایی برای مشتریان و مدیران فراهم می‌کند.

### ویژگی‌ها
- احراز هویت و مجوزدهی کاربران
- کاتالوگ محصولات با دسته‌بندی‌ها
- عملکرد سبد خرید
- مدیریت سفارشات
- پردازش پرداخت (یکپارچه‌سازی با زرین‌پال)
- اطلاع‌رسانی پیامکی (یکپارچه‌سازی با SMS.ir)
- داشبورد مدیریت
- API استاندارد RESTful
- مدیریت خطای قدرتمند
- بهینه‌سازی عملکرد (کش‌گذاری، محدودیت نرخ)
- ارتقای امنیت

### تکنولوژی‌ها
- **بک‌اند**: Node.js، Express
- **پایگاه داده**: MongoDB با Mongoose
- **احراز هویت**: JWT، Passport
- **درگاه پرداخت**: زرین‌پال
- **سرویس پیامکی**: SMS.ir
- **مستندسازی**: Swagger
- **کش‌گذاری**: Redis
- **امنیت**: Helmet، محافظت CSRF، محدودیت نرخ

### نصب و راه‌اندازی
1. کلون کردن مخزن
```bash
git clone https://github.com/yourusername/Forooshgah-Ecommerce.git
cd Forooshgah-Ecommerce
```

2. نصب وابستگی‌ها
```bash
npm install
```

3. تنظیم متغیرهای محیطی
یک فایل `.env` در دایرکتوری اصلی با متغیرهای زیر ایجاد کنید:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/forooshgah
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_CALLBACK_URL=http://yourdomain.com/api/payments/verify
SMSIR_API_KEY=your-api-key
SMSIR_SECRET_KEY=your-secret-key
SMSIR_LINE_NUMBER=your-line-number
```

4. اجرای سرور توسعه
```bash
npm run dev
```

### مستندات API
مستندات API در آدرس `/api-docs` هنگامی که سرور در حال اجراست، در دسترس است.

### مجوز
این پروژه تحت مجوز MIT منتشر شده است - برای جزئیات بیشتر فایل LICENSE را ببینید.

## Contact Information | اطلاعات تماس
- Developer: Erfan Ahmadvand
- Phone: +989109924707