# 🚀 خطوات رفع المشروع على GitHub

## ✅ تم إعداد المشروع للرفع!

تم إعداد كل شيء:
- ✅ تم تحديث `.gitignore` لحماية الملفات الحساسة
- ✅ تم إزالة `config.env` و `uploads/` من الملفات المرفوعة
- ✅ تم عمل commit للتغييرات
- ✅ تم ربط المشروع بـ: `https://github.com/cloudwork10/yoneapp.git`

---

## 📋 الخطوات المتبقية (يجب تنفيذها يدوياً):

### **الخطوة 1: إنشاء Repository على GitHub**

1. اذهب إلى: **https://github.com/new**
2. املأ البيانات:
   - **Repository name:** `yoneapp`
   - **Description:** `YONE Learning Platform - Mobile App & Backend`
   - **Visibility:** 🔒 **Private** (موصى به)
   - **لا** تضع ✅ Initialize with README
3. اضغط **Create repository**

---

### **الخطوة 2: إنشاء Personal Access Token**

لأن GitHub لا يقبل كلمات المرور العادية، تحتاج Personal Access Token:

1. اذهب إلى: **https://github.com/settings/tokens**
2. اضغط **Generate new token** → **Generate new token (classic)**
3. املأ البيانات:
   - **Note:** `YONE App - Local Development`
   - **Expiration:** `90 days` (أو حسب رغبتك)
   - **Select scopes:** ✅ **repo** (كل الصلاحيات تحت repo)
4. اضغط **Generate token**
5. **انسخ الـ Token فوراً** (لن يظهر مرة أخرى!)

---

### **الخطوة 3: رفع المشروع**

افتح Terminal في مجلد المشروع وقم بتنفيذ:

```bash
# تأكد من أنك في مجلد المشروع
cd /Users/abdulrahman/Desktop/yoneapp

# رفع المشروع (سيطلب منك Username و Password)
git push -u origin main
```

**عندما يطلب منك:**
- **Username:** `cloudwork10`
- **Password:** **الصق الـ Personal Access Token** (ليس كلمة المرور العادية!)

---

## 🔄 طريقة بديلة (أسهل):

### **استخدام GitHub CLI:**

إذا كان لديك GitHub CLI مثبت:

```bash
# تثبيت GitHub CLI (إذا لم يكن مثبت)
brew install gh

# تسجيل الدخول
gh auth login

# رفع المشروع
git push -u origin main
```

---

## ✅ التحقق من الرفع:

بعد الرفع، اذهب إلى:
**https://github.com/cloudwork10/yoneapp**

يجب أن ترى جميع الملفات هناك!

---

## 🛡️ تأكد من:

- ✅ `backend/config.env` **لن** يُرفع (محمي في .gitignore)
- ✅ `backend/uploads/` **لن** يُرفع (محمي في .gitignore)
- ✅ جميع ملفات `.env` محمية
- ✅ `node_modules/` محمي

---

## 🆘 إذا واجهت مشاكل:

### **مشكلة: Repository not found**
- تأكد من أنك أنشأت الـ repository على GitHub أولاً
- تأكد من اسم الـ repository: `yoneapp`

### **مشكلة: Authentication failed**
- تأكد من استخدام **Personal Access Token** وليس كلمة المرور
- تأكد من أن الـ Token له صلاحيات `repo`

### **مشكلة: Permission denied**
- تأكد من أنك مسجل دخول على GitHub
- تأكد من أن الـ repository موجود في حساب `cloudwork10`

---

## 📝 ملاحظات:

- **الـ repository سيكون Private** (مخفي) - يمكنك تغييره لاحقاً
- **يمكنك إضافة collaborators** من Settings → Collaborators
- **يمكنك تفعيل GitHub Actions** لاحقاً للـ CI/CD

---

**جاهز للرفع! 🚀**

بعد إنشاء الـ repository على GitHub، نفذ الأمر:
```bash
git push -u origin main
```

