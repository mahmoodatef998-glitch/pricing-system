# 🔧 حل مشكلة: Command "npm run build" exited with 127

## المشكلة:
```
Command "npm run build" exited with 127
```

**الخطأ 127** يعني أن الأمر غير موجود أو أن هناك مشكلة في تنفيذ الأمر.

---

## ✅ الحل المطبق:

### 1. إضافة `buildCommand` و `installCommand` في `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "npm run install:all",
  "framework": "nextjs"
}
```

### 2. التأكد من وجود `build` script في root `package.json`:
```json
{
  "scripts": {
    "build": "cd frontend && npm run build",
    "install:all": "cd backend && npm install && cd ../frontend && npm install"
  }
}
```

### 3. التأكد من وجود `build` script في `frontend/package.json`:
```json
{
  "scripts": {
    "build": "cd ../backend && npm run prisma:generate && cd ../frontend && next build"
  }
}
```

---

## ⚙️ إعدادات Vercel المطلوبة:

### في Vercel Dashboard:
1. اذهب إلى **Settings** → **General**
2. **Root Directory**: يجب أن يكون `.` (root)
3. **Build Command**: سيستخدم `npm run build` من root `package.json`
4. **Install Command**: سيستخدم `npm run install:all` من root `package.json`

---

## 📝 الخطوات:

1. ✅ تم إضافة `buildCommand` و `installCommand` في `vercel.json`
2. ✅ تم التأكد من وجود `build` script في root `package.json`
3. ✅ تم التأكد من وجود `build` script في `frontend/package.json`

---

## 🚀 بعد التطبيق:

1. **Commit & Push:**
   ```bash
   git add .
   git commit -m "Fix: Add buildCommand and installCommand to vercel.json"
   git push
   ```

2. **في Vercel Dashboard:**
   - Vercel سيعيد الـ deployment تلقائياً
   - أو اضغط على **Redeploy** يدوياً

---

## ✅ التحقق:

بعد الـ deployment، تحقق من:
- ✅ Build Logs لا تظهر خطأ "exited with 127"
- ✅ Build ينجح
- ✅ `/api/test` يعمل
- ✅ `/api/health` يعمل

---

## 🔍 إذا استمرت المشكلة:

1. **تحقق من Build Logs:**
   - اذهب إلى Vercel Dashboard
   - Deployments → آخر Deployment → Logs
   - ابحث عن الأخطاء

2. **تحقق من Root Directory:**
   - Settings → General → Root Directory
   - يجب أن يكون `.` (root)

3. **تحقق من Environment Variables:**
   - Settings → Environment Variables
   - تأكد من وجود جميع المتغيرات

---

**تم إعداد هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 20 نوفمبر 2025

