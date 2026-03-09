# رفع الباك اند – خطوات سريعة

تم تجهيز المشروع ليرفع على **Render** أو **Railway** بخطوات قليلة.

---

## قبل ما تبدأ

1. **مستودع Git:** المشروع لازم يكون على GitHub (أو GitLab) وكل التعديلات مرفوعة (`git push`).
2. **MongoDB:** سجّل في [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (مجاني) → أنشئ Cluster → Connect → انسخ الـ Connection String وضع فيها اسم المستخدم وكلمة السر.

---

## الطريقة ١: Render.com

1. ادخل [render.com](https://render.com) وسجّل دخول.
2. **New +** → **Blueprint**.
3. اربط مستودع GitHub (اختر repo المشروع).
4. Render يقرأ ملف `render.yaml` الموجود في المشروع ويُنشئ السيرفس تلقائياً.
5. اضغط **Apply** وانتظر أول نشر ينتهي.
6. من لوحة السيرفس: **Environment** → أضف المتغيرات:

   | المفتاح | القيمة |
   |---------|--------|
   | `NODE_ENV` | `production` |
   | `DB_CONNECTION_STRING` | رابط MongoDB من Atlas |
   | `JWT_SECRET` | أي نص طويل وعشوائي (مثلاً 32 حرف) |
   | `BASE_URL` | رابط السيرفس (مثل `https://yone-api.onrender.com`) |
   | `ALLOWED_ORIGINS` | `*` أو رابط التطبيق إن عندك دومين |

   لو عندك Paymob أضف: `PAYMOB_API_KEY`, `PAYMOB_INTEGRATION_ID_CARD`, `PAYMOB_HMAC_SECRET`, إلخ.

7. بعد ما الـ deploy ينجح، انسخ رابط السيرفس (مثل `https://yone-api.onrender.com`).
8. في مشروع التطبيق أنشئ ملف `.env` في **جذر المشروع** (جنب `app.json`) واكتب:
   ```env
   EXPO_PUBLIC_API_URL=https://yone-api.onrender.com
   ```
   (استبدل الرابط بالرابط اللي ظهر لك.)

9. أعد تشغيل التطبيق أو أعد البناء عشان يقرأ العنوان الجديد.

---

## الطريقة ٢: Railway

1. ادخل [railway.app](https://railway.app) وسجّل دخول.
2. **New Project** → **Deploy from GitHub repo** واختر المستودع.
3. بعد إنشاء المشروع: **Settings** للسيرفس → **Root Directory** → اكتب `backend` واحفظ.
4. **Variables** → أضف نفس المتغيرات اللي فوق (NODE_ENV, DB_CONNECTION_STRING, JWT_SECRET, BASE_URL, ALLOWED_ORIGINS، و Paymob لو تحتاج).
5. في **Settings** → **Networking** → **Generate Domain** عشان يطلع لك رابط مثل `https://xxx.up.railway.app`.
6. أضف متغير `BASE_URL` = نفس الرابط اللي ظهر.
7. في مشروع التطبيق في `.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://xxx.up.railway.app
   ```

---

## التأكد إن الباك اند شغال

افتح في المتصفح:

`https://رابط-الباك-اند-اللي-نسخته/api/health`

لو ظهر شيء مثل: `{"status":"success", ...}` يبقى الباك اند شغال. بعدها التطبيق يقدر يتصل به لو وضعت `EXPO_PUBLIC_API_URL` في `.env` وأعدت التشغيل.
