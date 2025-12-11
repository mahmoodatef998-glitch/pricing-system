# 📁 كيفية تحديد Root Directory في Vercel
## How to Set Root Directory in Vercel

---

## ⚠️ المشكلة

**`rootDirectory` غير مدعوم في `vercel.json`!**

Vercel لا يدعم `rootDirectory` في `vercel.json` مباشرة. يجب تحديده من **Vercel Project Settings**.

---

## ✅ الحل

### الخطوة 1: إزالة `rootDirectory` من `vercel.json`

**تم إزالة `rootDirectory` من `vercel.json`.**

### الخطوة 2: تحديد Root Directory في Vercel Dashboard

**في Vercel Dashboard:**

1. **اذهب إلى:** Project → Settings → General
2. **ابحث عن:** "Root Directory"
3. **حدد:** `frontend`
4. **احفظ التغييرات**

**هذا يخبر Vercel أن:**
- ✅ Build Command سيعمل من `frontend/`
- ✅ Install Command سيعمل من `frontend/`
- ✅ Output Directory سيكون `frontend/.next`
- ✅ Functions سيكون `frontend/api/`

---

## 📋 `vercel.json` المحدث

```json
{
  "version": 2,
  "buildCommand": "cd .. && bash scripts/pre-build.sh && npm run build",
  "outputDirectory": ".next",
  "installCommand": "cd .. && npm install && cd backend && npm install && cd ../frontend && npm install",
  "framework": "nextjs",
  "functions": {
    "api/[...path].ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

**ملاحظات:**
- ✅ `buildCommand` يبدأ من `frontend/` (بسبب Root Directory في Settings)
- ✅ `cd ..` للرجوع إلى Root
- ✅ `bash scripts/pre-build.sh` لتشغيل Pre-build script
- ✅ `npm run build` للبناء من `frontend/`
- ✅ `outputDirectory` نسبي إلى `frontend/` → `.next`
- ✅ `functions` نسبي إلى `frontend/` → `api/[...path].ts`

---

## 🎯 الخطوات الكاملة

### 1. في Vercel Dashboard:

**Settings → General → Root Directory:**
- حدد: `frontend`
- احفظ

### 2. في GitHub:

**تم تحديث `vercel.json` بدون `rootDirectory`**

### 3. بعد Deploy:

**Vercel سيعمل:**
- ✅ من `frontend/` كـ Root Directory
- ✅ Build Command سيعمل بشكل صحيح
- ✅ Install Command سيعمل بشكل صحيح
- ✅ Functions ستعمل بشكل صحيح

---

## ✅ تم الإصلاح!

**بعد تحديد Root Directory في Vercel Settings، كل شيء سيعمل!** 🎉

---

**تم إعداد هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 20 نوفمبر 2025

