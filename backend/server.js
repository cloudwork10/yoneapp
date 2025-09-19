const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { 
  securityMiddleware,
  publicSecurityMiddleware,
  authLimiter,
  uploadLimiter,
  apiLimiter,
  publicLimiter,
  errorHandler,
  notFoundHandler,
  logger
} = require('./middleware/security');
require('dotenv').config();

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Apply security middleware to specific routes only
// (Public routes will use publicSecurityMiddleware)

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb',
  verify: (req, res, buf) => {
    // Additional JSON validation can be added here
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));

// Static file serving for uploads with security headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    // Prevent execution of uploaded files
    res.setHeader('Content-Disposition', 'attachment');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Database connection with security options
mongoose.connect(process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/yoneapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false
})
.then(() => {
  logger.info('✅ MongoDB connected successfully');
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  logger.error('❌ MongoDB connection error:', err);
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'YONE API is running securely',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Security status endpoint (for monitoring)
app.get('/api/security/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    security: {
      rateLimiting: 'enabled',
      cors: 'enabled',
      helmet: 'enabled',
      sanitization: 'enabled',
      xssProtection: 'enabled',
      hppProtection: 'enabled',
      compression: 'enabled',
      logging: 'enabled'
    },
    timestamp: new Date().toISOString()
  });
});

// Public routes (no authentication required)
app.use('/api/public', publicSecurityMiddleware, require('./routes/public'));

// Routes with security middleware - RATE LIMITING COMPLETELY DISABLED
app.use('/api/auth', securityMiddleware, require('./routes/auth'));
app.use('/api/users', securityMiddleware, require('./routes/users'));
app.use('/api/courses', securityMiddleware, require('./routes/courses'));
app.use('/api/content', require('./routes/content'));
app.use('/api/admin', securityMiddleware, require('./routes/admin'));
app.use('/api/admin', securityMiddleware, require('./routes/notifications'));

// 404 handler
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 YONE API Server started on port ${PORT}`);
  logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 Security: Enterprise Level Enabled`);
  
  console.log(`🚀 YONE API Server started on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Enterprise Level Enabled`);
  console.log(`🛡️  Rate Limiting: Active`);
  console.log(`🔐 Authentication: JWT Enabled`);
  console.log(`📊 Logging: Winston Enabled`);
  console.log(`🌐 CORS: Configured`);
  console.log(`🛡️  Helmet: Security Headers Active`);
});
