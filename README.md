# Forooshgah E-commerce Platform | پلتفرم فروشگاه آنلاین

## English

### Introduction
Forooshgah is a comprehensive e-commerce platform built with Node.js, Express, and MongoDB. It provides a robust solution for online businesses with features for both customers and administrators. The platform is designed with scalability, security, and performance in mind, making it suitable for small to medium-sized online businesses.

### Features
- **User Management**
  - Registration and authentication
  - Role-based access control (customer, admin)
  - Profile management
  - Address book management
  - Order history
- **Product Catalog**
  - Category and subcategory navigation
  - Product search with filters
  - Product reviews and ratings
  - Featured and promotional products
- **Shopping Experience**
  - Intuitive shopping cart
  - Wishlist functionality
  - Checkout process
  - Multiple payment methods
- **Order Management**
  - Order tracking
  - Order history
  - Invoice generation
  - Order status updates with SMS notifications
- **Payment Processing**
  - ZarinPal gateway integration
  - Secure transaction handling
  - Payment verification
  - Transaction history
- **Notifications**
  - SMS notifications via SMS.ir
  - Order status updates
  - Promotional messages
  - Verification codes
- **Admin Dashboard**
  - Sales analytics
  - Inventory management
  - User management
  - Order processing
- **API & Integration**
  - RESTful API with Swagger documentation
  - Third-party service integrations
- **Performance & Security**
  - Rate limiting
  - Data sanitization
  - CSRF protection
  - Redis caching
  - Request compression

### System Architecture
The platform follows a modular architecture with clearly separated concerns:

- **Presentation Layer**: Express.js routes and controllers
- **Business Logic Layer**: Services and middleware
- **Data Access Layer**: Mongoose models and database operations
- **External Services Layer**: ZarinPal, SMS.ir integrations

