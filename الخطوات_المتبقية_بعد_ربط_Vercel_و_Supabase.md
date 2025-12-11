# 🚀 الخطوات المتبقية بعد ربط Vercel + Supabase
## Next Steps After Connecting Vercel & Supabase

**الحالة الحالية:**
- ✅ المشروع على GitHub
- ✅ Vercel مربوط
- ✅ Supabase Storage مربوط بـ Vercel

**الخطوات المتبقية:** ⬇️

---

## 📋 الخطوة 1: الحصول على Supabase Connection String

### 1.1 في Supabase Dashboard:

1. **اذهب إلى:** Project Settings → Database
2. **ابحث عن:** "Connection string" أو "Connection pooling"
3. **اختر:** "URI" tab
4. **انسخ Connection String** (سيبدو هكذا):

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**أو Direct Connection:**

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**⚠️ مهم:** استخدم **Connection Pooling** URL (port 6543) للإنتاج - أفضل للأداء!

---

## 🔐 الخطوة 2: إعداد Environment Variables في Vercel

### 2.1 في Vercel Dashboard:

1. **اذهب إلى:** Project → Settings → Environment Variables
2. **أضف المتغيرات التالية:**

---

### 📝 قائمة Environment Variables المطلوبة:

#### 1. Database (من Supabase):
```
DATABASE_URL
```
**القيمة:** Connection String من Supabase (الذي نسخته في الخطوة 1)

**مثال:**
```
postgresql://postgres.[abc123]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

---

#### 2. JWT Authentication:
```
JWT_SECRET
```
**القيمة:** أنشئ Secret قوي

**كيفية إنشائه:**
```bash
# على جهازك (PowerShell)
openssl rand -base64 32
```

**أو استخدم:** https://generate-secret.vercel.app/32

**مثال:**
```
K8mN2pQ9rT5vW7xY3zA6bC1dE4fG0hI3jK6mL9nP2qR5tV8wY1zA4bC7dE
```

```
JWT_EXPIRES_IN
```
**القيمة:**
```
24h
```

---

#### 3. Admin Credentials:
```
ADMIN_USERNAME
```
**القيمة:**
```
admin
```

```
ADMIN_PASSWORD
```
**القيمة:** كلمة مرور قوية (احفظها!)

**مثال:**
```
MyStr0ng!P@ssw0rd2025
```

---

#### 4. Storage Provider (Cloudinary):
```
STORAGE_PROVIDER
```
**القيمة:**
```
cloudinary
```

```
CLOUDINARY_CLOUD_NAME
```
**القيمة:** من Cloudinary Dashboard

```
CLOUDINARY_API_KEY
```
**القيمة:** من Cloudinary Dashboard

```
CLOUDINARY_API_SECRET
```
**القيمة:** من Cloudinary Dashboard

```
CLOUDINARY_FOLDER
```
**القيمة:**
```
pricing-system
```

---

#### 5. CORS Configuration:
```
ALLOWED_ORIGINS
```
**القيمة:** Vercel URL الخاص بك

**مثال:**
```
https://pricing-system.vercel.app,https://www.pricing-system.vercel.app
```

**⚠️ مهم:** بعد أول Deploy، ستحصل على URL من Vercel - أضفه هنا!

---

#### 6. API URL:
```
NEXT_PUBLIC_API_URL
```
**القيمة:** نفس Vercel URL

**مثال:**
```
https://pricing-system.vercel.app
```

**⚠️ مهم:** سيتم تحديثه بعد أول Deploy!

---

#### 7. Other Settings:
```
NODE_ENV
```
**القيمة:**
```
production
```

```
LOG_LEVEL
```
**القيمة:**
```
info
```

```
UPLOAD_DIR
```
**القيمة:**
```
/tmp
```

**⚠️ مهم:** في Vercel Serverless، استخدم `/tmp` للملفات المؤقتة

---

### 2.2 حفظ Environment Variables:

- ✅ اضغط "Save" بعد كل متغير
- ✅ تأكد من أن جميع المتغيرات موجودة
- ✅ تحقق من أن القيم صحيحة

---

## 🗄️ الخطوة 3: إنشاء Database Schema

### 3.1 على جهازك المحلي:

1. **افتح Terminal/PowerShell:**
   ```bash
   cd "C:\Users\admin\Desktop\mahmood\pricing system\backend"
   ```

2. **أنشئ ملف `.env` محلي:**
   ```bash
   # انسخ env.example
   copy env.example .env
   ```

3. **عدّل `.env` وأضف Supabase Connection String:**
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

4. **ثبت Dependencies:**
   ```bash
   npm install
   ```

5. **شغّل Prisma Generate:**
   ```bash
   npm run prisma:generate
   ```

6. **شغّل Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

   **أو إذا لم تكن هناك Migrations موجودة:**
   ```bash
   npx prisma db push
   ```

7. **شغّل Seed (اختياري - لإضافة بيانات تجريبية):**
   ```bash
   npm run seed
   ```

---

### 3.2 التحقق من Database:

1. **في Supabase Dashboard:**
   - اذهب إلى: **Table Editor**
   - يجب أن ترى 3 Tables:
     - ✅ `Product`
     - ✅ `Drawing`
     - ✅ `ProductHistory`

2. **أو استخدم SQL Editor:**
   ```sql
   SELECT * FROM "Product" LIMIT 10;
   ```

---

## 🚀 الخطوة 4: Deploy على Vercel

### 4.1 رفع التغييرات إلى GitHub:

```bash
cd "C:\Users\admin\Desktop\mahmood\pricing system"

