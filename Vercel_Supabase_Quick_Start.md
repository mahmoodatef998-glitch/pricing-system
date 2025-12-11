# ⚡ دليل سريع: النشر على Vercel + Supabase
## Quick Start Guide

**الوقت المتوقع:** 30-45 دقيقة  
**التكلفة:** $0 (مجاني تماماً)

---

## 🎯 الخطوات السريعة

### 1️⃣ Supabase Database (10 دقائق)

1. **سجل في:** https://supabase.com
2. **أنشئ Project جديد:**
   - Name: `pricing-system`
   - Password: (احفظه!)
   - Region: اختر الأقرب
3. **احصل على Connection String:**
   - Settings → Database → Connection string
   - انسخ: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

### 2️⃣ Vercel Deployment (20 دقيقة)

1. **سجل في:** https://vercel.com (استخدم GitHub)
2. **Import Project:**
   - اضغط "Add New" → "Project"
   - اختر: `mahmoodatef998-glitch/pricing-system`
   - Root Directory: `frontend`
   - Framework Preset: `Next.js`
3. **Environment Variables:**
   - اضغط "Environment Variables"
   - أضف جميع المتغيرات (انظر القائمة أدناه)

### 3️⃣ Database Setup (10 دقائق)

**على جهازك المحلي:**

```bash
cd backend
```

**أنشئ `.env`:**

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true"
```

**شغّل Migrations:**

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run seed
```

---

## 🔐 Environment Variables في Vercel

### Database:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

### JWT:
```
JWT_SECRET=[GENERATE_WITH: openssl rand -base64 32]
JWT_EXPIRES_IN=24h
```

### Admin:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[STRONG_PASSWORD]
```

### Storage (Cloudinary):
```
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=[YOUR_CLOUD_NAME]
CLOUDINARY_API_KEY=[YOUR_API_KEY]
CLOUDINARY_API_SECRET=[YOUR_API_SECRET]
CLOUDINARY_FOLDER=pricing-system
```

### CORS:
```
ALLOWED_ORIGINS=https://your-project.vercel.app
```

### Other:
```
NODE_ENV=production
LOG_LEVEL=info
UPLOAD_DIR=/tmp
```

### Frontend:
```
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

---

## 📝 ملاحظات مهمة

### 1. Vercel Serverless Functions
- Backend API سيعمل كـ Serverless Functions
- File Upload يحتاج Cloudinary (لا يمكن استخدام Local Storage)

### 2. Database Connection
- استخدم **Connection Pooling** من Supabase
- URL يجب أن يحتوي على `?pgbouncer=true`

### 3. Prisma
- يجب تشغيل `prisma generate` في Build
- أضف في `package.json`:
  ```json
  "vercel-build": "prisma generate && npm run build"
  ```

---

## ✅ Checklist

- [ ] Supabase Project منشأ
- [ ] Database Password محفوظ
- [ ] Connection String محفوظ
- [ ] Vercel Account منشأ
- [ ] GitHub Repository مربوط
- [ ] Environment Variables معدّة
- [ ] Database Migrations منشأة
- [ ] Deploy على Vercel
- [ ] Test Frontend
- [ ] Test Backend API

---

## 🚀 Deploy!

1. **ارفع التغييرات:**
   ```bash
   git add .
   git commit -m "Setup for Vercel + Supabase"
   git push
   ```

2. **Vercel سينشر تلقائياً**

3. **انتظر Build** (2-5 دقائق)

4. **افتح:** `https://your-project.vercel.app`

---

## 🎉 تم!

المشروع الآن يعمل على:
- ✅ **Frontend:** Vercel (Next.js)
- ✅ **Backend:** Vercel (Serverless Functions)
- ✅ **Database:** Supabase (PostgreSQL)

**جميعها مجانية!** 🎊

