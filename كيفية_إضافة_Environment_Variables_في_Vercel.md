# 📝 كيفية إضافة Environment Variables في Vercel
## Step-by-Step Guide

---

## 🎯 الخطوات التفصيلية

### 1️⃣ الوصول إلى صفحة Environment Variables

1. **في Vercel Dashboard:**
   - اذهب إلى **Project** الخاص بك
   - اضغط على **Settings** (من القائمة الجانبية)
   - اضغط على **Environment Variables** (من القائمة الفرعية)

---

### 2️⃣ إضافة متغير جديد

#### الطريقة 1: إضافة متغير واحد

1. **اضغط على:** `Create new` (أو `Add New`)

2. **أدخل المعلومات:**

   **Key (المفتاح):**
   ```
   DATABASE_URL
   ```

   **Value (القيمة):**
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
   *(استبدل بالقيم الفعلية من Supabase)*

   **Note (ملاحظة - اختياري):**
   ```
   Database connection string from Supabase
   ```

3. **اختر Environment:**
   - ✅ **Production** (للإنتاج)
   - ✅ **Preview** (للمعاينة)
   - ✅ **Development** (للتطوير)
   
   **أو اضغط:** `All Environments` (لجميع البيئات)

4. **Sensitive (اختياري):**
   - ✅ فعّل `Sensitive` إذا كان المتغير حساس (مثل Passwords, Secrets)
   - هذا يخفي القيمة بعد الحفظ

5. **اضغط:** `Save`

---

#### الطريقة 2: إضافة متعددة (Paste .env)

1. **اضغط على:** `or paste .env contents above`

2. **انسخ والصق محتوى .env:**

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
JWT_SECRET=K8mN2pQ9rT5vW7xY3zA6bC1dE4fG0hI3jK6mL9nP2qR5tV8wY1zA4bC7dE
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MyStr0ng!P@ssw0rd2025
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=pricing-system
NODE_ENV=production
LOG_LEVEL=info
UPLOAD_DIR=/tmp
```

3. **اختر Environment:**
   - ✅ `All Environments` (موصى به)

4. **اضغط:** `Save`

---

## 📋 قائمة المتغيرات المطلوبة

### Database:
```
DATABASE_URL
```
**القيمة:** من `POSTGRES_URL` أو Supabase Connection String

---

### JWT:
```
JWT_SECRET
```
**القيمة:** أنشئه بـ `openssl rand -base64 32`

```
JWT_EXPIRES_IN
```
**القيمة:** `24h`

---

### Admin:
```
ADMIN_USERNAME
```
**القيمة:** `admin`

```
ADMIN_PASSWORD
```
**القيمة:** كلمة مرور قوية

---

### Storage (Cloudinary):
```
STORAGE_PROVIDER
```
**القيمة:** `cloudinary`

```
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER
```
**القيمة:** من Cloudinary Dashboard

---

### CORS (بعد Deploy):
```
ALLOWED_ORIGINS
```
**القيمة:** Vercel URL (مثل: `https://pricing-system.vercel.app`)

```
NEXT_PUBLIC_API_URL
```
**القيمة:** Vercel URL (مثل: `https://pricing-system.vercel.app`)

---

### Other:
```
NODE_ENV
```
**القيمة:** `production`

```
LOG_LEVEL
```
**القيمة:** `info`

```
UPLOAD_DIR
```
**القيمة:** `/tmp`

---

## ⚠️ ملاحظات مهمة

### 1. Sensitive Variables:
- فعّل `Sensitive` للمتغيرات الحساسة:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `ADMIN_PASSWORD`
  - `CLOUDINARY_API_SECRET`

### 2. Environment Selection:
- **Production:** للإنتاج فقط
- **Preview:** للمعاينة (Pull Requests)
- **Development:** للتطوير المحلي
- **All Environments:** لجميع البيئات (موصى به)

### 3. بعد إضافة المتغيرات:
- **Redeploy** مطلوب!
- Vercel سيعرض رسالة: "A new Deployment is required"
- اضغط **"Redeploy"** أو ادفع commit جديد

---

## 🔄 كيفية Redeploy

### الطريقة 1: من Vercel Dashboard

1. **بعد إضافة Environment Variables:**
   - ستظهر رسالة: "A new Deployment is required"
   - اضغط **"Redeploy"**

2. **أو اذهب إلى:**
   - **Deployments** → اختر آخر Deployment → **Redeploy**

### الطريقة 2: من Git

```bash
git commit --allow-empty -m "Trigger redeploy after adding environment variables"
git push
```

---

## ✅ Checklist

- [ ] `DATABASE_URL` مضاف
- [ ] `JWT_SECRET` مضاف (Sensitive ✅)
- [ ] `JWT_EXPIRES_IN=24h` مضاف
- [ ] `ADMIN_USERNAME=admin` مضاف
- [ ] `ADMIN_PASSWORD` مضاف (Sensitive ✅)
- [ ] Cloudinary Variables مضاف
- [ ] `NODE_ENV=production` مضاف
- [ ] `LOG_LEVEL=info` مضاف
- [ ] `UPLOAD_DIR=/tmp` مضاف
- [ ] Redeploy تم

---

## 🎯 مثال عملي

### الخطوة 1: إضافة DATABASE_URL

1. **اضغط:** `Create new`
2. **Key:** `DATABASE_URL`
3. **Value:** (انسخ من `POSTGRES_URL` أو Supabase)
4. **Environment:** `All Environments`
5. **Sensitive:** ✅ (فعّل)
6. **Save**

### الخطوة 2: إضافة JWT_SECRET

1. **اضغط:** `Create new`
2. **Key:** `JWT_SECRET`
3. **Value:** (أنشئه: `openssl rand -base64 32`)
4. **Environment:** `All Environments`
5. **Sensitive:** ✅ (فعّل)
6. **Save**

### الخطوة 3: إضافة باقي المتغيرات

كرر نفس الخطوات لباقي المتغيرات...

---

## 🚀 بعد إضافة جميع المتغيرات

1. **Redeploy:**
   - اضغط **"Redeploy"** في Vercel
   - أو ادفع commit جديد

2. **انتظر Build:**
   - Build سيستغرق 2-5 دقائق

3. **Test:**
   - افتح: `https://your-project.vercel.app/api/health`
   - يجب أن ترى: `"database": "connected"`

---

## 📸 Screenshot Guide (نصي)

### في صفحة Environment Variables:

```
┌─────────────────────────────────────────┐
│ Environment Variables                   │
├─────────────────────────────────────────┤
│                                         │
│  [Create new]  [Link Shared...]        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Key: DATABASE_URL               │   │
│  │ Value: [••••••••••••••]         │   │
│  │ Note: [Database connection...]   │   │
│  │                                  │   │
│  │ Environments:                   │   │
│  │ ☑ Production                    │   │
│  │ ☑ Preview                       │   │
│  │ ☑ Development                  │   │
│  │                                  │   │
│  │ ☑ Sensitive                     │   │
│  │                                  │   │
│  │ [Cancel]  [Save]                │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎉 تم!

**بعد إضافة جميع المتغيرات و Redeploy، المشروع سيعمل!** 🚀

---

**تم إعداد هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 20 نوفمبر 2025  
**الحالة:** ✅ **جاهز للاستخدام**

