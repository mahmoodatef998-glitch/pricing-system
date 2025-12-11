# 📚 كيفية استخدام Swagger API Documentation

**التاريخ:** 19 نوفمبر 2025

---

## 🚀 البدء السريع

### 1. تشغيل Backend

```bash
cd backend
npm run dev
```

أو باستخدام Docker:

```bash
docker-compose up backend
```

### 2. فتح Swagger UI

افتح المتصفح واذهب إلى:

```
http://localhost:4000/api-docs
```

---

## 📖 استخدام Swagger UI

### 1. استكشاف API

- **الواجهة الرئيسية:** تعرض جميع Endpoints منظمة حسب Tags
- **Expand/Collapse:** اضغط على أي Endpoint لرؤية التفاصيل
- **Try it out:** اضغط على "Try it out" لتجربة API مباشرة

### 2. تجربة Authentication

#### الخطوة 1: تسجيل الدخول
1. اذهب إلى **Authentication** → **POST /api/auth/login**
2. اضغط **"Try it out"**
3. أدخل:
   ```json
   {
     "username": "admin",
     "password": "ChangeMe123!"
   }
   ```
4. اضغط **"Execute"**
5. انسخ الـ **token** من Response

#### الخطوة 2: استخدام Token
1. اضغط على زر **"Authorize"** في أعلى الصفحة (🔒)
2. أدخل: `Bearer YOUR_TOKEN_HERE`
3. اضغط **"Authorize"**
4. الآن جميع Endpoints المحمية ستعمل تلقائياً!

### 3. تجربة Endpoints

#### Create Product:
1. اذهب إلى **Products** → **POST /api/products**
2. اضغط **"Try it out"**
3. أدخل البيانات:
   ```json
   {
     "description": "ATS",
     "size": "34",
     "breakers": "CONTACTORS",
     "brand": "LS",
     "ipEnclosure": "54",
     "pole": "3P",
     "price": "MANUAL"
   }
   ```
4. (اختياري) أضف ملفات في **files** field
5. اضغط **"Execute"**

#### Match Product:
1. اذهب إلى **Match** → **POST /api/match**
2. اضغط **"Try it out"**
3. أدخل:
   ```json
   {
     "description": "ATS",
     "size": "34",
     "breakers": "CONTACTORS",
     "brand": "LS",
     "ipEnclosure": "54",
     "pole": "3P"
   }
   ```
4. اضغط **"Execute"**

---

## 📋 Endpoints المتاحة

### Authentication
- ✅ `POST /api/auth/login` - تسجيل الدخول

### Products
- ✅ `GET /api/products` - الحصول على جميع المنتجات (مع pagination)
- ✅ `GET /api/products/{id}` - الحصول على منتج محدد
- ✅ `POST /api/products` - إنشاء منتج جديد (Admin only)
- ✅ `PUT /api/products/{id}` - تحديث منتج (Admin only)
- ✅ `DELETE /api/products/{id}` - حذف منتج (Admin only)

### Match
- ✅ `POST /api/match` - البحث عن منتج مطابق

### Health
- ✅ `GET /health` - فحص حالة الخدمة

---

## 🔧 JSON Endpoint

للحصول على Swagger JSON:

```
http://localhost:4000/api-docs.json
```

مفيد لـ:
- Import في Postman
- استخدام في أدوات أخرى
- Integration مع أدوات CI/CD

---

## 💡 نصائح

1. **Authentication:**
   - استخدم زر "Authorize" لتسجيل الدخول مرة واحدة
   - Token صالح لمدة 24 ساعة (افتراضي)

2. **File Uploads:**
   - في Swagger UI، استخدم "Choose File" في حقل `files`
   - يدعم: PDF, JPG, PNG, DWG

3. **Error Handling:**
   - جميع الأخطاء تظهر في Response
   - راجع Status Code و Error Message

4. **Rate Limiting:**
   - Auth: 5 محاولات / 15 دقيقة
   - Upload: 10 ملفات / ساعة
   - General: 100 طلب / 15 دقيقة

---

## 🎯 أمثلة

### مثال 1: إنشاء منتج جديد

```bash
# 1. سجل الدخول أولاً
POST /api/auth/login
{
  "username": "admin",
  "password": "ChangeMe123!"
}

# 2. استخدم Token في Authorization Header
POST /api/products
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

description: ATS
size: 34
breakers: CONTACTORS
brand: LS
ipEnclosure: 54
pole: 3P
price: MANUAL
files: [file1.pdf]
```

### مثال 2: البحث عن منتج

```bash
POST /api/match
Content-Type: application/json

{
  "description": "ATS",
  "size": "34",
  "breakers": "CONTACTORS",
  "brand": "LS",
  "ipEnclosure": "54",
  "pole": "3P"
}
```

---

## ✅ الخلاصة

Swagger UI يوفر:
- ✅ واجهة تفاعلية كاملة
- ✅ تجربة API مباشرة
- ✅ توثيق شامل
- ✅ أمثلة واضحة
- ✅ Authentication Testing

**الوصول:** `http://localhost:4000/api-docs`

---

**تم إعداد هذا الملف بواسطة:** AI Assistant  
**التاريخ:** 19 نوفمبر 2025


