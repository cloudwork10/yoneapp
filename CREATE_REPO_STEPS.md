# 📝 خطوات إنشاء Repository على GitHub - خطوة بخطوة

## 🎯 الطريقة الأولى: من الموقع (الأسهل)

### **الخطوة 1: افتح GitHub**
افتح المتصفح واذهب إلى:
👉 **https://github.com/new**

---

### **الخطوة 2: املأ البيانات**

ستجد صفحة مثل هذه:

```
┌─────────────────────────────────────────┐
│ Create a new repository                 │
├─────────────────────────────────────────┤
│                                         │
│ Owner: [cloudwork10 ▼]                 │
│                                         │
│ Repository name: [yoneapp        ]     │
│                                         │
│ Description: [YONE Learning Platform...]│
│                                         │
│ ⚪ Public                               │
│ 🔒 Private  ← اختر هذا                 │
│                                         │
│ ☐ Add a README file                    │
│ ☐ Add .gitignore                       │
│ ☐ Choose a license                      │
│                                         │
│         [Create repository]             │
└─────────────────────────────────────────┘
```

**املأ كالتالي:**
- ✅ **Repository name:** `yoneapp`
- ✅ **Description:** `YONE Learning Platform - Mobile App & Backend`
- ✅ **اختر:** 🔒 **Private**
- ❌ **لا تضع** ✅ على أي من الخيارات الثلاثة (README, .gitignore, license)

---

### **الخطوة 3: اضغط Create repository**

بعد الضغط، ستفتح صفحة جديدة بها تعليمات. **تجاهلها** لأن المشروع جاهز بالفعل!

---

### **الخطوة 4: رفع المشروع**

ارجع إلى Terminal ونفذ:

```bash
git push -u origin main
```

**سيطلب منك:**
- **Username:** `cloudwork10`
- **Password:** ستحتاج **Personal Access Token** (انظر الخطوة التالية)

---

## 🔑 إنشاء Personal Access Token

### **الخطوة 1: افتح صفحة Tokens**
👉 **https://github.com/settings/tokens**

### **الخطوة 2: أنشئ Token جديد**
1. اضغط **Generate new token**
2. اختر **Generate new token (classic)**

### **الخطوة 3: املأ البيانات**
```
Note: YONE App Development
Expiration: 90 days (أو حسب رغبتك)
Select scopes: ✅ repo (كل الصلاحيات)
```

### **الخطوة 4: انسخ الـ Token**
- اضغط **Generate token**
- **انسخ الـ Token فوراً** (لن يظهر مرة أخرى!)
- احفظه في مكان آمن

---

## 🚀 رفع المشروع

بعد إنشاء الـ repository والـ Token:

```bash
# تأكد من أنك في مجلد المشروع
cd /Users/abdulrahman/Desktop/yoneapp

# رفع المشروع
git push -u origin main
```

**عندما يطلب منك:**
- **Username:** `cloudwork10`
- **Password:** **الصق الـ Token** (ليس كلمة المرور!)

---

## 🎯 الطريقة الثانية: استخدام GitHub CLI (أسرع)

إذا كنت تريد استخدام Terminal فقط:

```bash
# تسجيل الدخول (سيفتح متصفح)
gh auth login

# إنشاء repository
gh repo create yoneapp --private --description "YONE Learning Platform"

# رفع المشروع
git push -u origin main
```

---

## ✅ التحقق من النجاح

بعد الرفع، اذهب إلى:
👉 **https://github.com/cloudwork10/yoneapp**

يجب أن ترى جميع الملفات هناك!

---

## 🆘 إذا واجهت مشاكل

### **مشكلة: Repository already exists**
- الـ repository موجود بالفعل، جرب اسم آخر أو احذف القديم

### **مشكلة: Authentication failed**
- تأكد من استخدام **Token** وليس كلمة المرور
- تأكد من أن الـ Token له صلاحيات `repo`

### **مشكلة: Permission denied**
- تأكد من أنك مسجل دخول على GitHub
- تأكد من أن الـ repository في حساب `cloudwork10`

---

**جاهز! ابدأ بالخطوة 1 🚀**

