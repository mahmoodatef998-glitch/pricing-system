# 🚀 دليل النشر الفعلي - خطوة بخطوة مع Domain جاهز

**التاريخ:** 19 نوفمبر 2025  
**الحالة:** ✅ **دليل شامل جاهز**

---

## 📋 المتطلبات

### ✅ ما لديك:
- ✅ Domain جاهز (اسم النطاق)
- ✅ المشروع جاهز ومكتمل

### 🔧 ما ستحتاجه:
- Hosting Server (VPS)
- معرفة أساسية بـ Command Line
- 2-3 ساعات وقت

---

## 💰 التكلفة المتوقعة

### الخيار 1: DigitalOcean (موصى به)
- **Server:** $6/شهر (1GB RAM, 1 vCPU)
- **Domain:** $0 (لديك بالفعل)
- **Cloudinary:** $0-10/شهر (Free tier: 25GB)
- **المجموع:** **$6-16/شهر**

### الخيار 2: Vultr
- **Server:** $6/شهر
- **Domain:** $0
- **Cloudinary:** $0-10/شهر
- **المجموع:** **$6-16/شهر**

### الخيار 3: Hetzner (أرخص)
- **Server:** €4/شهر (~$4.5)
- **Domain:** $0
- **Cloudinary:** $0-10/شهر
- **المجموع:** **$4.5-14.5/شهر**

### التكلفة السنوية:
- **الحد الأدنى:** $54-72/سنة
- **الحد الأقصى:** $192/سنة

---

## 🎯 الخطوات التفصيلية

### الخطوة 1: شراء Hosting Server

#### أ. DigitalOcean (موصى به للمبتدئين)

1. **سجل حساب:**
   - اذهب: https://www.digitalocean.com
   - اضغط "Sign Up"
   - أدخل Email و Password
   - أكمل التسجيل

2. **أضف طريقة الدفع:**
   - اذهب إلى Billing
   - أضف Credit Card أو PayPal
   - (مطلوب للبدء)

3. **أنشئ Droplet:**
   - اضغط "Create" → "Droplets"
   - اختر:
     - **Image:** Ubuntu 22.04 LTS
     - **Plan:** Basic → $6/month (1GB RAM, 1 vCPU, 25GB SSD)
     - **Region:** اختر الأقرب لموقعك
     - **Authentication:** SSH Key (أو Password)
   - اضغط "Create Droplet"

4. **احفظ معلومات Server:**
   - **IP Address:** (مثل: 123.45.67.89)
   - **Username:** root
   - **Password:** (إذا اخترت Password)

#### ب. Vultr (بديل جيد)

1. **سجل حساب:**
   - اذهب: https://www.vultr.com
   - نفس الخطوات مثل DigitalOcean

2. **أنشئ Instance:**
   - اضغط "Deploy Server"
   - اختر:
     - **Server Type:** Cloud Compute
     - **CPU & Storage:** Regular Performance → $6/month
     - **Server Location:** اختر الأقرب
     - **Operating System:** Ubuntu 22.04
   - اضغط "Deploy Now"

---

### الخطوة 2: الاتصال بـ Server

#### من Windows (PowerShell):

```powershell
# الطريقة 1: SSH (إذا كان لديك SSH Key)
ssh root@[SERVER_IP]
# مثال: ssh root@123.45.67.89

# الطريقة 2: Password (إذا اخترت Password)
ssh root@[SERVER_IP]
# سيطلب منك Password
```

#### أو استخدام PuTTY:

1. **حمّل PuTTY:**
   - من: https://www.putty.org
   - أو استخدم Windows Terminal

2. **اتصل:**
   - Host Name: `[SERVER_IP]`
   - Port: `22`
   - Connection Type: `SSH`
   - اضغط "Open"
   - أدخل Username: `root`
   - أدخل Password

---

### الخطوة 3: إعداد Server الأساسي

#### 3.1 تحديث النظام:

```bash
apt update && apt upgrade -y
```

#### 3.2 تثبيت Docker:

```bash
# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# التحقق من التثبيت
docker --version
```

#### 3.3 تثبيت Docker Compose:

```bash
apt install docker-compose -y

# التحقق
docker-compose --version
```

#### 3.4 تثبيت Nginx (للـ Reverse Proxy):

```bash
apt install nginx -y

# تفعيل Nginx
systemctl enable nginx
systemctl start nginx
```

#### 3.5 تثبيت Certbot (للـ SSL):

```bash
apt install certbot python3-certbot-nginx -y
```

---

### الخطوة 4: رفع المشروع على Server

#### الطريقة 1: استخدام Git (موصى به)

##### أ. على جهازك (Local):

```bash
# 1. أنشئ Git Repository (إذا لم يكن موجود)
cd "C:\Users\admin\Desktop\mahmood\pricing system"
git init
git add .
git commit -m "Initial commit"

# 2. ارفع إلى GitHub/GitLab
# (أنشئ Repository على GitHub أولاً)
git remote add origin https://github.com/YOUR_USERNAME/pricing-system.git
git push -u origin main
```

