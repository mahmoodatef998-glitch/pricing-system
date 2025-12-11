#!/bin/bash

# ============================================
# Pricing System - Production Deployment Script
# ============================================

set -e  # Exit on error

echo "============================================"
echo "   Pricing System - Production Deployment"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Get domain from user
read -p "Enter your domain (e.g., pricing.yourcompany.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain is required!${NC}"
    exit 1
fi

echo -e "${GREEN}Domain: ${DOMAIN}${NC}"
echo ""

# Update system
echo -e "${YELLOW}[1/10] Updating system...${NC}"
apt update && apt upgrade -y

# Install Docker
echo -e "${YELLOW}[2/10] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo -e "${YELLOW}[3/10] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
else
    echo "Docker Compose already installed"
fi

# Install Nginx
echo -e "${YELLOW}[4/10] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl enable nginx
    systemctl start nginx
else
    echo "Nginx already installed"
fi

# Install Certbot
echo -e "${YELLOW}[5/10] Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
else
    echo "Certbot already installed"
fi

# Check if project directory exists
PROJECT_DIR="/opt/pricing-system"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Project directory not found at $PROJECT_DIR${NC}"
    echo "Please upload the project first"
    exit 1
fi

cd $PROJECT_DIR

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}[6/10] Creating .env.production...${NC}"
    
    # Generate random passwords
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 32)
    ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    
    cat > .env.production << EOF
# Database
POSTGRES_USER=pricing_admin
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=pricing_db

# JWT Authentication
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# Storage Provider
STORAGE_PROVIDER=hybrid

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dr7klhs6t
CLOUDINARY_API_KEY=165124341881569
CLOUDINARY_API_SECRET=NBxGzoPkngRqYIRA2VTosH1x9-Q
CLOUDINARY_FOLDER=pricing-system

# CORS
ALLOWED_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}

# API URL
API_URL=https://${DOMAIN}

# Node Environment
NODE_ENV=production

# Logging
LOG_LEVEL=info
EOF
    
    echo -e "${GREEN}✅ .env.production created${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Save these credentials!${NC}"
    echo -e "${GREEN}Admin Password: ${ADMIN_PASSWORD}${NC}"
    echo ""
else
    echo -e "${GREEN}[6/10] .env.production found${NC}"
fi

# Setup Nginx
echo -e "${YELLOW}[7/10] Setting up Nginx...${NC}"
cat > /etc/nginx/sites-available/pricing-system << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api-docs {
        proxy_pass http://localhost:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://localhost:4000;
        proxy_set_header Host \$host;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/pricing-system /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t
systemctl restart nginx

echo -e "${GREEN}✅ Nginx configured${NC}"

# Start services
echo -e "${YELLOW}[8/10] Starting services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Wait for services
echo "Waiting for services to be ready (20 seconds)..."
sleep 20

# Check services status
echo -e "${YELLOW}[9/10] Checking services status...${NC}"
docker-compose -f docker-compose.prod.yml ps

# Setup SSL
echo -e "${YELLOW}[10/10] Setting up SSL...${NC}"
echo "Please make sure DNS is pointing to this server's IP!"
read -p "Press Enter to continue with SSL setup..."

certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} --redirect

echo ""
echo -e "${GREEN}============================================"
echo "   ✅ Deployment Complete!"
echo "============================================${NC}"
echo ""
echo "Your application is now live at:"
echo -e "${GREEN}https://${DOMAIN}${NC}"
echo ""
echo "Important URLs:"
echo "  - Frontend: https://${DOMAIN}"
echo "  - API: https://${DOMAIN}/api"
echo "  - Swagger: https://${DOMAIN}/api-docs"
echo "  - Health: https://${DOMAIN}/health"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "  1. Save your admin password (shown above)"
echo "  2. Configure DNS if not done already"
echo "  3. Set up backups (see documentation)"
echo ""


