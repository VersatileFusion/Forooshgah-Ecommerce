const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const logger = require('./logger');
require('dotenv').config();

// Setup Passport
module.exports = () => {
  // Local Strategy (for admin panel and traditional login)
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        logger.info(`Authentication attempt with non-existent email: ${email}`);
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Check if password matches
      const isMatch = await user.isValidPassword(password);
      if (!isMatch) {
        logger.warn(`Failed login attempt for user: ${email}`);
        return done(null, false, { message: 'Invalid email or password' });
      }

      logger.info(`User authenticated successfully: ${email}`);
      return done(null, user);
    } catch (err) {
      logger.error(`Authentication error: ${err.message}`);
      return done(err);
    }
  }));

  // JWT Strategy (for API auth)
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      req => req.cookies.jwt
    ]),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      // Find user by ID from JWT payload
      const user = await User.findById(jwtPayload.id);
      if (!user) {
        logger.warn(`JWT token valid but user not found: ${jwtPayload.id}`);
        return done(null, false);
      }

      // Check if token was issued before password change
      if (user.passwordChangedAfter && user.passwordChangedAfter(jwtPayload.iat)) {
        logger.warn(`JWT token issued before password change: ${user.email}`);
        return done(null, false);
      }

      // Authentication successful
      logger.debug(`User authenticated via JWT: ${user.email}`);
      return done(null, user);
    } catch (err) {
      logger.error(`JWT authentication error: ${err.message}`);
      return done(err);
    }
  }));

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      logger.error(`Deserialize user error: ${err.message}`);
      done(err);
    }
  });

  return passport;
}; 