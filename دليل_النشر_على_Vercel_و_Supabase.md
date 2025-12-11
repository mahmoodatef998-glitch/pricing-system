# 🚀 دليل النشر على Vercel + Supabase
## Deploy to Vercel (Frontend + Backend API) + Supabase (Database)

**التاريخ:** 20 نوفمبر 2025  
**الحالة:** ✅ **جاهز للنشر**

---

## 📋 نظرة عامة

### ما سنفعله:
1. ✅ **Supabase** - Database (PostgreSQL)
2. ✅ **Vercel** - Frontend (Next.js)
3. ✅ **Vercel** - Backend API (Serverless Functions)

### المميزات:
- ✅ **مجاني تماماً** (Free Tier)
- ✅ **SSL تلقائي** (HTTPS)
- ✅ **CDN تلقائي**
- ✅ **Auto Deploy** من GitHub
- ✅ **Scalable** (يتوسع تلقائياً)

---

## 📦 الخطوة 1: إعداد Supabase Database

### 1.1 إنشاء حساب Supabase

1. **اذهب إلى:** https://supabase.com
2. **اضغط:** "Start your project"
3. **سجل حساب جديد** (استخدم GitHub أو Email)
4. **أنشئ Organization** (إذا طُلب)

### 1.2 إنشاء Project جديد

1. **اضغط:** "New Project"
2. **أدخل المعلومات:**
   - **Name:** `pricing-system`
   - **Database Password:** (احفظه! - ستحتاجه)
   - **Region:** اختر الأقرب (مثلاً: `West US` أو `Southeast Asia`)
   - **Pricing Plan:** `Free` (مجاني)

3. **اضغط:** "Create new project"
4. **انتظر 2-3 دقائق** حتى يتم إنشاء Project

### 1.3 الحصول على Connection String

1. **اذهب إلى:** Project Settings → Database
2. **ابحث عن:** "Connection string"
3. **اختر:** "URI" tab
4. **انسخ Connection String** (سيبدو هكذا):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

5. **احفظ:**
   - ✅ Connection String
   - ✅ Database Password
   - ✅ Project URL
   - ✅ API Key (anon/public)

### 1.4 إعداد Database Schema

#### الطريقة 1: استخدام Prisma Migrate (موصى به)

1. **على جهازك المحلي:**
   ```bash
   cd backend
   ```

2. **حدّث `.env` مع Supabase Connection String:**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   ```

3. **شغّل Migrations:**
   ```bash
   npm run prisma:generate
   npx prisma migrate deploy
   ```

4. **شغّل Seed (اختياري):**
   ```bash
   npm run seed
   ```

#### الطريقة 2: استخدام Supabase SQL Editor

1. **اذهب إلى:** SQL Editor في Supabase Dashboard
2. **انسخ والصق Schema من:** `backend/prisma/schema.prisma`
3. **حوّل Prisma Schema إلى SQL** (أو استخدم Prisma Studio)

---

## 🌐 الخطوة 2: إعداد Vercel

### 2.1 إنشاء حساب Vercel

1. **اذهب إلى:** https://vercel.com
2. **اضغط:** "Sign Up"
3. **سجل حساب جديد** (استخدم GitHub - موصى به)
4. **اتصل بـ GitHub** (إذا لم تكن متصل)

### 2.2 ربط GitHub Repository

1. **في Vercel Dashboard:**
   - اضغط "Add New..." → "Project"
   - اختر Repository: `mahmoodatef998-glitch/pricing-system`
   - اضغط "Import"

---

## 🔧 الخطوة 3: إعداد Backend API على Vercel

### 3.1 إنشاء Vercel Configuration

**أنشئ ملف `vercel.json` في root المشروع:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3.2 تحديث Backend للعمل مع Vercel

**أنشئ ملف `backend/api/index.ts`:**

```typescript
import app from '../src/app';

export default app;
```

**أو عدّل `backend/src/index.ts`:**

```typescript
import app from './app';
import { logger } from './utils/logger';

// For Vercel Serverless
export default app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}
```

### 3.3 تحديث vercel.json (الطريقة الأفضل)

**استبدل `vercel.json` بـ:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/package.json",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["backend/src/**", "backend/prisma/**"]
      }
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

---

## 🎨 الخطوة 4: إعداد Frontend على Vercel

### 4.1 تحديث next.config.js

**عدّل `frontend/next.config.js`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: [
      'localhost',
      'res.cloudinary.com',
      '*.cloudinary.com'
    ],
  },
  // For Vercel
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:4000',
  },
}

module.exports = nextConfig
```

### 4.2 تحديث API URL في Frontend

**عدّل `frontend/src/lib/api.ts`:**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:4000');

