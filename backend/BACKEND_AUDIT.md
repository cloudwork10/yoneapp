# تقرير مراجعة الـ Backend – YONE App

## هل كل الـ endpoints ترجع 500؟

**لا.** لكن جزء من الملاحظة صحيح:

- **Endpoints كانت ترجع 500** عند استدعائها **بدون توكن (بدون تسجيل دخول)** لأن الكود كان يستخدم `req.user.id` أو `req.user._id` بينما `req.user` غير معرّف → خطأ في السيرفر (500).
- **Endpoints أخرى** ترجع بشكل صحيح (200، 401، 404) حسب الطلب والصلاحيات.

تم إصلاح أسباب الـ 500 والحماية في التعديلات الحالية.

---

## ما الذي كان يسبب 500؟

1. **مسارات الـ Admin Content بدون حماية (بدون Auth)**
   - `/api/admin/content` كانت **بدون** `requireAuth` و `requireAdmin`.
   - عند استدعاء أي route فيها يستخدم `req.user` (مثل إنشاء كورس، مقال، بودكاست، نصائح، قوالب CV) كان السيرفر يحاول قراءة `req.user.id` أو `req.user._id` و`req.user` غير موجود → **500 Internal Server Error**.

2. **مسارات الـ Admin (داشبورد ومستخدمين) بدون حماية**
   - `/api/admin/dashboard` و `/api/admin/users` وغيرهما كانت مفتوحة بدون تسجيل دخول.
   - لم تكن تسبب 500 لوحدها، لكنها **مشكلة أمان**: أي شخص يستطيع طلب بيانات الأدمن.

3. **عدم التحقق من وجود المستخدم قبل استخدامه**
   - في `content.js` استخدام مباشر لـ `req.user.id` و `req.user._id` بدون التحقق من `req.user` → احتمال 500 إذا وصل الطلب بدون توكن.

---

## هل في endpoints مفتوحة (بدون حماية)؟

قبل التعديلات كان التالي **مفتوحاً**:

| المسار | المشكلة |
|--------|---------|
| `/api/admin/content/*` | كل عمليات المحتوى (إضافة/تعديل/حذف كورسات، مقالات، بودكاست، إلخ) بدون تسجيل دخول أو صلاحية أدمن. |
| `/api/admin/*` (dashboard, users, ...) | بدون تسجيل دخول؛ أي شخص يقدر يطلب بيانات الأدمن. |
| `/api/public/content` | بدون rate limit أو حماية أساسية (الآن عليها `publicSecurityMiddleware`). |

بعد التعديلات:

- **`/api/admin/content`**: محمية بـ `requireAuth` + `requireAdmin` → بدون توكن صالح + صلاحية أدمن ترجع **401** أو **403** وليس 500.
- **`/api/admin`** (dashboard, users, notifications): محمية بـ `requireAuth` + `requireAdmin`.
- **`/api/public/content`**: عليها `publicSecurityMiddleware` فقط (منطقي للمحتوى العام للقراءة).

---

## ملخص الإصلاحات التي تمت

1. **في `server.js`**
   - إضافة `requireAuth` و `requireAdmin` لمسارات `/api/admin/content` و `/api/admin`.
   - ربط `/api/admin/content` بـ `securityMiddleware` و `/api/public/content` بـ `publicSecurityMiddleware`.

2. **في `content.js`**
   - استبدال كل استخدام لـ `req.user.id` و `req.user._id` في إنشاء/تحديث المحتوى بـ `(req.user && req.user.id) || null` (أو نفس الفكرة لـ `_id`) حتى لو استُدعيت الـ route بدون مستخدم لا يحدث 500.

---

## Endpoints التي من المفترض ترجع 200 بدون توكن (عامة)

- `GET /api/health` → 200
- `GET /api/security/status` → 200
- `GET /api/public/*` (حسب تعريفك في `public.js`)
- `GET /api/public/content/public/podcasts` (ومثيلاتها للمحتوى العام)
- `GET /api/payments/plans` → 200
- `POST /api/auth/register` → 201 مع بيانات صحيحة
- `POST /api/auth/login` → 200 مع بيانات صحيحة

---

## Endpoints التي ترجع 401 بدون توكن (محمية)

- أي طلب لـ `/api/admin/*` بدون `Authorization: Bearer <token>` → 401.
- أي طلب لـ `/api/admin/content/*` بدون توكن أدمن → 401 أو 403.
- `/api/users/profile` (الملف الشخصي للمستخدم الحالي)، `/api/courses/:id/enroll`، `/api/payments/subscription`، إلخ.

---

## توصيات إضافية

1. **تشغيل الـ Backend مع MongoDB وملف البيئة**
   - التأكد من وجود `config.env` (أو نفس الملف الذي يقرأه `dotenv`) مع `JWT_SECRET` و `DB_CONNECTION_STRING`.
   - تشغيل MongoDB قبل تشغيل السيرفر؛ وإلا السيرفر يخرج بخطأ عند الاتصال بقاعدة البيانات.

2. **اختبار سريع بعد التشغيل**
   - `GET http://localhost:3000/api/health` → يجب أن ترجع 200.
   - طلب أي route في `/api/admin/content` أو `/api/admin` بدون توكن → يجب أن ترجع 401 وليس 500.

3. **إزالة أو تأمين الـ test routes**
   - في `content.js` توجد routes مثل `/test-podcast` و `/upload-audio-simple`؛ يفضّل إزالتها في الإنتاج أو حمايتها بـ Auth.

---

تم إعداد هذا التقرير بعد مراجعة `server.js`، `middleware/auth.js`، `middleware/security.js`، وملفات الـ routes (content, admin, users, payments, courses, reels, auth).
