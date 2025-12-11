# 🌐 دليل النشر على HOSTING + DOMAIN - Step by Step

**التاريخ:** 19 نوفمبر 2025  
**الهدف:** نشر المشروع على Hosting مع Domain

---

## 📋 المتطلبات الأساسية

### ما ستحتاجه:
- ✅ Domain (اسم نطاق)
- ✅ Hosting Provider (VPS أو Cloud)
- ✅ معرفة أساسية بـ Linux/Command Line
- ✅ 2-3 ساعات وقت

---

## 🎯 الخطوات الكاملة

### الخطوة 1: شراء Domain

#### الخيارات الموصى بها:

1. **Namecheap** (موصى به)
   - الموقع: https://www.namecheap.com
   - السعر: $10-15/سنة
   - المميزات: سهل الاستخدام، دعم جيد

2. **Cloudflare** (أرخص)
   - الموقع: https://www.cloudflare.com/products/registrar
   - السعر: $8-10/سنة
   - المميزات: أرخص، DNS مجاني

3. **GoDaddy**
   - الموقع: https://www.godaddy.com
   - السعر: $12-18/سنة
   - المميزات: أشهر، دعم 24/7

#### خطوات الشراء:

1. **اختر Domain:**
   - مثال: `pricing.yourcompany.com`
   - أو: `pricing-system.com`

2. **أكمل الشراء:**
   - ادفع
   - انتظر التفعيل (عادة فوري)

3. **احفظ معلومات الدخول:**
   - Username
   - Password
   - Domain Name

---

### الخطوة 2: اختيار Hosting Provider

#### الخيارات الموصى بها:

1. **DigitalOcean** (موصى به للمبتدئين)
   - الموقع: https://www.digitalocean.com
   - السعر: $6/شهر (1GB RAM)
   - المميزات: سهل، موثوق، دعم جيد

2. **Vultr**
   - الموقع: https://www.vultr.com
   - السعر: $6/شهر
   - المميزات: مشابه لـ DigitalOcean

3. **Hetzner** (أرخص)
   - الموقع: https://www.hetzner.com
   - السعر: €4/شهر
   - المميزات: أرخص، أوروبا

4. **AWS EC2**
   - الموقع: https://aws.amazon.com/ec2
   - السعر: $10-20/شهر
   - المميزات: موثوق، خدمات إضافية

#### خطوات إنشاء Server:

1. **سجل حساب:**
   - اذهب للموقع
   - سجل حساب جديد
   - أضف طريقة الدفع

2. **أنشئ Droplet/Instance:**
   - اختر: **Ubuntu 22.04 LTS**
   - اختر: **1GB RAM, 1 vCPU** (للبداية)
   - اختر: **Region** (أقرب لموقعك)
   - اختر: **SSH Key** (أو Password)

3. **احفظ معلومات Server:**
   - IP Address (مثل: 123.45.67.89)
   - Username (عادة: root)
   - Password (أو SSH Key)

---

### الخطوة 3: إعداد Server

#### الاتصال بـ Server:

**من Windows (PowerShell):**
```powershell
ssh root@[SERVER_IP]
# مثال: ssh root@123.45.67.89
```

**أو استخدام PuTTY:**
- حمّل PuTTY من: https://www.putty.org
- أدخل IP Address
- اضغط Connect

---

#### تثبيت Docker:

```bash
# تحديث النظام
apt update && apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# تثبيت Docker Compose
apt install docker-compose -y

# التحقق من التثبيت
docker --version
docker-compose --version
```

---

### الخطوة 4: رفع المشروع

#### الطريقة 1: استخدام Git (موصى به)

```bash
# تثبيت Git
apt install git -y

# رفع المشروع إلى GitHub/GitLab (من جهازك)
# ثم على Server:
cd /opt
git clone [YOUR_REPO_URL]
cd pricing-system
```

#### الطريقة 2: استخدام SCP (من Windows)

