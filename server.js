const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const fs = require('fs');
const winston = require('winston');
// Try to import redis but don't crash if it fails
let redis;
try {
  redis = require('./config/redis');
} catch (error) {
  console.warn('Redis connection failed, running without cache:', error.message);
}
const logger = require('./config/logger');
require('dotenv').config();

// Import middleware
const { sanitizeData, sanitizeHtml, logRequestData } = require('./middlewares/sanitize');
const { standardLimiter, authLimiter, apiLimiter } = require('./middlewares/rateLimiter');
const { configureSecurity } = require('./middlewares/security');
const paginate = require('./middlewares/paginate');
const cacheMiddleware = require('./middlewares/cache');
const errorHandler = require('./middlewares/errorHandler');
const { AppError } = require('./middlewares/errorHandler');

// Initialize app
const app = express();

// Set up Morgan request logger to use our Winston logger
app.use(morgan('combined', { stream: logger.stream }));

// Basic security setup
const { setupCsrf } = configureSecurity(app);

// Apply standard rate limiter to all requests
app.use(standardLimiter);

// API-specific rate limiter for API routes
app.use('/api', apiLimiter);

// More strict rate limiting for authentication routes
app.use(['/api/users/login', '/api/users/register'], authLimiter);

// Apply compression for all routes
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10kb' })); // Limit JSON body size
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Cookie parser for JWT cookies
app.use(cookieParser());

// Apply data sanitization
app.use(sanitizeData); // Sanitize against NoSQL query injection
app.use(sanitizeHtml); // Sanitize against XSS

// Log request data in development
app.use(logRequestData);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration (mainly for admin panel and non-API routes)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { 
    maxAge: 180 * 60 * 1000, // 3 hours
    secure: process.env.NODE_ENV === 'production', // Secure in production
    httpOnly: true, // Prevents JavaScript access
    sameSite: 'lax' // Protection against CSRF
  }
}));

// Set up CSRF protection after session middleware
setupCsrf(app);

// Passport middleware (for admin UI and social logins)
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  
  // Add CSRF token to res.locals for templates
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  
  next();
});

// Apply pagination middleware
app.use(paginate);

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Forooshgah E-commerce API',
      version: '1.0.0',
      description: 'E-commerce platform API documentation',
      contact: {
        name: 'API Support',
        email: 'support@forooshgah.com'
      },
      servers: [{
        url: `http://localhost:${process.env.PORT}`,
        description: 'Development server'
      }]
    },
    tags: [
      {
        name: 'Products',
        description: 'API for products'
      },
      {
        name: 'Categories',
        description: 'API for categories'
      },
      {
        name: 'Users',
        description: 'API for users'
      },
      {
        name: 'Orders',
        description: 'API for orders'
      },
      {
        name: 'Cart',
        description: 'API for cart operations'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./routes/*.js'] // Path to the API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Import routes
const indexRouter = require('./routes/index');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/payment');
const smsRoutes = require('./routes/smsRoutes');

// Use routes
app.use('/', indexRouter);
app.use('/api/users', userRoutes);

// Apply cache middleware only if Redis is available
if (redis) {
  app.use('/api/products', cacheMiddleware(300), productRoutes); // Cache products for 5 minutes
  app.use('/api/categories', cacheMiddleware(3600), categoryRoutes); // Cache categories for 1 hour
} else {
  app.use('/api/products', productRoutes); 
  app.use('/api/categories', categoryRoutes);
}

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sms', smsRoutes);

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  logger.info('MongoDB connected successfully');
  
  // Start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
  });
})
.catch(err => {
  logger.error(`MongoDB connection error: ${err.message}`);
  process.exit(1);
});

module.exports = app; // For testing 