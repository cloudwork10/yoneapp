# 🔄 إعادة تشغيل الـ Backend

## ⚠️ مهم: يجب إعادة تشغيل الـ Backend بعد التغييرات!

### الطريقة السريعة:

1. **أوقف الـ Backend الحالي:**
   - اذهب إلى Terminal الذي يعمل فيه الـ backend
   - اضغط `Ctrl + C` لإيقافه

2. **أعد تشغيله:**
   ```bash
   cd backend
   npm start
   ```

### أو استخدم الأمر التالي:

```bash
# أوقف الـ backend
pkill -f "node server.js"

# انتظر ثانيتين
sleep 2

# أعد تشغيله
cd backend && npm start
```

---

## ✅ بعد إعادة التشغيل:

1. جرب إنشاء payment order من التطبيق
2. يجب أن ترى رسالة "Test Mode" بدلاً من خطأ
3. تحقق من الـ logs في `backend/logs/app.log`

---

**ملاحظة:** التغييرات لن تعمل حتى تعيد تشغيل الـ backend!

