const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');

// Configure Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'yone-app' },
  transports: [
    new winston.transports.File({ filename: process.env.ERROR_LOG_FILE || './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: process.env.LOG_FILE || './logs/app.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Rate Limiting - Enterprise Level
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      status: 'error',
      message: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true',
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      res.status(429).json({
        status: 'error',
        message: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// General Rate Limiting - DISABLED FOR TESTING
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  999999, // Very high limit to effectively disable
  'Too many requests from this IP, please try again later.'
);

// Public Rate Limiting (more lenient)
const publicLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  500, // 500 requests per 15 minutes for public routes
  'Too many requests from this IP, please try again later.'
);

// Auth Rate Limiting - DISABLED FOR TESTING
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  999999, // Very high limit to effectively disable
  'Too many login attempts, please try again later.'
);

// Upload Rate Limiting
const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many file uploads, please try again later.'
);

// API Rate Limiting - DISABLED FOR TESTING
const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  999999, // Very high limit to effectively disable
  'API rate limit exceeded, please try again later.'
);

// Slow Down - DISABLED FOR TESTING
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 999999, // Very high limit to effectively disable
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500;
  }
});

// CORS Configuration - Secure
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://192.168.100.42:3000'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Helmet Configuration - Maximum Security
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: []
  }
};

// Morgan Logging Configuration
const morganFormat = process.env.NODE_ENV === 'production' 
  ? 'combined' 
  : 'dev';

// Security Middleware Stack - RATE LIMITING DISABLED FOR TESTING
const securityMiddleware = [
  // Compression
  compression(),
  
  // Helmet - Security Headers
  helmet(helmetOptions),
  
  // CORS
  cors(corsOptions),
  
  // Rate Limiting - DISABLED
  // generalLimiter,
  // speedLimiter,
  
  // Data Sanitization
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      logger.warn(`Sanitized malicious input: ${key}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
    }
  }),
  
  // XSS Protection
  xss({
    onSanitize: ({ req, key }) => {
      logger.warn(`XSS attack prevented: ${key}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
    }
  }),
  
  // HTTP Parameter Pollution Protection
  hpp(),
  
  // Request Logging
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
];

// Public Security Middleware Stack (no rate limiting)
const publicSecurityMiddleware = [
  // Compression
  compression(),
  
  // Helmet - Security Headers
  helmet(helmetOptions),
  
  // CORS
  cors(corsOptions),
  
  // Data Sanitization
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      logger.warn(`Sanitized malicious input: ${key}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
    }
  }),
  
  // XSS Protection
  xss({
    onSanitize: ({ req, key }) => {
      logger.warn(`XSS attack prevented: ${key}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
    }
  }),
  
  // HTTP Parameter Pollution Protection
  hpp(),
  
  // Request Logging
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
];

// Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    status: 'error',
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

// 404 Handler
const notFoundHandler = (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
};

module.exports = {
  securityMiddleware,
  publicSecurityMiddleware,
  authLimiter,
  uploadLimiter,
  apiLimiter,
  publicLimiter,
  errorHandler,
  notFoundHandler,
  logger
};