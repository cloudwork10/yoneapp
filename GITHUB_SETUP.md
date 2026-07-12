# 📦 دليل رفع المشروع على GitHub

## 🔍 معلومات الحساب الحالي

**الحساب المسجل حالياً:**
- **Username:** `cloudwork10`
- **Email:** `Cloudworkalaa.com`
- **Remote URL:** `https://github.com/cloudwork10/YOUR_NEW_REPO.git` (يحتاج تحديث)

---

## ✅ الخطوات لرفع المشروع

### **الخطوة 1: إنشاء Repository جديد على GitHub**

1. اذهب إلى: https://github.com/new
2. املأ البيانات:
   - **Repository name:** `yoneapp` (أو أي اسم تريده)
   - **Description:** `YONE Learning Platform - Mobile App & Backend`
   - **Visibility:** 
     - 🔒 **Private** (موصى به - لحماية الكود)
     - 🌐 **Public** (إذا تريد مشاركة الكود)
   - **لا** تضع ✅ Initialize with README (لأن المشروع موجود بالفعل)

3. اضغط **Create repository**

---

### **الخطوة 2: ربط المشروع بالـ Repository الجديد**

افتح Terminal في مجلد المشروع وقم بتنفيذ:

```bash
# إزالة الـ remote القديم (إذا كان موجود)
git remote remove origin

# إضافة الـ remote الجديد (استبدل YOUR_USERNAME و REPO_NAME)
git remote add origin https://github.com/cloudwork10/yoneapp.git

# التحقق من الـ remote
git remote -v
```

**ملاحظة:** استبدل `yoneapp` باسم الـ repository الذي أنشأته.

---

### **الخطوة 3: التأكد من عدم رفع ملفات حساسة**

✅ تم التأكد من:
- ✅ `backend/config.env` - محمي في `.gitignore`
- ✅ `.env` - محمي
- ✅ `node_modules/` - محمي
- ✅ `*.log` - محمي

**⚠️ مهم جداً:** قبل الرفع، تأكد من عدم وجود:
- ❌ `config.env` في الملفات المرفوعة
- ❌ أي API keys أو secrets
- ❌ كلمات مرور
- ❌ معلومات حساسة

---

### **الخطوة 4: رفع المشروع**

```bash
# إضافة جميع الملفات (باستثناء الملفات في .gitignore)
git add .

# عمل commit
git commit -m "Initial commit: YONE Learning Platform"

# رفع المشروع
git push -u origin main
```

**إذا كان الـ branch اسمه `master` بدلاً من `main`:**
```bash
git push -u origin master
```

---

## 🔐 الأمان قبل الرفع

### ✅ تم حماية:
- ✅ `backend/config.env` - لن يُرفع
- ✅ جميع ملفات `.env` - محمية
- ✅ `node_modules/` - محمية

### ⚠️ يجب التأكد من:
- ⚠️ لا توجد API keys في الكود
- ⚠️ لا توجد كلمات مرور hardcoded
- ⚠️ لا توجد معلومات حساسة في الكومنتات

---

## 🚀 بعد الرفع

### **إضافة README.md (اختياري)**

يمكنك إضافة ملف README.md يشرح المشروع:

```markdown
# YONE Learning Platform

Mobile learning platform with courses, articles, podcasts, and more.

## Features
- 📚 Courses
- 📰 Articles  
- 🎙️ Podcasts
- 🗺️ Roadmaps
- 💼 CV Templates

## Tech Stack
- Frontend: React Native (Expo)
- Backend: Node.js + Express
- Database: MongoDB
```

---

## 🔄 تحديث المشروع لاحقاً

عندما تقوم بتعديلات:

```bash
# إضافة التغييرات
git add .

# عمل commit
git commit -m "Description of changes"

# رفع التحديثات
git push
```

---

## 📝 ملاحظات مهمة

### **1. استخدام حسابك الخاص**
✅ **نعم** - يجب استخدام حسابك الخاص (`cloudwork10`)
- هذا يضمن أنك تملك المشروع
- يمكنك التحكم في الصلاحيات
- يمكنك إضافة collaborators لاحقاً

### **2. Private vs Public**
- 🔒 **Private:** الكود مخفي (موصى به للمشاريع التجارية)
- 🌐 **Public:** الكود مفتوح للجميع (للمشاريع مفتوحة المصدر)

### **3. Branch Protection (للمشاريع المهمة)**
يمكنك تفعيل Branch Protection في GitHub:
- Settings → Branches → Add rule
- حماية `main` branch من التعديل المباشر

---

## 🆘 حل المشاكل

### **مشكلة: Authentication failed**
```bash
# استخدام Personal Access Token
# اذهب إلى: GitHub → Settings → Developer settings → Personal access tokens
# أنشئ token جديد مع صلاحيات repo
# ثم استخدم:
git remote set-url origin https://YOUR_TOKEN@github.com/cloudwork10/yoneapp.git
```

### **مشكلة: Repository not found**
- تأكد من اسم الـ repository صحيح
- تأكد من أنك أنشأت الـ repository على GitHub أولاً

### **مشكلة: Permission denied**
- تأكد من أنك مسجل دخول على GitHub
- تأكد من صلاحيات الـ repository

---

## ✅ Checklist قبل الرفع

- [ ] ✅ تم إزالة `config.env` من staging
- [ ] ✅ تم إضافة `config.env` إلى `.gitignore`
- [ ] ✅ تم إنشاء repository جديد على GitHub
- [ ] ✅ تم ربط المشروع بالـ repository
- [ ] ✅ لا توجد ملفات حساسة في الملفات المرفوعة
- [ ] ✅ جاهز للرفع! 🚀

---

**تم إنشاء الدليل بواسطة:** AI Assistant  
**التاريخ:** 21 نوفمبر 2025

