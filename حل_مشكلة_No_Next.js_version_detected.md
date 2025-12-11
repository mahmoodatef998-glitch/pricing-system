# ✅ حل مشكلة "No Next.js version detected"
## Fix "No Next.js version detected" Error

---

## 🔍 المشكلة

**الخطأ:**
```
No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

**السبب:**
- ❌ Vercel لا يجد `package.json` في المكان الصحيح
- ❌ `outputDirectory` أو `buildCommand` غير صحيح
- ❌ Root Directory غير محدد بشكل صحيح

---

## ✅ الحل

### 1. تحديث `vercel.json`:

**المشكلة:** Vercel يحتاج أن يجد `package.json` في `frontend/` directory.

**الحل:** تحديث `installCommand` ليعمل من `frontend/` أولاً:

```json
{
  "version": 2,
  "buildCommand": "bash scripts/pre-build.sh && cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install && cd ../backend && npm install",
  "framework": "nextjs"
}
```

### 2. تحديد Root Directory في Vercel Settings:

**في Vercel Dashboard:**

1. **اذهب إلى:** Project → Settings → General
2. **ابحث عن:** "Root Directory"
3. **حدد:** `frontend` (إذا كان موجود)
4. **أو اتركه فارغاً** إذا لم يكن موجود

### 3. التحقق من `frontend/package.json`:

**يجب أن يحتوي على:**
```json
{
  "dependencies": {
    "next": "^14.0.4"
  }
}
```

---

## 🎓 لماذا هذا الحل يعمل؟

### Vercel Detection:
- ✅ **Vercel يبحث عن `package.json` في Root Directory**
- ✅ **إذا كان Root Directory = `frontend`، يبحث في `frontend/package.json`**
- ✅ **إذا كان Root Directory فارغ، يبحث في Root `package.json`**

### Install Command:
- ✅ **`installCommand` يجب أن يبدأ من `frontend/`**
- ✅ **هذا يضمن أن Vercel يجد `next` في `dependencies`**

---

## 📋 `vercel.json` النهائي

```json
{
  "version": 2,
  "buildCommand": "bash scripts/pre-build.sh && cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install && cd ../backend && npm install",
  "framework": "nextjs"
}
```

**ملاحظات:**
- ✅ `installCommand` يبدأ من `frontend/`
- ✅ `buildCommand` يبني من `frontend/`
- ✅ `outputDirectory` نسبي إلى Root → `frontend/.next`

---

## 🚀 بعد Deploy

### انتظر Build (2-5 دقائق)

### ثم Test:

**1. Test Route:**
```
https://pricing-system-zeta.vercel.app/api/test
```

**2. Health Check:**
```
https://pricing-system-zeta.vercel.app/api/health
```

**3. Frontend:**
```
https://pricing-system-zeta.vercel.app
```

---

## ✅ تم الإصلاح!

**بعد Deploy الجديد، المشكلة ستحل!** 🎉

**التغييرات المطبقة:**
1. ✅ تحديث `installCommand` ليعمل من `frontend/` أولاً
2. ✅ تحديث `buildCommand` ليبني من `frontend/`
3. ✅ تحديث `outputDirectory` إلى `frontend/.next`
4. ✅ Vercel سيجد `next` في `frontend/package.json`

---

**تم إعداد هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 20 نوفمبر 2025

