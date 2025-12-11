# ✅ Checklist: النشر على Vercel + Supabase

## 📋 قبل البدء

- [ ] حساب Supabase منشأ
- [ ] حساب Vercel منشأ (مربوط بـ GitHub)
- [ ] GitHub Repository جاهز
- [ ] 30-45 دقيقة متاحة

---

## 🗄️ Supabase Setup

- [ ] Project منشأ في Supabase
- [ ] Database Password محفوظ
- [ ] Connection String محفوظ
- [ ] Database Schema منشأ (Migrations)
- [ ] Seed Data (اختياري)

---

## ⚙️ Vercel Setup

- [ ] Project منشأ في Vercel
- [ ] GitHub Repository مربوط
- [ ] Root Directory: `frontend`
- [ ] Framework: `Next.js`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`

---

## 🔐 Environment Variables

### Database:
- [ ] `DATABASE_URL` (من Supabase)
- [ ] Connection Pooling URL

### JWT:
- [ ] `JWT_SECRET` (قوي - `openssl rand -base64 32`)
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
- [ ] `ALLOWED_ORIGINS` (Vercel URL)

### Frontend:
- [ ] `NEXT_PUBLIC_API_URL` (Vercel URL)

### Other:
- [ ] `NODE_ENV=production`
- [ ] `LOG_LEVEL=info`
- [ ] `UPLOAD_DIR=/tmp`

---

## 📤 Deployment

- [ ] Git Push (التغييرات مرفوعة)
- [ ] Vercel Auto Deploy (تم تلقائياً)
- [ ] Build نجح (لا أخطاء)
- [ ] Deploy نجح

---

## ✅ Testing

- [ ] Frontend يعمل (`https://your-project.vercel.app`)
- [ ] Backend API يعمل (`/api/health`)
- [ ] Database متصل
- [ ] تسجيل الدخول يعمل
- [ ] Match Product يعمل
- [ ] Admin Dashboard يعمل
- [ ] File Upload يعمل (Cloudinary)

---

## 🎉 النتيجة

- [ ] **جميع الخطوات مكتملة**
- [ ] **المشروع يعمل على Vercel**
- [ ] **Database متصل مع Supabase**
- [ ] **جميع الميزات تعمل**

---

**التاريخ:** _________________  
**Vercel URL:** _________________  
**Supabase Project:** _________________  
**الحالة:** ✅ **جاهز للإنتاج**