git add .
git commit -m "Setup environment variables and database schema"
git push
```

### 4.2 Vercel Auto Deploy:

- ✅ Vercel سيكتشف التغييرات تلقائياً
- ✅ سيبدأ Build تلقائياً
- ✅ انتظر حتى يكتمل (2-5 دقائق)

### 4.3 التحقق من Deploy:

1. **في Vercel Dashboard:**
   - اذهب إلى: **Deployments**
   - تحقق من أن Build نجح ✅
   - انسخ **Deployment URL**

2. **حدّث Environment Variables:**
   - أضف Deployment URL إلى:
     - `ALLOWED_ORIGINS`
     - `NEXT_PUBLIC_API_URL`

3. **Redeploy:**
   - اضغط "Redeploy" في Vercel
   - أو ادفع commit جديد

---

## ✅ الخطوة 5: الاختبار

### 5.1 اختبار Frontend:

افتح في المتصفح:
```
https://your-project.vercel.app
```

**يجب أن ترى:**
- ✅ الصفحة الرئيسية تعمل
- ✅ لا توجد أخطاء في Console

---

### 5.2 اختبار Backend API:

افتح في المتصفح:
```
https://your-project.vercel.app/api/health
```

**يجب أن ترى:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T...",
  "services": {
    "database": "connected"
  }
}
```

---

### 5.3 اختبار Database Connection:

1. **في Supabase Dashboard:**
   - اذهب إلى: **SQL Editor**
   - شغّل Query:
     ```sql
     SELECT COUNT(*) FROM "Product";
     ```

2. **أو من Frontend:**
   - اذهب إلى: `/admin/login`
   - سجل دخول
   - اذهب إلى: `/admin/products`
   - يجب أن ترى قائمة المنتجات

---

### 5.4 اختبار Match Product:

1. **افتح:** `https://your-project.vercel.app/match`
2. **أدخل مواصفات منتج:**
   - Description: `ATS`
   - Size: `32-40`
   - Breakers: `CONTACTORS`
   - Brand: `LS`
3. **اضغط "Match"**
4. **يجب أن يعمل البحث**

---

### 5.5 اختبار File Upload:

