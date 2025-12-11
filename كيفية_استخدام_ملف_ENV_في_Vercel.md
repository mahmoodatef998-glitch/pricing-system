# 📝 كيفية استخدام ملف .env في Vercel
## How to Import .env File in Vercel

---

## 🎯 الطريقة السريعة

### 1️⃣ افتح ملف `.env.vercel`

**الملف موجود في:** `C:\Users\admin\Desktop\mahmood\pricing system\.env.vercel`

---

### 2️⃣ افتح الملف وانسخ المحتوى

**المحتوى:**

```
JWT_SECRET=K8mN2pQ9rT5vW7xY3zA6bC1dE4fG0hI3jK6mL9nP2qR5tV8wY1zA4bC7dE
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MyStr0ng!P@ssw0rd2025
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=dr7klhs6t
CLOUDINARY_API_KEY=165124341881569
CLOUDINARY_API_SECRET=NBxGzoPkngRqYIRA2VTosH1x9-Q
CLOUDINARY_FOLDER=pricing-system
NODE_ENV=production
LOG_LEVEL=info
UPLOAD_DIR=/tmp
```

---

### 3️⃣ في Vercel Dashboard

1. **اذهب إلى:** Project → Settings → Environment Variables
2. **ابحث عن:** `or paste .env contents above`
3. **اضغط عليه**
4. **الصق المحتوى** (الذي نسخته من `.env.vercel`)
5. **اختر:** `All Environments`
6. **اضغط:** `Save`

---

## ⚠️ ملاحظات مهمة

### 1. DATABASE_URL منفصل

**⚠️ مهم:** `DATABASE_URL` **ليس** في ملف `.env.vercel` لأنه:
- ✅ أضفته بالفعل في الخطوة الأولى
- ✅ أو استخدم `POSTGRES_URL` الموجود من Supabase

**لا حاجة لإضافته مرة أخرى!**

---

### 2. استبدل القيم إذا لزم الأمر

**قبل الصق، تأكد من:**

- ✅ `JWT_SECRET` - يمكنك استخدام القيمة الموجودة أو إنشاء واحدة جديدة
- ✅ `ADMIN_PASSWORD` - استبدلها بكلمة مرور قوية (احفظها!)
- ✅ `CLOUDINARY_*` - تأكد من أنها صحيحة من Cloudinary Dashboard

---

### 3. CORS و API URL

**بعد Deploy:**
- ستحصل على Vercel URL (مثل: `https://pricing-system.vercel.app`)
- حدّث:
  - `ALLOWED_ORIGINS`
  - `NEXT_PUBLIC_API_URL`

---

## 📋 Checklist بعد Import

تحقق من أن جميع هذه المتغيرات موجودة في Vercel:

- [x] `DATABASE_URL` ✅ (من الخطوة الأولى)
- [ ] `JWT_SECRET` ✅ (من .env.vercel)
- [ ] `JWT_EXPIRES_IN` ✅ (من .env.vercel)
- [ ] `ADMIN_USERNAME` ✅ (من .env.vercel)
- [ ] `ADMIN_PASSWORD` ✅ (من .env.vercel)
- [ ] `STORAGE_PROVIDER` ✅ (من .env.vercel)
- [ ] `CLOUDINARY_CLOUD_NAME` ✅ (من .env.vercel)
- [ ] `CLOUDINARY_API_KEY` ✅ (من .env.vercel)
- [ ] `CLOUDINARY_API_SECRET` ✅ (من .env.vercel)
- [ ] `CLOUDINARY_FOLDER` ✅ (من .env.vercel)
- [ ] `NODE_ENV` ✅ (من .env.vercel)
- [ ] `LOG_LEVEL` ✅ (من .env.vercel)
- [ ] `UPLOAD_DIR` ✅ (من .env.vercel)

---

## 🚀 بعد Import

### 1. Redeploy

1. **في Vercel Dashboard:**
   - اذهب إلى **Deployments**
   - اضغط **"Redeploy"** على آخر Deployment

2. **أو من Git:**
   ```bash
   git commit --allow-empty -m "Trigger redeploy after importing environment variables"
   git push
   ```

---

### 2. Test

**بعد Deploy:**

1. **Health Check:**
   - افتح: `https://your-project.vercel.app/api/health`
   - يجب أن ترى: `"database": "connected"`

2. **Frontend:**
   - افتح: `https://your-project.vercel.app`

3. **Login:**
   - افتح: `https://your-project.vercel.app/admin/login`
   - Username: `admin`
   - Password: `MyStr0ng!P@ssw0rd2025` (أو ما وضعته)

---

## 📁 الملفات المُنشأة

1. **`.env.vercel`** - ملف جاهز للاستيراد في Vercel
2. **`.env.production`** - ملف كامل مع جميع المتغيرات (بما في ذلك DATABASE_URL)

---

## ✅ تم!

**بعد Import و Redeploy، المشروع سيعمل!** 🎉

---

**تم إعداد هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 20 نوفمبر 2025