```powershell
# من PowerShell على جهازك
scp -r "C:\Users\admin\Desktop\mahmood\pricing system" root@[SERVER_IP]:/opt/
```

#### الطريقة 3: استخدام FileZilla (GUI)

1. حمّل FileZilla: https://filezilla-project.org
2. اتصل بـ Server:
   - Host: `sftp://[SERVER_IP]`
   - Username: `root`
   - Password: [YOUR_PASSWORD]
3. ارفع مجلد المشروع إلى `/opt/`

---

### الخطوة 5: إعداد Environment Variables

```bash
# على Server
cd /opt/pricing-system

# أنشئ ملف .env.production
nano .env.production
```

**أدخل القيم التالية:**

```env
# Database
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_strong_db_password_here
POSTGRES_DB=pricing_db

# JWT Authentication
JWT_SECRET=generate-strong-random-secret-here
JWT_EXPIRES_IN=24h

# Admin Credentials
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_strong_admin_password_here

# Storage Provider
STORAGE_PROVIDER=hybrid

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dr7klhs6t
CLOUDINARY_API_KEY=165124341881569
CLOUDINARY_API_SECRET=NBxGzoPkngRqYIRA2VTosH1x9-Q
CLOUDINARY_FOLDER=pricing-system

# CORS - استخدم Domain الخاص بك
ALLOWED_ORIGINS=https://pricing.yourcompany.com,https://www.pricing.yourcompany.com

# API URL
API_URL=https://pricing.yourcompany.com

# Logging
LOG_LEVEL=info

# Node Environment
NODE_ENV=production
```

**احفظ الملف:**
- اضغط `Ctrl + X`
- اضغط `Y`
- اضغط `Enter`

---

### الخطوة 6: إعداد Domain (DNS)

#### في لوحة تحكم Domain (Namecheap مثال):

1. **اذهب إلى Domain List**
2. **اضغط "Manage" بجانب Domain**
3. **اذهب إلى "Advanced DNS"**
4. **أضف Records:**

```
Type: A Record
Host: @
Value: [SERVER_IP]
TTL: Automatic

Type: A Record
Host: www
Value: [SERVER_IP]
TTL: Automatic
```

5. **احفظ**

**انتظر 5-30 دقيقة** حتى ينتشر DNS

---

### الخطوة 7: إعداد SSL (HTTPS)

#### تثبيت Certbot:

```bash
# على Server
apt install certbot python3-certbot-nginx -y
```

#### تثبيت Nginx:

```bash
apt install nginx -y
```

#### إعداد Nginx:

```bash
# أنشئ ملف Configuration
nano /etc/nginx/sites-available/pricing-system
```

**أدخل التالي:**

```nginx
server {
    listen 80;
    server_name pricing.yourcompany.com www.pricing.yourcompany.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**تفعيل Configuration:**

```bash
ln -s /etc/nginx/sites-available/pricing-system /etc/nginx/sites-enabled/
nginx -t  # اختبار Configuration
systemctl restart nginx
```

#### الحصول على SSL Certificate:

```bash
certbot --nginx -d pricing.yourcompany.com -d www.pricing.yourcompany.com
```

**اتبع التعليمات:**
- أدخل Email
- وافق على الشروط
- اختر Redirect HTTP to HTTPS

**تم!** الآن لديك HTTPS ✅

---

### الخطوة 8: تشغيل المشروع

#### على Server:

```bash
cd /opt/pricing-system

# استخدم Production Docker Compose
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

#### التحقق من الحالة:

```bash
docker-compose -f docker-compose.prod.yml ps
```

**يجب أن ترى جميع Services تعمل:**
```
NAME              STATUS
pricing-db        Up (healthy)
pricing-backend   Up
pricing-frontend  Up
```

---

### الخطوة 9: اختبار

#### من المتصفح:

1. **افتح:**
   ```
   https://pricing.yourcompany.com
   ```

