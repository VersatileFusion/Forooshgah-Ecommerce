const express = require('express');
const AdminBro = require('admin-bro');
const AdminBroExpress = require('admin-bro-expressjs');
const AdminBroMongoose = require('admin-bro-mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Product = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');
const logger = require('../config/logger');

// Register adapter
AdminBro.registerAdapter(AdminBroMongoose);

// Define resources
const resources = [
  {
    resource: User,
    options: {
      properties: {
        password: {
          isVisible: { list: false, filter: false, show: false, edit: true }
        }
      },
      actions: {
        new: {
          before: async (request) => {
            if(request.payload.password) {
              const salt = await bcrypt.genSalt(10);
              request.payload.password = await bcrypt.hash(request.payload.password, salt);
            }
            return request;
          }
        }
      }
    }
  },
  {
    resource: Product,
    options: {
      properties: {
        description: {
          type: 'richtext'
        }
      }
    }
  },
  {
    resource: Category
  },
  {
    resource: Order,
    options: {
      properties: {
        delivered: {
          isVisible: { list: true, filter: true, show: true, edit: true }
        }
      }
    }
  }
];

// Create admin
const adminBro = new AdminBro({
  resources,
  rootPath: '/admin',
  branding: {
    companyName: 'E-commerce Admin Panel',
    logo: false,
    softwareBrothers: false
  },
  dashboard: {
    component: AdminBro.bundle('./dashboard')
  }
});

// Create admin router
const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'admin_password'
};

const adminRouter = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    if (email === ADMIN.email && password === ADMIN.password) {
      logger.info(`Admin login: ${email}`);
      return ADMIN;
    }
    // Also allow DB users with isAdmin flag
    const user = await User.findOne({ email });
    if (user && user.isAdmin) {
      const matched = await bcrypt.compare(password, user.password);
      if (matched) {
        logger.info(`Admin user login: ${email}`);
        return user;
      }
    }
    logger.warn(`Failed admin login attempt: ${email}`);
    return false;
  },
  cookiePassword: process.env.SESSION_SECRET || 'session_secret',
});

logger.info('Admin panel initialized');

module.exports = adminRouter; 