![Architecture Diagram](https://github.com/VersatileFusion/Forooshgah-Ecommerce/blob/main/docs/architecture.png)

### Technologies
- **Backend**: 
  - Node.js (≥16.0.0)
  - Express.js for routing and middleware
- **Database**: 
  - MongoDB for data storage
  - Mongoose for object modeling
- **Authentication**: 
  - JWT for API authentication
  - Passport.js for social logins
  - Bcrypt for password hashing
- **Payment Gateway**: 
  - ZarinPal for processing payments
- **SMS Service**: 
  - SMS.ir for notifications and OTP
- **Documentation**: 
  - Swagger/OpenAPI for API documentation
- **Caching**: 
  - Redis for performance optimization
- **Security**: 
  - Helmet for HTTP headers
  - CSRF protection
  - Rate limiting
  - Data sanitization
- **Performance**: 
  - Compression
  - Response caching
  - Database indexing

### Installation

#### Prerequisites
- Node.js (≥16.0.0)
- MongoDB (≥4.4)
- Redis (optional, for caching)

#### Steps
1. Clone the repository
```bash
git clone https://github.com/VersatileFusion/Forooshgah-Ecommerce.git
cd Forooshgah-Ecommerce
```

2. Install dependencies
```bash
npm install
```

3. Set up MongoDB
- Install MongoDB if not already installed
- Create a database named 'forooshgah'
```bash
mongod --dbpath /path/to/data/directory
# In another terminal
mongo
> use forooshgah
```

4. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/forooshgah

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_should_be_very_long_and_secure
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=3600000
AUTH_RATE_LIMIT_MAX_REQUESTS=20
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX_REQUESTS=60

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Session Configuration
SESSION_SECRET=your_session_secret

# ZarinPal Configuration
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_CALLBACK_URL=http://yourdomain.com/api/payments/verify

# SMS.ir Configuration
SMSIR_API_KEY=your-api-key
SMSIR_SECRET_KEY=your-secret-key
SMSIR_LINE_NUMBER=your-line-number
```

5. Start the development server
```bash
npm run dev
```

6. Access the application
- API Server: `http://localhost:5000`
- API Documentation: `http://localhost:5000/api-docs`

### Project Structure
```
Forooshgah-Ecommerce/
├── config/              # Configuration files
│   ├── db.js            # Database connection
│   ├── logger.js        # Logging configuration
│   ├── passport.js      # Authentication strategies
│   └── redis.js         # Redis client setup
├── controllers/         # Request handlers
│   ├── userController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── paymentController.js
│   └── smsController.js
├── middlewares/         # Express middlewares
│   ├── auth.js          # Authentication middleware
│   ├── errorHandler.js  # Error handling
│   ├── rateLimiter.js   # Rate limiting
│   └── sanitize.js      # Data sanitization
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── Cart.js
│   └── Transaction.js
├── routes/              # API routes
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   └── smsRoutes.js
├── services/            # Business logic
│   ├── zarinpalService.js
│   └── smsService.js
├── utils/               # Utility functions
│   ├── appError.js
│   └── logger.js
├── views/               # EJS templates (for payment pages)
│   └── payment/
│       ├── success.ejs
│       └── failed.ejs
├── public/              # Static files
├── logs/                # Application logs
├── server.js            # Application entry point
├── package.json         # Project dependencies
└── .env                 # Environment variables
```

### API Endpoints

#### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login
- `POST /api/users/refresh-token` - Refresh JWT token
- `GET /api/users/logout` - User logout

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password

#### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

#### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category with products
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

#### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove item from cart

#### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin only)

#### Payments
- `POST /api/payments/request` - Create payment request
- `GET /api/payments/verify` - Verify payment
- `GET /api/payments/status/:authority` - Check payment status

#### SMS
- `POST /api/sms/send-verification` - Send verification code
- `POST /api/sms/verify-code` - Verify SMS code
- `POST /api/sms/admin/send` - Send manual SMS (admin only)
- `GET /api/sms/admin/credit` - Get SMS credit balance (admin only)

### Security Features
- **JWT Authentication**: Secures API endpoints
- **Password Hashing**: Bcrypt for secure password storage
- **CSRF Protection**: Prevents cross-site request forgery
- **XSS Protection**: Data sanitization against XSS attacks
- **NoSQL Injection Protection**: Data sanitization for MongoDB
- **Rate Limiting**: Prevents brute force and DoS attacks
- **HTTP Security Headers**: Helmet middleware for security headers
- **Secure Cookies**: HttpOnly and Secure flags
- **Input Validation**: Express-validator for request validation

### Deployment

#### Production Environment Setup
1. Set up a production server (e.g., AWS EC2, DigitalOcean)
2. Install Node.js, MongoDB, and Redis
3. Configure environment variables for production
4. Use a process manager like PM2 to run the application

```bash
# Install PM2
npm install -g pm2

# Start the application with PM2
pm2 start server.js --name "forooshgah"

# Configure PM2 to start on system reboot
pm2 startup
pm2 save
```

#### Using Docker
The project can also be deployed using Docker.

```bash
# Build the Docker image
docker build -t forooshgah .

# Run the container
docker run -p 5000:5000 --env-file .env forooshgah
```

#### Nginx Configuration (Optional)
For production deployments, you might want to use Nginx as a reverse proxy.

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Troubleshooting

#### Common Issues
- **MongoDB Connection Errors**: Check your connection string and ensure MongoDB is running
- **Redis Connection Errors**: Redis is optional; if not available, the application will run without caching
- **Port Already in Use**: Change the port in .env file if 5000 is already in use
- **Dependency Issues**: Make sure you have Node.js version 16 or higher

#### Logs
Application logs are stored in the `logs` directory:
- `error.log`: Contains error messages
- `combined.log`: Contains all log messages

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## فارسی

### معرفی
فروشگاه یک پلتفرم جامع تجارت الکترونیک است که با Node.js، Express و MongoDB ساخته شده است. این پلتفرم راه‌حلی قدرتمند برای کسب‌وکارهای آنلاین با قابلیت‌هایی برای مشتریان و مدیران فراهم می‌کند و با در نظر گرفتن مقیاس‌پذیری، امنیت و عملکرد طراحی شده است.

### ویژگی‌ها
- **مدیریت کاربران**
  - ثبت‌نام و احراز هویت
  - کنترل دسترسی بر اساس نقش (مشتری، مدیر)
  - مدیریت پروفایل
  - مدیریت دفترچه آدرس
  - تاریخچه سفارشات
- **کاتالوگ محصولات**
  - ناوبری دسته و زیردسته
  - جستجوی محصول با فیلترها
  - نظرات و امتیازدهی محصولات
  - محصولات ویژه و تبلیغاتی
- **تجربه خرید**
  - سبد خرید شهودی
  - قابلیت لیست علاقه‌مندی‌ها
  - فرآیند تسویه حساب
  - روش‌های پرداخت متعدد
- **مدیریت سفارشات**
  - پیگیری سفارش
  - تاریخچه سفارش
  - تولید فاکتور
  - به‌روزرسانی‌های وضعیت سفارش با اطلاع‌رسانی پیامکی
- **پردازش پرداخت**
  - یکپارچه‌سازی درگاه زرین‌پال
  - مدیریت ایمن تراکنش
  - تأیید پرداخت
  - تاریخچه تراکنش
- **اطلاع‌رسانی**
  - اطلاع‌رسانی پیامکی از طریق SMS.ir
  - به‌روزرسانی‌های وضعیت سفارش
  - پیام‌های تبلیغاتی
  - کدهای تأیید
- **داشبورد مدیریت**
  - تحلیل فروش
  - مدیریت موجودی
  - مدیریت کاربران
  - پردازش سفارشات
- **API و ادغام**
  - API استاندارد RESTful با مستندات Swagger
  - ادغام‌های سرویس‌های شخص ثالث
- **عملکرد و امنیت**
  - محدودیت نرخ درخواست
  - پاکسازی داده‌ها
  - محافظت CSRF
  - کش‌گذاری Redis
  - فشرده‌سازی درخواست‌ها

### معماری سیستم
این پلتفرم از یک معماری ماژولار با تفکیک واضح دغدغه‌ها پیروی می‌کند:

- **لایه ارائه**: مسیرها و کنترلرهای Express.js
- **لایه منطق کسب‌وکار**: سرویس‌ها و میدلورها
- **لایه دسترسی به داده**: مدل‌های Mongoose و عملیات پایگاه داده
- **لایه سرویس‌های خارجی**: ادغام‌های زرین‌پال، SMS.ir

![نمودار معماری](https://github.com/VersatileFusion/Forooshgah-Ecommerce/blob/main/docs/architecture.png)

### تکنولوژی‌ها
- **بک‌اند**: 
  - Node.js (≥16.0.0)
  - Express.js برای مسیریابی و میدلور
- **پایگاه داده**: 
  - MongoDB برای ذخیره‌سازی داده
  - Mongoose برای مدل‌سازی شیء
- **احراز هویت**: 
  - JWT برای احراز هویت API
  - Passport.js برای ورود به سیستم از طریق شبکه‌های اجتماعی
  - Bcrypt برای هش کردن رمز عبور
- **درگاه پرداخت**: 
  - زرین‌پال برای پردازش پرداخت‌ها
- **سرویس پیامکی**: 
  - SMS.ir برای اطلاع‌رسانی و OTP
- **مستندسازی**: 
  - Swagger/OpenAPI برای مستندسازی API
- **کش‌گذاری**: 
  - Redis برای بهینه‌سازی عملکرد
- **امنیت**: 
  - Helmet برای هدرهای HTTP
  - محافظت CSRF
  - محدودیت نرخ
  - پاکسازی داده‌ها
- **عملکرد**: 
  - فشرده‌سازی
  - کش‌گذاری پاسخ
  - ایندکس‌گذاری پایگاه داده

### نصب و راه‌اندازی

#### پیش‌نیازها
- Node.js (≥16.0.0)
- MongoDB (≥4.4)
- Redis (اختیاری، برای کش‌گذاری)

#### مراحل
1. کلون کردن مخزن
```bash
git clone https://github.com/VersatileFusion/Forooshgah-Ecommerce.git
cd Forooshgah-Ecommerce
```

2. نصب وابستگی‌ها
```bash
npm install
```

3. راه‌اندازی MongoDB
- نصب MongoDB اگر قبلاً نصب نشده است
- ایجاد یک پایگاه داده به نام 'forooshgah'
```bash
mongod --dbpath /path/to/data/directory
# در ترمینال دیگر
mongo
> use forooshgah
```

4. تنظیم متغیرهای محیطی
یک فایل `.env` در دایرکتوری اصلی با متغیرهای زیر ایجاد کنید:
```
# تنظیمات سرور
PORT=5000
NODE_ENV=development

# تنظیمات MongoDB
MONGODB_URI=mongodb://localhost:27017/forooshgah

# تنظیمات JWT
JWT_SECRET=your_jwt_secret_key_here_should_be_very_long_and_secure
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# محدودیت نرخ درخواست
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=3600000
AUTH_RATE_LIMIT_MAX_REQUESTS=20
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX_REQUESTS=60

# تنظیمات Redis (اختیاری)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# تنظیمات جلسه
SESSION_SECRET=your_session_secret

# تنظیمات زرین‌پال
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_CALLBACK_URL=http://yourdomain.com/api/payments/verify

# تنظیمات SMS.ir
SMSIR_API_KEY=your-api-key
SMSIR_SECRET_KEY=your-secret-key
SMSIR_LINE_NUMBER=your-line-number
```

5. اجرای سرور توسعه
```bash
npm run dev
```

6. دسترسی به برنامه
- سرور API: `http://localhost:5000`
- مستندات API: `http://localhost:5000/api-docs`

### ساختار پروژه
```
Forooshgah-Ecommerce/
├── config/              # فایل‌های پیکربندی
│   ├── db.js            # اتصال پایگاه داده
│   ├── logger.js        # پیکربندی ثبت وقایع
│   ├── passport.js      # استراتژی‌های احراز هویت
│   └── redis.js         # راه‌اندازی کلاینت Redis
├── controllers/         # کنترلرهای درخواست
│   ├── userController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── paymentController.js
│   └── smsController.js
├── middlewares/         # میدلورهای Express
│   ├── auth.js          # میدلور احراز هویت
│   ├── errorHandler.js  # مدیریت خطا
│   ├── rateLimiter.js   # محدودیت نرخ
│   └── sanitize.js      # پاکسازی داده‌ها
├── models/              # طرح‌های Mongoose
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── Cart.js
│   └── Transaction.js
├── routes/              # مسیرهای API
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   └── smsRoutes.js
├── services/            # منطق کسب‌وکار
│   ├── zarinpalService.js
│   └── smsService.js
├── utils/               # توابع ابزاری
│   ├── appError.js
│   └── logger.js
├── views/               # قالب‌های EJS (برای صفحات پرداخت)
│   └── payment/
│       ├── success.ejs
│       └── failed.ejs
├── public/              # فایل‌های استاتیک
├── logs/                # گزارش‌های برنامه
├── server.js            # نقطه ورود برنامه
├── package.json         # وابستگی‌های پروژه
└── .env                 # متغیرهای محیطی
```

### نقاط پایانی API

#### احراز هویت
- `POST /api/users/register` - ثبت‌نام کاربر جدید
- `POST /api/users/login` - ورود کاربر
- `POST /api/users/refresh-token` - تجدید توکن JWT
- `GET /api/users/logout` - خروج کاربر

#### کاربران
- `GET /api/users/profile` - دریافت پروفایل کاربر
- `PUT /api/users/profile` - به‌روزرسانی پروفایل کاربر
- `POST /api/users/change-password` - تغییر رمز عبور

#### محصولات
- `GET /api/products` - فهرست تمام محصولات
- `GET /api/products/:id` - دریافت یک محصول
- `POST /api/products` - ایجاد محصول (فقط مدیر)
- `PUT /api/products/:id` - به‌روزرسانی محصول (فقط مدیر)
- `DELETE /api/products/:id` - حذف محصول (فقط مدیر)

#### دسته‌بندی‌ها
- `GET /api/categories` - فهرست تمام دسته‌بندی‌ها
- `GET /api/categories/:id` - دریافت یک دسته‌بندی با محصولات
- `POST /api/categories` - ایجاد دسته‌بندی (فقط مدیر)
- `PUT /api/categories/:id` - به‌روزرسانی دسته‌بندی (فقط مدیر)
- `DELETE /api/categories/:id` - حذف دسته‌بندی (فقط مدیر)

#### سبد خرید
- `GET /api/cart` - دریافت سبد خرید کاربر
- `POST /api/cart` - افزودن محصول به سبد خرید
- `PUT /api/cart/:itemId` - به‌روزرسانی محصول در سبد خرید
- `DELETE /api/cart/:itemId` - حذف محصول از سبد خرید

#### سفارش‌ها
- `GET /api/orders` - دریافت سفارشات کاربر
- `GET /api/orders/:id` - دریافت جزئیات سفارش
- `POST /api/orders` - ایجاد سفارش جدید
- `PUT /api/orders/:id/status` - به‌روزرسانی وضعیت سفارش (فقط مدیر)

#### پرداخت‌ها
- `POST /api/payments/request` - ایجاد درخواست پرداخت
- `GET /api/payments/verify` - تأیید پرداخت
- `GET /api/payments/status/:authority` - بررسی وضعیت پرداخت

#### پیامک
- `POST /api/sms/send-verification` - ارسال کد تأیید
- `POST /api/sms/verify-code` - تأیید کد پیامکی
- `POST /api/sms/admin/send` - ارسال پیامک دستی (فقط مدیر)
- `GET /api/sms/admin/credit` - دریافت موجودی اعتبار پیامک (فقط مدیر)

### ویژگی‌های امنیتی
- **احراز هویت JWT**: نقاط پایانی API را ایمن می‌کند
- **هش‌کردن رمز عبور**: استفاده از Bcrypt برای ذخیره‌سازی ایمن رمز عبور
- **محافظت CSRF**: جلوگیری از حملات cross-site request forgery
- **محافظت XSS**: پاکسازی داده‌ها در برابر حملات XSS
- **محافظت از تزریق NoSQL**: پاکسازی داده‌ها برای MongoDB
- **محدودیت نرخ**: جلوگیری از حملات نیروی brute force و DoS
- **هدرهای امنیتی HTTP**: میدلور Helmet برای هدرهای امنیتی
- **کوکی‌های امن**: پرچم‌های HttpOnly و Secure
- **اعتبارسنجی ورودی**: Express-validator برای اعتبارسنجی درخواست

### استقرار

#### راه‌اندازی محیط تولید
1. راه‌اندازی یک سرور تولید (مانند AWS EC2، DigitalOcean)
2. نصب Node.js، MongoDB و Redis
3. پیکربندی متغیرهای محیطی برای تولید
4. استفاده از یک مدیر فرآیند مانند PM2 برای اجرای برنامه

```bash
# نصب PM2
npm install -g pm2

# شروع برنامه با PM2
pm2 start server.js --name "forooshgah"

# پیکربندی PM2 برای شروع در راه‌اندازی مجدد سیستم
pm2 startup
pm2 save
```

#### استفاده از Docker
این پروژه می‌تواند با استفاده از Docker نیز مستقر شود.

```bash
# ساخت تصویر Docker
docker build -t forooshgah .

# اجرای کانتینر
docker run -p 5000:5000 --env-file .env forooshgah
```

#### پیکربندی Nginx (اختیاری)
برای استقرارهای تولید، ممکن است بخواهید از Nginx به عنوان یک پروکسی معکوس استفاده کنید.

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### عیب‌یابی

#### مشکلات رایج
- **خطاهای اتصال MongoDB**: رشته اتصال خود را بررسی کرده و مطمئن شوید MongoDB در حال اجراست
- **خطاهای اتصال Redis**: Redis اختیاری است؛ اگر در دسترس نباشد، برنامه بدون کش‌گذاری اجرا می‌شود
- **پورت قبلاً استفاده شده**: اگر پورت 5000 قبلاً استفاده شده است، آن را در فایل .env تغییر دهید
- **مشکلات وابستگی**: مطمئن شوید از نسخه Node.js 16 یا بالاتر استفاده می‌کنید

#### گزارش‌ها
گزارش‌های برنامه در دایرکتوری `logs` ذخیره می‌شوند:
- `error.log`: شامل پیام‌های خطا
- `combined.log`: شامل تمام پیام‌های گزارش

### مشارکت
1. Fork کردن مخزن
2. ایجاد شاخه ویژگی (`git checkout -b feature/amazing-feature`)
3. Commit کردن تغییرات (`git commit -m 'Add some amazing feature'`)
4. Push کردن به شاخه (`git push origin feature/amazing-feature`)
5. ارسال یک Pull Request

### مجوز
این پروژه تحت مجوز MIT منتشر شده است - برای جزئیات بیشتر فایل LICENSE را ببینید.

## Contact Information | اطلاعات تماس
- Developer: Erfan Ahmadvand
- Phone: +989109924707
- Email: erfan.ahmadvand98@gmail.com
- GitHub: [VersatileFusion](https://github.com/VersatileFusion)