##### ب. على Server:

```bash
# 1. تثبيت Git
apt install git -y

# 2. Clone المشروع
cd /opt
git clone https://github.com/YOUR_USERNAME/pricing-system.git
cd pricing-system
```

#### الطريقة 2: استخدام SCP (من Windows)

```powershell
# من PowerShell على جهازك
scp -r "C:\Users\admin\Desktop\mahmood\pricing system" root@[SERVER_IP]:/opt/
```

#### الطريقة 3: استخدام FileZilla (GUI)

1. **حمّل FileZilla:**
   - من: https://filezilla-project.org

2. **اتصل:**
   - Host: `sftp://[SERVER_IP]`
   - Username: `root`
   - Password: `[YOUR_PASSWORD]`
   - Port: `22`

3. **ارفع المشروع:**
   - اسحب مجلد المشروع إلى `/opt/`

---

### الخطوة 5: إعداد Environment Variables

```bash
# على Server
cd /opt/pricing-system

# أنشئ ملف .env.production
nano .env.production
```

**أدخل القيم التالية (استبدل بالقيم الفعلية):**

```env
# Database
POSTGRES_USER=pricing_admin
POSTGRES_PASSWORD=YOUR_STRONG_DB_PASSWORD_HERE
POSTGRES_DB=pricing_db

# JWT Authentication
JWT_SECRET=YOUR_VERY_STRONG_RANDOM_SECRET_HERE
JWT_EXPIRES_IN=24h

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YOUR_STRONG_ADMIN_PASSWORD_HERE

# Storage Provider
STORAGE_PROVIDER=hybrid

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dr7klhs6t
CLOUDINARY_API_KEY=165124341881569
CLOUDINARY_API_SECRET=NBxGzoPkngRqYIRA2VTosH1x9-Q
CLOUDINARY_FOLDER=pricing-system

# CORS - استخدم Domain الخاص بك
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# API URL
API_URL=https://your-domain.com

# Node Environment
NODE_ENV=production

# Logging
LOG_LEVEL=info
```

**احفظ الملف:**
- اضغط `Ctrl + X`
- اضغط `Y`
- اضغط `Enter`

**مهم:** استبدل:
- `your-domain.com` → Domain الخاص بك
- `YOUR_STRONG_DB_PASSWORD_HERE` → كلمة مرور قوية
- `YOUR_VERY_STRONG_RANDOM_SECRET_HERE` → Secret عشوائي قوي
- `YOUR_STRONG_ADMIN_PASSWORD_HERE` → كلمة مرور Admin قوية

**لإنشاء JWT_SECRET قوي:**
```bash
openssl rand -base64 32
```

---

### الخطوة 6: إعداد Domain (DNS)

#### في لوحة تحكم Domain:

1. **اذهب إلى Domain Management:**
   - سجل الدخول إلى لوحة Domain الخاصة بك
   - (Namecheap, GoDaddy, Cloudflare, إلخ)

2. **اذهب إلى DNS Settings:**
   - ابحث عن "DNS Management" أو "Advanced DNS"

3. **أضف A Records:**

```
Type: A Record
Host: @
Value: [SERVER_IP]
TTL: Automatic (أو 3600)

Type: A Record
Host: www
Value: [SERVER_IP]
TTL: Automatic (أو 3600)
```

4. **احفظ التغييرات**

5. **انتظر 5-30 دقيقة:**
   - DNS Propagation قد يستغرق وقتاً
   - تحقق من: https://www.whatsmydns.net

---

### الخطوة 7: إعداد Nginx

```bash
# على Server
nano /etc/nginx/sites-available/pricing-system
```

**أدخل التالي (استبدل your-domain.com):**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger Documentation
    location /api-docs {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
    }
}
```

**تفعيل Configuration:**

```bash
# إنشاء Symbolic Link
ln -s /etc/nginx/sites-available/pricing-system /etc/nginx/sites-enabled/

# حذف Default Configuration
rm /etc/nginx/sites-enabled/default

# اختبار Configuration
nginx -t

# إعادة تشغيل Nginx
systemctl restart nginx
```

---

### الخطوة 8: الحصول على SSL Certificate

```bash
# على Server
certbot --nginx -d your-domain.com -d www.your-domain.com
```

**اتبع التعليمات:**
1. أدخل Email
2. وافق على الشروط (A)
3. اختر Redirect HTTP to HTTPS (2)

**تم!** الآن لديك HTTPS ✅

**تجديد تلقائي:**
```bash
# Certbot يجدد تلقائياً، لكن يمكنك التحقق:
certbot renew --dry-run
```

---

### الخطوة 9: تشغيل المشروع

```bash
# على Server
cd /opt/pricing-system

# استخدم Production Docker Compose
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

**التحقق من الحالة:**

