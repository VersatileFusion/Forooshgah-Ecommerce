# Forooshgah E-commerce Platform Architecture

## System Architecture Overview

The Forooshgah E-commerce platform follows a modular architecture with clearly separated concerns, designed for scalability, maintainability, and performance.

### Architecture Layers

#### 1. Presentation Layer
- **Express.js Routes**: Handle HTTP requests and define API endpoints
- **Controllers**: Process requests, call appropriate services, and return responses
- **Views**: EJS templates for payment status pages and admin interface

#### 2. Business Logic Layer
- **Services**: Implement core business logic isolated from HTTP concerns
- **Middlewares**: Process requests before they reach controllers (authentication, validation, etc.)
- **Validators**: Validate input data

#### 3. Data Access Layer
- **Models**: Mongoose schemas defining the structure of the database
- **Repositories**: Abstract database operations
- **Query Handlers**: Optimize and handle complex database queries

#### 4. External Services Layer
- **ZarinPal Integration**: Handle payment processing
- **SMS.ir Integration**: Manage SMS notifications and verifications
- **External APIs**: Communicate with third-party services

### Key Components

#### User Management
- Authentication and authorization (JWT, Passport)
- User profiles and preferences
- Address management
- Role-based access control

#### Product Management
- Product catalog with categories and subcategories
- Product search and filtering
- Inventory management
- Product reviews and ratings

#### Order Processing
- Shopping cart functionality
- Checkout process
- Order tracking
- Order status management

#### Payment Processing
- Integration with ZarinPal payment gateway
- Transaction management
- Payment verification
- Refund processing

#### Notification System
- SMS notifications via SMS.ir
- Status updates
- Promotional messages
- Verification codes

#### Admin Management
- Dashboard with analytics
- Product management
- Order processing
- User management

#### Security
- JWT authentication
- Data validation
- CSRF protection
- Rate limiting
- Data sanitization

#### Performance Optimization
- Redis caching
- Database indexing
- Response compression
- Optimized queries

## Data Flow

1. Client sends request to Express.js server
2. Request passes through middleware (authentication, validation, etc.)
3. Router directs request to appropriate controller
4. Controller processes request and calls necessary services
5. Services implement business logic and interact with models/repositories
6. External service integrations are handled by dedicated services
7. Response flows back through the layers to the client

## Technologies

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport
- **Caching**: Redis
- **Payment**: ZarinPal
- **Notifications**: SMS.ir
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, Express-validator, Rate-limiting
- **Logging**: Winston 