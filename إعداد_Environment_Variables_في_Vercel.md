# 🔐 إعداد Environment Variables في Vercel
## Setup Environment Variables for Vercel + Supabase

**الحالة:** Supabase مربوط بالفعل من Vercel ✅

---

## 📋 المتغيرات الموجودة من Vercel

Vercel أضافت تلقائياً:
- ✅ `NEXT_PUBLIC_pricing systemSUPABASE_URL` (يجب أن يكون `NEXT_PUBLIC_SUPABASE_URL`)
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_SECRET_KEY`
- ✅ `POSTGRES_HOST`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_pricing systemSUPABASE_PUBLISHABLE_KEY` (يجب أن يكون `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- ✅ `POSTGRES_URL` ← **هذا هو DATABASE_URL!**

---

## 🔧 الخطوة 1: إضافة DATABASE_URL

### المشكلة:
- المشروع يحتاج `DATABASE_URL`
- Vercel أضافت `POSTGRES_URL`

### الحل:

**في Vercel Dashboard → Environment Variables:**

1. **أضف متغير جديد:**
   ```
   DATABASE_URL
   ```

2. **القيمة:** استخدم `POSTGRES_URL` أو أنشئه من Supabase

3. **الطريقة 1: استخدام POSTGRES_URL مباشرة**
   - انسخ قيمة `POSTGRES_URL`
   - أضفها كـ `DATABASE_URL`

4. **الطريقة 2: إنشاء من Supabase Dashboard**
   - اذهب إلى Supabase → Settings → Database
   - انسخ Connection String
   - استخدم **Connection Pooling** URL (port 6543)
   - مثال:
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
     ```

---

## 📝 الخطوة 2: إضافة باقي المتغيرات المطلوبة

### 2.1 JWT Authentication:

```
JWT_SECRET
```
**القيمة:** أنشئ Secret قوي
```bash
# على جهازك
openssl rand -base64 32
```

```
JWT_EXPIRES_IN
```
**القيمة:**
```
24h
```

---

### 2.2 Admin Credentials:

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

---

### 2.3 Storage Provider (Cloudinary):

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

### 2.4 CORS Configuration:

```
ALLOWED_ORIGINS
```
**القيمة:** بعد أول Deploy، ستحصل على Vercel URL

**مثال:**
```
https://pricing-system.vercel.app,https://www.pricing-system.vercel.app
```

**⚠️ مهم:** سيتم تحديثه بعد أول Deploy!

---

### 2.5 API URL:

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

### 2.6 Other Settings:

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

---

## 🔄 الخطوة 3: تصحيح أسماء المتغيرات (اختياري)

### المشكلة:
Vercel أضافت أسماء متغيرات بمسافات أو أسماء غير صحيحة:
- `NEXT_PUBLIC_pricing systemSUPABASE_URL` ❌
- `NEXT_PUBLIC_pricing systemSUPABASE_PUBLISHABLE_KEY` ❌

### الحل:

**إذا كنت ستستخدم Supabase Client في Frontend:**

1. **احذف المتغيرات القديمة:**
   - `NEXT_PUBLIC_pricing systemSUPABASE_URL`
   - `NEXT_PUBLIC_pricing systemSUPABASE_PUBLISHABLE_KEY`

2. **أضف المتغيرات الصحيحة:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```
   **القيمة:** من `NEXT_PUBLIC_pricing systemSUPABASE_URL`

   ```
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   ```
   **القيمة:** من `NEXT_PUBLIC_pricing systemSUPABASE_PUBLISHABLE_KEY`

**⚠️ ملاحظة:** إذا كنت لا تستخدم Supabase Client في Frontend، يمكنك تجاهل هذه المتغيرات.

---

## 📋 Checklist Environment Variables

### Database:
- [ ] `DATABASE_URL` (من `POSTGRES_URL` أو Supabase)
- [ ] `POSTGRES_URL` (موجود بالفعل ✅)

### JWT:
- [ ] `JWT_SECRET` (أنشئه)
- [ ] `JWT_EXPIRES_IN=24h`

### Admin:
- [ ] `ADMIN_USERNAME=admin`
- [ ] `ADMIN_PASSWORD` (قوي)

### Storage:
- [ ] `STORAGE_PROVIDER=cloudinary`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `CLOUDINARY_FOLDER=pricing-system`

### CORS:
- [ ] `ALLOWED_ORIGINS` (سيتم تحديثه بعد Deploy)

### Frontend:
- [ ] `NEXT_PUBLIC_API_URL` (سيتم تحديثه بعد Deploy)

### Other:
- [ ] `NODE_ENV=production`
- [ ] `LOG_LEVEL=info`
- [ ] `UPLOAD_DIR=/tmp`

### Supabase (موجود بالفعل):
- [x] `POSTGRES_URL` ✅
- [x] `SUPABASE_SERVICE_ROLE_KEY` ✅
- [x] `SUPABASE_ANON_KEY` ✅
- [x] `SUPABASE_SECRET_KEY` ✅
- [x] `POSTGRES_HOST` ✅

---

## 🚀 الخطوة 4: إنشاء Database Schema

### 4.1 على جهازك المحلي:

```bash
cd "C:\Users\admin\Desktop\mahmood\pricing system\backend"
```

### 4.2 أنشئ ملف `.env` محلي:

```bash
# انسخ env.example
copy env.example .env
```

### 4.3 عدّل `.env`:

**استخدم `POSTGRES_URL` من Vercel:**

1. **في Vercel Dashboard:**
   - اذهب إلى: Environment Variables
   - انسخ قيمة `POSTGRES_URL`

2. **أضفها في `.env`:**
   ```env
   DATABASE_URL="[PASTE_POSTGRES_URL_HERE]"
   ```

### 4.4 شغّل Migrations:

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
```

**أو إذا لم تكن هناك Migrations:**
```bash
npx prisma db push
```

### 4.5 Seed Data (اختياري):

```bash
npm run seed
```

---

## ✅ الخطوة 5: Deploy و Test

### 5.1 رفع التغييرات:

```bash
cd "C:\Users\admin\Desktop\mahmood\pricing system"
git add .
git commit -m "Add environment variables configuration"
git push
```

### 5.2 Vercel Auto Deploy:

- ✅ Vercel سينشر تلقائياً
- ✅ انتظر Build (2-5 دقائق)

### 5.3 بعد Deploy:

1. **احصل على Vercel URL:**
   - في Vercel Dashboard → Deployments
   - انسخ URL (مثل: `https://pricing-system.vercel.app`)

2. **حدّث Environment Variables:**
   - `ALLOWED_ORIGINS` = `https://pricing-system.vercel.app`
   - `NEXT_PUBLIC_API_URL` = `https://pricing-system.vercel.app`

3. **Redeploy:**
   - اضغط "Redeploy" في Vercel

---

## 🧪 الخطوة 6: الاختبار

### 6.1 اختبار Database:

افتح: `https://your-project.vercel.app/api/health`

**يجب أن ترى:**
```json
{
  "status": "ok",
  "services": {
    "database": "connected"
  }
}
```

### 6.2 اختبار Frontend:

افتح: `https://your-project.vercel.app`

### 6.3 اختبار Login:

افتح: `https://your-project.vercel.app/admin/login`
- Username: `admin`
- Password: (ما وضعته في `ADMIN_PASSWORD`)

---

## 🐛 حل المشاكل

### المشكلة: DATABASE_URL غير موجود

**الحل:**
1. أضف `DATABASE_URL` في Vercel
2. استخدم قيمة `POSTGRES_URL` أو أنشئه من Supabase

### المشكلة: Prisma Client Error

**الحل:**
1. تأكد من `vercel-build` script في `backend/package.json`
2. تحقق من Build Logs في Vercel

---

## 📝 ملخص سريع

1. ✅ **أضف `DATABASE_URL`** (من `POSTGRES_URL`)
2. ✅ **أضف JWT Variables** (`JWT_SECRET`, `JWT_EXPIRES_IN`)
3. ✅ **أضف Admin Credentials** (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)
4. ✅ **أضف Cloudinary Variables**
5. ✅ **شغّل Migrations** على جهازك المحلي
6. ✅ **Deploy** على Vercel
7. ✅ **حدّث `ALLOWED_ORIGINS` و `NEXT_PUBLIC_API_URL`** بعد Deploy
8. ✅ **Test**

---

**تم إعداد هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 20 نوفمبر 2025  
**الحالة:** ✅ **جاهز للتنفيذ**

