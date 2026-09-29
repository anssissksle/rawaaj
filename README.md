# Rawaaj - خدمات محتوى ذكي للشركات الصغيرة

مشروع **Full-Stack** متكامل لموقع Rawaaj.

## التقنيات

| الجزء | التقنية |
|------|--------|
| Frontend | HTML5 + CSS3 + Vanilla JavaScript |
| Backend | Node.js + Express |
| Database | JSON File (لا يحتاج تثبيت إضافي) |
| Auth | JWT + bcryptjs |

## هيكل المشروع

```
rawaaj/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/ (config.js, api.js, script.js)
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── db/database.js + data.json
│   ├── middleware/auth.js
│   └── routes/ (auth, services, packages, orders, user)
└── README.md
```

## طريقة التشغيل

### 1. تثبيت الـ Backend
```bash
cd backend
npm install
```

### 2. تشغيل السيرفر
```bash
npm start
```

السيرفر: **http://localhost:3000**

### 3. فتح الموقع
افتح **http://localhost:3000** في المتصفح  
(أو افتح `frontend/index.html` مباشرة)

## حساب تجريبي

| البريد | كلمة المرور |
|--------|-------------|
| demo@rawaaj.com | 123456 |

## الأسعار (جنيه مصري)

**خدمات فردية:**
- كتابة مقال احترافي → 250 ج.م
- تصميم منشور إنستجرام → 150 ج.م
- تصميم ستوري → 120 ج.م
- كتابة وصف منتج → 100 ج.م
- تصميم بانر إعلاني → 200 ج.م
- كتابة محتوى تيك توك → 180 ج.م
- كتابة بوست فيسبوك → 90 ج.م
- تصميم كوفر فيسبوك → 170 ج.م

**باقات شهرية:**
- الأساسية → 799 ج.م
- المتوسطة → 1499 ج.م (الأكثر طلباً)
- الاحترافية → 2799 ج.م

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/register | ❌ |
| POST | /api/auth/login | ❌ |
| GET | /api/services | ❌ |
| GET | /api/packages | ❌ |
| POST | /api/orders | ✅ |
| GET | /api/orders | ✅ |
| GET | /api/user/dashboard | ✅ |
| PUT | /api/user/profile | ✅ |
| PUT | /api/user/password | ✅ |

## ملاحظات
- غيّر `JWT_SECRET` في `.env` قبل النشر.
- قاعدة البيانات: `backend/db/data.json`
- للإنتاج يُفضل PostgreSQL أو MongoDB.


## حسابات تجريبية

| النوع | البريد | كلمة المرور |
|------|--------|-------------|
| مستخدم عادي | `demo@rawaaj.com` | `123456` |
| **أدمن** | `admin@rawaaj.com` | `admin123` |

### لوحة الأدمن (منفصلة تماماً عن العميل)
- سجّل دخول بـ `admin@rawaaj.com` / `admin123`
- هتتحول **فوراً** لواجهة إدارة مستقلة (مش موقع العميل)
- الواجهة فيها: إحصائيات | الطلبات | العملاء
- تقدر تغيّر حالة أي طلب من القائمة المنسدلة
- حساب الأدمن **ممنوع** من طلب خدمات كعميل
- أي مستخدم عادي لو حاول يدخل لوحة الأدمن → يتمنع ويُطرد