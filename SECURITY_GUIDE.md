# 🔒 دليل الأمان الشامل لتطبيق YONE

## 🚨 النقاط الحرجة التي يجب إخفاؤها:

### 1. **معلومات الخادم والـ API**
```javascript
// ❌ خطير - ظاهر في الكود
const API_URL = 'http://192.168.100.41:3000/api';

// ✅ آمن - مخفي في متغيرات البيئة
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

### 2. **مفاتيح التشفير والـ JWT**
```javascript
// ❌ خطير - مكتوب في الكود
const JWT_SECRET = 'my-secret-key-123';

// ✅ آمن - في ملف .env منفصل
JWT_SECRET=your-super-secure-secret-key-here
```

### 3. **بيانات المستخدمين الحساسة**
- كلمات المرور (يجب تشفيرها بـ bcrypt)
- معلومات الدفع والبطاقات
- البيانات الشخصية الحساسة
- ملفات المستخدمين

### 4. **نقاط الضعف في الـ API**
```javascript
// ❌ خطير - بدون مصادقة
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ✅ آمن - مع مصادقة
router.get('/users', requireAuth, async (req, res) => {
  const users = await User.find();
  res.json(users);
});
```

## 🛡️ خطة الأمان الشاملة:

### **المرحلة 1: إخفاء البيانات الحساسة**

#### أ) إنشاء ملف .env
```bash
# في مجلد backend
touch .env
```

#### ب) محتوى ملف .env
```env
# Database Configuration
DB_CONNECTION_STRING=mongodb://localhost:27017/yoneapp
DB_NAME=yoneapp

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# API Configuration
API_PORT=3000
API_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=admin@yoneapp.com
ADMIN_PASSWORD=your-secure-admin-password

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

#### ج) تحديث .gitignore
```gitignore
# Environment variables
.env
.env.local
.env.production

# Database files
*.db
*.sqlite

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed

# Coverage directory used by tools like istanbul
coverage

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
```

### **المرحلة 2: تشفير البيانات**

#### أ) تشفير كلمات المرور
```javascript
const bcrypt = require('bcryptjs');

// تشفير كلمة المرور
const hashedPassword = await bcrypt.hash(password, 12);

// التحقق من كلمة المرور
const isValid = await bcrypt.compare(password, hashedPassword);
```

#### ب) تشفير البيانات الحساسة
```javascript
const crypto = require('crypto');

// تشفير البيانات
function encrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// فك التشفير
function decrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipher(algorithm, key);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### **المرحلة 3: تأمين الـ API**

#### أ) إضافة المصادقة لجميع الـ routes
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = { requireAuth };
```

#### ب) إضافة Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

#### ج) إضافة CORS Security
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### **المرحلة 4: تأمين قاعدة البيانات**

#### أ) استخدام MongoDB Atlas (Production)
```javascript
// بدلاً من MongoDB محلي
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
```

#### ب) إضافة فهرسة آمنة
```javascript
// في نماذج البيانات
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // ... باقي الحقول
});

// إضافة فهرسة مركبة
userSchema.index({ email: 1, isActive: 1 });
```

### **المرحلة 5: تأمين الملفات**

#### أ) التحقق من نوع الملف
```javascript
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});
```

#### ب) إضافة فحص الفيروسات
```javascript
const ClamAV = require('clamav.js');

const scanFile = async (filePath) => {
  try {
    const result = await ClamAV.scanFile(filePath);
    return result.isInfected ? false : true;
  } catch (error) {
    console.error('Virus scan error:', error);
    return false;
  }
};
```

### **المرحلة 6: مراقبة الأمان**

#### أ) إضافة Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// تسجيل محاولات الدخول
app.post('/api/auth/login', async (req, res) => {
  try {
    // ... منطق تسجيل الدخول
    logger.info(`User login attempt: ${req.body.email}`);
  } catch (error) {
    logger.error(`Login failed: ${req.body.email} - ${error.message}`);
  }
});
```

#### ب) إضافة Monitoring
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 🚨 نقاط الأمان الحرجة الحالية في التطبيق:

### 1. **API URLs مكشوفة**
```javascript
// في app/programmer-thoughts.tsx
const API_URL = 'http://192.168.100.41:3000/api'; // ❌ خطير
```

### 2. **عدم وجود مصادقة في بعض الـ routes**
```javascript
// في backend/routes/content.js
router.get('/podcasts', async (req, res) => { // ❌ بدون مصادقة
```

### 3. **كلمات مرور ضعيفة**
```javascript
// في backend/models/User.js
// لا يوجد تشفير قوي لكلمات المرور
```

### 4. **عدم وجود Rate Limiting**
```javascript
// لا يوجد حماية من DDoS attacks
```

### 5. **ملفات حساسة مكشوفة**
```javascript
// ملفات .env غير موجودة
// مفاتيح API مكشوفة في الكود
```

## 📋 قائمة التحقق من الأمان:

- [ ] إنشاء ملف .env وإخفاء البيانات الحساسة
- [ ] إضافة مصادقة لجميع الـ API routes
- [ ] تشفير كلمات المرور بـ bcrypt
- [ ] إضافة Rate Limiting
- [ ] إضافة CORS Security
- [ ] استخدام HTTPS في الإنتاج
- [ ] إضافة فحص الملفات المرفوعة
- [ ] إضافة Logging و Monitoring
- [ ] استخدام MongoDB Atlas في الإنتاج
- [ ] إضافة فهرسة آمنة لقاعدة البيانات
- [ ] إضافة Helmet.js للحماية
- [ ] إضافة فحص الفيروسات
- [ ] إضافة Backup آمن للبيانات
- [ ] إضافة Two-Factor Authentication
- [ ] إضافة Session Management آمن

## 🔐 أولويات الأمان:

### **عاجل (يجب إصلاحه فوراً):**
1. إخفاء API URLs في متغيرات البيئة
2. إضافة مصادقة لجميع الـ routes
3. تشفير كلمات المرور
4. إضافة Rate Limiting

### **مهم (خلال أسبوع):**
1. إضافة CORS Security
2. إضافة Logging
3. تأمين الملفات المرفوعة
4. إضافة Helmet.js

### **مستقبلي (خلال شهر):**
1. استخدام MongoDB Atlas
2. إضافة Two-Factor Authentication
3. إضافة فحص الفيروسات
4. إضافة Backup آمن

---

**تذكر: الأمان ليس شيئاً يمكن إضافته لاحقاً، بل يجب أن يكون جزءاً أساسياً من التطبيق من البداية!** 🔒
