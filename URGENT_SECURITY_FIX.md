# 🚨 إصلاح الأمان العاجل - YONE App

## ⚠️ **تحذير: التطبيق حالياً غير آمن تماماً!**

### **المخاطر الحالية:**
- ❌ API URLs مكشوفة في 12 ملف
- ❌ معظم الـ API routes بدون مصادقة
- ❌ لا يوجد ملف .env
- ❌ لا يوجد Rate Limiting
- ❌ كلمات المرور غير مشفرة

## 🔥 **خطوات الإصلاح العاجلة:**

### **الخطوة 1: إنشاء ملف .env (عاجل)**

```bash
# في مجلد backend
cd backend
touch .env
```

**محتوى ملف .env:**
```env
# Database Configuration
DB_CONNECTION_STRING=mongodb://localhost:27017/yoneapp
DB_NAME=yoneapp

# JWT Configuration
JWT_SECRET=Kj8#mN2$pL9@qR4&wE7!tY1*uI3^oP6+sA5-dF8_gH2=jK9
JWT_EXPIRES_IN=7d

# API Configuration
API_PORT=3000
API_URL=http://192.168.100.41:3000

# Admin Configuration
ADMIN_EMAIL=admin@yoneapp.com
ADMIN_PASSWORD=SecureAdmin123!

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### **الخطوة 2: تثبيت حزم الأمان**

```bash
cd backend
npm install express-rate-limit cors helmet bcryptjs
```

### **الخطوة 3: إضافة Rate Limiting**

```javascript
// في backend/server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب لكل IP
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);
```

### **الخطوة 4: إضافة CORS Security**

```javascript
// في backend/server.js
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.100.41:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### **الخطوة 5: إضافة Helmet.js**

```javascript
// في backend/server.js
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

### **الخطوة 6: إضافة المصادقة لجميع الـ routes**

```javascript
// في backend/routes/content.js
const { requireAuth, requireAdmin } = require('../middleware/auth');

// إضافة المصادقة لجميع الـ routes
router.get('/podcasts', requireAuth, async (req, res) => {
  // ... الكود الحالي
});

router.post('/podcasts', requireAuth, requireAdmin, async (req, res) => {
  // ... الكود الحالي
});

router.put('/podcasts/:id', requireAuth, requireAdmin, async (req, res) => {
  // ... الكود الحالي
});

router.delete('/podcasts/:id', requireAuth, requireAdmin, async (req, res) => {
  // ... الكود الحالي
});
```

### **الخطوة 7: إنشاء middleware للمصادقة**

```javascript
// في backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Access denied. No token provided.' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ 
      status: 'error',
      message: 'Invalid token.' 
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      status: 'error',
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
```

### **الخطوة 8: تحديث نموذج المستخدم**

```javascript
// في backend/models/User.js
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ... الحقول الحالية
  password: {
    type: String,
    required: true,
    minlength: 6
  }
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

## 🚨 **تحذيرات مهمة:**

### **1. لا تشارك ملف .env أبداً**
```bash
# ❌ خطير جداً
git add .env

# ✅ صحيح
echo ".env" >> .gitignore
```

### **2. استخدم كلمات مرور قوية**
```javascript
// ❌ ضعيف
JWT_SECRET=secret123

// ✅ قوي
JWT_SECRET=Kj8#mN2$pL9@qR4&wE7!tY1*uI3^oP6+sA5-dF8_gH2=jK9
```

### **3. لا تثق في البيانات الواردة من المستخدم**
```javascript
// ❌ خطير
const user = await User.create(req.body);

// ✅ آمن
const { name, email, password } = req.body;
const user = await User.create({ name, email, password });
```

## 📋 **قائمة التحقق العاجلة:**

- [ ] إنشاء ملف .env في backend/
- [ ] تثبيت حزم الأمان (express-rate-limit, cors, helmet, bcryptjs)
- [ ] إضافة Rate Limiting
- [ ] إضافة CORS Security
- [ ] إضافة Helmet.js
- [ ] إنشاء middleware للمصادقة
- [ ] إضافة المصادقة لجميع الـ routes
- [ ] تحديث نموذج المستخدم
- [ ] تشفير كلمات المرور
- [ ] إخفاء API URLs في متغيرات البيئة

## ⚠️ **تحذير نهائي:**

**التطبيق حالياً غير آمن تماماً!** أي شخص يمكنه:
- الوصول لجميع البيانات
- حذف جميع المحتوى
- رفع ملفات ضارة
- إرسال آلاف الطلبات (DDoS)
- رؤية كلمات المرور
- الوصول لقاعدة البيانات

**يجب تطبيق هذه الإصلاحات فوراً قبل استخدام التطبيق في الإنتاج!**

---

**تذكر: الأمان ليس خياراً، بل ضرورة! كل يوم بدون أمان هو يوم في خطر!** 🔒
