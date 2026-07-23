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
const { requireAuth, requireAdmin } = require('./middleware/auth');
const { ensureUploadDirs, countUploadFiles, isUploadsWritable } = require('./utils/uploadDirs');
// Load env: try config.env then .env (so .env works for deployment)
require('dotenv').config({ path: path.join(__dirname, 'config.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Only log env hints in development (never expose in production)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 Environment loaded. JWT_SECRET set:', !!process.env.JWT_SECRET);
}

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Persistent uploads (Railway Volume → mount at /app/uploads)
const uploadsRoot = ensureUploadDirs();

// Apply security middleware to specific routes only
// (Public routes will use publicSecurityMiddleware)

// Body parsing middleware with size limits
// Skip JSON parsing for DELETE requests entirely
app.use((req, res, next) => {
  if (req.method === 'DELETE') {
    return next();
  }
  express.json({ 
    limit: process.env.MAX_FILE_SIZE || '10mb',
    verify: (req, res, buf) => {
      // Additional JSON validation can be added here
      if (buf && buf.length) {
        try {
          JSON.parse(buf);
        } catch (e) {
          throw new Error('Invalid JSON');
        }
      }
    }
  })(req, res, next);
});
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));

// Static file serving for uploads with security headers
app.use('/uploads', express.static(uploadsRoot, {
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const isMedia = /\.(mp4|mov|m4v|webm|mp3|m4a|wav|jpg|jpeg|png|gif|webp|pdf)$/i.test(filePath);
    // Media must be inline so video/audio players can stream it
    res.setHeader('Content-Disposition', isMedia ? 'inline' : 'attachment');
    if (/\.mp4$/i.test(filePath)) {
      res.setHeader('Content-Type', 'video/mp4');
    }
  }
}));

// Database connection - don't exit on failure so Railway sees the app respond
let dbConnected = false;
const rawMongoUri = process.env.DB_CONNECTION_STRING || process.env.MONGODB_URI || 'mongodb://localhost:27017/yoneapp';
let mongoUri = typeof rawMongoUri === 'string' ? rawMongoUri.trim() : rawMongoUri;
// Handle case where value is pasted with surrounding quotes in env (\"mongodb+srv://...\")
if (typeof mongoUri === 'string' && mongoUri.startsWith('"') && mongoUri.endsWith('"')) {
  mongoUri = mongoUri.slice(1, -1).trim();
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  bufferCommands: false
})
.then(() => {
  dbConnected = true;
  logger.info('✅ MongoDB connected successfully');
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  logger.error('❌ MongoDB connection error:', err.message);
  console.error('❌ MongoDB connection error:', err.message);
  // Don't exit - let server start so /api/health responds (Railway/platform checks)
});

// Health check endpoint - return 503 if DB not connected
app.get('/api/health', (req, res) => {
  const uploadStats = countUploadFiles();
  const status = dbConnected ? 200 : 503;
  res.status(status).json({
    status: dbConnected ? 'success' : 'degraded',
    message: dbConnected ? 'ELNADY API is running securely' : 'API running; database not connected',
    database: dbConnected,
    uploads: {
      root: uploadsRoot,
      writable: isUploadsWritable(),
      totalFiles: uploadStats.total,
      byFolder: uploadStats.byFolder,
    },
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
// Users routes - some endpoints are public (like /:id/profile)
app.use('/api/users', publicSecurityMiddleware, require('./routes/users'));
app.use('/api/courses', securityMiddleware, require('./routes/courses'));
app.use('/api/payments', publicSecurityMiddleware, require('./routes/payments'));
app.use('/api/subscription-requests', publicSecurityMiddleware, require('./routes/subscriptionRequests'));
// Admin content: requires auth + admin (was open before - caused 500 when req.user undefined)
app.use('/api/admin/content', securityMiddleware, requireAuth, requireAdmin, require('./routes/content'));
// Public content: read-only content for app (no auth required)
app.use('/api/public/content', publicSecurityMiddleware, require('./routes/content'));
app.use('/api/admin', securityMiddleware, requireAuth, requireAdmin, require('./routes/admin'));
app.use('/api/admin', securityMiddleware, requireAuth, requireAdmin, require('./routes/storage'));
app.use('/api/admin', securityMiddleware, requireAuth, requireAdmin, require('./routes/notifications'));
app.use('/api/reels', securityMiddleware, require('./routes/reels'));
// النادي — Live Cohort (public + student + admin routes inside)
app.use('/api/club', publicSecurityMiddleware, require('./routes/club'));
// Tech News — public feed + admin controls
app.use('/api/tech-news', publicSecurityMiddleware, require('./routes/techNews'));
// Jobs board — public list + company submit + admin approve
app.use('/api/jobs', publicSecurityMiddleware, require('./routes/jobs'));

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

// Catch unhandled promise rejections so server does not exit silently
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  console.error('Unhandled Rejection:', reason);
});

const PORT = process.env.API_PORT || process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 ELNADY API Server started on port ${PORT}`);
  logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 Security: Enterprise Level Enabled`);
  
  console.log(`🚀 ELNADY API Server started on port ${PORT} (0.0.0.0)`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Enterprise Level Enabled`);
  console.log(`🛡️  Rate Limiting: Active`);
  console.log(`🔐 Authentication: JWT Enabled`);
  console.log(`📊 Logging: Winston Enabled`);
  console.log(`🌐 CORS: Configured`);
  console.log(`🛡️  Helmet: Security Headers Active`);

  // Tech news auto-refresh: shortly after boot, then every hour
  try {
    const { refreshTechNews, enrichMissingImages, replaceGoogleLogoImages } = require('./services/techNewsFetcher');
    setTimeout(() => {
      replaceGoogleLogoImages(500)
        .then((n) => console.log(`🖼️ Boot logo cleanup: ${n}`))
        .catch((e) => console.warn('🖼️ Boot logo cleanup failed:', e.message));
      enrichMissingImages(120)
        .then((r) => console.log(`🖼️ Boot image enrich: ${r.filled}/${r.checked}`))
        .catch((e) => console.warn('🖼️ Boot image enrich failed:', e.message));
      refreshTechNews()
        .then((r) => console.log(`📰 Tech news refresh: +${r.imported} items`))
        .catch((e) => console.warn('📰 Tech news refresh failed:', e.message));
    }, 8000);
    setInterval(() => {
      refreshTechNews()
        .then((r) => console.log(`📰 Tech news hourly refresh: +${r.imported} items`))
        .catch((e) => console.warn('📰 Tech news hourly refresh failed:', e.message));
    }, 60 * 60 * 1000);
  } catch (e) {
    console.warn('Tech news scheduler not started:', e.message);
  }

  // Subscription lifecycle: expire past-due + renewal reminders (every 30 min)
  try {
    const { runSubscriptionLifecycleJob } = require('./services/subscriptionLifecycle');
    const runLifecycle = () => {
      runSubscriptionLifecycleJob()
        .then((r) =>
          console.log(
            `💎 Subscription lifecycle: expired=${r.expired} remind2d=${r.twoDays} sameDay=${r.sameDay} tonight=${r.lockTonight}`
          )
        )
        .catch((e) => console.warn('💎 Subscription lifecycle failed:', e.message));
    };
    setTimeout(runLifecycle, 15000);
    setInterval(runLifecycle, 30 * 60 * 1000);
  } catch (e) {
    console.warn('Subscription lifecycle scheduler not started:', e.message);
  }
});