2. **اختبر:**
   - Frontend: `https://pricing.yourcompany.com`
   - Backend: `https://pricing.yourcompany.com/api/health`
   - Match: `https://pricing.yourcompany.com/match`

3. **سجل الدخول:**
   - Username: [ADMIN_USERNAME من .env.production]
   - Password: [ADMIN_PASSWORD من .env.production]

---

### الخطوة 10: إعداد النسخ الاحتياطي

#### إنشاء Script للنسخ الاحتياطي:

```bash
nano /opt/backup.sh
```

**أدخل:**

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="pricing_db_$DATE.sql"

mkdir -p $BACKUP_DIR

# نسخ احتياطي للقاعدة
docker exec pricing-db-prod pg_dump -U postgres pricing_db > "$BACKUP_DIR/$FILENAME"

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "pricing_db_*.sql" -mtime +30 -delete

echo "Backup completed: $FILENAME"
```

**تفعيل Script:**

```bash
chmod +x /opt/backup.sh
```

**إضافة إلى Crontab (نسخ احتياطي يومي):**

```bash
crontab -e
```

**أضف:**

```cron
0 2 * * * /opt/backup.sh
```

**هذا يعني:** نسخ احتياطي يومي الساعة 2 صباحاً

---

## 🔧 الصيانة

### إعادة تشغيل Services:

```bash
cd /opt/pricing-system
docker-compose -f docker-compose.prod.yml restart
```

### عرض Logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### تحديث المشروع:

```bash
cd /opt/pricing-system
git pull  # إذا استخدمت Git
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🐛 حل المشاكل

### المشكلة 1: Domain لا يعمل

**الحل:**
1. تحقق من DNS:
   ```bash
   nslookup pricing.yourcompany.com
   ```
2. انتظر 30 دقيقة (DNS Propagation)
3. تحقق من Nginx:
   ```bash
   systemctl status nginx
   ```

---

### المشكلة 2: SSL لا يعمل

**الحل:**
1. تحقق من Certbot:
   ```bash
   certbot certificates
   ```
2. تجديد Certificate:
   ```bash
   certbot renew
   ```

---

### المشكلة 3: Services لا تعمل

**الحل:**
1. تحقق من Logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs
   ```
2. أعد التشغيل:
   ```bash
   docker-compose -f docker-compose.prod.yml restart
   ```

---

## 📋 Checklist النهائي

### قبل النشر:
- [ ] Domain مشترى ومفعّل
- [ ] Hosting Server جاهز
- [ ] Docker مثبت على Server
- [ ] المشروع مرفوع على Server
- [ ] Environment Variables معدّة

### أثناء النشر:
- [ ] DNS Records مضبوطة
- [ ] Nginx معدّ
- [ ] SSL Certificate مثبت
- [ ] Services تعمل

### بعد النشر:
- [ ] الموقع يعمل على HTTPS
- [ ] تسجيل الدخول يعمل
- [ ] Match Product يعمل
- [ ] النسخ الاحتياطي معدّ

---

## 💰 التكلفة الإجمالية

### الشهر الأول:
- Domain: $10-15 (سنة كاملة)
- Hosting: $6-12 (شهر واحد)
- **المجموع:** ~$16-27

### شهرياً (بعد الشهر الأول):
- Hosting: $6-12/شهر
- Domain: $0 (مدفوع سنوياً)

---

## ✅ الخلاصة

### الخطوات الأساسية:
1. ✅ شراء Domain
2. ✅ إنشاء Hosting Server
3. ✅ رفع المشروع
4. ✅ إعداد Environment Variables
5. ✅ إعداد DNS
6. ✅ إعداد SSL
7. ✅ تشغيل المشروع
8. ✅ اختبار

### الوقت المتوقع:
- **الإعداد الأول:** 2-3 ساعات
- **الصيانة:** 10-15 دقيقة/شهر

---

**تم إعداد هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 19 نوفمبر 2025  
**الحالة:** ✅ **دليل شامل جاهز**