```bash
docker-compose -f docker-compose.prod.yml ps
```

**يجب أن ترى:**
```
NAME                STATUS
pricing-db-prod     Up (healthy)
pricing-backend     Up
pricing-frontend    Up
```

---

### الخطوة 10: اختبار

#### 1. اختبار Frontend:
```
https://your-domain.com
```

#### 2. اختبار Backend:
```
https://your-domain.com/api/health
```

#### 3. اختبار Swagger:
```
https://your-domain.com/api-docs
```

#### 4. اختبار Match:
```
https://your-domain.com/match
```

#### 5. تسجيل الدخول:
- Username: `admin` (أو ما وضعته في .env.production)
- Password: (ما وضعته في .env.production)

---

### الخطوة 11: إعداد النسخ الاحتياطي (Backup)

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
docker exec pricing-db-prod pg_dump -U pricing_admin pricing_db > "$BACKUP_DIR/$FILENAME"

# ضغط الملف
gzip "$BACKUP_DIR/$FILENAME"

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "pricing_db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME.gz"
```

**تفعيل Script:**

```bash
chmod +x /opt/backup.sh
```

**إضافة إلى Crontab (نسخ احتياطي يومي الساعة 2 صباحاً):**

```bash
crontab -e
```

**أضف:**

```cron
0 2 * * * /opt/backup.sh
```

---

## 🔧 الصيانة اليومية

### إعادة تشغيل Services:

```bash
cd /opt/pricing-system
docker-compose -f docker-compose.prod.yml restart
```

### عرض Logs:

```bash
# جميع Logs
docker-compose -f docker-compose.prod.yml logs -f

# Backend فقط
docker-compose -f docker-compose.prod.yml logs -f backend

# Frontend فقط
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### تحديث المشروع:

```bash
cd /opt/pricing-system

# إذا استخدمت Git
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# إذا لم تستخدم Git
# ارفع الملفات الجديدة يدوياً
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🐛 حل المشاكل

### المشكلة 1: Domain لا يعمل

**الحل:**
```bash
# تحقق من DNS
nslookup your-domain.com

# تحقق من Nginx
systemctl status nginx
nginx -t

# تحقق من Logs
tail -f /var/log/nginx/error.log
```

### المشكلة 2: SSL لا يعمل

**الحل:**
```bash
# تحقق من Certificates
certbot certificates

# تجديد Certificate
certbot renew

# إعادة تشغيل Nginx
systemctl restart nginx
```

### المشكلة 3: Services لا تعمل

**الحل:**
```bash
# تحقق من Logs
docker-compose -f docker-compose.prod.yml logs

# أعد التشغيل
docker-compose -f docker-compose.prod.yml restart

# إعادة البناء
docker-compose -f docker-compose.prod.yml up -d --build
```

### المشكلة 4: Database Connection Error

**الحل:**
```bash
# تحقق من Database
docker exec -it pricing-db-prod psql -U pricing_admin -d pricing_db

# تحقق من Environment Variables
cat .env.production | grep DATABASE
```

---

## 📋 Checklist النهائي

### قبل النشر:
- [ ] Server جاهز ومتصل
- [ ] Docker مثبت
- [ ] المشروع مرفوع على Server
- [ ] Environment Variables معدّة
- [ ] Domain DNS مضبوط

### أثناء النشر:
- [ ] Nginx معدّ
- [ ] SSL Certificate مثبت
- [ ] Services تعمل

### بعد النشر:
- [ ] الموقع يعمل على HTTPS
- [ ] تسجيل الدخول يعمل
- [ ] Match Product يعمل
- [ ] Swagger يعمل
- [ ] النسخ الاحتياطي معدّ

---

## ✅ الخلاصة

### الخطوات الأساسية:
1. ✅ شراء Hosting Server ($6/شهر)
2. ✅ الاتصال بـ Server
3. ✅ تثبيت Docker & Nginx
4. ✅ رفع المشروع
5. ✅ إعداد Environment Variables
6. ✅ إعداد DNS
7. ✅ إعداد SSL
8. ✅ تشغيل المشروع
9. ✅ اختبار
10. ✅ إعداد Backup

### الوقت المتوقع:
- **الإعداد الأول:** 2-3 ساعات
- **الصيانة:** 10-15 دقيقة/شهر

### التكلفة:
- **الشهر الأول:** $6-16
- **شهرياً:** $6-16/شهر
- **سنوياً:** $72-192/سنة

---

## 📞 الدعم

### الملفات المرجعية:
- `دليل_النشر_على_HOSTING_و_DOMAIN.md` - دليل عام
- `سكريبت_النشر_التلقائي.sh` - سكريبت تلقائي
- `كيفية_استخدام_Swagger.md` - استخدام API

### السكريبتات:
- `سكريبت_النشر_التلقائي.sh` - نشر تلقائي

---

**تم إعداد هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 19 نوفمبر 2025  
**الحالة:** ✅ **دليل شامل جاهز**