export const api = {
  // ... existing code
  baseURL: API_URL,
};
```

---

## 🔐 الخطوة 5: إعداد Environment Variables

### 5.1 في Vercel Dashboard

1. **اذهب إلى:** Project Settings → Environment Variables
2. **أضف المتغيرات التالية:**

#### Database:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

#### JWT:
```
JWT_SECRET=your-very-strong-random-secret-here
JWT_EXPIRES_IN=24h
```

#### Admin:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-admin-password
```

#### Storage:
```
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=pricing-system
```

#### CORS:
```
ALLOWED_ORIGINS=https://your-project.vercel.app,https://www.your-project.vercel.app
```

#### API URL:
```
API_URL=https://your-project.vercel.app
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

#### Other:
```
NODE_ENV=production
LOG_LEVEL=info
UPLOAD_DIR=/tmp/uploads
```

### 5.2 إنشاء JWT Secret قوي

```bash
# على جهازك
openssl rand -base64 32
```

---

## 📤 الخطوة 6: النشر على Vercel

### 6.1 من Vercel Dashboard

1. **في Project Settings:**
   - Root Directory: `frontend` (للـ Frontend)
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **للـ Backend API:**
   - أنشئ Project منفصل أو استخدم Monorepo

### 6.2 الطريقة الأفضل: Monorepo Setup

**أنشئ `vercel.json` في root:**

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "functions": {
    "backend/src/index.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 6.3 النشر التلقائي

1. **ارفع التغييرات إلى GitHub:**
   ```bash
   git add .
   git commit -m "Setup for Vercel deployment"
   git push
   ```

2. **Vercel سينشر تلقائياً** من GitHub

3. **انتظر حتى يكتمل Build** (2-5 دقائق)

---

## 🔄 الخطوة 7: إعداد Prisma مع Supabase

### 7.1 تحديث DATABASE_URL

**استخدم Connection Pooling من Supabase:**

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### 7.2 تحديث Prisma Schema

**تأكد من أن `backend/prisma/schema.prisma` يستخدم:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 7.3 Run Migrations على Vercel

**أضف Build Script في `backend/package.json`:**

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && tsc",
    "vercel-build": "prisma generate && prisma migrate deploy && tsc"
  }
}
```

---

## ✅ الخطوة 8: الاختبار

### 8.1 اختبار Frontend

افتح: `https://your-project.vercel.app`

### 8.2 اختبار Backend API

افتح: `https://your-project.vercel.app/api/health`

### 8.3 اختبار Database

- اذهب إلى Supabase Dashboard
- SQL Editor → Run Query
- `SELECT * FROM "Product" LIMIT 10;`

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: Database Connection Error

**الحل:**
- تأكد من استخدام Connection Pooling URL
- تحقق من Environment Variables في Vercel
- تأكد من أن Database Password صحيح

### المشكلة 2: Prisma Client Error

**الحل:**
```bash
# في Vercel Build Command
cd backend && npm run prisma:generate
```

### المشكلة 3: CORS Error

**الحل:**
- تأكد من `ALLOWED_ORIGINS` في Environment Variables
- أضف Vercel URL إلى CORS

### المشكلة 4: File Upload لا يعمل

**الحل:**
- استخدم Cloudinary (Vercel Serverless لا يدعم Local Storage)
- أو استخدم Supabase Storage

---

## 📋 Checklist النهائي

### Supabase:
- [ ] Project منشأ
- [ ] Database Password محفوظ
- [ ] Connection String محفوظ
- [ ] Schema منشأ (Migrations)
- [ ] Seed Data (اختياري)

### Vercel:
- [ ] حساب منشأ
- [ ] GitHub Repository مربوط
- [ ] Environment Variables معدّة
- [ ] Frontend منشور
- [ ] Backend API منشور

### الاختبار:
- [ ] Frontend يعمل
- [ ] Backend API يعمل
- [ ] Database متصل
- [ ] تسجيل الدخول يعمل
- [ ] Match Product يعمل

---

## 🎉 الخلاصة

### المميزات:
- ✅ **مجاني تماماً** (Free Tier)
- ✅ **SSL تلقائي** (HTTPS)
- ✅ **Auto Deploy** من GitHub
- ✅ **Scalable** (يتوسع تلقائياً)
- ✅ **CDN تلقائي**
- ✅ **Global Edge Network**

### التكلفة:
- **Supabase Free Tier:** 500MB Database, 1GB Bandwidth
- **Vercel Free Tier:** 100GB Bandwidth, Unlimited Requests
- **المجموع:** **$0/شهر** (للاستخدام الصغير)

### الخطوات التالية:
1. ✅ ابدأ بإعداد Supabase
2. ✅ ثم Vercel
3. ✅ ثم Environment Variables
4. ✅ ثم Deploy
5. ✅ ثم Test

---

**تم إعداد هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 20 نوفمبر 2025  
**الحالة:** ✅ **جاهز للنشر**

