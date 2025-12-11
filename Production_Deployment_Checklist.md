# ✅ Production Deployment Checklist
## قائمة التحقق من النشر للإنتاج

**التاريخ:** 20 نوفمبر 2025  
**استخدم هذه القائمة للتأكد من إكمال جميع الخطوات**

---

## 📋 قبل البدء

- [ ] Domain جاهز (اسم النطاق)
- [ ] Hosting Server (VPS) جاهز
- [ ] معلومات Server (IP, Username, Password) محفوظة
- [ ] 2-3 ساعات وقت متاحة

---

## 🔧 إعداد الخادم

- [ ] الاتصال بالخادم (SSH)
- [ ] تحديث النظام (`apt update && apt upgrade -y`)
- [ ] تثبيت Docker (`curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`)
- [ ] تثبيت Docker Compose (`apt install docker-compose -y`)
- [ ] تثبيت Nginx (`apt install nginx -y`)
- [ ] تثبيت Certbot (`apt install certbot python3-certbot-nginx -y`)
- [ ] تثبيت Git (`apt install git -y`)

---

## 📤 رفع المشروع

- [ ] رفع المشروع على Server (Git/SCP/FileZilla)
- [ ] المشروع موجود في `/opt/pricing-system`

---

## 🔐 إعداد Environment Variables

- [ ] إنشاء ملف `.env.production`
- [ ] تعيين `POSTGRES_USER`
- [ ] تعيين `POSTGRES_PASSWORD` (قوي)
- [ ] تعيين `POSTGRES_DB`
- [ ] تعيين `JWT_SECRET` (قوي - `openssl rand -base64 32`)
- [ ] تعيين `ADMIN_USERNAME`
- [ ] تعيين `ADMIN_PASSWORD` (قوي)
- [ ] تعيين `ALLOWED_ORIGINS` (مع Domain)
- [ ] تعيين `API_URL` (مع Domain)
- [ ] تعيين `NODE_ENV=production`
- [ ] حماية الملف (`chmod 600 .env.production`)

---

## 🌐 إعداد DNS

- [ ] تسجيل الدخول إلى لوحة Domain
- [ ] إضافة A Record للـ `@` → `[SERVER_IP]`
- [ ] إضافة A Record للـ `www` → `[SERVER_IP]`
- [ ] حفظ التغييرات
- [ ] انتظار DNS Propagation (5-30 دقيقة)
- [ ] التحقق من DNS (`nslookup your-domain.com`)

---

## 🔧 إعداد Nginx

- [ ] إنشاء ملف Configuration (`/etc/nginx/sites-available/pricing-system`)
- [ ] إدخال Configuration (مع Domain)
- [ ] تفعيل Configuration (`ln -s`)
- [ ] حذف Default Configuration
- [ ] اختبار Configuration (`nginx -t`)
- [ ] إعادة تشغيل Nginx (`systemctl restart nginx`)

---

## 🔒 إعداد SSL

- [ ] الحصول على SSL Certificate (`certbot --nginx`)
- [ ] إدخال Email
- [ ] الموافقة على الشروط
- [ ] اختيار Redirect HTTP to HTTPS
- [ ] التحقق من SSL (`certbot certificates`)

---

## 🚀 تشغيل المشروع

- [ ] الانتقال إلى مجلد المشروع (`cd /opt/pricing-system`)
- [ ] بناء وتشغيل Containers (`docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build`)
- [ ] التحقق من الحالة (`docker-compose -f docker-compose.prod.yml ps`)
- [ ] جميع Containers تعمل (db, backend, frontend)

---

## ✅ الاختبار

- [ ] Frontend يعمل (`https://your-domain.com`)
- [ ] HTTPS يعمل (قفل أخضر)
- [ ] Backend API يعمل (`https://your-domain.com/api/health`)
- [ ] Swagger يعمل (`https://your-domain.com/api-docs`)
- [ ] Match Product يعمل (`https://your-domain.com/match`)
- [ ] تسجيل الدخول يعمل (`https://your-domain.com/admin/login`)
- [ ] Admin Dashboard يعمل (`https://your-domain.com/admin/products`)
- [ ] إنشاء منتج جديد يعمل
- [ ] Export Excel/PDF يعمل

---

## 💾 النسخ الاحتياطي

- [ ] إنشاء Script للنسخ الاحتياطي (`/opt/backup.sh`)
- [ ] تفعيل Script (`chmod +x /opt/backup.sh`)
- [ ] اختبار Script (`/opt/backup.sh`)
- [ ] إضافة إلى Crontab (نسخ احتياطي يومي)

---

## 📝 ملاحظات

**Server IP:** _________________  
**Domain:** _________________  
**Admin Username:** _________________  
**Admin Password:** _________________  
**Database Password:** _________________  
**JWT Secret:** _________________  

---

## 🎉 النتيجة

- [ ] **جميع الخطوات مكتملة**
- [ ] **المشروع يعمل على الإنتاج**
- [ ] **HTTPS يعمل**
- [ ] **جميع الميزات تعمل**

---

**التاريخ:** _________________  
**الوقت المستغرق:** _________________  
**الحالة:** ✅ **جاهز للإنتاج**