1. **سجل دخول كـ Admin**
2. **اذهب إلى:** `/form`
3. **أنشئ منتج جديد**
4. **ارفع ملف (PDF/JPG)**
5. **يجب أن يعمل الرفع** (Cloudinary)

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: Database Connection Error

**الأعراض:**
- `Error: Can't reach database server`
- `P1001: Can't reach database server`

**الحل:**
1. تحقق من `DATABASE_URL` في Vercel
2. تأكد من استخدام **Connection Pooling** URL (port 6543)
3. تحقق من أن Password صحيح
4. تأكد من أن Supabase Project نشط

---

### المشكلة 2: Prisma Client Error

**الأعراض:**
- `@prisma/client did not initialize yet`
- `PrismaClient is not configured`

**الحل:**
1. تأكد من أن `vercel-build` script موجود في `backend/package.json`:
   ```json
   "vercel-build": "prisma generate && prisma migrate deploy && tsc"
   ```
2. تحقق من Build Logs في Vercel
3. تأكد من أن `prisma generate` يعمل

---

### المشكلة 3: CORS Error

**الأعراض:**
- `Access to XMLHttpRequest has been blocked by CORS policy`

**الحل:**
1. تأكد من `ALLOWED_ORIGINS` في Vercel
2. أضف Vercel URL بالضبط (مع https://)
3. Redeploy بعد تحديث Environment Variables

---

### المشكلة 4: File Upload لا يعمل

**الأعراض:**
- `Error uploading file`
- `Storage provider not configured`

**الحل:**
1. تأكد من `STORAGE_PROVIDER=cloudinary`
2. تحقق من Cloudinary Credentials
3. تأكد من أن Cloudinary Account نشط

---

### المشكلة 5: Authentication لا يعمل

**الأعراض:**
- `Invalid credentials`
- `Unauthorized`

**الحل:**
1. تحقق من `ADMIN_USERNAME` و `ADMIN_PASSWORD` في Vercel
2. تأكد من أن القيم صحيحة
3. جرب تسجيل الدخول مرة أخرى

---

## 📋 Checklist النهائي

### Supabase:
- [ ] Connection String محفوظ
- [ ] Database Schema منشأ (Migrations)
- [ ] Seed Data (اختياري)
- [ ] Tables موجودة (Product, Drawing, ProductHistory)

### Vercel:
- [ ] جميع Environment Variables معدّة
- [ ] DATABASE_URL صحيح
- [ ] JWT_SECRET قوي
- [ ] ADMIN_PASSWORD قوي
- [ ] Cloudinary Credentials صحيحة
- [ ] ALLOWED_ORIGINS محدّث
- [ ] NEXT_PUBLIC_API_URL محدّث

### Deployment:
- [ ] Build نجح في Vercel
- [ ] Deploy نجح
- [ ] Frontend يعمل
- [ ] Backend API يعمل
- [ ] Database متصل

### Testing:
- [ ] Health Check يعمل (`/api/health`)
- [ ] تسجيل الدخول يعمل
- [ ] Match Product يعمل
- [ ] File Upload يعمل
- [ ] Admin Dashboard يعمل

---

## 🎉 تم!

**المشروع الآن يعمل على:**
- ✅ **Frontend:** Vercel (Next.js)
- ✅ **Backend:** Vercel (Serverless Functions)
- ✅ **Database:** Supabase (PostgreSQL)
- ✅ **Storage:** Cloudinary

**جميعها مجانية!** 🎊

---

## 📞 الخطوات التالية (اختياري)

1. **إضافة Custom Domain:**
   - في Vercel: Settings → Domains
   - أضف Domain الخاص بك

2. **تحسين الأداء:**
   - إضافة Caching
   - تحسين Images

3. **إضافة Monitoring:**
   - Vercel Analytics
   - Error Tracking

---

**تم إعداد هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 20 نوفمبر 2025  
**الحالة:** ✅ **جاهز للتنفيذ**

